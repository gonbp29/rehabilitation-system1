import express from 'express';
import { Therapist, User, Patient, RehabPlan, Appointment } from '../models';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get all therapists
router.get('/', authenticateToken, async (req, res) => {
  try {
    const therapists = await Therapist.findAll({
      include: [
        { 
          model: User,
          attributes: ['id', 'email', 'firstName', 'lastName', 'phoneNumber', 'dateOfBirth']
        }
      ]
    });
    res.json(therapists);
  } catch (error) {
    console.error('Error fetching therapists:', error);
    res.status(500).json({ error: 'Failed to fetch therapists' });
  }
});

// Get therapist by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const therapist = await Therapist.findByPk(req.params.id, {
      include: [
        { 
          model: User,
          attributes: ['id', 'email', 'firstName', 'lastName', 'phoneNumber', 'dateOfBirth']
        },
        {
          model: Patient,
          include: [
            {
              model: User,
              attributes: ['firstName', 'lastName']
            }
          ]
        },
        {
          model: RehabPlan,
          attributes: ['id', 'title', 'status', 'progress']
        },
        {
          model: Appointment,
          attributes: ['id', 'date', 'time', 'status', 'type']
        }
      ]
    });
    if (!therapist) {
      return res.status(404).json({ error: 'Therapist not found' });
    }
    res.json(therapist);
  } catch (error) {
    console.error('Error fetching therapist:', error);
    res.status(500).json({ error: 'Failed to fetch therapist' });
  }
});

// Update therapist
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const therapist = await Therapist.findByPk(req.params.id);
    if (!therapist) {
      return res.status(404).json({ error: 'Therapist not found' });
    }

    const { specialization } = req.body;

    await therapist.update({
      specialization
    });

    // Fetch the updated therapist with its relations
    const updatedTherapist = await Therapist.findByPk(therapist.id, {
      include: [
        { 
          model: User,
          attributes: ['id', 'email', 'firstName', 'lastName', 'phoneNumber', 'dateOfBirth']
        }
      ]
    });

    res.json(updatedTherapist);
  } catch (error) {
    console.error('Error updating therapist:', error);
    res.status(500).json({ error: 'Failed to update therapist' });
  }
});

export default router; 