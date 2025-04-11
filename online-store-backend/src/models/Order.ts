import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";
import OrderDetail from "./OrderDetail";
import PaymentMethod from "./PaymentMethod";
import PaymentStatus from "./PaymentStatus";
import Users from "./Users";

class Order extends Model {
  public id!: number;
  public userId!: number;
  public total!: number;
  public subtotal!: number;
  public voucherDiscount!: number;
  public shippingFee!: number;
  public shippingBasePrice!: number;
  public shippingDiscount!: number;
  public status!: string;
  public paymentMethodId!: number;
  public paymentStatusId!: number;
  public shippingAddress!: string;
  public phoneNumber!: string;
  public cancelNote!: string | null;
  public refundAmount!: number | null;
  public refundReason!: string | null;
}

Order.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Users, key: "id" },
    },
    total: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    subtotal: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    voucherDiscount: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM(
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled"
      ),
      allowNull: false,
      defaultValue: "pending",
    },
    paymentMethodId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: PaymentMethod, key: "id" },
    },
    paymentStatusId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: PaymentStatus, key: "id" },
    },
    shippingAddress: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cancelNote: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    refundAmount: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    refundReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    shippingFee: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    shippingBasePrice: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    shippingDiscount: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: "Order",
    tableName: "orders",
  }
);

export default Order;
