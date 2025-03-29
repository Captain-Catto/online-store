import { Request, Response } from "express";
import ProductCategory from "../models/ProductCategory";
import Product from "../models/Product";
import Category from "../models/Category";

// Thêm danh mục vào sản phẩm
export const addCategoryToProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { productId, categoryId } = req.body;

    // Kiểm tra sản phẩm và danh mục có tồn tại không
    const product = await Product.findByPk(productId);
    const category = await Category.findByPk(categoryId);

    if (!product || !category) {
      res.status(404).json({ message: "Sản phẩm hoặc danh mục không tồn tại" });
      return;
    }

    // Thêm danh mục vào sản phẩm
    await ProductCategory.create({ productId, categoryId });

    res
      .status(201)
      .json({
        message: "Thêm danh mục vào sản phẩm thành công",
        productId,
        categoryId,
      });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Xóa danh mục khỏi sản phẩm
export const removeCategoryFromProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { productId, categoryId } = req.body;

    // Xóa mối quan hệ giữa sản phẩm và danh mục
    const result = await ProductCategory.destroy({
      where: { productId, categoryId },
    });

    if (result === 0) {
      res.status(404).json({ message: "Không tìm thấy mối quan hệ để xóa" });
      return;
    }

    res.status(200).json({ message: "Xóa danh mục khỏi sản phẩm thành công" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
