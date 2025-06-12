import { useState } from "react";
import ExerciseBase from "./ExerciseBase";
import { useNavigate } from "react-router-dom";
import { completePatientExercise } from '../services/api';

interface Props {
  patientExerciseId: string;
}

export default function KneeRaiseExercise({ patientExerciseId }: Props) {
  const [count, setCount] = useState(0);
  const [lastCountTime, setLastCountTime] = useState<number | null>(null);
  const [complete, setComplete] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const navigate = useNavigate();

  // leftKnee = 25, leftHip = 23
  const handleResults = async (results: any) => {
    if (!results.poseLandmarks || complete) return;
    const leftKnee = results.poseLandmarks[25];
    const leftHip = results.poseLandmarks[23];
    const kneeUp = leftKnee.visibility > 0.6 && leftHip.visibility > 0.6 && leftKnee.y < leftHip.y;
    if (kneeUp) {
      const now = Date.now();
      if (!lastCountTime || now - lastCountTime >= 1000) {
        const newCount = count + 1;
        setCount(newCount);
        setLastCountTime(now);
        if (newCount >= 10) {
          setComplete(true);
          setIsActive(false);
          if (patientExerciseId) {
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
          }
          setTimeout(() => navigate('/my-exercises'), 1500);
        }
      }
    } else {
      setLastCountTime(null);
    }
  };

  return (
    <div>
      <ExerciseBase onResults={handleResults} isActive={isActive} />
      <div
        style={{
          position: "absolute",
          bottom: "16px",
          left: "16px",
          backgroundColor: "white",
          padding: "10px 20px",
          borderRadius: "10px",
          fontSize: "20px",
        }}
      >
        {complete ? "🎉 עבודה מצוינת!" : `🦵 ספירה: ${count}`}
      </div>
    </div>
  );
} 