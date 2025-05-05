"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class Product extends sequelize_1.Model {
}
Product.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    sku: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        unique: true,
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    brand: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    material: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    featured: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM("active", "outofstock", "draft"),
        allowNull: false,
        defaultValue: "draft",
    },
    tags: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
        defaultValue: "[]",
        get() {
            const rawValue = this.getDataValue("tags");
            return rawValue ? JSON.parse(rawValue) : [];
        },
        set(value) {
            this.setDataValue("tags", JSON.stringify(value));
        },
    },
}, {
    sequelize: db_1.default,
    modelName: "Product",
    tableName: "products",
    timestamps: true,
});
exports.default = Product;
