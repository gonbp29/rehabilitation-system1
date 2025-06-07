import sequelize from './database';
import { User, Patient, Therapist, Appointment, Exercise, RehabPlan, RehabGoal } from '../models';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const initDatabase = async () => {
  try {
    // Sync all models with database
    await sequelize.sync({ alter: true });
    console.log('Database synchronized successfully');

    // DEMO DATA: Add a few entities of each kind if not present
    // Therapist User
    let therapistUser = await User.findOne({ where: { email: 'therapist1@example.com' } });
    if (!therapistUser) {
      const hashedPassword = await bcrypt.hash('therapist123', 10);
      therapistUser = await User.create({
        id: uuidv4(),
        email: 'therapist1@example.com',
        password: hashedPassword,
        firstName: 'דנה',
        lastName: 'כהן',
        role: 'therapist',
        phoneNumber: '050-1111111',
        dateOfBirth: '1985-01-01',
      });
    }

    // Therapist
    let therapist = await Therapist.findOne({ where: { userId: therapistUser.id } });
    if (!therapist) {
      therapist = await Therapist.create({
        id: uuidv4(),
        userId: therapistUser.id,
        specialization: 'פיזיותרפיה',
      });
      console.log('Demo therapist created');
    }

    // Patient User
    let patientUser = await User.findOne({ where: { email: 'patient1@example.com' } });
    if (!patientUser) {
      const hashedPassword = await bcrypt.hash('patient123', 10);
      patientUser = await User.create({
        id: uuidv4(),
        email: 'patient1@example.com',
        password: hashedPassword,
        firstName: 'יוסי',
        lastName: 'לוי',
        role: 'patient',
        phoneNumber: '050-2222222',
        dateOfBirth: '1990-01-01',
      });
    }

    // Patient
    let patient = await Patient.findOne({ where: { userId: patientUser.id } });
    if (!patient) {
      patient = await Patient.create({
        id: uuidv4(),
        userId: patientUser.id,
        therapistId: therapist.id,
        condition: 'כאבי גב תחתון',
        status: 'active',
      });
      console.log('Demo patient created');
    }

    // Rehab Plan
    let rehabPlan = await RehabPlan.findOne({ where: { patientId: patient.id } });
    if (!rehabPlan) {
      const patientId = patient.id.toString();
      const therapistId = therapist.id.toString();
      
      rehabPlan = await RehabPlan.create({
        id: uuidv4(),
        patientId,
        therapistId,
        title: 'תוכנית שיקום לגב תחתון',
        description: 'תוכנית שיקום מקיפה לטיפול בכאבי גב תחתון',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        status: 'active',
        progress: 0,
      });
      console.log('Demo rehab plan created');

      // Add goals to the plan
      await RehabGoal.bulkCreate([
        {
          id: uuidv4(),
          planId: rehabPlan.id,
          title: 'שיפור טווח התנועה',
          description: 'הגדלת טווח התנועה של הגב התחתון',
          targetDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
          status: 'pending',
          measurementCriteria: 'מדידת טווח התנועה',
          progress: 0,
        },
        {
          id: uuidv4(),
          planId: rehabPlan.id,
          title: 'חיזוק שרירי הליבה',
          description: 'חיזוק שרירי הבטן והגב',
          targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          status: 'pending',
          measurementCriteria: 'מדידת כוח שרירים',
          progress: 0,
        },
      ]);
      console.log('Demo rehab goals created');
    }

    // Exercises
    const exerciseCount = await Exercise.count();
    if (exerciseCount === 0) {
      await Exercise.bulkCreate([
        {
          id: uuidv4(),
          name: 'כפיפת ברך',
          description: 'כפיפת ברך בשכיבה על הבטן',
          videoUrl: 'https://example.com/video1',
          instructions: 'בצע 3 סטים של 12 חזרות',
          duration: 10,
          repetitions: 12,
          sets: 3,
          difficulty: 'beginner',
          type: 'squat',
          category: 'lower',
        },
        {
          id: uuidv4(),
          name: 'הרמת רגל ישרה',
          description: 'הרמת רגל ישרה בשכיבה על הגב',
          videoUrl: 'https://example.com/video2',
          instructions: 'בצע 3 סטים של 15 חזרות',
          duration: 12,
          repetitions: 15,
          sets: 3,
          difficulty: 'intermediate',
          type: 'other',
          category: 'lower',
        },
      ]);
      console.log('Demo exercises created');
    }

    // Appointments
    const appointmentCount = await Appointment.count({ where: { patientId: patient.id } });
    if (appointmentCount === 0) {
      await Appointment.bulkCreate([
        {
          id: uuidv4(),
          patientId: patient.id,
          therapistId: therapist.id,
          planId: rehabPlan.id,
          date: new Date(Date.now() + 86400000), // tomorrow
          time: '10:00:00',
          type: 'follow-up',
          status: 'scheduled',
          notes: 'פגישת מעקב',
          location: 'מרפאה א',
          reminderTime: '1hour',
        },
        {
          id: uuidv4(),
          patientId: patient.id,
          therapistId: therapist.id,
          planId: rehabPlan.id,
          date: new Date(Date.now() + 2 * 86400000), // in 2 days
          time: '14:00:00',
          type: 'exercise',
          status: 'scheduled',
          notes: 'טיפול פיזיותרפיה',
          location: 'מרפאה ב',
          reminderTime: '30min',
        },
      ]);
      console.log('Demo appointments created');
    }

  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

export default initDatabase; 