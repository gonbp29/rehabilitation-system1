import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getTherapistPatients, unassignPatient } from '../services/api';
import { Patient } from '../types';
import styles from './PatientList.module.css';
import { useAuth } from '../contexts/AuthContext';
import { UserCircleIcon, TrashIcon } from '@heroicons/react/24/outline';

const PatientList: React.FC = () => {
  const { user } = useAuth();
  const therapistId = user?.role_id;
  const queryClient = useQueryClient();
  
  const { data: patients, isLoading } = useQuery<Patient[]>({
    queryKey: ['therapistPatients', therapistId],
    queryFn: () => getTherapistPatients(therapistId!),
    enabled: !!therapistId,
  });

  const unassignMutation = useMutation({
      mutationFn: unassignPatient,
      onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['therapistPatients', therapistId] });
      }
  });

  const handleRemovePatient = (patientId: string, event: React.MouseEvent) => {
      event.preventDefault(); // Prevent navigation
      if(window.confirm('האם אתה בטוח שברצונך להסיר את המטופל מרשימתך?')) {
          unassignMutation.mutate(patientId);
      }
  };

  const [search, setSearch] = useState('');

  if (isLoading) return <div className={styles.loading}>טוען...</div>;

  const filteredPatients = patients?.filter(p => 
    `${p.user?.first_name} ${p.user?.last_name}`.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>המטופלים שלי</h1>
        <div className={styles.searchContainer}>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="חפש מטופל לפי שם..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>
      <div className={styles.patientGrid}>
        {filteredPatients.map((patient) => (
          <Link to={`/patient/${patient.id}`} key={patient.id} className={styles.patientCard}>
            <div className={styles.cardHeader}>
                <UserCircleIcon className={styles.avatar}/>
                <div className={styles.patientInfo}>
                    <h3 className={styles.patientName}>{patient.user?.first_name} {patient.user?.last_name}</h3>
                    <p className={styles.patientCondition}>{patient.condition}</p>
                </div>
            </div>
            <div className={styles.cardFooter}>
                <span className={`${styles.status} ${styles[patient.status]}`}>
                    {patient.status === 'active' ? 'פעיל' : 'לא פעיל'}
                </span>
                 <button 
                    onClick={(e) => handleRemovePatient(patient.id, e)} 
                    className={styles.deleteButton}
                    disabled={unassignMutation.isPending}
                >
                    <TrashIcon/>
                </button>
            </div>
          </Link>
        ))}
        {filteredPatients.length === 0 && (
            <div className={styles.noPatients}>
                <p>לא נמצאו מטופלים.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default PatientList; 