"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
const Users_1 = __importDefault(require("./Users"));
class UserAddress extends sequelize_1.Model {
}
UserAddress.init({
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
    fullName: {
        // cái này sẽ là tên của địa chỉ
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    phoneNumber: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    streetAddress: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    ward: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    district: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    city: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    isDefault: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    sequelize: db_1.default,
    modelName: "UserAddress",
    tableName: "user_addresses",
});
exports.default = UserAddress;
