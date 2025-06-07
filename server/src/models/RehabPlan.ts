import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import Patient from './Patient';
import Therapist from './Therapist';
import { RehabPlanType } from '../types';

class RehabPlan extends Model implements RehabPlanType {
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
      type: DataTypes.STRING(36),
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    patientId: {
      type: DataTypes.STRING(36),
      allowNull: false,
      references: {
        model: Patient,
        key: 'id',
      },
    },
    therapistId: {
      type: DataTypes.STRING(36),
      allowNull: false,
      references: {
        model: Therapist,
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
    },
    progress: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: 'RehabPlan',
  }
);

// Define associations
RehabPlan.belongsTo(Patient, { foreignKey: 'patientId' });
Patient.hasMany(RehabPlan, { foreignKey: 'patientId' });

RehabPlan.belongsTo(Therapist, { foreignKey: 'therapistId' });
Therapist.hasMany(RehabPlan, { foreignKey: 'therapistId' });

export default RehabPlan; 