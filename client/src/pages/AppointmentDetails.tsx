import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { CalendarIcon, ClockIcon, UserIcon } from '@heroicons/react/24/outline';
import { getAppointment, deleteAppointment } from '../services/api';
import { Appointment } from '../types';
import styles from './AppointmentDetails.module.css';

const AppointmentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: appointment, isLoading, error } = useQuery<Appointment>({
    queryKey: ['appointment', id],
    queryFn: () => getAppointment(id!),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAppointment(id),
    onSuccess: () => {
      navigate('/appointments');
    },
  });

  if (isLoading) return <div className={styles.loading}>טוען...</div>;
  if (error) return <div className={styles.error}>שגיאה בטעינת נתוני הפגישה.</div>;
  if (!appointment) return <div className={styles.error}>הפגישה לא נמצאה.</div>;

  const getStatusText = (status: Appointment['status']) => {
    switch (status) {
      case 'scheduled': return 'מתוכנן';
      case 'completed': return 'הושלם';
      case 'cancelled': return 'בוטל';
      default: return status;
    }
  };

  const getTypeText = (type: Appointment['type']) => {
    switch (type) {
      case 'consultation': return 'ייעוץ';
      case 'follow_up': return 'מעקב';
      case 'assessment': return 'הערכה';
      default: return type;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>פרטי פגישה</h1>
        <span className={`${styles.status} ${styles[appointment.status]}`}>
          {getStatusText(appointment.status)}
        </span>
        <div className={styles.actions}>
          <button onClick={() => deleteMutation.mutate(appointment.id)} className={styles.deleteButton}>מחק</button>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <CalendarIcon className={styles.icon} />
            <h2>מועד הפגישה</h2>
          </div>
          <div className={styles.details}>
            <p>{new Date(appointment.scheduled_date).toLocaleDateString('he-IL')}</p>
            <div className={styles.time}>
              <ClockIcon className={styles.smallIcon} />
              <span>{appointment.scheduled_time} ({appointment.duration_minutes} דקות)</span>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <UserIcon className={styles.icon} />
            <h2>פרטי המשתתפים</h2>
          </div>
          <div className={styles.details}>
            <p><strong>מטפל:</strong> {appointment.therapist?.user?.first_name} {appointment.therapist?.user?.last_name}</p>
            <p><strong>מטופל:</strong> {appointment.patient?.user?.first_name} {appointment.patient?.user?.last_name}</p>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>פרטי הפגישה</h2>
          </div>
          <div className={styles.details}>
            <p><strong>סוג פגישה:</strong> {getTypeText(appointment.type)}</p>
            {appointment.session_notes && (
              <div className={styles.notes}>
                <p><strong>הערות:</strong></p>
                <p>{appointment.session_notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetails; 