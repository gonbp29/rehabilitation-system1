import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import RehabPlan from './RehabPlan';
import Exercise from './Exercise';

class RehabPlanExercise extends Model {
  public id!: string;
  public rehabPlanId!: string;
  public exerciseId!: string;
  public orderIndex!: number;
  public isCompleted!: boolean;
  public status!: 'pending' | 'completed' | 'skipped';
  public completedAt?: Date;
  public notes?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

RehabPlanExercise.init(
  {
    id: {
      type: DataTypes.STRING(36),
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    rehabPlanId: {
      type: DataTypes.STRING(36),
      allowNull: false,
      references: {
        model: RehabPlan,
        key: 'id',
      },
    },
    exerciseId: {
      type: DataTypes.STRING(36),
      allowNull: false,
      references: {
        model: Exercise,
        key: 'id',
      },
    },
    orderIndex: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    isCompleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'skipped'),
      defaultValue: 'pending',
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'RehabPlanExercise',
    indexes: [
      {
        unique: true,
        fields: ['rehabPlanId', 'exerciseId']
      }
    ]
  }
);

export default RehabPlanExercise; 