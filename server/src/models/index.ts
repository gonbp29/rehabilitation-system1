import { sequelize } from '../config/database';

// Import models
import User from './User';
import Patient from './Patient';
import Therapist from './Therapist';
import Exercise from './Exercise';
import Equipment from './Equipment';
import RehabPlan from './RehabPlan';
import RehabPlanExercise from './RehabPlanExercise';
import RehabGoal from './RehabGoal';
import Appointment from './Appointment';
import ExerciseSession from './ExerciseSession';
import UserGoogleToken from './UserGoogleToken';

// Define associations
User.hasOne(Patient, { foreignKey: 'userId', onDelete: 'CASCADE' });
Patient.belongsTo(User, { foreignKey: 'userId' });

User.hasOne(Therapist, { foreignKey: 'userId', onDelete: 'CASCADE' });
Therapist.belongsTo(User, { foreignKey: 'userId' });

Therapist.hasMany(Patient, { foreignKey: 'therapistId', onDelete: 'SET NULL' });
Patient.belongsTo(Therapist, { foreignKey: 'therapistId' });

Therapist.hasMany(RehabPlan, { foreignKey: 'therapistId', onDelete: 'CASCADE' });
RehabPlan.belongsTo(Therapist, { foreignKey: 'therapistId' });

Patient.hasMany(RehabPlan, { foreignKey: 'patientId', onDelete: 'CASCADE' });
RehabPlan.belongsTo(Patient, { foreignKey: 'patientId' });

RehabPlan.hasMany(RehabGoal, { foreignKey: 'planId', onDelete: 'CASCADE' });
RehabGoal.belongsTo(RehabPlan, { foreignKey: 'planId' });

// Many-to-many relationship between RehabPlan and Exercise through RehabPlanExercise
RehabPlan.belongsToMany(Exercise, { 
  through: RehabPlanExercise, 
  foreignKey: 'rehabPlanId',
  otherKey: 'exerciseId',
  as: 'exercises'
});
Exercise.belongsToMany(RehabPlan, { 
  through: RehabPlanExercise, 
  foreignKey: 'exerciseId',
  otherKey: 'rehabPlanId',
  as: 'rehabPlans'
});

// Direct associations for the junction table
RehabPlanExercise.belongsTo(RehabPlan, { foreignKey: 'rehabPlanId' });
RehabPlanExercise.belongsTo(Exercise, { foreignKey: 'exerciseId' });
RehabPlan.hasMany(RehabPlanExercise, { foreignKey: 'rehabPlanId', onDelete: 'CASCADE' });
Exercise.hasMany(RehabPlanExercise, { foreignKey: 'exerciseId', onDelete: 'CASCADE' });

Therapist.hasMany(Appointment, { foreignKey: 'therapistId', onDelete: 'CASCADE' });
Appointment.belongsTo(Therapist, { foreignKey: 'therapistId' });

Patient.hasMany(Appointment, { foreignKey: 'patientId', onDelete: 'CASCADE' });
Appointment.belongsTo(Patient, { foreignKey: 'patientId' });

RehabPlan.hasMany(Appointment, { foreignKey: 'planId', onDelete: 'CASCADE' });
Appointment.belongsTo(RehabPlan, { foreignKey: 'planId' });

Appointment.hasMany(ExerciseSession, { foreignKey: 'appointmentId', onDelete: 'CASCADE' });
ExerciseSession.belongsTo(Appointment, { foreignKey: 'appointmentId' });

Patient.hasMany(ExerciseSession, { foreignKey: 'patientId', onDelete: 'CASCADE' });
ExerciseSession.belongsTo(Patient, { foreignKey: 'patientId' });

Exercise.hasMany(ExerciseSession, { foreignKey: 'exerciseId', onDelete: 'CASCADE' });
ExerciseSession.belongsTo(Exercise, { foreignKey: 'exerciseId' });

// Export models
export {
  sequelize,
  User,
  Patient,
  Therapist,
  Exercise,
  Equipment,
  RehabPlan,
  RehabPlanExercise,
  RehabGoal,
  Appointment,
  ExerciseSession,
  UserGoogleToken
}; 