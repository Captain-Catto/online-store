import { Request, Response } from "express";
import { Op } from "sequelize";
import Category from "../models/Category";
import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import Product from "../models/Product";
import ProductDetail from "../models/ProductDetail";
import ProductInventory from "../models/ProductInventory";
import ProductImage from "../models/ProductImage";
import Suitability from "../models/Suitability";

// Cấu hình upload file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../../uploads/categories");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `category-${uuidv4()}${ext}`;
    cb(null, uniqueName);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Định dạng file không được hỗ trợ. Chỉ hỗ trợ JPEG, PNG, WEBP và GIF."
        )
      );
    }
  },
}).single("image");

// Cập nhật hàm tạo mới một category
export const createCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: `Lỗi upload: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }

    try {
      const { name, slug, description, parentId, isActive } = req.body;
      console.log("isActive", isActive);
      // Kiểm tra nếu Category đã tồn tại
      const existingCategory = await Category.findOne({ where: { slug } });
      if (existingCategory) {
        return res.status(400).json({ message: "Slug danh mục đã tồn tại" });
      }

      // Lấy đường dẫn file nếu có upload
      const image = req.file
        ? `/uploads/categories/${req.file.filename}`
        : null;

      const newCategory = await Category.create({
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
        description,
        parentId: parentId || null,
        image,
        isActive: isActive === "true" || isActive === true,
      });

      res.status(201).json(newCategory);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
};

// Cập nhật một category
export const updateCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: `Lỗi upload: ${err.message}` });
    }

    try {
      const { id } = req.params;
      const { name, slug, description, parentId, isActive } = req.body;

      const category = await Category.findByPk(id);
      if (!category) {
        return res.status(404).json({ message: "Danh mục không tồn tại" });
      }

      // Kiểm tra slug trùng lặp (trừ slug hiện tại)
      if (slug && slug !== category.slug) {
        const existingCategory = await Category.findOne({
          where: {
            slug,
            id: { [Op.ne]: id }, // Op.ne = not equal, tức là không phải category hiện tại
          },
        });
        if (existingCategory) {
          return res.status(400).json({ message: "Slug danh mục đã tồn tại" });
        }
      }

      // Tạo object cập nhật
      const updateData: any = {
        name: name || category.name,
        slug: slug || category.slug,
        description,
        parentId: parentId !== undefined ? parentId || null : category.parentId,
        isActive:
          isActive !== undefined ? isActive === "true" : category.isActive,
      };

      // Nếu có upload file mới
      if (req.file) {
        // Xóa file cũ nếu có
        if (category.image) {
          const oldImagePath = path.join(__dirname, "../../", category.image);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }

        // Cập nhật đường dẫn mới
        updateData.image = `/uploads/categories/${req.file.filename}`;
      }

      // Cập nhật category
      await category.update(updateData);
      res.status(200).json({ message: "Cập nhật thành công", category });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
};

// lấy chi tiết một category theo ID
export const getCategoryById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id, {
      attributes: [
        "id",
        "name",
        "slug",
        "description",
        "image",
        "parentId",
        "isActive",
      ],
      include: [
        {
          model: Category,
          as: "children",
          attributes: ["id", "name", "slug", "isActive"],
          where: { isActive: true },
          required: false, // LEFT JOIN
        },
      ],
    });

    if (!category) {
      res.status(404).json({ message: "Danh mục không tồn tại" });
      return;
    }

    res.status(200).json(category);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// xóa category
export const deleteCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);
    if (!category) {
      res.status(404).json({ message: "Category không tồn tại" });
      return;
    }

    // Xóa Category
    await category.destroy();
    res.status(200).json({ message: "Xóa Category thành công" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// lấy tất cả categories và subtypes kể cả không active
export const getAllCategories = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Lấy tất cả các danh mục
    const categories = await Category.findAll({
      attributes: [
        "id",
        "name",
        "slug",
        "description",
        "image",
        "parentId",
        "isActive",
      ],
      order: [["name", "ASC"]],
    });

    // Sắp xếp thành cấu trúc cha-con
    const result = categories.reduce((acc, category) => {
      if (!category.parentId) {
        // Nếu là danh mục cha
        acc.push({
          ...category.toJSON(),
          children: categories
            .filter((child) => child.parentId === category.id)
            .map((child) => child.toJSON()),
        });
      }
      return acc;
    }, [] as any[]);

    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy danh mục cho navigation (danh mục cha và con)
export const getNavCategories = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Lấy tất cả danh mục cha (parentId = null và isActive = true)
    const parentCategories = await Category.findAll({
      where: {
        parentId: null,
        isActive: true,
      },
      attributes: ["id", "name", "slug"],
      order: [["name", "ASC"]],
    });

    // Tạo mảng kết quả với cấu trúc phù hợp cho navbar
    const result = await Promise.all(
      parentCategories.map(async (parent) => {
        // Lấy tất cả danh mục con của danh mục cha hiện tại
        const childCategories = await Category.findAll({
          where: {
            parentId: parent.id,
            isActive: true,
          },
          attributes: ["id", "name", "slug"],
          order: [["name", "ASC"]],
        });

        return {
          id: parent.id,
          name: parent.name,
          slug: parent.slug,
          children: childCategories.map((child) => ({
            id: child.id,
            name: child.name,
            slug: child.slug,
          })),
        };
      })
    );

    res.status(200).json(result);
  } catch (error: any) {
    console.error("Lỗi khi lấy danh mục cho navbar:", error);
    res.status(500).json({ message: error.message });
  }
};

// Lấy danh mục theo slug
export const getCategoryBySlug = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { slug } = req.params;

    const category = await Category.findOne({
      where: { slug, isActive: true },
      attributes: [
        "id",
        "name",
        "slug",
        "description",
        "image",
        "parentId",
        "isActive",
      ],
      include: [
        {
          model: Category,
          as: "children",
          attributes: ["id", "name", "slug", "isActive"],
          where: { isActive: true },
          required: false,
        },
      ],
    });

    if (!category) {
      res.status(404).json({ message: "Danh mục không tồn tại" });
      return;
    }

    res.status(200).json(category);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy sản phẩm theo slug của danh mục
export const getProductsByCategorySlug = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { slug } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const offset = (page - 1) * limit;

    // Filter parameters
    const color = req.query.color as string;
    const sizeParam = req.query.size as string;
    const sizes = sizeParam ? sizeParam.split(",") : [];
    const brand = req.query.brand as string;
    const minPrice = parseFloat(req.query.minPrice as string) || 0;
    const maxPrice = parseFloat(req.query.maxPrice as string) || 9999999999;
    const featured = req.query.featured === "true" ? true : undefined;
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder =
      (req.query.sortOrder as string)?.toUpperCase() === "ASC" ? "ASC" : "DESC";

    const suitabilityParam = req.query.suitability as string;
    const suitabilities = suitabilityParam ? suitabilityParam.split(",") : [];

    // Tìm category theo slug
    const category = await Category.findOne({
      where: { slug, isActive: true },
      include: [
        {
          model: Category,
          as: "parent",
          attributes: ["id", "name", "slug"],
          required: false,
        },
      ],
    });

    if (!category) {
      res.status(404).json({ message: "Danh mục không tồn tại" });
      return;
    }

    // Lấy tất cả ID danh mục (bao gồm danh mục con)
    const categoryIds = [category.id];

    // Nếu là danh mục cha, thêm tất cả danh mục con
    if (category.parentId === null) {
      const childCategories = await Category.findAll({
        where: { parentId: category.id, isActive: true },
        attributes: ["id"],
      });

      categoryIds.push(...childCategories.map((child) => child.id));
    }

    // Xây dựng điều kiện lọc cho sản phẩm
    const productWhere: any = {
      status: { [Op.ne]: "draft" }, // Chỉ lấy sản phẩm không phải là bản nháp
    };
    if (brand) productWhere.brand = brand;
    if (featured !== undefined) productWhere.featured = featured;

    // Xây dựng điều kiện lọc cho product details
    const detailWhere: any = {};
    if (color) detailWhere.color = color;

    // Xây dựng điều kiện giá
    if (minPrice > 0 || maxPrice < 9999999999) {
      detailWhere.price = {
        [Op.between]: [minPrice, maxPrice],
      };
    }

    // Xây dựng điều kiện lọc cho inventories
    const inventoryWhere: any = {};
    if (sizes.length > 0) {
      inventoryWhere.size = { [Op.in]: sizes };
      inventoryWhere.stock = { [Op.gt]: 0 }; // Chỉ lấy size còn hàng
    }

    // Xác định thứ tự sắp xếp
    let order: any[] = [];

    // Sắp xếp theo giá là trường hợp đặc biệt vì giá nằm trong ProductDetail
    if (sortBy === "price") {
      order = [[{ model: ProductDetail, as: "details" }, "price", sortOrder]];
    } else {
      // Các trường sắp xếp khác thuộc về Product
      const validFields = ["createdAt", "name", "brand"];
      if (validFields.includes(sortBy)) {
        order = [[sortBy, sortOrder]];
      } else {
        order = [["createdAt", "DESC"]]; // Default
      }
    }

    // Lấy sản phẩm theo danh mục với các điều kiện lọc
    const { count, rows: products } = await Product.findAndCountAll({
      where: productWhere,
      include: [
        {
          model: Category,
          as: "categories",
          attributes: ["id", "name", "slug"],
          through: { attributes: [] },
          where: { id: { [Op.in]: categoryIds } },
        },
        {
          model: ProductDetail,
          as: "details",
          attributes: ["id", "productId", "color", "price", "originalPrice"],
          where: Object.keys(detailWhere).length > 0 ? detailWhere : undefined,
          include: [
            {
              model: ProductInventory,
              as: "inventories",
              attributes: ["id", "productDetailId", "size", "stock"],
              where:
                Object.keys(inventoryWhere).length > 0
                  ? inventoryWhere
                  : undefined,
              required: sizes.length > 0, // Chỉ yêu cầu nếu có lọc size
            },
            {
              model: ProductImage,
              as: "images",
              attributes: ["id", "productDetailId", "url", "isMain"],
            },
          ],
          required: Object.keys(detailWhere).length > 0 || sizes.length > 0,
        },
        {
          model: Suitability,
          as: "suitabilities",
          attributes: ["id", "name"],
          through: { attributes: [] },
          required: suitabilities.length > 0,
          where:
            suitabilities.length > 0
              ? { name: { [Op.in]: suitabilities } }
              : undefined,
        },
      ],
      order,
      limit,
      offset,
      distinct: true,
    });

    // Format dữ liệu sản phẩm để dễ sử dụng ở frontend
    const formattedProducts = products.map((product) => {
      const productData = product.toJSON();

      // Tổng hợp thông tin màu sắc, kích thước, hình ảnh
      const colors = [
        ...new Set(productData.details.map((detail: any) => detail.color)),
      ];
      const sizes = [
        ...new Set(
          productData.details.flatMap((detail: any) =>
            detail.inventories.map((inv: any) => inv.size)
          )
        ),
      ];

      // Lấy hình ảnh chính
      const mainImages = productData.details
        .flatMap((detail: any) => detail.images)
        .filter((image: any) => image.isMain);

      // lấy thêm 1 ảnh phụ
      const subImage = productData.details
        .flatMap((detail: any) => detail.images)
        .filter((image: any) => !image.isMain)
        .slice(0, 1); // Lấy 1 ảnh phụ đầu tiên

      const mainImage = mainImages.length > 0 ? mainImages[0].url : null;

      // Tính giá thấp nhất, cao nhất
      const prices = productData.details.map((detail: any) => detail.price);
      const minProductPrice = Math.min(...prices);
      const maxProductPrice = Math.max(...prices);

      // Kiểm tra xem sản phẩm có giảm giá không
      const hasDiscount = productData.details.some(
        (detail: any) =>
          detail.originalPrice && detail.originalPrice > detail.price
      );

      return {
        id: productData.id,
        name: productData.name,
        sku: productData.sku,
        slug: productData.slug,
        description: productData.description,
        brand: productData.brand,
        featured: productData.featured,
        status: productData.status,
        mainImage,
        subImage,
        price: prices.length === 1 ? prices[0] : null,
        priceRange:
          prices.length > 1
            ? {
                min: minProductPrice,
                max: maxProductPrice,
              }
            : null,
        hasDiscount,
        colors,
        sizes,
        categories: productData.categories,
        suitabilities: productData.suitabilities || [],
      };
    });

    res.status(200).json({
      products: formattedProducts,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        image: category.image,
        parentCategory: category.parentId
          ? await Category.findByPk(category.parentId)
          : null,
      },
      filters: {
        availableColors: [
          ...new Set(
            products.flatMap((p) => (p.details ?? []).map((d) => d.color))
          ),
        ],
        availableSizes: [
          ...new Set(
            products.flatMap((p) =>
              (p.details || []).flatMap((d: any) =>
                (d.inventories || []).map((i: any) => i.size)
              )
            )
          ),
        ],
        priceRange: {
          min: Math.min(
            ...products.flatMap((p) => (p.details ?? []).map((d) => d.price))
          ),
          max: Math.max(
            ...products.flatMap((p) => (p.details ?? []).map((d) => d.price))
          ),
        },
        brands: [...new Set(products.map((p) => p.brand).filter(Boolean))],
        suitabilities: [
          ...new Set(
            products.flatMap((p) => (p.suitabilities || []).map((s) => s.name))
          ),
        ],
      },
    });
  } catch (error: any) {
    console.error("Lỗi khi lấy sản phẩm theo danh mục:", error);
    res.status(500).json({ message: error.message });
  }
};
