import { Request, Response } from "express";
import AdminMenuItem from "../models/AdminMenuItem.model";
import { literal, Op } from "sequelize";
import sequelize from "../config/db";

export const getAdminMenu = async (req: Request, res: Response) => {
  try {
    const userRole = req.user?.role;

    if (!userRole) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    let menuItems;

    if (userRole === 1) {
      // Admin: lấy toàn bộ menu
      menuItems = await AdminMenuItem.findAll({
        order: [
          [literal("ISNULL(`parentId`)"), "DESC"],
          ["parentId", "ASC"],
          ["displayOrder", "ASC"],
        ],
        raw: true,
      });
    } else if (userRole === 2) {
      // Employee: chỉ lấy các menu liên quan user, order, product
      // Lấy các menu con liên quan user, order, product
      const childMenus = await AdminMenuItem.findAll({
        where: {
          [Op.or]: [
            { path: { [Op.like]: "%user%" } },
            { path: { [Op.like]: "%order%" } },
            { path: { [Op.like]: "%product%" } },
          ],
        },
        raw: true,
      });

      // Lấy danh sách parentId duy nhất (menu cha)
      const parentIds = [
        ...new Set(childMenus.map((item) => item.parentId).filter(Boolean)),
      ];

      // Lấy các menu cha (nếu có)
      const parentMenus = parentIds.length
        ? await AdminMenuItem.findAll({
            where: { id: parentIds },
            raw: true,
          })
        : [];

      // Gộp menu cha và menu con, sắp xếp lại
      menuItems = [...parentMenus, ...childMenus].sort(
        (a, b) => a.displayOrder - b.displayOrder
      );
    } else {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    res.json(menuItems);
  } catch (error) {
    console.error("Error fetching admin menu:", error);
    res.status(500).json({ message: "Failed to fetch admin menu" });
  }
};

// Lấy tất cả menu items (dạng phẳng để quản lý)
export const getAllAdminMenuItemsFlat = async (req: Request, res: Response) => {
  try {
    const menuItems = await AdminMenuItem.findAll({
      order: [
        [literal("ISNULL(`parentId`)"), "DESC"],
        ["parentId", "ASC"],
        ["displayOrder", "ASC"],
      ],
      raw: true, // Trả về dạng phẳng
    });
    res.json(menuItems || []);
  } catch (error) {
    console.error("Error fetching all admin menu items:", error);
    res.status(500).json({ message: "Failed to fetch menu items" });
  }
};

// Tạo menu item mới
export const createAdminMenuItem = async (req: Request, res: Response) => {
  const { title, path, icon, parentId, displayOrder } = req.body;
  try {
    // Validation cơ bản (có thể thêm validation chi tiết hơn)
    if (!title || !path || !icon) {
      res.status(400).json({ message: "Title, Path, and Icon are required" });
    }

    // Đảm bảo parentId là null nếu không được cung cấp hoặc là chuỗi rỗng
    const validParentId = parentId ? Number(parentId) : null;

    const newItem = await AdminMenuItem.create({
      title,
      path,
      icon,
      parentId: validParentId,
      displayOrder: displayOrder || 0,
    });
    res.status(201).json(newItem);
  } catch (error) {
    console.error("Error creating admin menu item:", error);
    res.status(500).json({ message: "Failed to create menu item" });
  }
};

// Cập nhật menu item
export const updateAdminMenuItem = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, path, icon, parentId, displayOrder } = req.body;
  try {
    const item = await AdminMenuItem.findByPk(id);
    if (!item) {
      res.status(404).json({ message: "Menu item not found" });
      return;
    }

    const validParentId = parentId ? Number(parentId) : null;

    if (validParentId === Number(id)) {
      res.status(400).json({ message: "Cannot set item as its own parent" });
      return;
    }

    await item.update({
      title: title ?? item.title,
      path: path ?? item.path,
      icon: icon ?? item.icon,
      parentId: validParentId !== undefined ? validParentId : item.parentId,
      displayOrder: displayOrder ?? item.displayOrder,
    });
    res.json(item);
  } catch (error) {
    console.error("Error updating admin menu item:", error);
    res.status(500).json({ message: "Failed to update menu item" });
  }
};

// Xóa menu item
export const deleteAdminMenuItem = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const item = await AdminMenuItem.findByPk(id);
    if (!item) {
      res.status(404).json({ message: "Menu item not found" });
      return;
    }

    const children = await AdminMenuItem.count({ where: { parentId: id } });
    if (children > 0) {
      res.status(400).json({
        message:
          "Cannot delete item with children. Please delete or reassign children first.",
      });
      return;
    }

    await item.destroy();
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting admin menu item:", error);
    res.status(500).json({ message: "Failed to delete menu item" });
  }
};

// Thêm phương thức mới
export const updateMenuOrder = async (req: Request, res: Response) => {
  const { items } = req.body;

  if (!items || !Array.isArray(items)) {
    res.status(400).json({ message: "Invalid input data" });
    return;
  }

  try {
    // Sử dụng transaction để đảm bảo tính nhất quán
    await sequelize.transaction(async (t) => {
      for (const item of items) {
        await AdminMenuItem.update(
          { displayOrder: item.displayOrder },
          {
            where: { id: item.id },
            transaction: t,
          }
        );
      }
    });

    res.json({ message: "Menu order updated successfully" });
  } catch (error) {
    console.error("Error updating menu order:", error);
    res.status(500).json({ message: "Failed to update menu order" });
  }
};
