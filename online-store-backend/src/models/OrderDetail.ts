import { Model, DataTypes } from "sequelize";
import sequelize from "../config/db";
import Order from "./Order";
import Product from "./Product";
import Voucher from "./Voucher";

class OrderDetail extends Model {
  public id!: number;
  public orderId!: number;
  public itemId!: number;
  public quantity!: number;
  public color!: string;
  public size!: string;
  public price!: number;
}

OrderDetail.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Order, key: "id" }, // Thay "orders" bằng Order
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Product, key: "id" }, // Thay "products" bằng Product
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    color: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    size: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    originalPrice: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    discountPrice: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    discountPercent: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100,
      },
    },
    voucherId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: Voucher, key: "id" }, // Thay "vouchers" bằng Voucher
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "OrderDetail",
  }
);

export default OrderDetail;
