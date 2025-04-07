import { Request, Response } from "express";
import sequelize from "../config/db";
import Product from "../models/Product";
import ProductDetail from "../models/ProductDetail";
import ProductInventory from "../models/ProductInventory";
import ProductImage from "../models/ProductImage";
import ProductCategory from "../models/ProductCategory";
import Category from "../models/Category";
import { getPublicUrl, deleteFile } from "../services/imageUpload";
import { Op } from "sequelize";

/**
 * Create a product with details and inventory
 */
export const createProductWithDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  const t = await sequelize.transaction();

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
      details,
      categories,
    } = req.body;

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
        featured: featured || false,
        status: status || "draft",
        tags,
        suitability,
      },
      { transaction: t }
    );

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
              productDetailId: (productDetail as any).id,
              size: sizeInfo.size,
              stock: sizeInfo.stock || 0,
            },
            { transaction: t }
          );
        }
      }
    }

    // Add product to categories if specified
    if (categories && categories.length > 0) {
      const categoryEntries = categories.map((categoryId: number) => ({
        productId: newProduct.id,
        categoryId,
      }));

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

    // Tính offset
    const offset = (page - 1) * limit;

    // Tạo where condition
    const where: any = {};

    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }
    if (status) {
      where.status = status;
    }
    if (brand) {
      where.brand = brand;
    }

    // Lấy tổng số sản phẩm
    const count = await Product.count({ where });

    // Get products với phân trang và filter
    const products = await Product.findAll({
      where,
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
          ...(category && { where: { id: category } }),
        },
      ],
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });
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
        tags: product.tags || [],
        suitability: product.suitability || [],
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
      pagination: {
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
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
      tags: (product as any).tags || [],
      suitability: (product as any).suitability || [],
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
 * Update a product
 */
export const updateProduct = async (
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
      suitability,
      categories,
    } = req.body;

    // Find product
    const product = await Product.findByPk(id, { transaction: t });

    if (!product) {
      await t.rollback();
      res.status(404).json({ message: "Sản phẩm không tồn tại" });
      return;
    }

    // Update product basic information
    await product.update(
      {
        name,
        sku,
        description,
        brand,
        material,
        featured,
        status,
        tags,
        suitability,
      },
      { transaction: t }
    );

    // Update categories if provided
    if (categories) {
      // Remove existing categories
      await ProductCategory.destroy({
        where: { productId: id },
        transaction: t,
      });

      // Add new categories
      if (categories.length > 0) {
        const categoryEntries = categories.map((categoryId: number) => ({
          productId: Number(id),
          categoryId,
        }));

        await ProductCategory.bulkCreate(categoryEntries, { transaction: t });
      }
    }

    await t.commit();

    res.status(200).json({
      message: "Cập nhật sản phẩm thành công",
      productId: id,
    });
  } catch (error: any) {
    await t.rollback();
    res.status(500).json({
      message: "Lỗi khi cập nhật sản phẩm",
      error: error.message,
    });
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
export const getProductsByCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { categoryId } = req.params;

    // Pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    // Find category to check if exists
    const category = await Category.findByPk(categoryId);
    if (!category) {
      res.status(404).json({ message: "Danh mục không tồn tại" });
      return;
    }

    // Count products in this category for pagination
    const count = await Product.count({
      include: [
        {
          model: Category,
          as: "categories",
          where: { id: categoryId },
          through: { attributes: [] },
        },
      ],
    });

    // Get products with details
    const products = await Product.findAll({
      include: [
        {
          model: ProductDetail,
          as: "details",
          include: [
            { model: ProductInventory, as: "inventories" },
            { model: ProductImage, as: "images" },
          ],
        },
        {
          model: Category,
          as: "categories",
          where: { id: categoryId },
          attributes: ["id", "name"],
          through: { attributes: [] },
        },
      ],
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    // Format products (same as in getProductsWithVariants)
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
        tags: product.tags || [],
        suitability: product.suitability || [],
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

    // Return with pagination info
    res.status(200).json({
      categoryName: category.getDataValue("name"),
      products: formattedProducts,
      pagination: {
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
