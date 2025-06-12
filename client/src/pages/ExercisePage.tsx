import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import RaiseHandsExercise from '../components/RaiseHandsExercise';
import KneeRaiseExercise from '../components/KneeRaiseExercise';
import TouchShoulderExercise from '../components/TouchShoulderExercise';
import KneeBendingExercise from '../components/KneeBendingExercise';
import styles from './ExercisePage.module.css';
import { getPatientExercise } from '../services/api';

const exerciseComponents: Record<string, any> = {
  'raise-hands': RaiseHandsExercise,
  'knee-bending': KneeBendingExercise,
  'knee-raise': KneeRaiseExercise,
  'touch-shoulder': TouchShoulderExercise,
};

export default function ExercisePage() {
  const { exerciseId } = useParams(); // כאן exerciseId הוא ה-id של PatientExercise
  const navigate = useNavigate();

  const { data: patientExercise, isLoading, error } = useQuery({
    queryKey: ['patientExercise', exerciseId],
    queryFn: () => getPatientExercise(exerciseId!),
    enabled: !!exerciseId,
  });

  if (isLoading) return <div>טוען...</div>;
  if (error || !patientExercise) return <div>תרגיל לא נמצא</div>;

  const type = patientExercise.exercise?.type;
  const ExerciseComponent = type ? exerciseComponents[type] : null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>{patientExercise.exercise?.name}</h1>
        <p>{patientExercise.exercise?.description}</p>
      </div>
      <div className={styles.exerciseContainer}>
        {ExerciseComponent ? (
          <ExerciseComponent patientExerciseId={patientExercise.id} />
        ) : (
          <div>לא נמצא תרגיל מתאים</div>
        )}
      </div>
      <button 
        className={styles.backButton}
        onClick={() => navigate('/my-exercises')}
      >
        חזרה לתרגילים שלי
      </button>
    </div>
  );
} 