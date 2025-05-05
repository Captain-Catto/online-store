"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
const ProductDetail_1 = __importDefault(require("./ProductDetail"));
class ProductInventory extends sequelize_1.Model {
}
ProductInventory.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    productDetailId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: { model: ProductDetail_1.default, key: "id" },
    },
    size: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    stock: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0,
        },
    },
}, {
    sequelize: db_1.default,
    modelName: "ProductInventory",
    tableName: "product_inventories",
    indexes: [
        {
            unique: true,
            fields: ["productDetailId", "size"],
        },
    ],
});
exports.default = ProductInventory;
