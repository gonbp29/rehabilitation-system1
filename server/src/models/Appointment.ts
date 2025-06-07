import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import Patient from './Patient';
import Therapist from './Therapist';
import RehabPlan from './RehabPlan';
import { AppointmentType } from '../types';

class Appointment extends Model implements AppointmentType {
  public id!: string;
  public patientId!: string;
  public therapistId!: string;
  public planId!: string;
  public date!: Date;
  public time!: string;
  public type!: 'initial' | 'follow-up' | 'exercise';
  public status!: 'scheduled' | 'completed' | 'cancelled';
  public notes?: string;
  public location?: string;
  public reminderTime?: '30min' | '1hour' | '1day';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Appointment.init(
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
    planId: {
      type: DataTypes.STRING(36),
      allowNull: false,
      references: {
        model: RehabPlan,
        key: 'id',
      },
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('initial', 'follow-up', 'exercise'),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('scheduled', 'completed', 'cancelled'),
      defaultValue: 'scheduled',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    reminderTime: {
      type: DataTypes.ENUM('30min', '1hour', '1day'),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Appointment',
  }
);

// Define associations
Appointment.belongsTo(Patient, { foreignKey: 'patientId' });
Patient.hasMany(Appointment, { foreignKey: 'patientId' });

Appointment.belongsTo(Therapist, { foreignKey: 'therapistId' });
Therapist.hasMany(Appointment, { foreignKey: 'therapistId' });

Appointment.belongsTo(RehabPlan, { foreignKey: 'planId' });
RehabPlan.hasMany(Appointment, { foreignKey: 'planId' });

export default Appointment; 