import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  CalendarIcon,
  ClockIcon,
  PlusIcon,
  MapPinIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import { getAppointments } from '../services/api';
import { Appointment } from '../types';
import { useAuth } from '../contexts/AuthContext';
import styles from './Appointments.module.css';

const Appointments: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { user } = useAuth();
  
  const { data: appointments = [], isLoading } = useQuery<Appointment[]>({
    queryKey: ['appointments', user?.id, user?.role],
    queryFn: () => getAppointments(user?.id!, user?.role as 'patient' | 'therapist'),
    enabled: !!user?.id && !!user?.role,
  });

  const filterAppointmentsByDate = (date: Date) => {
    return appointments.filter((appointment: Appointment) => {
      const appointmentDate = new Date(appointment.date);
      return (
        appointmentDate.getFullYear() === date.getFullYear() &&
        appointmentDate.getMonth() === date.getMonth() &&
        appointmentDate.getDate() === date.getDate()
      );
    });
  };

  const selectedDayAppointments = filterAppointmentsByDate(selectedDate);

  const navigate = useNavigate();

  if (isLoading) {
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
        <h1>פגישות</h1>
        <button className={styles.addButton} onClick={() => navigate('/appointment/create')}>
          <PlusIcon className={styles.icon} />
          הוספת פגישה
        </button>
      </div>

      <div className={styles.content}>
        <div className={styles.calendar}>
          <CalendarIcon className={styles.icon} />
          <input
            type="date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
          />
        </div>

        {selectedDayAppointments.length === 0 ? (
          <div className={styles.noAppointments}>
            <p>אין פגישות מתוכננות ליום זה</p>
          </div>
        ) : (
          <div className={styles.appointmentsGrid}>
            {selectedDayAppointments.map((appointment: Appointment) => (
              <Link
                key={appointment.id}
                to={`/appointment/${appointment.id}`}
                className={styles.appointmentCard}
              >
                <div className={styles.appointmentHeader}>
                  <h3>{appointment.patientName}</h3>
                  <span className={styles[`status${appointment.status}`]}>
                    {getStatusText(appointment.status)}
                  </span>
                </div>
                <div className={styles.appointmentDetails}>
                  <div className={styles.detail}>
                    <ClockIcon className={styles.icon} />
                    <span>{appointment.time}</span>
                  </div>
                  <div className={styles.detail}>
                    <span>{getTypeText(appointment.type)}</span>
                  </div>
                  {appointment.location && (
                    <div className={styles.detail}>
                      <MapPinIcon className={styles.icon} />
                      <span>{appointment.location}</span>
                    </div>
                  )}
                  {appointment.reminderTime && (
                    <div className={styles.detail}>
                      <BellIcon className={styles.icon} />
                      <span>{getReminderText(appointment.reminderTime)}</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointments; 