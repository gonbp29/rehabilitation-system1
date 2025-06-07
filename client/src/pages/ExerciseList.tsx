import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './ExerciseList.module.css';
import { getExercises } from '../services/api';
import { Exercise } from '../types';

const ExerciseList: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch exercises
    getExercises()
      .then((data) => setExercises(data))
      .catch((err) => console.error('Error fetching exercises:', err));
  }, []);

  const filteredExercises =
    filter === 'all'
      ? exercises
      : exercises.filter((ex) => ex.status === filter);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>התרגילים שלי</h1>
        <p>כל התרגילים בתוכנית השיקום שלך</p>
      </div>

      <div className={styles.filters}>
        <button
          className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
          onClick={() => setFilter('all')}
        >
          הכל
        </button>
        <button
          className={`${styles.filterButton} ${filter === 'pending' ? styles.active : ''}`}
          onClick={() => setFilter('pending')}
        >
          ממתין
        </button>
        <button
          className={`${styles.filterButton} ${filter === 'completed' ? styles.active : ''}`}
          onClick={() => setFilter('completed')}
        >
          הושלם
        </button>
      </div>

      <div className={styles.exercisesList}>
        {filteredExercises.map(exercise => (
          <div key={exercise.id} className={styles.exerciseCard}>
            <div className={styles.exerciseInfo}>
              <div className={styles.exerciseHeader}>
                <h3>{exercise.name}</h3>
                <span className={`${styles.status} ${styles[exercise.status]}`}>
                  {exercise.status === 'completed' ? 'הושלם' : 'ממתין'}
                </span>
              </div>
              <p>{exercise.description}</p>
              <div className={styles.exerciseDetails}>
                <span className={styles.duration}>{exercise.duration} דקות</span>
                {exercise.repetitions && (
                  <span className={styles.repetitions}>{exercise.repetitions} חזרות</span>
                )}
                {exercise.sets && (
                  <span className={styles.sets}>{exercise.sets} סטים</span>
                )}
                <span className={styles.difficulty}>רמת קושי: {exercise.difficulty}</span>
              </div>
              {exercise.instructions && (
                <p className={styles.instructions}>{exercise.instructions}</p>
              )}
              {exercise.requiredEquipment && exercise.requiredEquipment.length > 0 && (
                <div className={styles.equipment}>
                  <h4>ציוד נדרש:</h4>
                  <ul>
                    {exercise.requiredEquipment.map(equipment => (
                      <li key={equipment.id}>{equipment.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className={styles.actions}>
              {exercise.status === 'pending' && (
                <Link
                  to={`/exercise-session/${exercise.id}`}
                  className={styles.startButton}
                >
                  התחל תרגיל
                </Link>
              )}
              <button
                className={styles.detailsButton}
                onClick={() => navigate(`/exercise-details/${exercise.id}`)}
              >
                פרטים נוספים
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExerciseList; 