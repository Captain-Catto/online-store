"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class Voucher extends sequelize_1.Model {
}
Voucher.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    code: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    type: {
        // Loại giảm giá: phần trăm hoặc cố định
        type: sequelize_1.DataTypes.ENUM("percentage", "fixed"),
        allowNull: false,
    },
    value: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
    },
    minOrderValue: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
    },
    description: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    expirationDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM("active", "inactive", "expired"),
        allowNull: false,
        defaultValue: "active",
    },
    usageLimit: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0, // 0 = không giới hạn
    },
    usageCount: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
}, {
    sequelize: db_1.default,
    modelName: "Voucher",
    tableName: "vouchers",
});
exports.default = Voucher;
