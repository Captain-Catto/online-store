"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMenuOrder = exports.deleteAdminMenuItem = exports.updateAdminMenuItem = exports.createAdminMenuItem = exports.getAllAdminMenuItemsFlat = exports.getAdminMenu = void 0;
const AdminMenuItem_model_1 = __importDefault(require("../models/AdminMenuItem.model"));
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
const getAdminMenu = async (req, res) => {
    try {
        const userRole = req.user?.role;
        if (!userRole) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        let menuItems;
        if (userRole === 1) {
            // Admin: lấy toàn bộ menu
            menuItems = await AdminMenuItem_model_1.default.findAll({
                order: [
                    [(0, sequelize_1.literal)("ISNULL(`parentId`)"), "DESC"],
                    ["parentId", "ASC"],
                    ["displayOrder", "ASC"],
                ],
                raw: true,
            });
        }
        else if (userRole === 2) {
            // Employee: chỉ lấy các menu liên quan user, order, product
            // Lấy các menu con liên quan user, order, product
            const childMenus = await AdminMenuItem_model_1.default.findAll({
                where: {
                    [sequelize_1.Op.or]: [
                        { path: { [sequelize_1.Op.like]: "%user%" } },
                        { path: { [sequelize_1.Op.like]: "%order%" } },
                        { path: { [sequelize_1.Op.like]: "%product%" } },
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
                ? await AdminMenuItem_model_1.default.findAll({
                    where: { id: parentIds },
                    raw: true,
                })
                : [];
            // Gộp menu cha và menu con, sắp xếp lại
            menuItems = [...parentMenus, ...childMenus].sort((a, b) => a.displayOrder - b.displayOrder);
        }
        else {
            res.status(403).json({ message: "Forbidden" });
            return;
        }
        res.json(menuItems);
    }
    catch (error) {
        console.error("Error fetching admin menu:", error);
        res.status(500).json({ message: "Failed to fetch admin menu" });
    }
};
exports.getAdminMenu = getAdminMenu;
// Lấy tất cả menu items (dạng phẳng để quản lý)
const getAllAdminMenuItemsFlat = async (req, res) => {
    try {
        const menuItems = await AdminMenuItem_model_1.default.findAll({
            order: [
                [(0, sequelize_1.literal)("ISNULL(`parentId`)"), "DESC"],
                ["parentId", "ASC"],
                ["displayOrder", "ASC"],
            ],
            raw: true, // Trả về dạng phẳng
        });
        res.json(menuItems || []);
    }
    catch (error) {
        console.error("Error fetching all admin menu items:", error);
        res.status(500).json({ message: "Failed to fetch menu items" });
    }
};
exports.getAllAdminMenuItemsFlat = getAllAdminMenuItemsFlat;
// Tạo menu item mới
const createAdminMenuItem = async (req, res) => {
    const { title, path, icon, parentId, displayOrder } = req.body;
    try {
        // Validation cơ bản (có thể thêm validation chi tiết hơn)
        if (!title || !path || !icon) {
            res.status(400).json({ message: "Title, Path, and Icon are required" });
        }
        // Đảm bảo parentId là null nếu không được cung cấp hoặc là chuỗi rỗng
        const validParentId = parentId ? Number(parentId) : null;
        const newItem = await AdminMenuItem_model_1.default.create({
            title,
            path,
            icon,
            parentId: validParentId,
            displayOrder: displayOrder || 0,
        });
        res.status(201).json(newItem);
    }
    catch (error) {
        console.error("Error creating admin menu item:", error);
        res.status(500).json({ message: "Failed to create menu item" });
    }
};
exports.createAdminMenuItem = createAdminMenuItem;
// Cập nhật menu item
const updateAdminMenuItem = async (req, res) => {
    const { id } = req.params;
    const { title, path, icon, parentId, displayOrder } = req.body;
    try {
        const item = await AdminMenuItem_model_1.default.findByPk(id);
        if (!item) {
            res.status(404).json({ message: "Menu item not found" }); // Bỏ return
            return;
        }
        const validParentId = parentId ? Number(parentId) : null;
        if (validParentId === Number(id)) {
            res.status(400).json({ message: "Cannot set item as its own parent" }); // Bỏ return
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
    }
    catch (error) {
        console.error("Error updating admin menu item:", error);
        res.status(500).json({ message: "Failed to update menu item" });
    }
};
exports.updateAdminMenuItem = updateAdminMenuItem;
// Xóa menu item
const deleteAdminMenuItem = async (req, res) => {
    const { id } = req.params;
    try {
        const item = await AdminMenuItem_model_1.default.findByPk(id);
        if (!item) {
            res.status(404).json({ message: "Menu item not found" }); // Bỏ return
            return;
        }
        const children = await AdminMenuItem_model_1.default.count({ where: { parentId: id } });
        if (children > 0) {
            res.status(400).json({
                message: "Cannot delete item with children. Please delete or reassign children first.",
            }); // Bỏ return
            return;
        }
        await item.destroy();
        res.status(204).send(); // Bỏ return
    }
    catch (error) {
        console.error("Error deleting admin menu item:", error);
        res.status(500).json({ message: "Failed to delete menu item" }); // Bỏ return
    }
};
exports.deleteAdminMenuItem = deleteAdminMenuItem;
// Thêm phương thức mới
const updateMenuOrder = async (req, res) => {
    const { items } = req.body;
    if (!items || !Array.isArray(items)) {
        res.status(400).json({ message: "Invalid input data" });
        return;
    }
    try {
        // Sử dụng transaction để đảm bảo tính nhất quán
        await db_1.default.transaction(async (t) => {
            for (const item of items) {
                await AdminMenuItem_model_1.default.update({ displayOrder: item.displayOrder }, {
                    where: { id: item.id },
                    transaction: t,
                });
            }
        });
        res.json({ message: "Menu order updated successfully" });
    }
    catch (error) {
        console.error("Error updating menu order:", error);
        res.status(500).json({ message: "Failed to update menu order" });
    }
};
exports.updateMenuOrder = updateMenuOrder;
