import { Request, Response } from "express";
import sequelize from "../config/db";
import Product from "../models/Product";
import ProductDetail from "../models/ProductDetail";
import ProductInventory from "../models/ProductInventory";
import ProductCategory from "../models/ProductCategory";
import Category from "../models/Category";

/**
 * Create a product with details and inventory
 */
export const createProductWithDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  const t = await sequelize.transaction();
  // sử dụng transaction để khi tạo data ở nhiều csdl nếu có lỗi
  // ở 1 trong số đó thì sẽ rollback lại

  try {
    const { name, details, categories } = req.body;

    // Check if product already exists
    const existingProduct = await Product.findOne({
      where: { name },
      transaction: t,
    });

    if (existingProduct) {
      await t.rollback();
      res.status(400).json({ message: "Sản phẩm đã tồn tại" });
      return;
    }

    // Create new product
    const newProduct = await Product.create({ name }, { transaction: t });

    // Create product details with their respective inventories
    for (const detail of details) {
      // Create product detail (color and images)
      const productDetail = await ProductDetail.create(
        {
          productId: newProduct.id,
          color: detail.color,
          imagePath: JSON.stringify(detail.images || []),
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

/**
 * Get all products with their variants, inventory and categories
 */
export const getProductsWithVariants = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Get products with details, inventory and categories
    const products = await Product.findAll({
      include: [
        {
          model: ProductDetail,
          as: "details",
          include: [
            {
              model: ProductInventory,
              as: "inventories",
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

    // Format data for optimized response
    const formattedProducts = products.map((product: any) => {
      const details = product.details || [];

      // Get all unique colors
      const uniqueColors = [
        ...new Set(details.map((detail: any) => detail.color)),
      ];

      // Create mapping for each color: images and available sizes
      const variantMap: Record<string, any> = {};

      uniqueColors.forEach((color) => {
        // Get the detail record for this color
        const detailWithColor = details.find((d: any) => d.color === color);

        if (!detailWithColor) return;

        // Parse images - add debugging
        let images = [];
        try {
          // Add validation to make sure imagePath is a complete valid string
          let rawPath = detailWithColor.imagePath || "[]";

          // If the JSON is malformed but we can identify the issue is truncation
          if (rawPath.includes("[") && !rawPath.includes("]")) {
            // Try to repair the JSON by adding closing bracket
            rawPath += '"]';
            console.log("Attempted to repair truncated JSON");
          }

          images = JSON.parse(rawPath);
        } catch (e) {
          console.error("Error parsing imagePath:", e);
          // Return empty array on error
          images = [];
        }

        // Get inventory for this color
        const inventories = detailWithColor.inventories || [];

        // Map inventory to a simple size->stock object
        const sizeInventory: Record<string, number> = {};
        inventories.forEach((inv: any) => {
          if (inv.stock > 0) {
            sizeInventory[inv.size] = inv.stock;
          }
        });

        // Add to variant map with explicit images property
        variantMap[color as string] = {
          detailId: detailWithColor.id,
          images: images, // Ensure this is included
          sizes: sizeInventory,
          availableSizes: Object.keys(sizeInventory),
        };
      });

      return {
        id: product.id,
        name: product.name,
        categories: product.categories || [],
        variants: {
          colors: uniqueColors,
          details: variantMap,
        },
      };
    });

    res.status(200).json(formattedProducts);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get a specific product by ID
 */
export const getProductById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

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
      res.status(404).json({ message: "Sản phẩm không tồn tại" });
      return;
    }

    // Format product details similar to getProductsWithVariants
    const details = (product as any).details || [];
    const uniqueColors = [
      ...new Set(details.map((detail: any) => detail.color)),
    ];

    const variantMap: Record<string, any> = {};

    uniqueColors.forEach((color) => {
      const detailWithColor = details.find((d: any) => d.color === color);

      if (!detailWithColor) return;

      // Parse images
      let images = [];
      try {
        images = JSON.parse(detailWithColor.imagePath || "[]");
      } catch (e) {
        images = [];
      }

      // Get inventory for this color
      const inventories = detailWithColor.inventories || [];

      // Map inventory to a simple size->stock object
      const sizeInventory: Record<string, number> = {};
      inventories.forEach((inv: any) => {
        sizeInventory[inv.size] = inv.stock;
      });

      // Add to variant map
      variantMap[color as string] = {
        detailId: detailWithColor.id,
        images,
        sizes: Object.keys(sizeInventory).filter(
          (size) => sizeInventory[size] > 0
        ),
        inventory: sizeInventory,
      };
    });

    const formattedProduct = {
      id: product.id,
      name: (product as any).name,
      categories: (product as any).categories || [],
      variants: {
        colors: uniqueColors,
        details: variantMap,
      },
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
    const { name, categories } = req.body;

    // Find product
    const product = await Product.findByPk(id, { transaction: t });

    if (!product) {
      await t.rollback();
      res.status(404).json({ message: "Sản phẩm không tồn tại" });
      return;
    }

    // Update product name if provided
    if (name) {
      await product.update({ name }, { transaction: t });
    }

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

    // Get all product details to delete their inventories
    const details = await ProductDetail.findAll({
      where: { productId: id },
      transaction: t,
    });

    // Delete inventories for each detail
    for (const detail of details) {
      await ProductInventory.destroy({
        where: { productDetailId: (detail as any).id },
        transaction: t,
      });
    }

    // Delete product details
    await ProductDetail.destroy({
      where: { productId: id },
      transaction: t,
    });

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
 * Add a new color variant to an existing product
 */
export const addProductVariant = async (
  req: Request,
  res: Response
): Promise<void> => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { color, images, sizes } = req.body;

    // Check if product exists
    const product = await Product.findByPk(id, { transaction: t });

    if (!product) {
      await t.rollback();
      res.status(404).json({ message: "Sản phẩm không tồn tại" });
      return;
    }

    // Check if color already exists for this product
    const existingDetail = await ProductDetail.findOne({
      where: { productId: id, color },
      transaction: t,
    });

    if (existingDetail) {
      await t.rollback();
      res.status(400).json({ message: "Màu này đã tồn tại cho sản phẩm" });
      return;
    }

    // Create new product detail
    const productDetail = await ProductDetail.create(
      {
        productId: id,
        color,
        imagePath: JSON.stringify(images || []),
      },
      { transaction: t }
    );

    // Add sizes and inventory
    if (sizes && sizes.length > 0) {
      for (const sizeInfo of sizes) {
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

    await t.commit();

    res.status(201).json({
      message: "Thêm biến thể màu mới thành công",
      detailId: (productDetail as any).id,
    });
  } catch (error: any) {
    await t.rollback();
    res.status(500).json({
      message: "Lỗi khi thêm biến thể màu",
      error: error.message,
    });
  }
};

//
const data = [
  {
    id: "1234649896",
    name: "Khoa ở trần",
    color: ["white", "black", "yellow"],
    sizes: ["S", "M", "L"],
    stock: [
      { size: "S", color: "white", stock: 10 },
      { size: "M", color: "white", stock: 20 },
      { size: "L", color: "white", stock: 30 },
      { size: "S", color: "black", stock: 10 },
      { size: "M", color: "black", stock: 20 },
      { size: "L", color: "black", stock: 30 },
    ],
    images: [
      {
        src: "https://www.google.com.vn",
        color: "white",
        size: "S",
        isFront: true,
        isProductOnly: false,
        stock: 10,
      },
      {
        src: "https://www.google.com.vn",
        color: "white",
        size: "S",
        isFront: false,
        isProductOnly: true,
        stock: 10,
      },
    ],
  },
];
