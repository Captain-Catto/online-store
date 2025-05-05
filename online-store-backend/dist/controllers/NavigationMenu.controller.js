"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNavigationMenu = exports.updateNavigationMenu = exports.createNavigationMenu = exports.getAllNavigationMenus = exports.getPublicNavigationMenu = void 0;
const NavigationMenu_1 = __importDefault(require("../models/NavigationMenu"));
const Category_1 = __importDefault(require("../models/Category"));
const slugify_1 = __importDefault(require("slugify"));
// Lấy menu cho frontend hiển thị
const getPublicNavigationMenu = async (req, res) => {
    try {
        const menuItems = await NavigationMenu_1.default.findAll({
            where: { isActive: true },
            order: [
                ["parentId", "ASC"],
                ["order", "ASC"],
            ],
            include: [
                {
                    model: Category_1.default,
                    as: "category",
                    attributes: ["id", "name", "slug", "image"],
                },
            ],
        });
        // Xây dựng cây menu
        const menuTree = buildMenuTree(menuItems);
        res.json(menuTree);
    }
    catch (error) {
        res.status(500).json({ message: "Lỗi khi lấy menu", error });
    }
};
exports.getPublicNavigationMenu = getPublicNavigationMenu;
// Các API cho admin quản lý
const getAllNavigationMenus = async (req, res) => {
    try {
        const menuItems = await NavigationMenu_1.default.findAll({
            order: [
                ["parentId", "ASC"],
                ["order", "ASC"],
            ],
            include: [
                {
                    model: Category_1.default,
                    as: "category",
                    attributes: ["id", "name", "slug"],
                },
            ],
        });
        res.json(menuItems);
    }
    catch (error) {
        res.status(500).json({ message: "Lỗi khi lấy danh sách menu", error });
    }
};
exports.getAllNavigationMenus = getAllNavigationMenus;
const createNavigationMenu = async (req, res) => {
    try {
        const { name, link, categoryId, parentId, order, isActive, megaMenu } = req.body;
        // Tạo slug từ tên
        const slug = (0, slugify_1.default)(name, { lower: true });
        const newMenu = await NavigationMenu_1.default.create({
            name,
            slug,
            link: link || null,
            categoryId: categoryId || null,
            parentId: parentId || null,
            order: order || 0,
            isActive: isActive === undefined ? true : isActive,
            megaMenu: megaMenu || false,
        });
        res.status(201).json(newMenu);
    }
    catch (error) {
        res.status(500).json({ message: "Lỗi khi tạo menu", error });
    }
};
exports.createNavigationMenu = createNavigationMenu;
const updateNavigationMenu = async (req, res) => {
    const { id } = req.params;
    try {
        const menu = await NavigationMenu_1.default.findByPk(id);
        if (!menu) {
            res.status(404).json({ message: "Không tìm thấy menu" });
            return;
        }
        const { name, link, categoryId, parentId, order, isActive, megaMenu } = req.body;
        // Tạo slug mới nếu tên thay đổi
        let slug = menu.slug;
        if (name && name !== menu.name) {
            slug = (0, slugify_1.default)(name, { lower: true });
        }
        await menu.update({
            name: name || menu.name,
            slug,
            link: link === undefined ? menu.link : link,
            categoryId: categoryId === undefined ? menu.categoryId : categoryId,
            parentId: parentId === undefined ? menu.parentId : parentId,
            order: order === undefined ? menu.order : order,
            isActive: isActive === undefined ? menu.isActive : isActive,
            megaMenu: megaMenu === undefined ? menu.megaMenu : megaMenu,
        });
        res.status(200).json({ message: "Navigation menu updated successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Lỗi khi cập nhật menu", error });
    }
};
exports.updateNavigationMenu = updateNavigationMenu;
const deleteNavigationMenu = async (req, res) => {
    const { id } = req.params;
    try {
        const menu = await NavigationMenu_1.default.findByPk(id);
        if (!menu) {
            res.status(404).json({ message: "Không tìm thấy menu" });
            return;
        }
        // Kiểm tra nếu menu có menu con
        const childMenus = await NavigationMenu_1.default.findAll({
            where: { parentId: id },
        });
        if (childMenus.length > 0) {
            res.status(400).json({
                message: "Không thể xóa menu có menu con. Vui lòng xóa menu con trước.",
            });
            return;
        }
        await menu.destroy();
        res.json({ message: "Đã xóa menu thành công" });
    }
    catch (error) {
        res.status(500).json({ message: "Lỗi khi xóa menu", error });
    }
};
exports.deleteNavigationMenu = deleteNavigationMenu;
// Hàm hỗ trợ tạo cấu trúc menu dạng cây
function buildMenuTree(menuItems, parentId = null) {
    const items = menuItems.filter((menu) => menu.parentId === parentId);
    return items.map((item) => {
        const children = buildMenuTree(menuItems, item.id);
        const itemJson = item.toJSON();
        return {
            ...itemJson,
            children: children.length > 0 ? children : undefined,
        };
    });
}
