import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import RehabPlan from './RehabPlan';
import Exercise from './Exercise';

class RehabPlanExercise extends Model {
  public id!: string;
  public rehabPlanId!: string;
  public exerciseId!: string;
  public sets!: number;
  public repetitions!: number;
  public durationSeconds!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

RehabPlanExercise.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    rehabPlanId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: RehabPlan, key: 'id' },
    },
    exerciseId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: Exercise, key: 'id' },
    },
    sets: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 3,
    },
    repetitions: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
    },
    durationSeconds: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 60,
    },
  },
  {
    sequelize,
    modelName: 'RehabPlanExercise',
    tableName: 'RehabPlanExercises',
    timestamps: true,
    underscored: false,
  }
);

RehabPlanExercise.belongsTo(RehabPlan, { foreignKey: 'rehabPlanId', as: 'rehabPlan' });
RehabPlanExercise.belongsTo(Exercise, { foreignKey: 'exerciseId', as: 'exercise' });

export default RehabPlanExercise; 