import React from 'react';
import { useQuery } from '@tanstack/react-query';
import styles from './PatientProgress.module.css';
import { getPatientProgress } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const PatientProgress: React.FC = () => {
    const { user } = useAuth();
    const patientId = user?.role_id;

    const { data: progress, isLoading, error } = useQuery({
        queryKey: ['patientProgress', patientId],
        queryFn: () => getPatientProgress(patientId!).then(res => res.data),
        enabled: !!patientId,
    });
    
    if (isLoading) return <div className={styles.loading}>טוען...</div>;
    if (error) return <div className={styles.error}>שגיאה בטעינת נתוני ההתקדמות.</div>;

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>התקדמות אישית</h2>

            <div className={styles.progressGrid}>
                <div className={styles.progressCard}>
                    <h3>תרגילים שהוקצו</h3>
                    <p>{progress?.totalAssigned}</p>
                </div>
                <div className={styles.progressCard}>
                    <h3>תרגילים שהושלמו</h3>
                    <p>{progress?.completed}</p>
                </div>
                <div className={styles.progressCard}>
                    <h3>אחוז השלמה</h3>
                    <p>{progress?.completionPercentage.toFixed(2)}%</p>
                </div>
            </div>

            <div className={styles.chartSection}>
                <div className={styles.chartTitle}>התקדמות כללית</div>
                <div className={styles.progressBarContainer}>
                    <div 
                        className={styles.progressBarFill} 
                        style={{ width: `${progress?.completionPercentage || 0}%`}}
                    />
                </div>
                <p>{progress?.completionPercentage.toFixed(2)}% מהתרגילים הושלמו</p>
            </div>
        </div>
    );
};

export default PatientProgress; 