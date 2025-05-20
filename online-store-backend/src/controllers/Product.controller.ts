import { Request, Response } from "express";
import { Op, literal, FindOptions, col } from "sequelize";
import Product from "../models/Product";
import ProductDetail from "../models/ProductDetail";
import ProductInventory from "../models/ProductInventory";
import ProductImage from "../models/ProductImage";
import ProductCategory from "../models/ProductCategory";
import Category from "../models/Category";
import { getPublicUrl, deleteFile } from "../services/imageUpload";
import Suitability from "../models/Suitability";
import ProductSuitability from "../models/ProductSuitability";
import sequelize from "../config/db";

interface ExtendedFindOptions extends FindOptions {
  distinct?: boolean;
}
interface S3File extends Express.Multer.File {
  location: string;
}
/**
 * Create a product with details and inventory
 */
export const createProductWithDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  console.log("data nhận vào", req.body);
  const t = await sequelize.transaction();

  // Get uploaded files
  const files = req.files as S3File[];
  try {
    const {
      name,
      sku,
      description,
      brand,
      material,
      featured,
      status,
      tags,
      suitability,
      categories,
    } = req.body;

    // Parse JSON data sent as strings from form-data
    const details = JSON.parse(req.body.details || "[]");
    const categoriesData = JSON.parse(req.body.categories || "[]");
    const imageIsMain = JSON.parse(req.body.imageIsMain || "{}");

    if (!name || !sku) {
      await t.rollback();
      res.status(400).json({ message: "Thiếu thông tin tên và mã sản phẩm" });
      return;
    }
    // Check if product with same SKU already exists
    if (sku) {
      const existingProduct = await Product.findOne({
        where: { sku },
        transaction: t,
      });

      if (existingProduct) {
        await t.rollback();
        res.status(400).json({ message: "Sản phẩm với SKU này đã tồn tại" });
        return;
      }
    }

    // Create new product
    const newProduct = await Product.create(
      {
        name,
        sku,
        description,
        brand,
        material,
        featured: featured === "true" || featured === true,
        status: status || "draft",
        tags: typeof tags === "string" ? JSON.parse(tags) : tags,
      },
      { transaction: t }
    );

    // Map to track which images belong to which color
    const colorImageMap = new Map();
    // Xử lý suitability đúng cách
    let suitabilityIds = [];
    if (suitability) {
      try {
        suitabilityIds =
          typeof suitability === "string"
            ? JSON.parse(suitability)
            : Array.isArray(suitability)
            ? suitability
            : [];
      } catch (e) {
        console.error("Error parsing suitability:", e);
        suitabilityIds = [];
      }

      for (const suitId of suitabilityIds) {
        // Tìm suitability theo ID thay vì tạo mới
        const existingSuitability = await Suitability.findByPk(suitId, {
          transaction: t,
        });

        if (existingSuitability) {
          await ProductSuitability.create(
            {
              productId: newProduct.id,
              suitabilityId: existingSuitability.id,
            },
            { transaction: t }
          );
        }
      }
    }

    // Process uploaded files if any - group by color
    if (files && files.length > 0) {
      // Extract color information from the form
      let imageColors: { [key: string]: string } = {};
      let imageIsMain: { [key: string]: boolean | string } = {};
      try {
        imageColors =
          typeof req.body.imageColors === "string"
            ? JSON.parse(req.body.imageColors)
            : req.body.imageColors || {};

        imageIsMain =
          typeof req.body.imageIsMain === "string"
            ? JSON.parse(req.body.imageIsMain)
            : req.body.imageIsMain || {};
      } catch (e) {
        console.error("Error parsing image metadata:", e);
      }

      // Group images by color
      files.forEach((file, index) => {
        const indexKey = index.toString();
        const color = imageColors[indexKey] || "default";
        if (!colorImageMap.has(color)) {
          colorImageMap.set(color, []);
        }
        colorImageMap.get(color).push({
          url: file.location,
          isMain:
            imageIsMain[indexKey] === true || imageIsMain[indexKey] === "true",
          displayOrder: colorImageMap.get(color).length,
        });
      });
    }

    // Create product details with their respective inventories and prices
    for (const detail of details) {
      // Create product detail (color and price)
      const productDetail = await ProductDetail.create(
        {
          productId: newProduct.id,
          color: detail.color,
          price: detail.price || 0,
          originalPrice: detail.originalPrice || detail.price || 0,
        },
        { transaction: t }
      );

      // Add sizes and inventory for this detail
      if (detail.sizes && detail.sizes.length > 0) {
        for (const sizeInfo of detail.sizes) {
          await ProductInventory.create(
            {
              productDetailId: productDetail.id,
              size: sizeInfo.size,
              stock: sizeInfo.stock || 0,
            },
            { transaction: t }
          );
        }
      }

      // Add images for this detail if they exist in the map
      const colorImages = colorImageMap.get(detail.color) || [];
      for (const imageInfo of colorImages) {
        await ProductImage.create(
          {
            productDetailId: productDetail.id,
            url: imageInfo.url,
            isMain: imageInfo.isMain,
            displayOrder: imageInfo.displayOrder,
          },
          { transaction: t }
        );
      }
    }

    // Sau khi xử lý categories từ request
    if (categoriesData && categoriesData.length > 0) {
      // Map để theo dõi các danh mục đã xử lý để tránh trùng lặp
      const processedCategories = new Set<number>();
      const categoryEntries = [];

      for (const categoryId of categoriesData) {
        const categoryIdNum = parseInt(categoryId.toString());

        if (!processedCategories.has(categoryIdNum)) {
          // Thêm danh mục vào danh sách để tạo liên kết
          categoryEntries.push({
            productId: newProduct.id,
            categoryId: categoryIdNum,
          });

          processedCategories.add(categoryIdNum);

          // KHÔNG lưu danh mục cha nếu đã chọn danh mục con
          // Chỉ lưu ID danh mục được chọn trực tiếp
        }
      }

      // Tạo các liên kết giữa sản phẩm và danh mục
      await ProductCategory.bulkCreate(categoryEntries, { transaction: t });
    }

    await t.commit();

    // Return success response
    res.status(201).json({
      message: "Tạo sản phẩm thành công",
      productId: newProduct.id,
    });
  } catch (error: any) {
    await t.rollback();
    // Xóa các file đã upload lên S3 nếu có lỗi
    if (files && files.length > 0) {
      try {
        console.log("Cleaning up uploaded files from S3");
        await Promise.all(
          files.map((file) => {
            const key = file.location.split("/").pop(); // Lấy key từ URL
            return deleteFile(file.location);
          })
        );
      } catch (cleanupError) {
        console.error("Error cleaning up S3 files:", cleanupError);
        // Vẫn tiếp tục xử lý lỗi chính
      }
    }
    res.status(500).json({
      message: "Lỗi khi tạo sản phẩm",
      error: error.message,
    });
  }
};

// Cập nhật cả phương thức getProductsWithVariants
export const getProductsWithVariants = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Lấy query parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const category = req.query.category as string;
    const status = req.query.status as string;
    const brand = req.query.brand as string;
    const featured =
      req.query.featured === "true"
        ? true
        : req.query.featured === "false"
        ? false
        : null;
    // Thêm lọc theo color và size
    const color = req.query.color as string;
    const sizeParam = req.query.size as string;
    const sizes = sizeParam ? sizeParam.split(",") : [];
    const suitabilityParam = req.query.suitability as string;
    const suitabilities = suitabilityParam ? suitabilityParam.split(",") : [];
    console.log("Suitabilities:", suitabilities);
    console.log("Comparing suitabilities:", {
      input: suitabilities,
      dbValues: await Suitability.findAll({
        attributes: ["id", "name", "slug"],
      }).then((records) => records.map((r) => r.get({ plain: true }))),
    });
    // thêm tham số để sort
    const sort = req.query.sort as string;

    let order: any[] = [["createdAt", "DESC"]]; // Default sort

    if (sort) {
      const [field, direction] = sort.split("_");
      const validFields = ["name", "createdAt", "price", "featured"];
      const validDirections = ["asc", "desc"];

      if (
        validFields.includes(field) &&
        validDirections.includes(direction?.toLowerCase())
      ) {
        if (field === "price") {
          // Sắp xếp theo giá
          order = [
            [
              { model: ProductDetail, as: "details" },
              "price",
              direction.toUpperCase(),
            ],
          ];
        } else {
          order = [[field, direction.toUpperCase()]];
        }
      }
    }

    // Tính offset
    const offset = (page - 1) * limit;

    // Tạo where condition
    let where: any = {};

    // Xây dựng include
    const include: any[] = [];

    if (search) {
      where = {
        [Op.or]: {
          name: { [Op.like]: `%${search}%` },
          sku: { [Op.like]: `%${search}%` },
        },
      };
    }
    if (status) {
      where.status = { [Op.eq]: status };
    }
    if (brand) {
      where.brand = brand;
    }

    // so sánh với slug trong db
    if (suitabilities.length > 0) {
      include.push({
        model: Suitability,
        as: "suitabilities",
        // so sánh bằng slug luôn thay vì phải mapping id
        where: { slug: { [Op.in]: suitabilities } },
        through: { attributes: [] }, // Không lấy thông tin bảng trung gian
        required: true, // Bắt buộc phải có
      });
    } else {
      include.push({
        model: Suitability,
        as: "suitabilities",
        attributes: ["id", "name"],
        through: { attributes: [] },
        required: false, // Không bắt buộc có
      });
    }

    if (featured === true) {
      where.featured = true;
    }

    // Category include
    const categoryInclude: any = {
      model: Category,
      as: "categories",
      attributes: ["id", "name"],
      through: { attributes: [] },
    };

    if (category) {
      categoryInclude.where = { id: category };
    }

    include.push(categoryInclude);

    // ProductDetail include với lọc
    const detailsInclude: any = {
      model: ProductDetail,
      as: "details",
      include: [
        {
          model: ProductInventory,
          as: "inventories",
          where: sizes.length > 0 ? { size: { [Op.in]: sizes } } : undefined,
        },
        { model: ProductImage, as: "images" },
      ],
    };

    if (color) {
      detailsInclude.where = { color };
    }

    include.push(detailsInclude);

    // Đếm tổng số sản phẩm phù hợp với bộ lọc
    const count = await Product.count({
      where,
      include,
      distinct: true,
    } as ExtendedFindOptions);

    // Lấy sản phẩm đã lọc
    const products = await Product.findAll({
      where,
      include,
      limit,
      offset,
      order,
      distinct: true,
    } as ExtendedFindOptions);

    // Format data for optimized response
    const formattedProducts = products.map((product: any) => {
      const details = product.details || [];

      // Get all unique colors
      const uniqueColors = [
        ...new Set(details.map((detail: any) => detail.color)),
      ];

      // Get all unique sizes
      const uniqueSizes = [
        ...new Set(
          details.flatMap((detail: any) =>
            detail.inventories.map((inv: any) => inv.size)
          )
        ),
      ];

      // Calculate total stock
      const totalStock = details.reduce(
        (sum: number, detail: any) =>
          sum +
          detail.inventories.reduce(
            (detailSum: number, inv: any) => detailSum + inv.stock,
            0
          ),
        0
      );

      // Create mapping for each color: images, price and available sizes
      const variantMap: Record<string, any> = {};

      uniqueColors.forEach((color) => {
        const detailWithColor = details.find((d: any) => d.color === color);

        if (!detailWithColor) return;

        // Get images for this color
        const images = detailWithColor.images || [];

        // Get inventory for this color
        const inventories = detailWithColor.inventories || [];

        // Map inventory to a simple size->stock object and calculate variants
        const sizeInventory: Record<string, number> = {};
        const variants = [];

        for (const inv of inventories) {
          if (inv.stock > 0) {
            sizeInventory[inv.size] = inv.stock;
            variants.push({
              color: color as string,
              size: inv.size,
              stock: inv.stock,
            });
          }
        }

        // Add to variant map
        variantMap[color as string] = {
          detailId: detailWithColor.id,
          price: detailWithColor.price,
          originalPrice: detailWithColor.originalPrice,
          images: images.map((img: any) => ({
            id: img.id,
            url: img.url,
            isMain: img.isMain,
          })),
          availableSizes: Object.keys(sizeInventory),
          inventory: sizeInventory,
          variants,
        };
      });

      // Generate status label and CSS class
      let statusLabel = "";
      let statusClass = "";

      switch (product.status) {
        case "active":
          statusLabel = "Đang bán";
          statusClass = "success";
          break;
        case "outofstock":
          statusLabel = "Hết hàng";
          statusClass = "danger";
          break;
        case "draft":
          statusLabel = "Nháp";
          statusClass = "warning";
          break;
      }

      // Return formatted product
      return {
        id: product.id,
        name: product.name,
        sku: product.sku || "",
        description: product.description || "",
        categories: product.categories || [],
        brand: product.brand || "",
        material: product.material || "",
        featured: product.featured || false,
        status: product.status,
        statusLabel,
        statusClass,
        tags: Array.isArray(product.tags)
          ? product.tags
          : typeof product.tags === "string"
          ? JSON.parse(product.tags)
          : [],
        suitability: product.suitabilities
          ? product.suitabilities.map((s: { name: string }) => s.name)
          : [],
        colors: uniqueColors,
        sizes: uniqueSizes,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        stock: {
          total: totalStock,
          variants: details.flatMap((detail: any) =>
            detail.inventories.map((inv: any) => ({
              color: detail.color,
              size: inv.size,
              stock: inv.stock,
            }))
          ),
        },
        variants: variantMap,
      };
    });

    // Trả về response với thông tin phân trang
    res.status(200).json({
      products: formattedProducts,
      filters: {
        search: search || null,
        category: category || null,
        status: status || null,
        brand: brand || null,
        color: color || null,
        size: sizeParam || null,
        featured: req.query.featured === "true" ? true : null,
        sort: sort || null,
        suitability: suitabilityParam ? suitabilityParam.split(",") : [],
      },
      pagination: {
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
    console.error("GET PRODUCTS ERROR:", {
      message: error.message,
      stack: error.stack,
      query: req.query,
    });
  }
};
/**
 * Get product by ID with details, inventory, images and categories
 */
export const getProductById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // Find product by ID
    const product = await Product.findByPk(id, {
      include: [
        {
          model: ProductDetail,
          as: "details",
          include: [
            {
              model: ProductInventory,
              as: "inventories",
            },
            {
              model: ProductImage,
              as: "images",
            },
          ],
        },
        {
          model: Category,
          as: "categories",
          attributes: ["id", "name"],
          through: { attributes: [] },
        },
        {
          model: Suitability,
          as: "suitabilities",
          attributes: ["id", "name"],
          through: { attributes: [] }, // Ẩn bảng liên kết
        },
      ],
    });

    if (!product) {
      res.status(404).json({ message: "Không tìm thấy sản phẩm" });
      return;
    }

    // Format product like in getProductsWithVariants
    const details = (product as any).details || [];

    // Get all unique colors
    const uniqueColors = [
      ...new Set(details.map((detail: any) => detail.color)),
    ];

    // Get all unique sizes
    const uniqueSizes = [
      ...new Set(
        details.flatMap((detail: any) =>
          detail.inventories.map((inv: any) => inv.size)
        )
      ),
    ];

    // Calculate total stock
    const totalStock = details.reduce(
      (sum: number, detail: any) =>
        sum +
        detail.inventories.reduce(
          (detailSum: number, inv: any) => detailSum + inv.stock,
          0
        ),
      0
    );

    // Create mapping for each color: images, price and available sizes
    const variantMap: Record<string, any> = {};

    uniqueColors.forEach((color) => {
      const detailWithColor = details.find((d: any) => d.color === color);

      if (!detailWithColor) return;

      // Get images for this color
      const images = detailWithColor.images || [];

      // Get inventory for this color
      const inventories = detailWithColor.inventories || [];

      // Map inventory to a simple size->stock object and calculate variants
      const sizeInventory: Record<string, number> = {};
      const variants = [];

      for (const inv of inventories) {
        sizeInventory[inv.size] = inv.stock;
        if (inv.stock > 0) {
          variants.push({
            color: color as string,
            size: inv.size,
            stock: inv.stock,
          });
        }
      }

      // Add to variant map
      variantMap[color as string] = {
        detailId: detailWithColor.id,
        price: detailWithColor.price,
        originalPrice: detailWithColor.originalPrice,
        images: images.map((img: any) => ({
          id: img.id,
          url: img.url,
          isMain: img.isMain,
        })),
        availableSizes: Object.keys(sizeInventory),
        inventory: sizeInventory,
        variants,
      };
    });

    // Generate status label and CSS class
    let statusLabel = "";
    let statusClass = "";

    switch ((product as any).status) {
      case "active":
        statusLabel = "Đang bán";
        statusClass = "success";
        break;
      case "outofstock":
        statusLabel = "Hết hàng";
        statusClass = "danger";
        break;
      case "draft":
        statusLabel = "Nháp";
        statusClass = "warning";
        break;
    }

    // Format product response
    const formattedProduct = {
      id: (product as any).id,
      name: (product as any).name,
      sku: (product as any).sku || "",
      description: (product as any).description || "",
      categories: (product as any).categories || [],
      brand: (product as any).brand || "",
      material: (product as any).material || "",
      featured: (product as any).featured || false,
      status: (product as any).status,
      statusLabel,
      statusClass,
      tags: Array.isArray((product as any).tags)
        ? (product as any).tags
        : typeof (product as any).tags === "string"
        ? JSON.parse((product as any).tags)
        : [],
      suitability: Array.isArray((product as any).suitability)
        ? (product as any).suitability
        : typeof (product as any).suitability === "string"
        ? JSON.parse((product as any).suitability)
        : [],
      colors: uniqueColors,
      sizes: uniqueSizes,
      createdAt: (product as any).createdAt,
      updatedAt: (product as any).updatedAt,
      stock: {
        total: totalStock,
        variants: details.flatMap((detail: any) =>
          detail.inventories.map((inv: any) => ({
            color: detail.color,
            size: inv.size,
            stock: inv.stock,
          }))
        ),
      },
      variants: variantMap,
    };

    res.status(200).json(formattedProduct);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Delete a product and all associated details and inventory
 */
export const deleteProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;

    // Check if product exists
    const product = await Product.findByPk(id, { transaction: t });

    if (!product) {
      await t.rollback();
      res.status(404).json({ message: "Sản phẩm không tồn tại" });
      return;
    }

    // Get all product details to delete their inventories and images
    const details = await ProductDetail.findAll({
      where: { productId: id },
      transaction: t,
      include: [
        {
          model: ProductImage,
          as: "images",
        },
      ],
    });

    // Delete related data for each product detail
    for (const detail of details) {
      // Delete images (both DB records and files)
      const images = (detail as any).images || [];
      for (const image of images) {
        const imageUrl = image.url;
        await image.destroy({ transaction: t });
        deleteFile(imageUrl);
      }

      // Delete inventories
      await ProductInventory.destroy({
        where: { productDetailId: (detail as any).id },
        transaction: t,
      });

      // Delete the product detail
      await detail.destroy({ transaction: t });
    }

    // Delete product categories
    await ProductCategory.destroy({
      where: { productId: id },
      transaction: t,
    });

    // Delete the product
    await product.destroy({ transaction: t });

    await t.commit();

    res.status(200).json({ message: "Xóa sản phẩm thành công" });
  } catch (error: any) {
    await t.rollback();
    res.status(500).json({
      message: "Lỗi khi xóa sản phẩm",
      error: error.message,
    });
  }
};

/**
 * Get products by category ID with pagination
 */
/**
 * Get products by category ID with pagination
 */
export const getProductsByCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    console.log("Fetching products by category ID", req.params);
    const { categoryId } = req.params;

    // Pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    // Giữ lại các filter parameters
    const color = req.query.color as string;
    const sizeParam = req.query.size as string;
    const sizes = sizeParam ? sizeParam.split(",") : [];
    const suitabilityParam = req.query.suitability as string;
    const suitabilities = suitabilityParam ? suitabilityParam.split(",") : [];
    const childCategoryId = req.query.childCategory as string;

    // Tìm category để kiểm tra tồn tại
    const category = await Category.findByPk(categoryId);
    if (!category) {
      res.status(404).json({ message: "Danh mục không tồn tại" });
      return;
    }

    // Lấy danh sách categoryIds để lọc sản phẩm
    let categoryIds = [categoryId];

    // Nếu đây là danh mục cha và không có childCategoryId được chỉ định
    if (category.parentId === null && !childCategoryId) {
      // Lấy tất cả các danh mục con của danh mục hiện tại
      const childCategories = await Category.findAll({
        where: {
          parentId: categoryId,
          isActive: true,
        },
        attributes: ["id"],
      });

      // Thêm IDs của danh mục con vào danh sách lọc
      categoryIds = [
        ...categoryIds,
        ...childCategories.map((c) => c.id.toString()),
      ];
    }
    // Nếu có chỉ định childCategoryId cụ thể
    else if (childCategoryId) {
      // Kiểm tra xem childCategory có thuộc category cha không
      const childCategory = await Category.findOne({
        where: {
          id: childCategoryId,
          parentId: categoryId,
        },
      });

      if (childCategory) {
        // Nếu có, chỉ lấy sản phẩm thuộc danh mục con này
        categoryIds = [childCategoryId];
      }
    }

    // Start with basic include for category filtering
    const include: any[] = [
      {
        model: Category,
        as: "categories",
        where: { id: { [Op.in]: categoryIds } },
        attributes: ["id", "name"],
        through: { attributes: [] },
      },
    ];

    // Where condition for product filtering
    const where: any = {};

    // Add suitability filter if present
    if (suitabilities.length > 0) {
      include.push({
        model: Suitability,
        as: "suitabilities",
        where: { name: { [Op.in]: suitabilities } },
        through: { attributes: [] }, // Không lấy thông tin bảng trung gian
        required: true, // Bắt buộc phải có
      });
    }

    // ProductDetail include with filtering
    const detailsInclude: any = {
      model: ProductDetail,
      as: "details",
      include: [
        {
          model: ProductInventory,
          as: "inventories",
          where: sizes.length > 0 ? { size: { [Op.in]: sizes } } : undefined,
        },
        { model: ProductImage, as: "images" },
      ],
    };

    // Apply color filter if provided
    if (color) {
      detailsInclude.where = { color };
    }

    // Add details include to main include array
    include.push(detailsInclude);

    // Count total matching products
    const count = await Product.count({
      where,
      include,
      distinct: true,
    } as ExtendedFindOptions);

    // Get filtered products
    const products = await Product.findAll({
      where,
      include,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      distinct: true,
    } as ExtendedFindOptions);

    // Format sản phẩm (giữ nguyên phần này)
    const formattedProducts = products.map((product: any, index: number) => {
      console.log(`Processing product ${index}:`, product.toJSON());
      const details = product.details || [];

      // Get all unique colors
      const uniqueColors = [
        ...new Set(details.map((detail: any) => detail.color)),
      ];

      // Get all unique sizes
      const uniqueSizes = [
        ...new Set(
          details.flatMap((detail: any) =>
            detail.inventories.map((inv: any) => inv.size)
          )
        ),
      ];

      // Calculate total stock
      const totalStock = details.reduce(
        (sum: number, detail: any) =>
          sum +
          detail.inventories.reduce(
            (detailSum: number, inv: any) => detailSum + inv.stock,
            0
          ),
        0
      );

      // Create variant map
      const variantMap: Record<string, any> = {};

      uniqueColors.forEach((color) => {
        const detailWithColor = details.find((d: any) => d.color === color);

        if (!detailWithColor) return;

        // Get images for this color
        const images = detailWithColor.images || [];

        // Get inventory for this color
        const inventories = detailWithColor.inventories || [];

        // Map inventory to a simple size->stock object
        const sizeInventory: Record<string, number> = {};
        const variants = [];

        for (const inv of inventories) {
          if (inv.stock > 0) {
            sizeInventory[inv.size] = inv.stock;
            variants.push({
              color: color as string,
              size: inv.size,
              stock: inv.stock,
            });
          }
        }

        // Add to variant map
        variantMap[color as string] = {
          detailId: detailWithColor.id,
          price: detailWithColor.price,
          originalPrice: detailWithColor.originalPrice,
          images: images.map((img: any) => ({
            id: img.id,
            url: img.url,
            isMain: img.isMain,
          })),
          availableSizes: Object.keys(sizeInventory),
          inventory: sizeInventory,
          variants,
        };
      });

      // Generate status label
      let statusLabel = "";
      let statusClass = "";

      switch (product.status) {
        case "active":
          statusLabel = "Đang bán";
          statusClass = "success";
          break;
        case "outofstock":
          statusLabel = "Hết hàng";
          statusClass = "danger";
          break;
        case "draft":
          statusLabel = "Nháp";
          statusClass = "warning";
          break;
      }

      // Return formatted product
      return {
        id: product.id,
        name: product.name,
        sku: product.sku || "",
        description: product.description || "",
        categories: product.categories || [],
        brand: product.brand || "",
        material: product.material || "",
        featured: product.featured || false,
        status: product.status,
        statusLabel,
        statusClass,
        tags: Array.isArray(product.tags)
          ? product.tags
          : typeof product.tags === "string"
          ? JSON.parse(product.tags)
          : [],
        suitability: product.suitabilities
          ? product.suitabilities.map((s: { name: string }) => s.name)
          : [],
        colors: uniqueColors,
        sizes: uniqueSizes,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        stock: {
          total: totalStock,
          variants: details.flatMap((detail: any) =>
            detail.inventories.map((inv: any) => ({
              color: detail.color,
              size: inv.size,
              stock: inv.stock,
            }))
          ),
        },
        variants: variantMap,
      };
    });

    // Lấy thông tin danh mục con nếu là danh mục cha
    let childCategories: Category[] = [];
    if (category.parentId === null) {
      childCategories = await Category.findAll({
        where: {
          parentId: categoryId,
          isActive: true,
        },
        attributes: ["id", "name", "slug"],
        order: [["name", "ASC"]],
      });
    }

    // Return with pagination info
    res.status(200).json({
      categoryName: category.name,
      categoryId: category.id,
      parentCategoryId: category.parentId,
      products: formattedProducts,
      childCategories: childCategories,
      filters: {
        category: categoryId,
        childCategory: childCategoryId || null,
        color: color || null,
        size: sizeParam || null,
        suitability: suitabilityParam || null,
      },
      pagination: {
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error: any) {
    console.error("Error getting products by category:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getSuitabilities = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const suitabilities = await Suitability.findAll({
      order: [
        ["sortOrder", "ASC"],
        ["name", "ASC"],
      ],
    });
    res.status(200).json(suitabilities);
  } catch (error: any) {
    console.error("Error getting suitabilities:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getSubtypes = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Lấy category ID từ query parameters
    const categoryId = req.query.categoryId as string;

    console.log("Fetching subtypes for category:", categoryId || "all");

    let products;

    if (categoryId) {
      // Nếu có categoryId, lọc sản phẩm theo category
      products = await Product.findAll({
        attributes: ["subtype"],
        include: [
          {
            model: Category,
            as: "categories",
            where: { id: categoryId },
            through: { attributes: [] },
            required: true, // Đảm bảo chỉ lấy sản phẩm thuộc category này
          },
        ],
        where: {
          subtype: {
            [Op.not]: null,
          },
        },
      });
    } else {
      // Nếu không có categoryId, lấy tất cả
      products = await Product.findAll({
        attributes: ["subtype"],
        where: {
          subtype: {
            [Op.not]: null,
          },
        },
      });
    }

    console.log("Products found:", products.length);
    console.log(
      "Product subtypes:",
      products.map((p) => p.getDataValue("subtype"))
    );

    // Tạo danh sách `subtypes` duy nhất
    const subtypes = [
      ...new Set(products.map((product) => product.getDataValue("subtype"))),
    ].filter(Boolean);

    console.log("Unique subtypes:", subtypes);

    // Trả về danh sách `subtypes`
    res.status(200).json({
      subtypes,
      categoryId: categoryId || null,
      count: subtypes.length,
    });
  } catch (error: any) {
    console.error("Error fetching subtypes:", error);
    res.status(500).json({ message: "Lỗi khi lấy danh sách subtypes" });
  }
};

// hàm để lấy variant của sản phẩm theo id ở product
export const getProductVariantsById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // Tìm sản phẩm theo ID
    const product = await Product.findByPk(id, {
      include: [
        {
          model: ProductDetail,
          as: "details",
          include: [
            {
              model: ProductInventory,
              as: "inventories",
            },
            { model: ProductImage, as: "images" },
          ],
        },
        {
          model: Category,
          as: "categories",
          attributes: ["id", "name"],
          through: { attributes: [] }, // Ẩn bảng trung gian
        },
        {
          model: Suitability,
          as: "suitabilities",
          attributes: ["id", "name"],
          through: { attributes: [] }, // Ẩn bảng liên kết
        },
      ],
    });

    if (!product) {
      res.status(404).json({ message: "Không tìm thấy sản phẩm" });
      return;
    }

    // Trả về thông tin chi tiết của sản phẩm
    res.status(200).json(product);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Update basic product information
 */
export const updateProductBasicInfo = async (
  req: Request,
  res: Response
): Promise<void> => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const {
      name,
      sku,
      description,
      brand,
      material,
      featured,
      status,
      tags,
      suitabilities,
      categories,
    } = req.body;
    console.log("suitabilities nhặn vào", suitabilities);
    // Check if product exists
    const product = await Product.findByPk(id, { transaction: t });
    if (!product) {
      await t.rollback();
      res.status(404).json({ message: "Sản phẩm không tồn tại" });
      return;
    }

    // Update basic product information
    await product.update(
      {
        name,
        sku,
        description,
        brand,
        material,
        featured: featured === "true" || featured === true,
        status: status || "draft",
        tags: typeof tags === "string" ? JSON.parse(tags) : tags,
      },
      { transaction: t }
    );

    // Update suitabilities if provided
    if (
      suitabilities &&
      Array.isArray(suitabilities)
      // kể cả = 0 thì cũng xóa vì có thể xóa hết suitabilities
    ) {
      // Delete existing suitability relationships
      await ProductSuitability.destroy({
        where: { productId: id },
        transaction: t,
      });

      // Add new suitability relationships
      const suitabilityEntries = suitabilities.map((suitabilityId: number) => ({
        productId: Number(id),
        suitabilityId,
      }));

      await ProductSuitability.bulkCreate(suitabilityEntries, {
        transaction: t,
      });
    }

    // Update categories if provided
    if (categories && categories.length > 0) {
      // Kiểm tra xem có đang cố gắng cập nhật đầy đủ categories hay không
      // Nếu chỉ có 1 category được gửi lên (category chính), giữ lại subcategories hiện tại
      if (categories.length === 1) {
        // Tìm các category hiện tại của sản phẩm
        const existingCategories = await ProductCategory.findAll({
          where: { productId: id },
          transaction: t,
        });

        // Kiểm tra xem category được gửi lên có phải là category cha không
        const existingCategoryIds = existingCategories.map((cat) =>
          cat.getDataValue("categoryId")
        );
        const mainCategoryId = categories[0];

        // Nếu category được gửi lên là category cha và sản phẩm đã có nhiều hơn 1 category (có subcategory)
        // thì chỉ cập nhật category cha và giữ nguyên subcategory
        if (existingCategories.length > 1) {
          // Tìm category cha hiện tại
          const parentCategory = await Category.findOne({
            where: {
              id: { [Op.in]: existingCategoryIds },
              parentId: null,
            },
            transaction: t,
          });

          if (parentCategory && parentCategory.id !== mainCategoryId) {
            // Chỉ cập nhật category cha, giữ nguyên các subcategories
            await ProductCategory.update(
              { categoryId: mainCategoryId },
              {
                where: {
                  productId: id,
                  categoryId: parentCategory.id,
                },
                transaction: t,
              }
            );
            return;
          }
        }
      }

      // Trường hợp thông thường - xóa và thêm lại tất cả
      await ProductCategory.destroy({
        where: { productId: id },
        transaction: t,
      });

      // Add new categories
      const categoryEntries = categories.map((categoryId: number) => ({
        productId: Number(id),
        categoryId,
      }));

      await ProductCategory.bulkCreate(categoryEntries, { transaction: t });
    }

    await t.commit();
    res.status(200).json({
      message: "Cập nhật thông tin cơ bản sản phẩm thành công",
      productId: id,
    });
  } catch (error: any) {
    await t.rollback();
    console.error("UPDATE BASIC PRODUCT INFO ERROR:", {
      message: error.message,
      stack: error.stack,
      requestId: req.params.id,
    });

    res.status(500).json({
      message: "Lỗi khi cập nhật thông tin cơ bản sản phẩm",
      error: error.message,
    });
  }
};

/**
 * Update product inventory
 */
export const updateProductInventory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { details } = req.body;

    // Check if product exists
    const product = await Product.findByPk(id, { transaction: t });
    if (!product) {
      await t.rollback();
      res.status(404).json({ message: "Sản phẩm không tồn tại" });
      return;
    }

    // Process each detail
    for (const detail of details) {
      if (detail.id) {
        // Existing detail
        const productDetail = await ProductDetail.findByPk(detail.id, {
          transaction: t,
          include: [{ model: ProductInventory, as: "inventories" }],
        });

        if (productDetail) {
          // Update price information
          if (
            detail.price !== undefined ||
            detail.originalPrice !== undefined
          ) {
            await productDetail.update(
              {
                price: detail.price || productDetail.getDataValue("price"),
                originalPrice:
                  detail.originalPrice ||
                  detail.price ||
                  productDetail.getDataValue("originalPrice"),
              },
              { transaction: t }
            );
          }

          // Update inventories
          if (detail.sizes && Array.isArray(detail.sizes)) {
            // Get existing inventories
            const existingInventories =
              (productDetail as any).inventories || [];

            // Create map for quick lookup
            const inventoryMap = new Map();
            existingInventories.forEach((inv: any) => {
              inventoryMap.set(inv.size, inv);
            });

            // Update or create inventory items
            for (const sizeInfo of detail.sizes) {
              const existing = inventoryMap.get(sizeInfo.size);

              if (existing) {
                // Update existing inventory
                await existing.update(
                  {
                    stock: sizeInfo.stock,
                  },
                  { transaction: t }
                );
              } else {
                // Create new inventory
                await ProductInventory.create(
                  {
                    productDetailId: detail.id,
                    size: sizeInfo.size,
                    stock: sizeInfo.stock || 0,
                  },
                  { transaction: t }
                );
              }
            }

            // Delete sizes that are not in the update
            const updatedSizes: string[] = detail.sizes.map(
              (s: { size: string }) => s.size
            );
            for (const inv of existingInventories) {
              if (!updatedSizes.includes(inv.size)) {
                await inv.destroy({ transaction: t });
              }
            }
          }
        }
      } else if (detail.color) {
        // New detail - first check if color already exists
        const existingDetail = await ProductDetail.findOne({
          where: {
            productId: id,
            color: detail.color,
          },
          transaction: t,
        });

        if (existingDetail) {
          // Color already exists, update it
          await existingDetail.update(
            {
              price: detail.price || 0,
              originalPrice: detail.originalPrice || detail.price || 0,
            },
            { transaction: t }
          );

          if (detail.sizes && Array.isArray(detail.sizes)) {
            for (const sizeInfo of detail.sizes) {
              // Check if inventory for this size exists
              const existingInventory = await ProductInventory.findOne({
                where: {
                  productDetailId: existingDetail.id,
                  size: sizeInfo.size,
                },
                transaction: t,
              });

              if (existingInventory) {
                await existingInventory.update(
                  {
                    stock: sizeInfo.stock || 0,
                  },
                  { transaction: t }
                );
              } else {
                await ProductInventory.create(
                  {
                    productDetailId: existingDetail.id,
                    size: sizeInfo.size,
                    stock: sizeInfo.stock || 0,
                  },
                  { transaction: t }
                );
              }
            }
          }
        } else {
          // Create new detail
          const newDetail = await ProductDetail.create(
            {
              productId: id,
              color: detail.color,
              price: detail.price || 0,
              originalPrice: detail.originalPrice || detail.price || 0,
            },
            { transaction: t }
          );

          if (detail.sizes && Array.isArray(detail.sizes)) {
            for (const sizeInfo of detail.sizes) {
              await ProductInventory.create(
                {
                  productDetailId: newDetail.id,
                  size: sizeInfo.size,
                  stock: sizeInfo.stock || 0,
                },
                { transaction: t }
              );
            }
          }
        }
      }
    }

    await t.commit();
    res.status(200).json({
      message: "Cập nhật tồn kho sản phẩm thành công",
      productId: id,
    });
  } catch (error: any) {
    await t.rollback();
    console.error("UPDATE PRODUCT INVENTORY ERROR:", {
      message: error.message,
      stack: error.stack,
      requestId: req.params.id,
    });

    res.status(500).json({
      message: "Lỗi khi cập nhật tồn kho sản phẩm",
      error: error.message,
    });
  }
};

/**
 * Add images to product
 */
export const addProductImages = async (
  req: Request,
  res: Response
): Promise<void> => {
  const t = await sequelize.transaction();

  // Get uploaded files
  const files = req.files as S3File[];
  try {
    const { id } = req.params;

    // Check if product exists
    const product = await Product.findByPk(id, {
      include: [{ model: ProductDetail, as: "details" }],
      transaction: t,
    });

    if (!product) {
      await t.rollback();
      res.status(404).json({ message: "Sản phẩm không tồn tại" });
      return;
    }

    // Extract metadata
    let imageColors: Record<string, string> = {};
    let imageIsMain: Record<string, boolean | string> = {};

    try {
      imageColors = JSON.parse(req.body.imageColors || "{}");
      imageIsMain = JSON.parse(req.body.imageIsMain || "{}");
    } catch (e) {
      await t.rollback();
      res.status(400).json({ message: "Dữ liệu hình ảnh không hợp lệ" });
      return;
    }

    // Map to track which images belong to which color
    const colorImageMap = new Map();

    // Process uploaded files
    if (!files || files.length === 0) {
      await t.rollback();
      res.status(400).json({ message: "Không có hình ảnh được tải lên" });
      return;
    }

    // Group images by color
    files.forEach((file, index) => {
      const indexKey = index.toString();
      const color = imageColors[indexKey] || "default";

      if (!colorImageMap.has(color)) {
        colorImageMap.set(color, []);
      }

      colorImageMap.get(color).push({
        url: file.location,
        isMain:
          imageIsMain[indexKey] === true || imageIsMain[indexKey] === "true",
        displayOrder: colorImageMap.get(color).length,
      });
    });

    // Process each color's images
    for (const [color, images] of colorImageMap.entries()) {
      // Find product detail for this color
      let productDetail = (product as any).details.find(
        (detail: any) => detail.color === color
      );

      // If detail doesn't exist for this color, create one
      if (!productDetail) {
        productDetail = await ProductDetail.create(
          {
            productId: product.id,
            color: color,
            price: 0, // Default price
            originalPrice: 0,
          },
          { transaction: t }
        );
      }

      // Add images to this detail
      for (const imageInfo of images) {
        // If this is set as main, remove main flag from other images
        if (imageInfo.isMain) {
          await ProductImage.update(
            { isMain: false },
            {
              where: {
                productDetailId: productDetail.id,
                isMain: true,
              },
              transaction: t,
            }
          );
        }

        // Create the new image
        await ProductImage.create(
          {
            productDetailId: productDetail.id,
            url: imageInfo.url,
            isMain: imageInfo.isMain,
            displayOrder: imageInfo.displayOrder,
          },
          { transaction: t }
        );
      }
    }

    await t.commit();
    res.status(200).json({
      message: "Thêm hình ảnh sản phẩm thành công",
      productId: id,
    });
  } catch (error: any) {
    await t.rollback();

    // Clean up uploaded files on error
    if (files && files.length > 0) {
      try {
        await Promise.all(files.map((file) => deleteFile(file.location)));
      } catch (cleanupError) {
        console.error("Error cleaning up S3 files:", cleanupError);
      }
    }

    console.error("ADD PRODUCT IMAGES ERROR:", {
      message: error.message,
      stack: error.stack,
      requestId: req.params.id,
    });

    res.status(500).json({
      message: "Lỗi khi thêm hình ảnh sản phẩm",
      error: error.message,
    });
  }
};

/**
 * Remove images from product
 */
export const removeProductImages = async (
  req: Request,
  res: Response
): Promise<void> => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { imageIds } = req.body;

    if (!Array.isArray(imageIds) || imageIds.length === 0) {
      await t.rollback();
      res.status(400).json({ message: "Danh sách hình ảnh không hợp lệ" });
      return;
    }

    // Check if product exists
    const product = await Product.findByPk(id, { transaction: t });
    if (!product) {
      await t.rollback();
      res.status(404).json({ message: "Sản phẩm không tồn tại" });
      return;
    }

    // Find all images that belong to this product's details
    const images = await ProductImage.findAll({
      where: { id: { [Op.in]: imageIds } },
      include: [
        {
          model: ProductDetail,
          as: "productDetail",
          where: { productId: id },
          required: true,
        },
      ],
      transaction: t,
    });

    if (images.length === 0) {
      await t.rollback();
      res
        .status(404)
        .json({ message: "Không tìm thấy hình ảnh nào thuộc sản phẩm này" });
      return;
    }

    // Delete images and their S3 files
    for (const image of images) {
      const imageUrl = image.getDataValue("url");
      const isMain = image.getDataValue("isMain");
      const productDetailId = image.getDataValue("productDetailId");

      // Delete image from database
      await image.destroy({ transaction: t });

      // Delete file from S3
      await deleteFile(imageUrl);

      // If this was a main image, set another image as main
      if (isMain) {
        const anotherImage = await ProductImage.findOne({
          where: { productDetailId },
          transaction: t,
        });

        if (anotherImage) {
          await anotherImage.update({ isMain: true }, { transaction: t });
        }
      }
    }

    await t.commit();
    res.status(200).json({
      message: "Xóa hình ảnh sản phẩm thành công",
      productId: id,
      removedCount: images.length,
    });
  } catch (error: any) {
    await t.rollback();
    console.error("REMOVE PRODUCT IMAGES ERROR:", {
      message: error.message,
      stack: error.stack,
      requestId: req.params.id,
    });

    res.status(500).json({
      message: "Lỗi khi xóa hình ảnh sản phẩm",
      error: error.message,
    });
  }
};

/**
 * Set image as main for product
 */
export const setMainProductImage = async (
  req: Request,
  res: Response
): Promise<void> => {
  const t = await sequelize.transaction();

  try {
    const { id, imageId } = req.params;

    // Check if product exists
    const product = await Product.findByPk(id, { transaction: t });
    if (!product) {
      await t.rollback();
      res.status(404).json({ message: "Sản phẩm không tồn tại" });
      return;
    }

    // Find image and verify it belongs to this product
    const image = await ProductImage.findOne({
      where: { id: imageId },
      include: [
        {
          model: ProductDetail,
          as: "productDetail",
          where: { productId: id },
          required: true,
        },
      ],
      transaction: t,
    });

    if (!image) {
      await t.rollback();
      res
        .status(404)
        .json({ message: "Không tìm thấy hình ảnh thuộc sản phẩm này" });
      return;
    }

    const productDetailId = image.getDataValue("productDetailId");

    // Reset all images for this color to not be main
    await ProductImage.update(
      { isMain: false },
      {
        where: { productDetailId },
        transaction: t,
      }
    );

    // Set this image as main
    await image.update({ isMain: true }, { transaction: t });

    await t.commit();
    res.status(200).json({
      message: "Đặt ảnh chính thành công",
      productId: id,
      imageId,
    });
  } catch (error: any) {
    await t.rollback();
    console.error("SET MAIN PRODUCT IMAGE ERROR:", {
      message: error.message,
      stack: error.stack,
      requestId: req.params.id,
    });

    res.status(500).json({
      message: "Lỗi khi đặt ảnh chính",
      error: error.message,
    });
  }
};

/**
 * Update product variants
 */
export const updateProductVariants = async (
  req: Request,
  res: Response
): Promise<void> => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { variants } = req.body;

    // Check if product exists
    const product = await Product.findByPk(id, { transaction: t });
    if (!product) {
      await t.rollback();
      res.status(404).json({ message: "Sản phẩm không tồn tại" });
      return;
    }

    // Validate variants data
    if (!Array.isArray(variants)) {
      await t.rollback();
      res.status(400).json({ message: "Dữ liệu biến thể không hợp lệ" });
      return;
    }

    // Check for duplicate colors in the request
    const colors = variants.map((v) => v.color);
    const duplicateColors = colors.filter(
      (color, index) => colors.indexOf(color) !== index
    );

    if (duplicateColors.length > 0) {
      await t.rollback();
      res.status(400).json({
        message: `Phát hiện màu trùng lặp: ${duplicateColors.join(", ")}`,
        duplicateColors,
      });
      return;
    }

    // Get all existing product details for this product
    const existingDetails = await ProductDetail.findAll({
      where: { productId: Number(id) },
      transaction: t,
    });

    // Create map of existing colors for quick lookup
    const existingColorMap = new Map();
    existingDetails.forEach((detail) => {
      existingColorMap.set(detail.getDataValue("color"), detail);
    });

    console.log(
      `Found ${existingDetails.length} existing details for product ${id}`
    );

    // Process each variant
    for (const variant of variants) {
      // Handle case where variant has an ID (update existing)
      if (variant.id) {
        // Update existing variant
        const productDetail = await ProductDetail.findByPk(variant.id, {
          transaction: t,
          include: [{ model: ProductInventory, as: "inventories" }],
        });

        if (productDetail) {
          // Ensure we're not creating a color conflict
          const existingWithSameColor = existingDetails.find(
            (d) =>
              d.getDataValue("id") !== variant.id &&
              d.getDataValue("color") === variant.color
          );

          if (existingWithSameColor) {
            await t.rollback();
            res.status(400).json({
              message: `Màu "${variant.color}" đã tồn tại trong biến thể khác`,
              conflictingDetailId: existingWithSameColor.getDataValue("id"),
            });
            return;
          }

          // Update variant information
          await productDetail.update(
            {
              color: variant.color,
              price: variant.price || productDetail.getDataValue("price"),
              originalPrice:
                variant.originalPrice ||
                variant.price ||
                productDetail.getDataValue("originalPrice"),
            },
            { transaction: t }
          );

          // Update sizes/inventory if provided
          if (variant.sizes && Array.isArray(variant.sizes)) {
            // Get existing inventories
            const existingInventories =
              (productDetail as any).inventories || [];

            // Create map for quick lookup
            const inventoryMap = new Map();
            existingInventories.forEach((inv: any) => {
              inventoryMap.set(inv.size, inv);
            });

            // Update or create inventory items
            for (const sizeInfo of variant.sizes) {
              const existing = inventoryMap.get(sizeInfo.size);

              if (existing) {
                // Update existing inventory
                await existing.update(
                  {
                    stock: sizeInfo.stock,
                  },
                  { transaction: t }
                );
              } else {
                // Create new inventory
                await ProductInventory.create(
                  {
                    productDetailId: variant.id,
                    size: sizeInfo.size,
                    stock: sizeInfo.stock || 0,
                  },
                  { transaction: t }
                );
              }
            }

            // Delete sizes that are not in the update
            const updatedSizes = variant.sizes.map((s: any) => s.size);
            for (const inv of existingInventories) {
              if (!updatedSizes.includes(inv.size)) {
                await inv.destroy({ transaction: t });
              }
            }
          }
        }
      } else {
        // Handle case where variant has no ID (create new or update existing with same color)

        // Check if a variant with this color already exists
        const existingDetail = existingColorMap.get(variant.color);

        if (existingDetail) {
          // Update existing detail with this color instead of creating a new one
          console.log(`Updating existing detail for color ${variant.color}`);

          await existingDetail.update(
            {
              price: variant.price || existingDetail.getDataValue("price"),
              originalPrice:
                variant.originalPrice ||
                variant.price ||
                existingDetail.getDataValue("originalPrice"),
            },
            { transaction: t }
          );

          // Update or add sizes
          if (variant.sizes && Array.isArray(variant.sizes)) {
            // Get existing inventories
            const existingInventories = await ProductInventory.findAll({
              where: { productDetailId: existingDetail.getDataValue("id") },
              transaction: t,
            });

            // Create map for quick lookup
            const inventoryMap = new Map();
            existingInventories.forEach((inv) => {
              inventoryMap.set(inv.getDataValue("size"), inv);
            });

            // Update or create inventory items
            for (const sizeInfo of variant.sizes) {
              const existing = inventoryMap.get(sizeInfo.size);

              if (existing) {
                // Update existing inventory
                await existing.update(
                  { stock: sizeInfo.stock },
                  { transaction: t }
                );
              } else {
                // Create new inventory
                await ProductInventory.create(
                  {
                    productDetailId: existingDetail.getDataValue("id"),
                    size: sizeInfo.size,
                    stock: sizeInfo.stock || 0,
                  },
                  { transaction: t }
                );
              }
            }

            // Delete sizes not in the update
            const updatedSizes: string[] = variant.sizes.map(
              (s: { size: string }) => s.size
            );
            for (const inv of existingInventories) {
              if (!updatedSizes.includes(inv.getDataValue("size"))) {
                await inv.destroy({ transaction: t });
              }
            }
          }
        } else if (variant.color) {
          // Only create if color is defined
          // Create new variant
          console.log(`Creating new detail for color ${variant.color}`);

          const newVariant = await ProductDetail.create(
            {
              productId: Number(id),
              color: variant.color,
              price: variant.price || 0,
              originalPrice: variant.originalPrice || variant.price || 0,
            },
            { transaction: t }
          );

          // Add sizes if provided
          if (variant.sizes && Array.isArray(variant.sizes)) {
            for (const size of variant.sizes) {
              await ProductInventory.create(
                {
                  productDetailId: newVariant.id,
                  size: size.size,
                  stock: size.stock || 0,
                },
                { transaction: t }
              );
            }
          }
        } else {
          // Skip creating variants with undefined color
          console.log("[Warning] Skipping variant with undefined color");
        }
      }
    }

    await t.commit();
    res.status(200).json({
      message: "Cập nhật biến thể sản phẩm thành công",
      productId: id,
    });
  } catch (error: any) {
    await t.rollback();
    console.error("UPDATE VARIANTS ERROR:", {
      message: error.message,
      stack: error.stack,
      productId: req.params.id,
    });

    res.status(500).json({
      message: "Lỗi khi cập nhật biến thể sản phẩm",
      error: error.message,
    });
  }
};

/**
 * Get product breadcrumb path
 */
export const getProductBreadcrumb = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, {
      include: [
        {
          model: Category,
          as: "categories",
          attributes: ["id", "name", "slug", "parentId"],
          through: { attributes: [] },
        },
      ],
    });

    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    // tạo breadcrumb mặc định
    const breadcrumb: { label: string; href: string; isLast?: boolean }[] = [
      { label: "Trang chủ", href: "/", isLast: false },
    ];

    // Lấy category chính (ưu tiên category cha nếu có)
    const categories = (product as any).categories || [];
    let mainCategory = null;
    let parentCategory = null;

    // Tìm category cha (parentId === null)
    for (const cat of categories) {
      if (!cat.parentId) {
        mainCategory = cat;
        break;
      }
    }

    // Nếu không tìm thấy category cha, lấy category đầu tiên
    if (!mainCategory && categories.length > 0) {
      mainCategory = categories[0];

      // Lấy category cha của mainCategory nếu có
      if (mainCategory.parentId) {
        parentCategory = await Category.findByPk(mainCategory.parentId, {
          attributes: ["id", "name", "slug"],
        });
      }
    }

    // Thêm category cha vào breadcrumb nếu có
    if (parentCategory) {
      breadcrumb.push({
        label: parentCategory.name,
        href: `/category/${parentCategory.slug}`,
      });
    }

    // Thêm category hiện tại vào breadcrumb
    if (mainCategory) {
      breadcrumb.push({
        label: mainCategory.name,
        href: `/category/${mainCategory.slug}`,
      });
    }

    // Thêm sản phẩm hiện tại vào breadcrumb
    breadcrumb.push({
      label: (product as any).name,
      href: `/products/${id}`,
      isLast: true,
    });

    res.status(200).json(breadcrumb);
  } catch (error: any) {
    console.error("Error generating product breadcrumb:", error);
    res.status(500).json({ message: error.message });
  }
};
