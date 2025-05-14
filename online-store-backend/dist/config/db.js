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
// Thêm logs chi tiết hơn
console.log("==== Database Connection Debug ====");
console.log("DB_HOST:", process.env.DB_HOST || "not set");
console.log("DB_USER:", process.env.DB_USER || "not set");
console.log("DB_NAME:", process.env.DB_NAME || "not set");
console.log("DB_PORT:", process.env.DB_PORT || "not set");
console.log("DATABASE_URL:", process.env.DATABASE_URL ? "set" : "not set");
console.log("NODE_ENV:", process.env.NODE_ENV || "not set");
console.log("================================");
// Khởi tạo sequelize với hỗ trợ DATABASE_URL
let sequelize;
if (process.env.DATABASE_URL) {
    // Sử dụng URL nếu có (Railway ưa thích cách này)
    console.log("Using DATABASE_URL for connection");
    sequelize = new sequelize_1.Sequelize(process.env.DATABASE_URL, {
        dialect: "mysql",
        logging: true,
        dialectOptions: process.env.NODE_ENV === "production"
            ? {
                ssl: {
                    require: true,
                    rejectUnauthorized: false,
                },
            }
            : {},
    });
}
else {
    // Sử dụng các biến riêng lẻ
    console.log("Using individual connection parameters");
    sequelize = new sequelize_1.Sequelize({
        database: process.env.DB_NAME,
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        dialect: "mysql",
        logging: true,
    });
}
// Kiểm tra kết nối
sequelize
    .authenticate()
    .then(() => console.log("Database connection established successfully"))
    .catch((err) => console.error("Unable to connect to the database:", err));
//export sequelize
exports.default = sequelize;
