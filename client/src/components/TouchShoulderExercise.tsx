import { useState } from "react";
import ExerciseBase from "./ExerciseBase";
import { useNavigate } from "react-router-dom";
import { completePatientExercise } from '../services/api';

function distance(a: any, b: any) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

interface Props {
  patientExerciseId: string;
}

export default function TouchShoulderExercise({ patientExerciseId }: Props) {
  const [count, setCount] = useState(0);
  const [lastCountTime, setLastCountTime] = useState<number | null>(null);
  const [complete, setComplete] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const navigate = useNavigate();

  // leftWrist = 15, leftShoulder = 11
  const handleResults = async (results: any) => {
    if (!results.poseLandmarks || complete) return;
    const leftWrist = results.poseLandmarks[15];
    const leftShoulder = results.poseLandmarks[11];
    const touching = leftWrist.visibility > 0.6 && leftShoulder.visibility > 0.6 && distance(leftWrist, leftShoulder) < 0.07;
    if (touching) {
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
        {complete ? "🎉 עבודה מצוינת!" : `🤚 ספירה: ${count}`}
      </div>
    </div>
  );
} 