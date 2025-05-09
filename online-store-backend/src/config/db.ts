//import thư viện sequelize và dotenv
import { Sequelize } from "sequelize";
import dotenv from "dotenv";

//config dotenv
dotenv.config();

// khởi tạo sequelize
const sequelize = new Sequelize({
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  dialect: "mysql",
  logging: true,
});

//export sequelize
export default sequelize;
