export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'patient' | 'therapist';
  phoneNumber: string;
  dateOfBirth: string;
}

export interface Patient extends User {
  role: 'patient';
  condition: string;
  therapistId: string;
  status: 'active' | 'inactive';
  rehabPlans?: RehabPlan[];
}

export interface Therapist extends User {
  role: 'therapist';
  specialization: string;
  patients?: Patient[];
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  videoUrl: string;
  instructions: string;
  duration: number;
  repetitions?: number;
  sets?: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  type: 'squat' | 'plank' | 'pushup' | 'other';
  category: 'core' | 'upper' | 'lower' | 'full';
  requiredEquipment?: Equipment[];
}

export interface RehabPlanExercise {
  id: string;
  rehabPlanId: string;
  exerciseId: string;
  orderIndex: number;
  isCompleted: boolean;
  status: 'pending' | 'completed' | 'skipped';
  completedAt?: string;
  notes?: string;
  exercise?: Exercise;
}

export interface RehabPlan {
  id: string;
  patientId: string;
  therapistId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'on-hold';
  goals: RehabGoal[];
  exercises: Exercise[];
  progress: number;
}

export interface RehabGoal {
  id: string;
  planId: string;
  title: string;
  description: string;
  targetDate: string;
  status: 'pending' | 'in-progress' | 'achieved';
  measurementCriteria: string;
  progress: number;
}

export interface Appointment {
  id: string;
  patientId: string;
  therapistId: string;
  planId: string;
  date: string;
  time: string;
  type: 'initial' | 'follow-up' | 'exercise';
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  location?: string;
  patientName?: string;
  reminderTime?: '30min' | '1hour' | '1day';
}

export interface ExerciseSession {
  id: string;
  appointmentId: string;
  patientId: string;
  exerciseId: string;
  date: string;
  startTime: string;
  endTime: string;
  completed: boolean;
  performance: {
    accuracy: number;
    correctPosture: boolean;
    completedRepetitions: number;
    completedSets: number;
    notes: string;
  };
}

export interface Equipment {
  id: string;
  name: string;
  description: string;
  category: string;
  yadSaraLocation: {
    branchName: string;
    address: string;
    availability: boolean;
  };
} 