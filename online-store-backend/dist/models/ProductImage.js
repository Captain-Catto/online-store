"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
const ProductDetail_1 = __importDefault(require("./ProductDetail"));
class ProductImage extends sequelize_1.Model {
}
ProductImage.init({
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
    url: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    isMain: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    displayOrder: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
}, {
    sequelize: db_1.default,
    modelName: "ProductImage",
    tableName: "product_images",
});
exports.default = ProductImage;
