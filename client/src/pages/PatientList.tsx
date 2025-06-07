import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getTherapistPatients } from '../services/api';
import { Patient } from '../types';
import styles from './PatientList.module.css';
import { useAuth } from '../contexts/AuthContext';

const PatientList: React.FC = () => {
  const { user } = useAuth();
  const therapistId = user?.role_id;
  
  const { data: patients, isLoading } = useQuery<Patient[]>({
    queryKey: ['therapistPatients', therapistId],
    queryFn: () => getTherapistPatients(therapistId!),
    enabled: !!therapistId,
  });

  const [search, setSearch] = useState('');

  if (isLoading) {
    return <div className={styles.loading}>טוען...</div>;
  }

  const filteredPatients = (patients || []).filter(p =>
    `${p.user?.first_name} ${p.user?.last_name}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.pageBg}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>המטופלים שלי</h1>
          <div className={styles.actionsRow}>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="חפש מטופל..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className={styles.patientsList}>
          {filteredPatients.map((patient) => (
            <div key={patient.id} className={styles.patientCard}>
              <Link
                to={`/patient/${patient.id}`}
                className={styles.patientInfo}
              >
                <h3 className={styles.patientName}>{patient.user?.first_name} {patient.user?.last_name}</h3>
                <p className={styles.patientDetails}>
                  {patient.condition}
                </p>
              </Link>
              <div className={`${styles.status} ${styles[patient.status]}`}>
                {patient.status === 'active' ? 'פעיל' : 'לא פעיל'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PatientList; 