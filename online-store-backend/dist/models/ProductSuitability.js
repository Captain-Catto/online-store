"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class ProductSuitability extends sequelize_1.Model {
}
ProductSuitability.init({
    productId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "products",
            key: "id",
        },
        primaryKey: true,
    },
    suitabilityId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "suitabilities",
            key: "id",
        },
        primaryKey: true,
    },
}, {
    sequelize: db_1.default,
    modelName: "ProductSuitability",
    tableName: "product_suitabilities",
    timestamps: true,
});
exports.default = ProductSuitability;
