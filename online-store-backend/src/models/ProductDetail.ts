import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";
import Product from "./Product";

class ProductDetail extends Model {
  public id!: number;
  public productId!: number;
  public color!: string;
  public imagePath!: string;
}

ProductDetail.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Product, key: "id" },
    },
    color: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    imagePath: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "[]",
    },
  },
  {
    sequelize,
    modelName: "ProductDetail",
    tableName: "product_details",
    indexes: [
      {
        unique: true,
        fields: ["productId", "color"],
      },
    ],
  }
);

export default ProductDetail;
