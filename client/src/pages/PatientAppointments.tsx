import React, { useState } from 'react';
import styles from './PatientAppointments.module.css';
import { CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { updateAppointment, getPatientAppointments } from '../services/api';
import { Appointment } from '../types';
import { useAuth } from '../contexts/AuthContext';

const PatientAppointments: React.FC = () => {
  const { user } = useAuth();
  const patientId = user?.role_id;
  const queryClient = useQueryClient();

  const [filter, setFilter] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all');

  const { data: appointments, isLoading, error } = useQuery<Appointment[]>({
    queryKey: ['patientAppointments', patientId],
    queryFn: () => getPatientAppointments(patientId!),
    enabled: !!patientId,
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => updateAppointment(id, { status: 'cancelled' }),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['patientAppointments', patientId] });
    },
  });

  if(isLoading) return <div className={styles.loading}>טוען...</div>;
  if(error) return <div className={styles.error}>שגיאה בטעינת הפגישות.</div>;

  const filteredAppointments = filter === 'all'
    ? appointments
    : appointments?.filter(a => a.status === filter);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>הפגישות שלי</h1>
        <p>צפה בכל הפגישות המתוכננות והקודמות שלך</p>
      </div>

      <div className={styles.filters}>
        <button className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`} onClick={() => setFilter('all')}>הכל</button>
        <button className={`${styles.filterButton} ${filter === 'scheduled' ? styles.active : ''}`} onClick={() => setFilter('scheduled')}>מתוכנן</button>
        <button className={`${styles.filterButton} ${filter === 'completed' ? styles.active : ''}`} onClick={() => setFilter('completed')}>הושלם</button>
        <button className={`${styles.filterButton} ${filter === 'cancelled' ? styles.active : ''}`} onClick={() => setFilter('cancelled')}>בוטל</button>
      </div>

      <div className={styles.appointmentsList}>
        {filteredAppointments?.map(appointment => (
          <div key={appointment.id} className={styles.appointmentCard}>
            <div className={styles.appointmentDate}>
              <CalendarIcon className={styles.icon} />
              <div>
                <strong>{new Date(appointment.scheduled_date).toLocaleDateString('he-IL')}</strong>
                <div className={styles.timeWrapper}>
                  <ClockIcon className={styles.smallIcon} />
                  <span>{appointment.scheduled_time}</span>
                </div>
              </div>
            </div>

            <div className={styles.appointmentDetails}>
              <div>
                <h3>{appointment.type}</h3>
                <p>עם {appointment.therapist?.user?.first_name} {appointment.therapist?.user?.last_name}</p>
              </div>
            </div>

            <div className={styles.status}>
              <span className={`${styles.statusBadge} ${styles[appointment.status]}`}>
                {appointment.status === 'scheduled' ? 'מתוכנן' : 
                 appointment.status === 'completed' ? 'הושלם' : 'בוטל'}
              </span>
              {appointment.status === 'scheduled' && (
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