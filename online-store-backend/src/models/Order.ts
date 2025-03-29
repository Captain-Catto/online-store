// import datatype và modêl thư viện sequelize
import { DataTypes, Model } from "sequelize";
// import sequelize từ config/db
import sequelize from "../config/db";
import OrderDetail from "./OrderDetail";
import PaymentMethod from "./PaymentMethod";
import PaymentStatus from "./PaymentStatus";
import Users from "./Users";

// khai báo interface Order để kiểm tra kiểu dữ liệu
interface Order {
  id: number;
  userId: number;
  total: number;
  status: string;
  paymentMethodId: string;
  paymentStatus: string;
}

// khai báo class Order kế thừa class Model
class Order extends Model {
  // khai báo các thuộc tính của class Order
  public id!: number;
  public userId!: number;
  public total!: number;
  public status!: string;
  public paymentMethodId!: string;
  public paymentStatus!: string;
}

// khai báo các trường của bảng Order
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
    status: {
      type: DataTypes.STRING,
      allowNull: false,
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
  },
  {
    sequelize,
    modelName: "Order",
    tableName: "orders",
  }
);

// export class Order
export default Order;
