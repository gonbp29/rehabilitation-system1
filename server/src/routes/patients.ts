import express from 'express';
import { Patient, User, Therapist, PatientExercise, Exercise, ExerciseCompletion, Appointment, RehabPlan, RehabPlanExercise } from '../models';
import { authenticateToken } from '../middleware/auth';
import { Op } from 'sequelize';
import { Request } from 'express';

interface AuthRequest extends Request {
    user?: {
        id: string;
        role: string;
        role_id: string;
    };
}

const router = express.Router();

// Get patient by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const patient = await Patient.findByPk(req.params.id, {
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['first_name', 'last_name', 'email', 'phone']
                },
                {
                    model: Therapist,
                    as: 'therapist',
                    include: [{ model: User, as: 'user', attributes: ['first_name', 'last_name'] }]
                }
            ]
        });
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }
        res.json(patient);
    } catch (error) {
        console.error('Error fetching patient:', error);
        res.status(500).json({ error: 'Failed to fetch patient' });
    }
});

// Update patient
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const patient = await Patient.findByPk(req.params.id);
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        const { condition, status, therapist_id } = req.body;
        
        // Build an object with only the fields that are actually provided
        const updatedFields: { condition?: string, status?: 'active' | 'inactive', therapist_id?: string | null } = {};
        if (condition !== undefined) updatedFields.condition = condition;
        if (status !== undefined) updatedFields.status = status;
        if (therapist_id !== undefined) updatedFields.therapist_id = therapist_id;

        await patient.update(updatedFields);

        res.json(patient);
    } catch (error) {
        console.error('Error updating patient:', error);
        res.status(500).json({ error: 'Failed to update patient' });
    }
});

// Delete a patient
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const patient = await Patient.findByPk(req.params.id);
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        // Also delete the associated user record
        await User.destroy({ where: { id: patient.user_id } });
        await patient.destroy();

        res.status(204).send();
    } catch (error) {
        console.error('Error deleting patient:', error);
        res.status(500).json({ error: 'Failed to delete patient' });
    }
});

// Get patient dashboard
router.get('/:id/dashboard', authenticateToken, async (req, res) => {
    try {
        const patientId = req.params.id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todaysExercises = await PatientExercise.findAll({
            where: { 
                patient_id: patientId,
                assigned_date: { [Op.lte]: new Date() } 
            }, // Simplified: all assigned exercises for now
            include: [{ model: Exercise, as: 'exercise' }]
        });
        const nextAppointment = await Appointment.findOne({ 
            where: { patient_id: patientId, scheduled_date: { [Op.gte]: today } },
            order: [['scheduled_date', 'ASC'], ['scheduled_time', 'ASC']],
            include: [{
                model: Therapist,
                as: 'therapist',
                include: [{ model: User, as: 'user', attributes: ['first_name', 'last_name'] }]
            }]
        });

        res.json({ todaysExercises, nextAppointment });
    } catch (error) {
        console.error('Error fetching patient dashboard:', error);
        res.status(500).json({ error: 'Failed to fetch patient dashboard' });
    }
});

// Get all exercises for a patient
router.get('/:id/exercises', authenticateToken, async (req, res) => {
    try {
        const exercises = await PatientExercise.findAll({
            where: { patient_id: req.params.id },
            include: [{ model: Exercise, as: 'exercise' }]
        });
        res.json(exercises);
    } catch (error) {
        console.error('Error fetching patient exercises:', error);
        res.status(500).json({ error: 'Failed to fetch patient exercises' });
    }
});

// Get exercises for today
router.get('/:id/exercises/today', authenticateToken, async (req, res) => {
    try {
        const patientId = req.params.id;
        const assignedExercises = await PatientExercise.findAll({
            where: {
                patient_id: patientId,
                // A simple logic for 'today': assigned on or before today, and not marked 'completed'
                assigned_date: { [Op.lte]: new Date() },
                status: { [Op.ne]: 'completed' }
            },
            include: [{ model: Exercise, as: 'exercise' }]
        });
        res.json(assignedExercises);
    } catch (error) {
        console.error('Error fetching today\'s exercises:', error);
        res.status(500).json({ error: 'Failed to fetch today\'s exercises' });
    }
});

// Assign exercises to a patient
router.post('/:id/assign-exercises', authenticateToken, async (req, res) => {
    try {
        const patientId = req.params.id;
        // @ts-ignore
        const therapistId = req.user.role_id; // Assuming therapist ID is in JWT
        const { exercises } = req.body; // Expects an array of exercise assignments

        const assignments = exercises.map((ex: any) => ({
            ...ex,
            patient_id: patientId,
            assigned_by_therapist_id: therapistId,
            assigned_date: new Date(),
            status: 'assigned',
        }));
        
        const createdAssignments = await PatientExercise.bulkCreate(assignments);
        res.status(201).json(createdAssignments);

    } catch (error) {
        console.error('Error assigning exercises:', error);
        res.status(500).json({ error: 'Failed to assign exercises' });
    }
});

// Get all exercise completions for a patient
router.get('/:id/exercise-completions', authenticateToken, async (req, res) => {
    try {
        const patientExercises = await PatientExercise.findAll({
            where: { patient_id: req.params.id },
            attributes: ['id']
        });
        const patientExerciseIds = patientExercises.map(pe => pe.id);

        const completions = await ExerciseCompletion.findAll({
            where: { patient_exercise_id: { [Op.in]: patientExerciseIds } }
        });
        res.json(completions);
    } catch (error) {
        console.error('Error fetching exercise completions:', error);
        res.status(500).json({ error: 'Failed to fetch exercise completions' });
    }
});

// Get all appointments for a patient
router.get('/:id/appointments', authenticateToken, async (req, res) => {
    try {
        const appointments = await Appointment.findAll({
            where: { patient_id: req.params.id },
            include: [{
                model: Therapist,
                as: 'therapist',
                include: [{ model: User, as: 'user', attributes: ['first_name', 'last_name'] }]
            }]
        });
        res.json(appointments);
    } catch (error) {
        console.error('Error fetching patient appointments:', error);
        res.status(500).json({ error: 'Failed to fetch patient appointments' });
    }
});

// Get progress for a patient
router.get('/:id/progress', authenticateToken, async (req, res) => {
    try {
        const patientId = req.params.id;
        const totalAssigned = await PatientExercise.count({ where: { patient_id: patientId } });
        const completed = await PatientExercise.count({ where: { patient_id: patientId, status: 'completed' } });

        const completionPercentage = totalAssigned > 0 ? (completed / totalAssigned) * 100 : 0;

        res.json({
            totalAssigned,
            completed,
            completionPercentage,
        });
    } catch (error) {
        console.error('Error fetching patient progress:', error);
        res.status(500).json({ error: 'Failed to fetch patient progress' });
    }
});

// Create a rehab plan for a patient
router.post('/:id/rehab-plan', authenticateToken, async (req, res) => {
  try {
    const patientId = req.params.id;
    // @ts-ignore
    const therapistId = req.user.role_id; // מתוך ה-JWT
    const { general_goals, detailed_goals, required_equipment, notes, exercise_ids } = req.body;

    // יצירת תוכנית שיקום בסיסית
    const rehabPlan = await RehabPlan.create({
      patientId,
      therapistId,
      title: general_goals || 'תוכנית שיקום',
      description: detailed_goals || '',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // חודש קדימה
      status: 'active',
      progress: 0,
    });

    // יצירת קשרים לתרגילים
    if (Array.isArray(exercise_ids)) {
      const exercisesToAdd = exercise_ids.map((exerciseId: string) => ({
        rehabPlanId: rehabPlan.id,
        exerciseId,
        sets: 3,
        repetitions: 10,
        durationSeconds: 60,
      }));
      await RehabPlanExercise.bulkCreate(exercisesToAdd);
    }

    res.status(201).json({ message: 'Rehab plan created', rehabPlan });
  } catch (error) {
    console.error('Error creating rehab plan:', error);
    res.status(500).json({ error: 'Failed to create rehab plan' });
  }
});

// Get patient by email
router.get('/by-email/:email', authenticateToken, async (req: AuthRequest, res) => {
    try {
        console.log('Searching for user with email:', req.params.email);
        
        // First find the user in Users table
        const user = await User.findOne({
            where: { 
                email: req.params.email
            },
            attributes: ['id', 'email', 'first_name', 'last_name', 'phone', 'role']
        });

        console.log('Found user:', user);

        if (!user) {
            return res.status(404).json({ error: 'משתמש לא נמצא במערכת' });
        }

        // If user exists but is not a patient, return error
        if (user.role !== 'patient') {
            return res.status(400).json({ error: 'המשתמש אינו מטופל במערכת' });
        }

        // Then find or create the patient record
        let patient = await Patient.findOne({
            where: { user_id: user.id },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['first_name', 'last_name', 'email', 'phone']
                },
                {
                    model: Therapist,
                    as: 'therapist',
                    include: [{ model: User, as: 'user', attributes: ['first_name', 'last_name'] }]
                }
            ]
        });

        // If patient doesn't exist, create it
        if (!patient) {
            const therapistId = req.user?.role_id;
            
            patient = await Patient.create({
                user_id: user.id,
                therapist_id: therapistId,
                date_of_birth: new Date(),
                condition: 'General',
                status: 'active'
            });

            // Fetch the complete patient record with associations
            patient = await Patient.findOne({
                where: { id: patient.id },
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['first_name', 'last_name', 'email', 'phone']
                    },
                    {
                        model: Therapist,
                        as: 'therapist',
                        include: [{ model: User, as: 'user', attributes: ['first_name', 'last_name'] }]
                    }
                ]
            });
        }

        res.json(patient);
    } catch (error) {
        console.error('Error fetching/creating patient by email:', error);
        res.status(500).json({ error: 'שגיאה בחיפוש/יצירת מטופל' });
    }
});

export default router; 