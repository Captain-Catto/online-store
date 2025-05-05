"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
// khai báo class PaymentStatus kế thừa class Model
class PaymentStatus extends sequelize_1.Model {
}
// khai báo các trường của bảng PaymentStatus
PaymentStatus.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    description: {
        type: sequelize_1.DataTypes.ENUM("Pending", "Paid", "Failed", "Refunded"),
        allowNull: true,
    },
}, {
    sequelize: db_1.default,
    modelName: "PaymentStatus",
    tableName: "payment_statuses",
    timestamps: false,
});
exports.default = PaymentStatus;
