import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import Appointment from './Appointment';
import Patient from './Patient';
import Exercise from './Exercise';
import { ExercisePerformance, ExerciseFeedback } from '../types';

class ExerciseSession extends Model {
  public id!: string;
  public appointmentId!: string;
  public patientId!: string;
  public exerciseId!: string;
  public date!: Date;
  public startTime!: string;
  public endTime?: string;
  public completed!: boolean;
  public performance?: ExercisePerformance;
  public feedback?: ExerciseFeedback;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ExerciseSession.init(
  {
    id: {
      type: DataTypes.STRING(36),
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    appointmentId: {
      type: DataTypes.STRING(36),
      allowNull: false,
      references: {
        model: Appointment,
        key: 'id',
      },
    },
    patientId: {
      type: DataTypes.STRING(36),
      allowNull: false,
      references: {
        model: Patient,
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
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    startTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    endTime: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    performance: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    feedback: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'ExerciseSession',
  }
);

// Define associations
ExerciseSession.belongsTo(Appointment, { foreignKey: 'appointmentId' });
Appointment.hasMany(ExerciseSession, { foreignKey: 'appointmentId' });

ExerciseSession.belongsTo(Patient, { foreignKey: 'patientId' });
Patient.hasMany(ExerciseSession, { foreignKey: 'patientId' });

ExerciseSession.belongsTo(Exercise, { foreignKey: 'exerciseId' });
Exercise.hasMany(ExerciseSession, { foreignKey: 'exerciseId' });

export default ExerciseSession; 