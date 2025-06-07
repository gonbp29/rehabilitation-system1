import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getExerciseSession, updateExerciseInSession, getExercises } from '../services/api';
import { ExerciseSession as ExerciseSessionType, Exercise } from '../types';
import PoseDetection from '../components/PoseDetection';
import styles from './ExerciseSession.module.css';

const ExerciseSessionComponent: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<ExerciseSessionType | null>(null);
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    const fetchData = async () => {
      try {
        const sessionData = await getExerciseSession(sessionId);
        setSession(sessionData);
        
        if (sessionData.exerciseId) {
          const exercises = await getExercises();
          const exerciseData = exercises.find(e => e.id === sessionData.exerciseId);
          if (exerciseData) {
            setExercise(exerciseData);
          } else {
            setError('לא נמצא תרגיל');
          }
        }
        
        setError(null);
      } catch (err) {
        setError('שגיאה בטעינת התרגיל');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sessionId]);

  const handleExerciseComplete = async () => {
    if (!session || !exercise) return;

    try {
      await updateExerciseInSession(session.id, exercise.id, { isCompleted: true });
      navigate('/dashboard');
    } catch (err) {
      console.error('Error completing exercise:', err);
      setError('שגיאה בסיום התרגיל');
    }
  };

  if (loading) {
    return <div className={styles.loading}>טוען...</div>;
  }

  if (error || !session || !exercise) {
    return <div className={styles.error}>{error || 'לא נמצא תרגיל'}</div>;
  }

  const mapExerciseTypeToPoseType = (type: string): 'squat' | 'plank' | 'pushup' | 'other' => {
    switch (type) {
      case 'squat':
        return 'squat';
      case 'plank':
        return 'plank';
      case 'pushup':
        return 'pushup';
      default:
        return 'other';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.exerciseInfo}>
        <h1>{exercise.name}</h1>
        <p>{exercise.description}</p>
        <div className={styles.exerciseDetails}>
          <div className={styles.detail}>
            <span>משך:</span>
            <span>{exercise.duration} דקות</span>
          </div>
          <div className={styles.detail}>
            <span>חזרות:</span>
            <span>{exercise.repetitions}</span>
          </div>
          <div className={styles.detail}>
            <span>סטים:</span>
            <span>{exercise.sets}</span>
          </div>
          <div className={styles.detail}>
            <span>רמת קושי:</span>
            <span>{exercise.difficulty}</span>
          </div>
        </div>
        <div className={styles.instructions}>
          <h3>הוראות:</h3>
          <p>{exercise.instructions}</p>
        </div>
      </div>

      <div className={styles.poseDetection}>
        <PoseDetection
          exerciseType={mapExerciseTypeToPoseType(exercise.type)}
          onPoseDetected={(feedback) => {
            if (feedback.isValid) {
              handleExerciseComplete();
            }
          }}
        />
      </div>

      <div className={styles.progress}>
        <h3>התקדמות</h3>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{
              width: `${(session.performance.completedRepetitions / (exercise.repetitions || 1)) * 100}%`
            }}
          />
        </div>
        <p>
          {session.performance.completedRepetitions} / {exercise.repetitions} חזרות
        </p>
      </div>
    </div>
  );
};

export default ExerciseSessionComponent; 