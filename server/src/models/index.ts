import sequelize from '../config/database';

// Import models
import User from './User';
import Therapist from './Therapist';
import Patient from './Patient';
import Exercise from './Exercise';
import PatientExercise from './PatientExercise';
import ExerciseCompletion from './ExerciseCompletion';
import Appointment from './Appointment';
import RehabPlan from './RehabPlan';
import RehabPlanExercise from './RehabPlanExercise';

// Associations are defined in the model files.
// This file is for exporting the models and the sequelize instance.

export {
  sequelize,
  User,
  Therapist,
  Patient,
  Exercise,
  PatientExercise,
  ExerciseCompletion,
  Appointment,
  RehabPlan,
  RehabPlanExercise,
}; 