import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getTherapistAppointments } from '../services/api';
import { Appointment } from '../types';
import styles from './AppointmentList.module.css';
import { useAuth } from '../contexts/AuthContext';

const AppointmentList: React.FC = () => {
  const { user } = useAuth();
  const therapistId = user?.role_id;
  
  const { data: appointments, isLoading } = useQuery<Appointment[]>({
    queryKey: ['therapistAppointments', therapistId],
    queryFn: () => getTherapistAppointments(therapistId!),
    enabled: !!therapistId,
  });

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all');

  if (isLoading) return <div className={styles.loading}>טוען...</div>;

  let filteredAppointments = appointments || [];
  if (search) {
    filteredAppointments = filteredAppointments.filter(a =>
      `${a.patient?.user?.first_name} ${a.patient?.user?.last_name}`.toLowerCase().includes(search.toLowerCase())
    );
  }
  if (statusFilter !== 'all') {
    filteredAppointments = filteredAppointments.filter(a => a.status === statusFilter);
  }

  const sortedAppointments = filteredAppointments.sort((a, b) => {
    const dateA = new Date(`${a.scheduled_date}T${a.scheduled_time}`);
    const dateB = new Date(`${b.scheduled_date}T${b.scheduled_time}`);
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <div className={styles.pageBg}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>הפגישות שלי</h1>
          <div className={styles.actionsRow}>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="חפש מטופל..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <select
              className={styles.filterSelect}
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
            >
              <option value="all">הכל</option>
              <option value="scheduled">מתוכנן</option>
              <option value="completed">הושלם</option>
              <option value="cancelled">בוטל</option>
            </select>
          </div>
        </div>
        <div className={styles.appointmentsList}>
          {sortedAppointments.map((appointment) => (
            <div key={appointment.id} className={styles.appointmentCard}>
              <Link
                to={`/appointment/${appointment.id}`}
                className={styles.appointmentInfo}
              >
                <h3 className={styles.appointmentTitle}>
                    {appointment.patient?.user?.first_name} {appointment.patient?.user?.last_name}
                </h3>
                <p className={styles.appointmentDetails}>
                  {new Date(appointment.scheduled_date).toLocaleDateString('he-IL')} - {appointment.scheduled_time}
                </p>
              </Link>
              <div className={`${styles.status} ${styles[appointment.status]}`}>
                {appointment.status === 'scheduled' ? 'מתוכנן' :
                  appointment.status === 'completed' ? 'הושלם' : 'בוטל'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AppointmentList; 