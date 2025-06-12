import { Router } from 'express';
import PatientExercise from '../models/PatientExercise';
import Exercise from '../models/Exercise';

const router = Router();

// סימון תרגיל כהושלם
router.post('/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    const exercise = await PatientExercise.findByPk(id);
    if (!exercise) {
      return res.status(404).json({ error: 'PatientExercise not found' });
    }
    exercise.status = 'completed';
    await exercise.save();
    res.json(exercise);
  } catch (error) {
    res.status(500).json({ error: 'Failed to complete exercise' });
  }
});

// Get single PatientExercise by id
router.get('/:id', async (req, res) => {
  try {
    const exercise = await PatientExercise.findByPk(req.params.id, {
      include: [{ model: Exercise, as: 'exercise' }]
    });
    if (!exercise) {
      return res.status(404).json({ error: 'PatientExercise not found' });
    }
    res.json(exercise);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch patient exercise' });
  }
});

export default router; 