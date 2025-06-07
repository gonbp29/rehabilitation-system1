import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { getRehabPlan, type RehabPlan } from '../services/api';
import styles from './RehabPlanDetails.module.css';

const RehabPlanDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: plan, isLoading } = useQuery<RehabPlan>({
    queryKey: ['rehabPlan', id],
    queryFn: () => getRehabPlan(id!),
    enabled: !!id,
  });

  if (isLoading || !plan) {
    return <div className={styles.loading}>טוען...</div>;
  }

  const completedExercises = plan.exercises.filter((exercise) => 
    exercise.status === 'completed'
  ).length;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1>{plan.title}</h1>
          <div className={styles.status}>
            <span className={styles[`status${plan.status}`]}>
              {plan.status === 'active' ? 'פעיל' : 'הושלם'}
            </span>
          </div>
          <div className={styles.dates}>
            <div className={styles.dateItem}>
              <CalendarIcon className={styles.icon} />
              <span>התחלה: {new Date(plan.startDate).toLocaleDateString('he-IL')}</span>
            </div>
            <div className={styles.dateItem}>
              <CalendarIcon className={styles.icon} />
              <span>סיום: {new Date(plan.endDate).toLocaleDateString('he-IL')}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>התקדמות</h2>
          <div className={styles.progressCard}>
            <div className={styles.progressInfo}>
              <div className={styles.progressPercentage}>{plan.progress}%</div>
              <div className={styles.progressLabel}>הושלם</div>
            </div>
            <div className={styles.progressBarContainer}>
              <div 
                className={styles.progressBar}
                style={{ width: `${plan.progress}%` }}
              />
            </div>
            <div className={styles.progressStats}>
              <div className={styles.stat}>
                <span className={styles.statValue}>{completedExercises}</span>
                <span className={styles.statLabel}>תרגילים הושלמו</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>{plan.exercises.length}</span>
                <span className={styles.statLabel}>סה"כ תרגילים</span>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>תרגילים</h2>
          <div className={styles.exercisesList}>
            {plan.exercises.map((exercise) => (
              <div key={exercise.id} className={styles.exerciseCard}>
                <div className={styles.exerciseInfo}>
                  <div className={styles.exerciseHeader}>
                    <h3 className={styles.exerciseName}>{exercise.name}</h3>
                    {exercise.status === 'completed' ? (
                      <CheckCircleIcon className={styles.completedIcon} />
                    ) : (
                      <XCircleIcon className={styles.pendingIcon} />
                    )}
                  </div>
                  <p className={styles.exerciseDescription}>{exercise.description}</p>
                  <div className={styles.exerciseDetails}>
                    <div className={styles.detail}>
                      <span>סטים: {exercise.sets}</span>
                    </div>
                    <div className={styles.detail}>
                      <span>חזרות: {exercise.repetitions}</span>
                    </div>
                    {exercise.duration && (
                      <div className={styles.detail}>
                        <ClockIcon className={styles.detailIcon} />
                        <span>{exercise.duration} דקות</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default RehabPlanDetails; 