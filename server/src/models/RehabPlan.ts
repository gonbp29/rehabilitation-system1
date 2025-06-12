import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import Patient from './Patient';
import Therapist from './Therapist';

class RehabPlan extends Model {
  public id!: string;
  public patientId!: string;
  public therapistId!: string;
  public title!: string;
  public description?: string;
  public startDate!: Date;
  public endDate!: Date;
  public status!: 'active' | 'completed' | 'on-hold';
  public progress!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

RehabPlan.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    patientId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: Patient, key: 'id' },
    },
    therapistId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: Therapist, key: 'id' },
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('active', 'completed', 'on-hold'),
      defaultValue: 'active',
      allowNull: false,
    },
    progress: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'RehabPlan',
    tableName: 'RehabPlans',
    timestamps: true,
    underscored: false,
  }
);

RehabPlan.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });
RehabPlan.belongsTo(Therapist, { foreignKey: 'therapistId', as: 'therapist' });

export default RehabPlan; 