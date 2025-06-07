/// <reference types="vite/client" />
import axios from 'axios';
import { Exercise, ExerciseSession, RehabPlan, Patient, Appointment, Therapist, Equipment, RehabGoal } from '../types';

const API_URL = import.meta.env.PROD
  ? 'https://your-render-app.onrender.com/api'  // החלף עם כתובת ה-Render שלך
  : 'http://localhost:3001/api';

// Mock data for development
const mockExercises: Exercise[] = [
  {
    id: '1',
    name: 'כפיפות בטן',
    description: 'תרגיל לחיזוק שרירי הבטן',
    videoUrl: 'https://example.com/video1',
    instructions: 'שכב על הגב, כופף את הברכיים והרם את הגוף',
    duration: 10,
    repetitions: 15,
    sets: 3,
    difficulty: 'beginner',
    type: 'squat',
    category: 'core',
    isCompleted: false,
    status: 'pending',
    requiredEquipment: []
  },
  {
    id: '2',
    name: 'כפיפות בטן צידיות',
    description: 'תרגיל לחיזוק שרירי הבטן הצידיים',
    videoUrl: 'https://example.com/video2',
    instructions: 'שכב על הצד, תמוך את הגוף על המרפק והרם את האגן',
    duration: 15,
    repetitions: 12,
    sets: 3,
    difficulty: 'intermediate',
    type: 'plank',
    category: 'core',
    isCompleted: false,
    status: 'pending',
    requiredEquipment: []
  }
];

const mockExerciseSessions: ExerciseSession[] = [
  {
    id: '1',
    appointmentId: '1',
    patientId: '1',
    exerciseId: '1',
    date: '2024-02-20',
    startTime: '10:00',
    endTime: '10:30',
    completed: false,
    performance: {
      accuracy: 0,
      correctPosture: false,
      completedRepetitions: 0,
      completedSets: 0,
      notes: ''
    }
  }
];

const mockRehabPlans: RehabPlan[] = [
  {
    id: '1',
    patientId: '1',
    therapistId: '1',
    title: 'תוכנית שיקום גב',
    description: 'תוכנית שיקום לחיזוק שרירי הגב',
    startDate: '2024-02-20',
    endDate: '2024-03-20',
    status: 'active',
    goals: [
      {
        id: '1',
        planId: '1',
        title: 'חיזוק שרירי הגב',
        description: 'שיפור חוזק שרירי הגב',
        targetDate: '2024-03-01',
        status: 'pending',
        measurementCriteria: 'יכולת לבצע 3 סטים של 15 חזרות',
        progress: 0
      }
    ],
    exercises: [],
    progress: 0
  }
];

const mockPatients: Patient[] = [
  {
    id: '1',
    email: 'patient@example.com',
    firstName: 'ישראל',
    lastName: 'ישראלי',
    role: 'patient',
    phoneNumber: '050-1234567',
    dateOfBirth: '1980-01-01',
    condition: 'כאבי גב',
    therapistId: '1',
    status: 'active'
  }
];

const mockTherapists: Therapist[] = [
  {
    id: '1',
    email: 'therapist@example.com',
    firstName: 'דוד',
    lastName: 'דוידי',
    role: 'therapist',
    phoneNumber: '050-7654321',
    dateOfBirth: '1975-01-01',
    specialization: 'פיזיותרפיה',
    patients: []
  }
];

const mockAppointments: Appointment[] = [
  {
    id: '1',
    patientId: '1',
    therapistId: '1',
    planId: '1',
    date: '2024-02-20',
    time: '10:00',
    type: 'initial',
    status: 'scheduled',
    location: 'מרפאה 1'
  }
];

const mockEquipment: Equipment[] = [
  {
    id: '1',
    name: 'מזרון יוגה',
    description: 'מזרון יוגה איכותי',
    category: 'fitness',
    yadSaraLocation: {
      branchName: 'סניף מרכז',
      address: 'רחוב הרצל 1, תל אביב',
      availability: true
    }
  }
];

// Create axios instance with auth interceptor
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API functions
export const getExercises = async (): Promise<Exercise[]> => {
  try {
    const response = await axios.get(`${API_URL}/exercises`);
    return response.data;
  } catch (error) {
    console.error('Error fetching exercises:', error);
    return mockExercises;
  }
};

export const getExerciseSession = async (sessionId: string): Promise<ExerciseSession> => {
  try {
    const response = await api.get(`/exercise-sessions/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching exercise session:', error);
    const session = mockExerciseSessions.find(s => s.id === sessionId);
    if (!session) {
      throw new Error('Exercise session not found');
    }
    return session;
  }
};

export const updateExerciseInSession = async (
  sessionId: string,
  exerciseId: string,
  updates: Partial<Exercise>
): Promise<Exercise> => {
  try {
    const response = await api.patch(
      `/exercise-sessions/${sessionId}/exercises/${exerciseId}`,
      updates
    );
    return response.data;
  } catch (error) {
    console.error('Error updating exercise:', error);
    const session = mockExerciseSessions.find(s => s.id === sessionId);
    if (!session) {
      throw new Error('Exercise session not found');
    }
    const exercise = mockExercises.find(e => e.id === exerciseId);
    if (!exercise) {
      throw new Error('Exercise not found');
    }
    const updatedExercise = { ...exercise, ...updates };
    return updatedExercise;
  }
};

export const getRehabPlans = async (patientId: string): Promise<RehabPlan[]> => {
  try {
    const response = await api.get('/rehab-plans', {
      params: { patientId }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching rehab plans:', error);
    return mockRehabPlans.filter(plan => plan.patientId === patientId);
  }
};

export const getPatient = async (patientId: string): Promise<Patient> => {
  try {
    const response = await api.get(`/patients/${patientId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching patient:', error);
    const patient = mockPatients.find(p => p.id === patientId);
    if (!patient) {
      throw new Error('Patient not found');
    }
    return patient;
  }
};

export const getTherapist = async (therapistId: string): Promise<Therapist> => {
  try {
    const response = await api.get(`/therapists/${therapistId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching therapist:', error);
    const therapist = mockTherapists.find(t => t.id === therapistId);
    if (!therapist) {
      throw new Error('Therapist not found');
    }
    return therapist;
  }
};

export const getTherapistPatients = async (therapistId: string): Promise<Patient[]> => {
  try {
    const response = await api.get(`/therapists/${therapistId}/patients`);
    return response.data;
  } catch (error) {
    console.error('Error fetching therapist patients:', error);
    return mockPatients.filter(patient => patient.therapistId === therapistId);
  }
};

export const getAppointments = async (userId: string, role: 'patient' | 'therapist'): Promise<Appointment[]> => {
  try {
    const response = await api.get('/appointments', {
      params: { userId, role }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return mockAppointments.filter(appointment => 
      role === 'patient' ? appointment.patientId === userId : appointment.therapistId === userId
    );
  }
};

export const getEquipment = async (): Promise<Equipment[]> => {
  try {
    const response = await api.get('/equipment');
    return response.data;
  } catch (error) {
    console.error('Error fetching equipment:', error);
    return mockEquipment;
  }
};

export const updateSessionNotes = async (sessionId: string, notes: string): Promise<ExerciseSession> => {
  try {
    const response = await api.put(`/exercise-sessions/${sessionId}/notes`, { notes });
    return response.data;
  } catch (error) {
    console.error('Error updating session notes:', error);
    const session = mockExerciseSessions.find(s => s.id === sessionId);
    if (!session) {
      throw new Error('Exercise session not found');
    }
    return { ...session, performance: { ...session.performance, notes } };
  }
};

export const createRehabPlan = async (plan: Omit<RehabPlan, 'id'>): Promise<RehabPlan> => {
  try {
    const response = await axios.post(`${API_URL}/rehab-plans`, plan);
    return response.data;
  } catch (error) {
    console.error('Error creating rehab plan:', error);
    throw error;
  }
};

export const createAppointment = async (appointment: Omit<Appointment, 'id'>): Promise<Appointment> => {
  try {
    const response = await api.post('/appointments', appointment);
    return response.data;
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
};

export const getAppointment = async (id: string): Promise<Appointment> => {
  try {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching appointment:', error);
    const appointment = mockAppointments.find(a => a.id === id);
    if (!appointment) {
      throw new Error('Appointment not found');
    }
    return appointment;
  }
};

export const updateAppointment = async (id: string, updates: Partial<Appointment>): Promise<Appointment> => {
  try {
    const response = await api.put(`/appointments/${id}`, updates);
    return response.data;
  } catch (error) {
    console.error('Error updating appointment:', error);
    const appointment = mockAppointments.find(a => a.id === id);
    if (!appointment) {
      throw new Error('Appointment not found');
    }
    const updatedAppointment = { ...appointment, ...updates };
    return updatedAppointment;
  }
};

export const getRehabPlan = async (planId: string): Promise<RehabPlan> => {
  try {
    const response = await api.get(`/rehab-plans/${planId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching rehab plan:', error);
    const plan = mockRehabPlans.find(p => p.id === planId);
    if (!plan) {
      throw new Error('Rehab plan not found');
    }
    return plan;
  }
};

export const deleteAppointment = async (id: string): Promise<void> => {
  try {
    await api.delete(`/appointments/${id}`);
  } catch (error) {
    console.error('Error deleting appointment:', error);
    throw error;
  }
};

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: 'patient' | 'therapist';
}

export const registerUser = async (data: RegisterData) => {
  return api.post('/auth/register', data);
};

export default api; 