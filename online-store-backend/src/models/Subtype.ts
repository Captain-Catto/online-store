import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";
import Category from "./Category";

class Subtype extends Model {
  public id!: number;
  public name!: string; // tên kỹ thuật: t-shirt, polo
  public displayName!: string; // tên hiển thị: Áo thun, Áo polo
  public categoryId!: number;
}

Subtype.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    displayName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Category, key: "id" },
    },
  },
  {
    sequelize,
    modelName: "Subtype",
    tableName: "subtypes",
  }
);

export default Subtype;
