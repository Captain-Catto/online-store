"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class AdminMenuItem extends sequelize_1.Model {
}
AdminMenuItem.init({
    id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    title: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    path: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    icon: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    parentId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: { model: "admin_menu_items", key: "id" },
    }, // Tự tham chiếu
    displayOrder: { type: sequelize_1.DataTypes.INTEGER, defaultValue: 0 },
    // requiredRole: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 }, // Ví dụ: 1 = Admin
    // isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
    sequelize: db_1.default,
    tableName: "admin_menu_items", // Tên bảng trong DB
    timestamps: true,
});
exports.default = AdminMenuItem;
