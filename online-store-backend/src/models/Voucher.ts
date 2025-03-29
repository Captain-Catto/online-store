import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";

class Voucher extends Model {
  public id!: number;
  public code!: string;
  public type!: string;
  public value!: number;
  public expirationDate!: Date;
}

Voucher.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    type: {
      // Loại giảm giá: phần trăm hoặc cố định
      type: DataTypes.ENUM("percentage", "fixed"),
      allowNull: false,
    },
    value: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    expirationDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Voucher",
    tableName: "vouchers",
  }
);

export default Voucher;
