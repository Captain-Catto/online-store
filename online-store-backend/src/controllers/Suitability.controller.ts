import { Request, Response } from "express";
import Suitability from "../models/Suitability";
import ProductSuitability from "../models/ProductSuitability";
import sequelize from "../config/db";

// Tạo mới một suitability
export const createSuitability = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, description } = req.body;
    const newSuitability = await Suitability.create({ name, description });
    res.status(201).json(newSuitability);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// update thứ tự suitability
export const updateSuitabilityOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items)) {
      res.status(400).json({ message: "Items phải là một mảng" });
      return;
    }

    // Thực hiện cập nhật theo transaction để đảm bảo tính nhất quán
    await sequelize.transaction(async (t) => {
      for (const item of items) {
        if (!item.id || typeof item.sortOrder !== "number") {
          continue; // Bỏ qua các item không hợp lệ
        }

        await Suitability.update(
          { sortOrder: item.sortOrder },
          {
            where: { id: item.id },
            transaction: t,
          }
        );
      }
    });

    res.status(200).json({ message: "Cập nhật thứ tự thành công" });
  } catch (error: any) {
    console.error("Lỗi khi cập nhật thứ tự:", error);
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật hàm getAllSuitabilities để sắp xếp theo sortOrder
export const getAllSuitabilities = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const suitabilities = await Suitability.findAll({
      order: [
        ["sortOrder", "ASC"],
        ["id", "ASC"],
      ],
    });
    res.status(200).json(suitabilities);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật suitability
export const updateSuitability = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const suitability = await Suitability.findByPk(id);

    if (!suitability) {
      res.status(404).json({ message: "Suitability không tồn tại" });
      return;
    }

    await suitability.update({ name, description });
    res.json({ message: "Cập nhật thành công", suitability });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Xóa suitability
export const deleteSuitability = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const suitability = await Suitability.findByPk(id);

    if (!suitability) {
      res.status(404).json({ message: "Suitability không tồn tại" });
      return;
    }

    await suitability.destroy();
    res.json({ message: "Xóa thành công" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Thêm suitability cho sản phẩm
export const addProductSuitability = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { productId, suitabilityId } = req.body;
    await ProductSuitability.create({ productId, suitabilityId });
    res.status(201).json({ message: "Thêm thành công" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Xóa suitability khỏi sản phẩm
export const removeProductSuitability = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { productId, suitabilityId } = req.params;
    await ProductSuitability.destroy({
      where: { productId, suitabilityId },
    });
    res.json({ message: "Xóa thành công" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
