import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";
import Category from "./Category";

export class ProductSize extends Model {
  public id!: number;
  public value!: string;
  public displayName!: string;
  public categoryId!: number;
  public displayOrder!: number;
  public active!: boolean;
}

ProductSize.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    value: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    displayName: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Category,
        key: "id",
      },
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: "product_sizes",
    timestamps: true,
  }
);

export default ProductSize;
