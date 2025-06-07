import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import { YadSaraLocation } from '../types';

class Equipment extends Model {
  public id!: string;
  public name!: string;
  public description?: string;
  public category?: string;
  public yadSaraLocation?: YadSaraLocation;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Equipment.init(
  {
    id: {
      type: DataTypes.STRING(36),
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    yadSaraLocation: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Equipment',
  }
);

export default Equipment; 