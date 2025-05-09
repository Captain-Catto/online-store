import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";

class Suitability extends Model {
  public id!: number;
  public name!: string;
  public slug!: string;
  public description?: string;
  public sortOrder?: number;
}

Suitability.init(
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
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: "Suitability",
    tableName: "suitabilities",
    timestamps: true,
  }
);

export default Suitability;
