import { Request, Response } from "express";
import Category from "../models/Category";

// tạo mới một category
export const createCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name } = req.body;

    // Kiểm tra nếu Category đã tồn tại
    const existingCategory = await Category.findOne({ where: { name } });
    if (existingCategory) {
      res.status(400).json({ message: "Category đã tồn tại" });
      return;
    }

    const newCategory = await Category.create({ name });
    res.status(201).json(newCategory);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// lấy danh sách tất cả category
export const getCategories = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const categories = await Category.findAll();
    res.status(200).json(categories);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật một câtegory
export const updateCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const category = await Category.findByPk(id);
    if (!category) {
      res.status(404).json({ message: "Category không tồn tại" });
      return;
    }

    // cập nhật category
    await category.update({ name });
    res.status(200).json({ message: "Cập nhật thành công", category });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// lấy chi tiết một category theo ID
export const getCategoryById = async (
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
