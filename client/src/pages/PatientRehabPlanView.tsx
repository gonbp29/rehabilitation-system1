import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getRehabPlan, type RehabPlan } from '../services/api';
import styles from './PatientRehabPlanView.module.css';

const PatientRehabPlanView: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: plan, isLoading } = useQuery<RehabPlan>({
    queryKey: ['rehabPlan', id],
    queryFn: () => getRehabPlan(id!),
    enabled: !!id,
  });

  if (isLoading || !plan) {
    return <div className={styles.loading}>טוען...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>{plan.title}</h1>
        <div className={styles.dates}>
          <div className={styles.dateItem}>
            <span>תאריך התחלה: {new Date(plan.startDate).toLocaleDateString('he-IL')}</span>
          </div>
          <div className={styles.dateItem}>
            <span>תאריך סיום: {new Date(plan.endDate).toLocaleDateString('he-IL')}</span>
          </div>
        </div>
      </div>

      <section className={styles.section}>
        <h2>מטרות השיקום</h2>
        <div className={styles.goalsGrid}>
          {plan.goals.map((goal, index) => (
            <div key={index} className={styles.goalCard}>
              <h3>{goal.title}</h3>
              <p>{goal.description}</p>
              <div className={styles.targets}>
                <h4>יעדים מדידים:</h4>
                <ul>
                  {goal.measurableTargets.map((target, targetIndex) => (
                    <li key={targetIndex}>{target}</li>
                  ))}
                </ul>
              </div>
              <div className={styles.targetDate}>
                תאריך יעד: {new Date(goal.targetDate).toLocaleDateString('he-IL')}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2>תרגילים</h2>
        <div className={styles.exercisesGrid}>
          {plan.exercises.map(exercise => (
            <div key={exercise.id} className={styles.exerciseCard}>
              <h3>{exercise.name}</h3>
              <p>{exercise.description}</p>
              <div className={styles.exerciseDetails}>
                <div>סטים: {exercise.sets}</div>
                <div>חזרות: {exercise.repetitions}</div>
                <div>משך: {exercise.duration} דקות</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2>ציוד נדרש</h2>
        <div className={styles.equipmentGrid}>
          {plan.requiredEquipment.map(equipment => (
            <div key={equipment.id} className={styles.equipmentCard}>
              <h3>{equipment.name}</h3>
              <p>{equipment.description}</p>
              <div className={styles.location}>
                <h4>מיקום בציוד יד שרה:</h4>
                <p>{equipment.yadSaraLocation.branchName}</p>
                <p>{equipment.yadSaraLocation.address}</p>
                <p>זמינות: {equipment.yadSaraLocation.availability ? 'זמין' : 'לא זמין'}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {plan.notes && (
        <section className={styles.section}>
          <h2>הערות נוספות</h2>
          <div className={styles.notes}>{plan.notes}</div>
        </section>
      )}
    </div>
  );
};

export default PatientRehabPlanView; 