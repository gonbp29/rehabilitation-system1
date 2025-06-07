import express from 'express';
import { Appointment, Patient, Therapist, RehabPlan } from '../models';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get all appointments
router.get('/', authenticateToken, async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      include: [
        { model: Patient, attributes: ['id', 'status'] },
        { model: Therapist, attributes: ['id'] },
        { model: RehabPlan, attributes: ['id', 'title'] }
      ]
    });
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Get appointment by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        { model: Patient, attributes: ['id', 'status'] },
        { model: Therapist, attributes: ['id'] },
        { model: RehabPlan, attributes: ['id', 'title'] }
      ]
    });
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json(appointment);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({ error: 'Failed to fetch appointment' });
  }
});

// Create new appointment
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      patientId,
      therapistId,
      planId,
      date,
      time,
      type,
      status,
      notes,
      location,
      reminderTime
    } = req.body;

    const appointment = await Appointment.create({
      patientId,
      therapistId,
      planId,
      date,
      time,
      type,
      status: status || 'scheduled',
      notes,
      location,
      reminderTime
    });

    // Fetch the created appointment with its relations
    const createdAppointment = await Appointment.findByPk(appointment.id, {
      include: [
        { model: Patient, attributes: ['id', 'status'] },
        { model: Therapist, attributes: ['id'] },
        { model: RehabPlan, attributes: ['id', 'title'] }
      ]
    });

    res.status(201).json(createdAppointment);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
});

// Update appointment
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const {
      date,
      time,
      type,
      status,
      notes,
      location,
      reminderTime
    } = req.body;

    await appointment.update({
      date,
      time,
      type,
      status,
      notes,
      location,
      reminderTime
    });

    // Fetch the updated appointment with its relations
    const updatedAppointment = await Appointment.findByPk(appointment.id, {
      include: [
        { model: Patient, attributes: ['id', 'status'] },
        { model: Therapist, attributes: ['id'] },
        { model: RehabPlan, attributes: ['id', 'title'] }
      ]
    });

    res.json(updatedAppointment);
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

// Delete appointment
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    await appointment.destroy();
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ error: 'Failed to delete appointment' });
  }
});

// Get appointments for a specific patient
router.get('/patient/:patientId', authenticateToken, async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      where: { patientId: req.params.patientId },
      include: [
        { model: Patient, attributes: ['id', 'status'] },
        { model: Therapist, attributes: ['id'] },
        { model: RehabPlan, attributes: ['id', 'title'] }
      ]
    });
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching patient appointments:', error);
    res.status(500).json({ error: 'Failed to fetch patient appointments' });
  }
});

// Get appointments for a specific therapist
router.get('/therapist/:therapistId', authenticateToken, async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      where: { therapistId: req.params.therapistId },
      include: [
        { model: Patient, attributes: ['id', 'status'] },
        { model: Therapist, attributes: ['id'] },
        { model: RehabPlan, attributes: ['id', 'title'] }
      ]
    });
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching therapist appointments:', error);
    res.status(500).json({ error: 'Failed to fetch therapist appointments' });
  }
});

export default router; 