import { useState } from "react";
import ExerciseBase from "./ExerciseBase";
import { useNavigate } from "react-router-dom";
import { completePatientExercise } from '../services/api';

interface Props {
  patientExerciseId: string;
  onComplete?: () => void;
}

// חישוב זווית בין שלוש נקודות
function calculateAngle(a: any, b: any, c: any) {
  const toXY = (p: any) => [p.x, p.y];
  const A = toXY(a);
  const B = toXY(b);
  const C = toXY(c);
  const radians = Math.atan2(C[1] - B[1], C[0] - B[0]) - Math.atan2(A[1] - B[1], A[0] - B[0]);
  let angle = Math.abs(radians * 180.0 / Math.PI);
  if (angle > 180) angle = 360 - angle;
  return angle;
}

export default function KneeBendingExercise({ patientExerciseId, onComplete }: Props) {
  const [count, setCount] = useState(0);
  const [lastCountTime, setLastCountTime] = useState<number | null>(null);
  const [complete, setComplete] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const navigate = useNavigate();

  const handleResults = async (results: any) => {
    if (!results.poseLandmarks || complete) return;
    // ימין: ירך 24, ברך 26, קרסול 28
    const hip = results.poseLandmarks[24];
    const knee = results.poseLandmarks[26];
    const ankle = results.poseLandmarks[28];
    if (!hip || !knee || !ankle) return;
    const angle = calculateAngle(hip, knee, ankle);
    const squatDown = angle < 90;
    if (squatDown) {
      const now = Date.now();
      if (!lastCountTime || now - lastCountTime >= 1000) {
        const newCount = count + 1;
        setCount(newCount);
        setLastCountTime(now);
        if (newCount >= 12) {
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
          setTimeout(() => {
            if (onComplete) onComplete();
            else navigate('/my-exercises');
          }, 1500);
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
        {complete ? "🎉 עבודה מצוינת!" : `🦵 הרמת רגל ימין: ${count}`}
      </div>
    </div>
  );
} 