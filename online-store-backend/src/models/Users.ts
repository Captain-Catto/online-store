// import datatype và modêl thư viện sequelize
import { DataTypes, Model } from "sequelize";
// import sequelize từ config/db
import sequelize from "../config/db";
// import Role từ models/Role
import Role from "./Role";

//khai báo interface User để kiểm tra kiểu dữ liệu
interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  roleId: number;
}

// khai báo class Users kế thừa class Model
class Users extends Model {
  // khai báo các thuộc tính của class Users
  public id!: number;
  public username!: string;
  public email!: string;
  public password!: string;
  public roleId!: number;
}

// khai báo các trường của bảng Users
Users.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Role, key: "id" },
      defaultValue: 2,
    },
  },
  {
    sequelize,
    modelName: "Users",
  }
);

// export class Users
export default Users;
