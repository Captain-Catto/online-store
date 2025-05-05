"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
const Order_1 = __importDefault(require("./Order"));
const Product_1 = __importDefault(require("./Product"));
const Voucher_1 = __importDefault(require("./Voucher"));
const ProductDetail_1 = __importDefault(require("./ProductDetail"));
class OrderDetail extends sequelize_1.Model {
}
OrderDetail.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    orderId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: { model: Order_1.default, key: "id" },
    },
    productId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: { model: Product_1.default, key: "id" },
    },
    productDetailId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: { model: ProductDetail_1.default, key: "id" },
    },
    quantity: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    color: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    size: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    originalPrice: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
    },
    discountPrice: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
    },
    discountPercent: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0,
            max: 100,
        },
    },
    voucherId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: { model: Voucher_1.default, key: "id" },
    },
    imageUrl: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
}, {
    sequelize: db_1.default,
    modelName: "OrderDetail",
    tableName: "order_details",
});
exports.default = OrderDetail;
