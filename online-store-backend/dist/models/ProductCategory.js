"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
const Product_1 = __importDefault(require("./Product"));
class ProductCategory extends sequelize_1.Model {
}
ProductCategory.init({
    productId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: { model: Product_1.default, key: "id" },
    },
    categoryId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: { model: "categories", key: "id" },
    },
}, {
    sequelize: db_1.default,
    modelName: "ProductCategory",
    tableName: "product_categories",
    timestamps: false,
});
exports.default = ProductCategory;
