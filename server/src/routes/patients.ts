import express from 'express';
import { Patient, User, Therapist, RehabPlan, Appointment } from '../models';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get all patients
router.get('/', authenticateToken, async (req, res) => {
  try {
    const patients = await Patient.findAll({
      include: [
        { 
          model: User,
          attributes: ['id', 'email', 'firstName', 'lastName', 'phoneNumber', 'dateOfBirth']
        },
        { 
          model: Therapist,
          attributes: ['id'],
          include: [
            {
              model: User,
              attributes: ['firstName', 'lastName']
            }
          ]
        }
      ]
    });
    res.json(patients);
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

// Get patient by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const patient = await Patient.findByPk(req.params.id, {
      include: [
        { 
          model: User,
          attributes: ['id', 'email', 'firstName', 'lastName', 'phoneNumber', 'dateOfBirth']
        },
        { 
          model: Therapist,
          attributes: ['id'],
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
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.json(patient);
  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(500).json({ error: 'Failed to fetch patient' });
  }
});

// Create new patient
router.post('/', async (req, res) => {
  try {
    const patientData = req.body;
    // Return the new patient with a mock id
    res.status(201).json({ ...patientData, id: Date.now() });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update patient
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const { condition, status, therapistId } = req.body;

    await patient.update({
      condition,
      status,
      therapistId
    });

    // Fetch the updated patient with its relations
    const updatedPatient = await Patient.findByPk(patient.id, {
      include: [
        { 
          model: User,
          attributes: ['id', 'email', 'firstName', 'lastName', 'phoneNumber', 'dateOfBirth']
        },
        { 
          model: Therapist,
          attributes: ['id'],
          include: [
            {
              model: User,
              attributes: ['firstName', 'lastName']
            }
          ]
        }
      ]
    });

    res.json(updatedPatient);
  } catch (error) {
    console.error('Error updating patient:', error);
    res.status(500).json({ error: 'Failed to update patient' });
  }
});

// Delete patient
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Return success (mock)
    res.json({ message: `Patient ${id} deleted` });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all appointments for a patient
router.get('/:id/appointments', async (req, res) => {
  try {
    const { id } = req.params;
    const appointments = await Appointment.findAll({ where: { patientId: id } });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get patients for a specific therapist
router.get('/therapist/:therapistId', authenticateToken, async (req, res) => {
  try {
    const patients = await Patient.findAll({
      where: { therapistId: req.params.therapistId },
      include: [
        { 
          model: User,
          attributes: ['id', 'email', 'firstName', 'lastName', 'phoneNumber', 'dateOfBirth']
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
    res.json(patients);
  } catch (error) {
    console.error('Error fetching therapist patients:', error);
    res.status(500).json({ error: 'Failed to fetch therapist patients' });
  }
});

export default router; 