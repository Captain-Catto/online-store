import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";
import Product from "./Product";
import ProductCategory from "./ProductCategory";

class Category extends Model {
  public id!: number;
  public name!: string;
}

Category.init(
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
  },
  {
    sequelize,
    modelName: "Category",
    tableName: "categories",
    timestamps: false,
  }
);

export default Category;
