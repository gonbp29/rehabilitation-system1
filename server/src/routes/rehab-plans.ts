import express from 'express';
import { RehabPlan, RehabGoal, Patient, Therapist } from '../models';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get all rehab plans
router.get('/', authenticateToken, async (req, res) => {
  try {
    const plans = await RehabPlan.findAll({
      include: [
        { model: Patient, attributes: ['id', 'status'] },
        { model: Therapist, attributes: ['id'] }
      ]
    });
    res.json(plans);
  } catch (error) {
    console.error('Error fetching rehab plans:', error);
    res.status(500).json({ error: 'Failed to fetch rehab plans' });
  }
});

// Get rehab plan by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const plan = await RehabPlan.findByPk(req.params.id, {
      include: [
        { model: Patient, attributes: ['id', 'status'] },
        { model: Therapist, attributes: ['id'] },
        { model: RehabGoal }
      ]
    });
    if (!plan) {
      return res.status(404).json({ error: 'Rehab plan not found' });
    }
    res.json(plan);
  } catch (error) {
    console.error('Error fetching rehab plan:', error);
    res.status(500).json({ error: 'Failed to fetch rehab plan' });
  }
});

// Create new rehab plan
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      patientId,
      therapistId,
      title,
      description,
      startDate,
      endDate,
      status,
      progress,
      goals
    } = req.body;

    const plan = await RehabPlan.create({
      patientId,
      therapistId,
      title,
      description,
      startDate,
      endDate,
      status: status || 'active',
      progress: progress || 0
    });

    // Create goals if provided
    if (goals && Array.isArray(goals)) {
      await Promise.all(goals.map(goal => 
        RehabGoal.create({
          planId: plan.id,
          title: goal.title,
          description: goal.description,
          targetDate: goal.targetDate,
          status: goal.status || 'pending',
          measurementCriteria: goal.measurementCriteria,
          progress: goal.progress || 0
        })
      ));
    }

    // Fetch the created plan with its goals
    const createdPlan = await RehabPlan.findByPk(plan.id, {
      include: [
        { model: Patient, attributes: ['id', 'status'] },
        { model: Therapist, attributes: ['id'] },
        { model: RehabGoal }
      ]
    });

    res.status(201).json(createdPlan);
  } catch (error) {
    console.error('Error creating rehab plan:', error);
    res.status(500).json({ error: 'Failed to create rehab plan' });
  }
});

// Update rehab plan
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const plan = await RehabPlan.findByPk(req.params.id);
    if (!plan) {
      return res.status(404).json({ error: 'Rehab plan not found' });
    }

    const {
      title,
      description,
      startDate,
      endDate,
      status,
      progress,
      goals
    } = req.body;

    await plan.update({
      title,
      description,
      startDate,
      endDate,
      status,
      progress
    });

    // Update goals if provided
    if (goals && Array.isArray(goals)) {
      // Delete existing goals
      await RehabGoal.destroy({ where: { planId: plan.id } });
      
      // Create new goals
      await Promise.all(goals.map(goal => 
        RehabGoal.create({
          planId: plan.id,
          title: goal.title,
          description: goal.description,
          targetDate: goal.targetDate,
          status: goal.status || 'pending',
          measurementCriteria: goal.measurementCriteria,
          progress: goal.progress || 0
        })
      ));
    }

    // Fetch the updated plan with its goals
    const updatedPlan = await RehabPlan.findByPk(plan.id, {
      include: [
        { model: Patient, attributes: ['id', 'status'] },
        { model: Therapist, attributes: ['id'] },
        { model: RehabGoal }
      ]
    });

    res.json(updatedPlan);
  } catch (error) {
    console.error('Error updating rehab plan:', error);
    res.status(500).json({ error: 'Failed to update rehab plan' });
  }
});

// Delete rehab plan
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const plan = await RehabPlan.findByPk(req.params.id);
    if (!plan) {
      return res.status(404).json({ error: 'Rehab plan not found' });
    }

    // Delete associated goals first
    await RehabGoal.destroy({ where: { planId: plan.id } });
    
    // Delete the plan
    await plan.destroy();
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting rehab plan:', error);
    res.status(500).json({ error: 'Failed to delete rehab plan' });
  }
});

export default router; 