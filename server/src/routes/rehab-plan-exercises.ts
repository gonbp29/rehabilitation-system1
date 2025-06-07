import express from 'express';
import { RehabPlan, Exercise, RehabPlanExercise } from '../models';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Add exercise to rehab plan
router.post('/:planId/exercises/:exerciseId', authenticateToken, async (req, res) => {
  try {
    const { planId, exerciseId } = req.params;
    const { orderIndex, notes } = req.body;

    // Check if plan and exercise exist
    const plan = await RehabPlan.findByPk(planId);
    const exercise = await Exercise.findByPk(exerciseId);

    if (!plan) {
      return res.status(404).json({ error: 'Rehab plan not found' });
    }
    if (!exercise) {
      return res.status(404).json({ error: 'Exercise not found' });
    }

    // Check if already exists
    const existing = await RehabPlanExercise.findOne({
      where: { rehabPlanId: planId, exerciseId }
    });

    if (existing) {
      return res.status(400).json({ error: 'Exercise already added to this plan' });
    }

    const planExercise = await RehabPlanExercise.create({
      rehabPlanId: planId,
      exerciseId,
      orderIndex: orderIndex || 0,
      notes
    });

    res.status(201).json(planExercise);
  } catch (error) {
    console.error('Error adding exercise to plan:', error);
    res.status(500).json({ error: 'Failed to add exercise to plan' });
  }
});

// Remove exercise from rehab plan
router.delete('/:planId/exercises/:exerciseId', authenticateToken, async (req, res) => {
  try {
    const { planId, exerciseId } = req.params;

    const deleted = await RehabPlanExercise.destroy({
      where: { rehabPlanId: planId, exerciseId }
    });

    if (deleted === 0) {
      return res.status(404).json({ error: 'Exercise not found in this plan' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error removing exercise from plan:', error);
    res.status(500).json({ error: 'Failed to remove exercise from plan' });
  }
});

// Update exercise status in rehab plan
router.put('/:planId/exercises/:exerciseId', authenticateToken, async (req, res) => {
  try {
    const { planId, exerciseId } = req.params;
    const { isCompleted, status, notes, completedAt } = req.body;

    const planExercise = await RehabPlanExercise.findOne({
      where: { rehabPlanId: planId, exerciseId }
    });

    if (!planExercise) {
      return res.status(404).json({ error: 'Exercise not found in this plan' });
    }

    await planExercise.update({
      isCompleted,
      status,
      notes,
      completedAt: isCompleted ? (completedAt || new Date()) : null
    });

    res.json(planExercise);
  } catch (error) {
    console.error('Error updating exercise in plan:', error);
    res.status(500).json({ error: 'Failed to update exercise in plan' });
  }
});

// Get all exercises for a rehab plan
router.get('/:planId/exercises', authenticateToken, async (req, res) => {
  try {
    const { planId } = req.params;

    const plan = await RehabPlan.findByPk(planId, {
      include: [
        {
          model: Exercise,
          as: 'exercises',
          through: {
            attributes: ['orderIndex', 'isCompleted', 'status', 'completedAt', 'notes']
          }
        }
      ]
    });

    if (!plan) {
      return res.status(404).json({ error: 'Rehab plan not found' });
    }

    res.json(plan.exercises);
  } catch (error) {
    console.error('Error fetching plan exercises:', error);
    res.status(500).json({ error: 'Failed to fetch plan exercises' });
  }
});

export default router; 