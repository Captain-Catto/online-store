"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import datatype và modêl thư viện sequelize
const sequelize_1 = require("sequelize");
// import sequelize từ config/db
const db_1 = __importDefault(require("../config/db"));
// import Role từ models/Role
const Role_1 = __importDefault(require("./Role"));
// khai báo class Users kế thừa class Model
class Users extends sequelize_1.Model {
}
// khai báo các trường của bảng Users
Users.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    username: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    roleId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: { model: Role_1.default, key: "id" },
        defaultValue: 3,
    },
    phoneNumber: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    dateOfBirth: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    isActive: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
}, {
    sequelize: db_1.default,
    modelName: "Users",
    tableName: "users",
});
// export class Users
exports.default = Users;
