"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//import thư viện sequelize và dotenv
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
//config dotenv
dotenv_1.default.config();
// khởi tạo sequelize
const sequelize = new sequelize_1.Sequelize({
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    dialect: "mysql",
});
//export sequelize
exports.default = sequelize;
