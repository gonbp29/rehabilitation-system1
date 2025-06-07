import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { getTherapistAppointments, type Appointment } from '../services/api';
import styles from './AppointmentList.module.css';

const AppointmentList: React.FC = () => {
  const therapistId = '1'; // TODO: Get from auth context
  const navigate = useNavigate();
  const { data: appointments, isLoading } = useQuery<Appointment[]>({
    queryKey: ['therapistAppointments', therapistId],
    queryFn: () => getTherapistAppointments(therapistId),
  });

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'cancelled'>('all');

  if (isLoading) {
    return <div className={styles.loading}>טוען...</div>;
  }

  let filteredAppointments = appointments || [];
  if (search) {
    filteredAppointments = filteredAppointments.filter(a =>
      a.patientName.toLowerCase().includes(search.toLowerCase())
    );
  }
  if (statusFilter !== 'all') {
    filteredAppointments = filteredAppointments.filter(a => a.status === statusFilter);
  }

  const sortedAppointments = filteredAppointments.sort((a, b) => {
    const dateA = new Date(a.date + 'T' + a.time);
    const dateB = new Date(b.date + 'T' + b.time);
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
              <option value="pending">ממתין</option>
              <option value="completed">הושלם</option>
              <option value="cancelled">בוטל</option>
            </select>
            <button className={styles.createButton} onClick={() => navigate('/create-appointment')}>
              + צור פגישה חדשה
            </button>
          </div>
        </div>
        <div className={styles.appointmentsList}>
          {sortedAppointments.map((appointment) => (
            <div key={appointment.id} className={styles.appointmentCard}>
              <Link
                to={`/appointment/${appointment.id}`}
                className={styles.appointmentInfo}
              >
                <h3 className={styles.appointmentTitle}>{appointment.patientName}</h3>
                <p className={styles.appointmentDetails}>
                  {new Date(appointment.date).toLocaleDateString('he-IL')} - {appointment.time}
                </p>
              </Link>
              <div className={styles[`status${appointment.status}`]}>
                {appointment.status === 'pending' ? 'ממתין' :
                  appointment.status === 'completed' ? 'הושלם' : 'בוטל'}
              </div>
              <div className={styles.cardActions}>
                <button className={styles.editButton} onClick={() => navigate(`/edit-appointment/${appointment.id}`)}>ערוך</button>
                <button className={styles.cancelButton}>בטל</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AppointmentList; 