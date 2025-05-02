import { Request, Response } from "express";
import { ProductSize } from "../models/ProductSize";
import sequelize from "../config/db";

// Lấy tất cả kích thước
export const getAllSizes = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const sizes = await ProductSize.findAll({
      order: [["displayOrder", "ASC"]],
    });
    res.status(200).json(sizes);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Thêm kích thước mới
export const createSize = async (
  req: Request,
  res: Response
): Promise<void> => {
  const t = await sequelize.transaction();
  try {
    const { value, displayName, category, displayOrder, sizeType } = req.body;

    // Kiểm tra kích thước đã tồn tại chưa
    const existingSize = await ProductSize.findOne({
      where: { value },
      transaction: t,
    });

    if (existingSize) {
      await t.rollback();
      res.status(400).json({ message: "Kích thước này đã tồn tại" });
      return;
    }

    const newSize = await ProductSize.create(
      {
        value,
        displayName: displayName || value,
        category: category || "general",
        sizeType: sizeType || "letter",
        displayOrder: displayOrder || 0,
        active: true,
      },
      { transaction: t }
    );

    await t.commit();
    res.status(201).json(newSize);
  } catch (error: any) {
    await t.rollback();
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật kích thước
export const updateSize = async (
  req: Request,
  res: Response
): Promise<void> => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { value, displayName, category, displayOrder, active } = req.body;

    const size = await ProductSize.findByPk(id, { transaction: t });
    if (!size) {
      await t.rollback();
      res.status(404).json({ message: "Không tìm thấy kích thước" });
      return;
    }

    await size.update(
      {
        value: value || size.getDataValue("value"),
        displayName: displayName || size.getDataValue("displayName"),
        category: category || size.getDataValue("category"),
        displayOrder:
          displayOrder !== undefined
            ? displayOrder
            : size.getDataValue("displayOrder"),
        active: active !== undefined ? active : size.getDataValue("active"),
      },
      { transaction: t }
    );

    await t.commit();
    res.status(200).json(size);
  } catch (error: any) {
    await t.rollback();
    res.status(500).json({ message: error.message });
  }
};

// Xóa kích thước
export const deleteSize = async (
  req: Request,
  res: Response
): Promise<void> => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;

    const size = await ProductSize.findByPk(id, { transaction: t });
    if (!size) {
      await t.rollback();
      res.status(404).json({ message: "Không tìm thấy kích thước" });
      return;
    }

    // Kiểm tra xem kích thước đã được sử dụng chưa
    // Nếu đã sử dụng, chỉ vô hiệu hóa thay vì xóa
    // Code kiểm tra sản phẩm sẽ được thêm ở đây

    await size.destroy({ transaction: t });

    await t.commit();
    res.status(200).json({ message: "Xóa kích thước thành công" });
  } catch (error: any) {
    await t.rollback();
    res.status(500).json({ message: error.message });
  }
};
