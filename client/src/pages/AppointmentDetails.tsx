import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { CalendarIcon, ClockIcon, UserIcon, MapPinIcon, BellIcon } from '@heroicons/react/24/outline';
import { getAppointment, deleteAppointment, getRehabPlan } from '../services/api';
import { Appointment } from '../types';
import styles from './AppointmentDetails.module.css';

const AppointmentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: appointment, isLoading } = useQuery<Appointment>({
    queryKey: ['appointment', id],
    queryFn: () => getAppointment(id!),
    enabled: !!id,
  });

  const { data: rehabPlan } = useQuery({
    queryKey: ['rehabPlan', appointment?.planId],
    queryFn: () => getRehabPlan(appointment?.planId!),
    enabled: !!appointment?.planId,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAppointment(id),
    onSuccess: () => {
      navigate('/appointments');
    },
  });

  if (isLoading || !appointment) {
    return <div className={styles.loading}>טוען...</div>;
  }

  const getStatusText = (status: Appointment['status']) => {
    switch (status) {
      case 'scheduled':
        return 'מתוכנן';
      case 'completed':
        return 'הושלם';
      case 'cancelled':
        return 'בוטל';
      default:
        return status;
    }
  };

  const getTypeText = (type: Appointment['type']) => {
    switch (type) {
      case 'initial':
        return 'פגישה ראשונה';
      case 'follow-up':
        return 'מעקב';
      case 'exercise':
        return 'תרגול מונחה';
      default:
        return type;
    }
  };

  const getReminderText = (reminderTime: Appointment['reminderTime']) => {
    switch (reminderTime) {
      case '30min':
        return '30 דקות לפני';
      case '1hour':
        return 'שעה לפני';
      case '1day':
        return 'יום לפני';
      default:
        return 'ללא תזכורת';
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
          <button onClick={() => navigate(`/appointment/edit/${appointment.id}`)} className={styles.editButton}>ערוך</button>
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
            <p>{new Date(appointment.date).toLocaleDateString('he-IL')}</p>
            <div className={styles.time}>
              <ClockIcon className={styles.smallIcon} />
              <span>{appointment.time}</span>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <UserIcon className={styles.icon} />
            <h2>פרטי המשתתפים</h2>
          </div>
          <div className={styles.details}>
            <p><strong>מטופל:</strong> {appointment.patientName}</p>
            {rehabPlan && (
              <p><strong>תוכנית שיקום:</strong> {rehabPlan.title}</p>
            )}
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>פרטי הפגישה</h2>
          </div>
          <div className={styles.details}>
            <p><strong>סוג פגישה:</strong> {getTypeText(appointment.type)}</p>
            {appointment.location && (
              <div className={styles.location}>
                <MapPinIcon className={styles.smallIcon} />
                <span>{appointment.location}</span>
              </div>
            )}
            {appointment.reminderTime && (
              <div className={styles.reminder}>
                <BellIcon className={styles.smallIcon} />
                <span>{getReminderText(appointment.reminderTime)}</span>
              </div>
            )}
            {appointment.notes && (
              <div className={styles.notes}>
                <p><strong>הערות:</strong></p>
                <p>{appointment.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetails; 