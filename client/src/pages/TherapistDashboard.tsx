import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  UserGroupIcon,
  ClipboardDocumentListIcon,
  CalendarIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { getTherapistPatients, getAppointments } from '../services/api';
import { type Patient, type Appointment, type RehabPlan } from '../types';
import styles from './TherapistDashboard.module.css';
import { useAuth } from '../contexts/AuthContext';

const TherapistDashboard: React.FC = () => {
  const { user } = useAuth();
  const therapistId = user?.id;

  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!therapistId) return;

    const fetchData = async () => {
      try {
        const [patientsData, appointmentsData] = await Promise.all([
          getTherapistPatients(therapistId),
          getAppointments(therapistId, 'therapist')
        ]);
        setPatients(patientsData);
        setAppointments(appointmentsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('שגיאה בטעינת הנתונים');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [therapistId]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>טוען...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  const activePatients = patients.filter(patient => patient.status === 'active');
  const todayAppointments = appointments.filter(apt => {
    const appointmentDate = new Date(apt.date);
    const today = new Date();
    return appointmentDate.toDateString() === today.toDateString();
  });

  const activePlans = activePatients.reduce((count, patient) => {
    return count + (patient.rehabPlans?.filter(plan => plan.status === 'active').length || 0);
  }, 0);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>ברוך הבא למערכת השיקום</h1>
        <p className={styles.subtitle}>סקירה כללית של המטופלים והפעילויות שלך</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <UserGroupIcon className={styles.icon} />
            <span>מטופלים פעילים</span>
          </div>
          <div className={styles.statValue}>{activePatients.length}</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <ClipboardDocumentListIcon className={styles.icon} />
            <span>תוכניות שיקום פעילות</span>
          </div>
          <div className={styles.statValue}>{activePlans}</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <CalendarIcon className={styles.icon} />
            <span>פגישות היום</span>
          </div>
          <div className={styles.statValue}>{todayAppointments.length}</div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>תוכניות שיקום פעילות</h2>
          <Link to="/create-program" className={styles.sectionLink}>
            יצירת תוכנית חדשה
          </Link>
        </div>
        <div className={styles.appointmentsList}>
          {activePatients.map(patient => 
            patient.rehabPlans
              ?.filter(plan => plan.status === 'active')
              .map(plan => (
                <Link
                  key={plan.id}
                  to={`/program/${plan.id}`}
                  className={styles.appointmentCard}
                >
                  <div className={styles.appointmentHeader}>
                    <h3>{patient.firstName} {patient.lastName}</h3>
                    <span className={styles.statuspending}>פעיל</span>
                  </div>
                  <div className={styles.appointmentTime}>
                    <span>{plan.title}</span>
                  </div>
                </Link>
              ))
          )}
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>פגישות היום</h2>
        </div>
        <div className={styles.appointmentsList}>
          {todayAppointments.length > 0 ? (
            todayAppointments.map(appointment => (
              <Link
                key={appointment.id}
                to={`/appointment/${appointment.id}`}
                className={styles.appointmentCard}
              >
                <div className={styles.appointmentHeader}>
                  <h3>{appointment.patientName || 'מטופל'}</h3>
                  <span className={styles[`status${appointment.status}`]}>
                    {appointment.status}
                  </span>
                </div>
                <div className={styles.appointmentTime}>
                  <span>{appointment.time}</span>
                </div>
              </Link>
            ))
          ) : (
            <div className={styles.appointmentCard}>
              <div className={styles.appointmentHeader}>
                <h3>אין פגישות להיום</h3>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TherapistDashboard; 