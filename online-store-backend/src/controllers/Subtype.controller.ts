import { Request, Response } from "express";
import Subtype from "../models/Subtype";
import Category from "../models/Category";

/**
 * Lấy tất cả subtypes
 */
export const getAllSubtypes = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const subtypes = await Subtype.findAll({
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name"],
        },
      ],
    });
    res.status(200).json(subtypes);
  } catch (error: any) {
    console.error("Error getting subtypes:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Lấy subtype theo ID
 */
export const getSubtypeById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const subtype = await Subtype.findByPk(id, {
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name"],
        },
      ],
    });

    if (!subtype) {
      res.status(404).json({ message: "Subtype không tồn tại" });
      return;
    }

    res.status(200).json(subtype);
  } catch (error: any) {
    console.error("Error getting subtype:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Lấy subtypes theo category ID
 */
export const getSubtypesByCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { categoryId } = req.params;
    const subtypes = await Subtype.findAll({
      where: { categoryId },
      order: [["displayName", "ASC"]],
    });
    res.status(200).json(subtypes);
  } catch (error: any) {
    console.error("Error getting subtypes by category:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Tạo subtype mới (admin only)
 */
export const createSubtype = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Kiểm tra quyền admin
    if (!req.user || req.user.role !== 1) {
      res.status(403).json({ message: "Không có quyền truy cập" });
      return;
    }

    const { name, displayName, categoryId } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!name || !displayName || !categoryId) {
      res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
      return;
    }

    // Kiểm tra category có tồn tại không
    const categoryExists = await Category.findByPk(categoryId);
    if (!categoryExists) {
      res.status(400).json({ message: "Category không tồn tại" });
      return;
    }

    // Kiểm tra tên subtype đã tồn tại chưa
    const existingSubtype = await Subtype.findOne({ where: { name } });
    if (existingSubtype) {
      res.status(400).json({ message: "Subtype này đã tồn tại" });
      return;
    }

    // Tạo subtype mới
    const subtype = await Subtype.create({
      name: name.toLowerCase(),
      displayName,
      categoryId,
    });

    res.status(201).json(subtype);
  } catch (error: any) {
    console.error("Error creating subtype:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Cập nhật subtype (admin only)
 */
export const updateSubtype = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Kiểm tra quyền admin
    if (!req.user || req.user.role !== 1) {
      res.status(403).json({ message: "Không có quyền truy cập" });
      return;
    }

    const { id } = req.params;
    const { name, displayName, categoryId } = req.body;

    // Kiểm tra subtype tồn tại
    const subtype = await Subtype.findByPk(id);
    if (!subtype) {
      res.status(404).json({ message: "Subtype không tồn tại" });
      return;
    }

    // Nếu thay đổi category, kiểm tra category mới có tồn tại không
    if (categoryId) {
      const categoryExists = await Category.findByPk(categoryId);
      if (!categoryExists) {
        res.status(400).json({ message: "Category không tồn tại" });
        return;
      }
    }

    // Nếu thay đổi tên, kiểm tra tên mới đã được sử dụng chưa
    if (name && name !== subtype.name) {
      const existingSubtype = await Subtype.findOne({ where: { name } });
      if (existingSubtype) {
        res.status(400).json({ message: "Tên subtype đã được sử dụng" });
        return;
      }
    }

    // Cập nhật subtype
    await subtype.update({
      name: name ? name.toLowerCase() : subtype.name,
      displayName: displayName || subtype.displayName,
      categoryId: categoryId || subtype.categoryId,
    });

    res.status(200).json(await Subtype.findByPk(id));
  } catch (error: any) {
    console.error("Error updating subtype:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Xóa subtype (admin only)
 */
export const deleteSubtype = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Kiểm tra quyền admin
    if (!req.user || req.user.role !== 1) {
      res.status(403).json({ message: "Không có quyền truy cập" });
      return;
    }

    const { id } = req.params;

    // Kiểm tra subtype tồn tại
    const subtype = await Subtype.findByPk(id);
    if (!subtype) {
      res.status(404).json({ message: "Subtype không tồn tại" });
      return;
    }

    // Xóa subtype
    await subtype.destroy();

    res.status(200).json({ message: "Xóa thành công" });
  } catch (error: any) {
    console.error("Error deleting subtype:", error);
    res.status(500).json({ message: error.message });
  }
};
