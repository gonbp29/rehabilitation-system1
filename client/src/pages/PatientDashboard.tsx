import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './PatientDashboard.module.css';
import { ClockIcon, ChartBarIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { getExercises, getAppointments, getPatient, getTherapist } from '../services/api';
import { Exercise, Appointment, Patient, Therapist } from '../types';
import { useAuth } from '../contexts/AuthContext';

const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const patientId = user?.id;

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [therapist, setTherapist] = useState<Therapist | null>(null);

  useEffect(() => {
    if (!patientId) return;
    // Fetch patient info
    getPatient(patientId)
      .then((data) => {
        setPatient(data);
        // Fetch therapist info if patient has a therapist
        if (data.therapistId) {
          getTherapist(data.therapistId)
            .then((therapistData) => setTherapist(therapistData))
            .catch((err) => console.error('Error fetching therapist:', err));
        }
      })
      .catch((err) => console.error('Error fetching patient:', err));

    // Fetch exercises
    getExercises()
      .then((data) => setExercises(data))
      .catch((err) => console.error('Error fetching exercises:', err));

    // Fetch appointments
    getAppointments(patientId, 'patient')
      .then((data) => setAppointments(data))
      .catch((err) => console.error('Error fetching appointments:', err));
  }, [patientId]);

  // Calculate stats
  const completedExercises = exercises.filter(e => e.isCompleted).length;
  const totalExercises = exercises.length;
  const completionPercent = totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0;
  const completedAppointments = appointments.filter(a => a.status === 'completed').length;

  // Get current rehab plan
  const currentPlan = patient?.rehabPlans?.find(plan => plan.status === 'active');

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>שלום, {user?.firstName || '...'}</h1>
        <p>ברוך הבא למערכת המעקב האישית שלך</p>
      </div>

      <div className={styles.statsContainer}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <ChartBarIcon />
          </div>
          <div className={styles.statContent}>
            <h3>{completionPercent}%</h3>
            <p>השלמת תרגילים</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <ClockIcon />
          </div>
          <div className={styles.statContent}>
            <h3>{completedExercises}</h3>
            <p>תרגילים הושלמו</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <ChatBubbleLeftIcon />
          </div>
          <div className={styles.statContent}>
            <h3>{completedAppointments}</h3>
            <p>פגישות בוצעו</p>
          </div>
        </div>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>התרגילים שלי להיום</h2>
            <Link to="/my-exercises" className={styles.link}>
              צפה בכל התרגילים
            </Link>
          </div>
          <div className={styles.exercisesList}>
            {exercises.map(exercise => (
              <div key={exercise.id} className={styles.exerciseCard}>
                <div className={styles.exerciseInfo}>
                  <h3>{exercise.name}</h3>
                  <p>{exercise.description}</p>
                  <span className={styles.duration}>{exercise.duration} דקות</span>
                </div>
                <Link
                  to={`/exercise-session/${exercise.id}`}
                  className={styles.startButton}
                >
                  התחל תרגיל
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>פגישות קרובות</h2>
            <Link to="/my-appointments" className={styles.link}>
              צפה בכל הפגישות
            </Link>
          </div>
          <div className={styles.appointmentsList}>
            {appointments.map(appointment => (
              <div key={appointment.id} className={styles.appointmentCard}>
                <div className={styles.appointmentInfo}>
                  <div className={styles.appointmentDate}>
                    <strong>{new Date(appointment.date).toLocaleDateString('he-IL')}</strong>
                    <span>{appointment.time}</span>
                  </div>
                  <div className={styles.appointmentDetails}>
                    <h3>
                      {appointment.type === 'initial'
                        ? 'פגישת הערכה'
                        : appointment.type === 'follow-up'
                        ? 'פגישת מעקב'
                        : 'תרגול'}
                    </h3>
                    <p>עם {therapist ? `${therapist.firstName} ${therapist.lastName}` : 'מטפל'}</p>
                    <p>{appointment.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>ההתקדמות שלי</h2>
            <Link to="/my-progress" className={styles.link}>
              צפה בדוח מלא
            </Link>
          </div>
          <div className={styles.progressCard}>
            <div className={styles.progressHeader}>
              <h3>תוכנית שיקום נוכחית</h3>
              <p>{currentPlan?.title || patient?.condition || '---'}</p>
            </div>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${completionPercent}%` }} />
            </div>
            <p className={styles.progressText}>{completionPercent}% להשלמת היעד</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard; 