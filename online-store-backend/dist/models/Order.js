"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
const PaymentMethod_1 = __importDefault(require("./PaymentMethod"));
const PaymentStatus_1 = __importDefault(require("./PaymentStatus"));
const Users_1 = __importDefault(require("./Users"));
class Order extends sequelize_1.Model {
}
Order.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: { model: Users_1.default, key: "id" },
    },
    total: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
    },
    subtotal: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
    },
    voucherDiscount: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM("pending", "processing", "shipping", "delivered", "cancelled"),
        allowNull: false,
        defaultValue: "pending",
    },
    paymentMethodId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: { model: PaymentMethod_1.default, key: "id" },
    },
    paymentStatusId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: { model: PaymentStatus_1.default, key: "id" },
    },
    shippingFullName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    shippingPhoneNumber: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    shippingStreetAddress: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    shippingWard: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    shippingDistrict: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    shippingCity: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    cancelNote: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    refundAmount: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: true,
    },
    refundReason: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    shippingFee: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
    },
    shippingBasePrice: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
    },
    shippingDiscount: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
    },
}, {
    sequelize: db_1.default,
    modelName: "Order",
    tableName: "orders",
});
exports.default = Order;
