import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import RehabPlan from './RehabPlan';
import { RehabGoalType } from '../types';

class RehabGoal extends Model implements RehabGoalType {
  public id!: string;
  public planId!: string;
  public title!: string;
  public description?: string;
  public targetDate!: Date;
  public status!: 'pending' | 'in-progress' | 'achieved';
  public measurementCriteria?: string;
  public progress!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

RehabGoal.init(
  {
    id: {
      type: DataTypes.STRING(36),
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    planId: {
      type: DataTypes.STRING(36),
      allowNull: false,
      references: {
        model: RehabPlan,
        key: 'id',
      },
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    targetDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'in-progress', 'achieved'),
      defaultValue: 'pending',
    },
    measurementCriteria: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    progress: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: 'RehabGoal',
  }
);

// Define associations
RehabGoal.belongsTo(RehabPlan, { foreignKey: 'planId' });
RehabPlan.hasMany(RehabGoal, { foreignKey: 'planId' });

export default RehabGoal; 