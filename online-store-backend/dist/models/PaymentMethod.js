"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
// khai báo class PaymentMethod kế thừa class Model
class PaymentMethod extends sequelize_1.Model {
}
// khai báo các trường của bảng PaymentMethod
PaymentMethod.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.ENUM("COD", "Credit Card", "Internet Banking", "Momo"),
        allowNull: false,
        unique: true,
    },
}, {
    sequelize: db_1.default,
    modelName: "PaymentMethod",
    tableName: "payment_methods",
    timestamps: false,
});
exports.default = PaymentMethod;
