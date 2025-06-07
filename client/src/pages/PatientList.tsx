import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { getTherapistPatients } from '../services/api';
import { Patient, RehabPlan } from '../types';
import styles from './PatientList.module.css';

const PatientList: React.FC = () => {
  const therapistId = '1'; // TODO: Get from auth context
  const navigate = useNavigate();
  const { data: patients, isLoading } = useQuery<(Patient & { name?: string; lastName?: string })[]>({
    queryKey: ['therapistPatients', therapistId],
    queryFn: () => getTherapistPatients(therapistId),
  });

  const [search, setSearch] = useState('');

  if (isLoading) {
    return <div className={styles.loading}>טוען...</div>;
  }

  let filteredPatients = patients || [];
  if (search) {
    filteredPatients = filteredPatients.filter(p =>
      p.firstName.toLowerCase().includes(search.toLowerCase())
    );
  }

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
            <button className={styles.createButton} onClick={() => navigate('/create-patient')}>
              + הוסף מטופל
            </button>
          </div>
        </div>
        <div className={styles.patientsList}>
          {filteredPatients.map((patient) => (
            <div key={patient.id} className={styles.patientCard}>
              <Link
                to={`/patient/${patient.id}`}
                className={styles.patientInfo}
              >
                <h3 className={styles.patientName}>{patient.name || `${patient.firstName} ${patient.lastName}`}</h3>
                <p className={styles.patientDetails}>
                  תוכניות פעילות: {patient.rehabPlans?.filter((plan: RehabPlan) => plan.status === 'active').length || 0}
                </p>
              </Link>
              <div className={styles[`status${patient.status}`]}>
                {patient.status === 'active' ? 'פעיל' : 'לא פעיל'}
              </div>
              <div className={styles.cardActions}>
                <button className={styles.editButton} onClick={() => navigate(`/edit-patient/${patient.id}`)}>ערוך</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PatientList; 