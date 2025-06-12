import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import RaiseHandsExercise from "../components/RaiseHandsExercise";
import { completePatientExercise } from "../services/api";
import KneeBendingExercise from "../components/KneeBendingExercise";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function ExerciseStart() {
  const query = useQuery();
  const patientExerciseId = query.get("id") || "";
  const exerciseType = query.get("type") || "";
  const navigate = useNavigate();
  const [isCompleting, setIsCompleting] = useState(false);

  const handleComplete = async () => {
    if (isCompleting) return;
    setIsCompleting(true);
    try {
      await completePatientExercise(patientExerciseId, {
        completed_date: new Date().toISOString().split('T')[0],
        sets_completed: 3,
        repetitions_completed: 10,
        duration_completed_seconds: 300,
        pain_level: 3,
        difficulty_rating: 4,
      });
    } catch (e) {}
    navigate('/my-exercises', { state: { refresh: true } });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e3f0ff 0%, #f9f9f9 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '18px',
        boxShadow: '0 4px 24px 0 rgba(0,0,0,0.10)',
        padding: '32px 24px 24px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxWidth: 420,
        width: '100%',
      }}>
        <h2 style={{
          fontSize: '2rem',
          fontWeight: 700,
          marginBottom: 24,
          color: '#1976d2',
          letterSpacing: 1,
        }}>
          תרגיל במעקב מצלמה
        </h2>
        {exerciseType === "הרמת ידיים" && (
  <RaiseHandsExercise
    patientExerciseId={patientExerciseId}
    onComplete={handleComplete}
  />
)}

    {exerciseType === "Knee Bending" && (
    <KneeBendingExercise
    patientExerciseId={patientExerciseId}
    onComplete={handleComplete}
  />
)}
        <button
          onClick={() => navigate(-1)}
          style={{
            marginTop: 32,
            background: '#1976d2',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '12px 32px',
            fontSize: 18,
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 2px 8px 0 rgba(25,118,210,0.10)',
            transition: 'background 0.2s',
          }}
        >
          חזרה
        </button>
      </div>
    </div>
  );
} 