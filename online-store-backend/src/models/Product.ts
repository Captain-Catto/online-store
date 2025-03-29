import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";
import ProductDetail from "./ProductDetail";
import Category from "./Category";
import ProductCategory from "./ProductCategory";

class Product extends Model {
  public id!: number;
  public name!: string;
}

Product.init(
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
    modelName: "Product",
    tableName: "products",
  }
);

export default Product;
