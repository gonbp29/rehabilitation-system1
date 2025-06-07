import React, { useEffect, useState } from 'react';
import styles from './PatientAppointments.module.css';
import { CalendarIcon, ClockIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { useMutation } from '@tanstack/react-query';
import { updateAppointment, getPatientAppointments, Appointment as ApiAppointment } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface Appointment extends ApiAppointment {
  therapistName?: string;
  location?: string;
  // UI status: 'upcoming' | 'completed' | 'cancelled'
  uiStatus: 'upcoming' | 'completed' | 'cancelled';
}

const PatientAppointments: React.FC = () => {
  const { user } = useAuth();
  const patientId = user?.patientId;
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = React.useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');
  const [successMsg, setSuccessMsg] = React.useState('');
  const [errorMsg, setErrorMsg] = React.useState('');

  const cancelMutation = useMutation({
    mutationFn: (id: string) => updateAppointment(id, { status: 'cancelled' }),
  });

  useEffect(() => {
    if (!patientId) return;
    getPatientAppointments(patientId)
      .then((data) => {
        // Map API status to UI status
        const mapped = data.map((a: ApiAppointment) => ({
          ...a,
          uiStatus: (a.status === 'pending' ? 'upcoming' : a.status) as 'upcoming' | 'completed' | 'cancelled',
        }));
        setAppointments(mapped);
      })
      .catch(() => setErrorMsg('שגיאה בטעינת הפגישות'));
  }, [patientId]);

  const filteredAppointments = filter === 'all'
    ? appointments
    : appointments.filter(a => a.uiStatus === filter);

  React.useEffect(() => {
    if (cancelMutation.isSuccess) {
      setSuccessMsg('הפגישה בוטלה בהצלחה');
      setTimeout(() => setSuccessMsg(''), 2000);
    }
    if (cancelMutation.isError) {
      setErrorMsg('שגיאה בביטול הפגישה');
      setTimeout(() => setErrorMsg(''), 2000);
    }
  }, [cancelMutation.isSuccess, cancelMutation.isError]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>הפגישות שלי</h1>
        <p>צפה בכל הפגישות המתוכננות והקודמות שלך</p>
      </div>

      <div className={styles.filters}>
        <button className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`} onClick={() => setFilter('all')}>הכל</button>
        <button className={styles.filterButton + ' ' + (filter === 'upcoming' ? styles.active : '')} onClick={() => setFilter('upcoming')}>מתוכנן</button>
        <button className={styles.filterButton + ' ' + (filter === 'completed' ? styles.active : '')} onClick={() => setFilter('completed')}>הושלם</button>
        <button className={styles.filterButton + ' ' + (filter === 'cancelled' ? styles.active : '')} onClick={() => setFilter('cancelled')}>בוטל</button>
      </div>

      {successMsg && <div className={styles.successMsg}>{successMsg}</div>}
      {errorMsg && <div className={styles.errorMsg}>{errorMsg}</div>}

      <div className={styles.appointmentsList}>
        {filteredAppointments.map(appointment => (
          <div key={appointment.id} className={styles.appointmentCard}>
            <div className={styles.appointmentDate}>
              <CalendarIcon className={styles.icon} />
              <div>
                <strong>{new Date(appointment.date).toLocaleDateString('he-IL')}</strong>
                <div className={styles.timeWrapper}>
                  <ClockIcon className={styles.smallIcon} />
                  <span>{appointment.time}</span>
                </div>
              </div>
            </div>

            <div className={styles.appointmentDetails}>
              <div>
                <h3>{appointment.type}</h3>
                <p>עם {/* therapist name placeholder */}מטפל</p>
              </div>
              <div className={styles.location}>
                <MapPinIcon className={styles.smallIcon} />
                <span>{appointment.location || '---'}</span>
              </div>
            </div>

            <div className={styles.status}>
              <span className={`${styles.statusBadge} ${styles[appointment.uiStatus]}`}>
                {appointment.uiStatus === 'upcoming' ? 'מתוכנן' : 
                 appointment.uiStatus === 'completed' ? 'הושלם' : 'בוטל'}
              </span>
              {appointment.uiStatus === 'upcoming' && (
                <button
                  className={styles.cancelButton}
                  onClick={() => cancelMutation.mutate(appointment.id)}
                  disabled={cancelMutation.isPending}
                >
                  {cancelMutation.isPending ? 'מבטל...' : 'בטל פגישה'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PatientAppointments; 