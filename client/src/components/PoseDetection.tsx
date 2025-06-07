import React, { useEffect, useRef, useState } from 'react';
import { PoseLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import styles from './PoseDetection.module.css';

interface PoseDetectionProps {
  exerciseType: string;
  onPoseDetected: (feedback: { isValid: boolean; message: string }) => void;
}

const PoseDetection: React.FC<PoseDetectionProps> = ({ exerciseType, onPoseDetected }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);

  useEffect(() => {
    const initializePoseDetection = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );

        poseLandmarkerRef.current = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numPoses: 1
        });

        setIsInitialized(true);
        setError(null);
      } catch (err) {
        console.error('Error initializing pose detection:', err);
        setError('Failed to initialize pose detection');
      }
    };

    initializePoseDetection();

    return () => {
      if (poseLandmarkerRef.current) {
        poseLandmarkerRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (!isInitialized || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      setError('Failed to get canvas context');
      return;
    }

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 }
        });
        video.srcObject = stream;
        video.play();
      } catch (err) {
        console.error('Error accessing camera:', err);
        setError('Failed to access camera');
      }
    };

    startCamera();

    const detectPose = async () => {
      if (!poseLandmarkerRef.current || !video || !ctx) return;

      const results = poseLandmarkerRef.current.detectForVideo(video, Date.now());
      
      if (results.landmarks && results.landmarks.length > 0) {
        const landmarks = results.landmarks[0];
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw landmarks
        landmarks.forEach(landmark => {
          ctx.beginPath();
          ctx.arc(
            landmark.x * canvas.width,
            landmark.y * canvas.height,
            5,
            0,
            2 * Math.PI
          );
          ctx.fillStyle = '#00FF00';
          ctx.fill();
        });

        // Check exercise form based on type
        const feedback = checkExerciseForm(exerciseType, landmarks);
        onPoseDetected(feedback);
      }
    };

    const intervalId = setInterval(detectPose, 100);

    return () => {
      clearInterval(intervalId);
      if (video.srcObject) {
        const stream = video.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isInitialized, exerciseType, onPoseDetected]);

  const checkExerciseForm = (type: string, landmarks: any[]): { isValid: boolean; message: string } => {
    switch (type) {
      case 'squat':
        return checkSquatForm(landmarks);
      case 'shoulder_press':
        return checkShoulderPressForm(landmarks);
      case 'plank':
        return checkPlankForm(landmarks);
      case 'bicep_curl':
        return checkBicepCurlForm(landmarks);
      case 'bridge':
        return checkBridgeForm(landmarks);
      case 'wall_pushup':
        return checkWallPushupForm(landmarks);
      default:
        return { isValid: false, message: 'סוג תרגיל לא נתמך' };
    }
  };

  const checkSquatForm = (landmarks: any[]): { isValid: boolean; message: string } => {
    // Get relevant landmarks
    const leftHip = landmarks[23];
    const leftKnee = landmarks[25];
    const leftAnkle = landmarks[27];
    const rightHip = landmarks[24];
    const rightKnee = landmarks[26];
    const rightAnkle = landmarks[28];

    if (!leftHip || !leftKnee || !leftAnkle || !rightHip || !rightKnee || !rightAnkle) {
      return { isValid: false, message: 'לא ניתן לזהות את כל נקודות הגוף הנדרשות' };
    }

    // Calculate knee angles
    const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
    const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);

    // Check if knees are bent enough (between 70 and 110 degrees)
    if (leftKneeAngle < 70 || leftKneeAngle > 110 || rightKneeAngle < 70 || rightKneeAngle > 110) {
      return { isValid: false, message: 'כופף את הברכיים יותר' };
    }

    // Check if back is straight
    const backAngle = calculateBackAngle(landmarks);
    if (backAngle > 20) {
      return { isValid: false, message: 'שמור על גב ישר' };
    }

    return { isValid: true, message: 'תנוחה נכונה!' };
  };

  const checkShoulderPressForm = (landmarks: any[]): { isValid: boolean; message: string } => {
    // Get relevant landmarks
    const leftShoulder = landmarks[11];
    const leftElbow = landmarks[13];
    const leftWrist = landmarks[15];
    const rightShoulder = landmarks[12];
    const rightElbow = landmarks[14];
    const rightWrist = landmarks[16];

    if (!leftShoulder || !leftElbow || !leftWrist || !rightShoulder || !rightElbow || !rightWrist) {
      return { isValid: false, message: 'לא ניתן לזהות את כל נקודות הגוף הנדרשות' };
    }

    // Calculate arm angles
    const leftArmAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
    const rightArmAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);

    // Check if arms are extended (angle close to 180 degrees)
    if (leftArmAngle < 160 || rightArmAngle < 160) {
      return { isValid: false, message: 'ישר את הידיים למעלה' };
    }

    return { isValid: true, message: 'תנוחה נכונה!' };
  };

  const checkPlankForm = (landmarks: any[]): { isValid: boolean; message: string } => {
    // Get relevant landmarks
    const leftShoulder = landmarks[11];
    const leftHip = landmarks[23];
    const leftAnkle = landmarks[27];
    const rightShoulder = landmarks[12];
    const rightHip = landmarks[24];
    const rightAnkle = landmarks[28];

    if (!leftShoulder || !leftHip || !leftAnkle || !rightShoulder || !rightHip || !rightAnkle) {
      return { isValid: false, message: 'לא ניתן לזהות את כל נקודות הגוף הנדרשות' };
    }

    // Calculate body line angle
    const bodyAngle = calculateBodyLineAngle(landmarks);
    if (bodyAngle > 10) {
      return { isValid: false, message: 'שמור על קו ישר מהכתפיים עד העקבים' };
    }

    return { isValid: true, message: 'תנוחה נכונה!' };
  };

  const checkBicepCurlForm = (landmarks: any[]): { isValid: boolean; message: string } => {
    // Get relevant landmarks
    const leftShoulder = landmarks[11];
    const leftElbow = landmarks[13];
    const leftWrist = landmarks[15];
    const rightShoulder = landmarks[12];
    const rightElbow = landmarks[14];
    const rightWrist = landmarks[16];

    if (!leftShoulder || !leftElbow || !leftWrist || !rightShoulder || !rightElbow || !rightWrist) {
      return { isValid: false, message: 'לא ניתן לזהות את כל נקודות הגוף הנדרשות' };
    }

    // Calculate arm angles
    const leftArmAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
    const rightArmAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);

    // Check if arms are bent enough (between 70 and 110 degrees)
    if (leftArmAngle < 70 || leftArmAngle > 110 || rightArmAngle < 70 || rightArmAngle > 110) {
      return { isValid: false, message: 'כופף את הידיים יותר' };
    }

    return { isValid: true, message: 'תנוחה נכונה!' };
  };

  const checkBridgeForm = (landmarks: any[]): { isValid: boolean; message: string } => {
    // Get relevant landmarks
    const leftShoulder = landmarks[11];
    const leftHip = landmarks[23];
    const leftKnee = landmarks[25];
    const rightShoulder = landmarks[12];
    const rightHip = landmarks[24];
    const rightKnee = landmarks[26];

    if (!leftShoulder || !leftHip || !leftKnee || !rightShoulder || !rightHip || !rightKnee) {
      return { isValid: false, message: 'לא ניתן לזהות את כל נקודות הגוף הנדרשות' };
    }

    // Calculate hip angle
    const hipAngle = calculateHipAngle(landmarks);
    if (hipAngle < 70 || hipAngle > 110) {
      return { isValid: false, message: 'הרם את האגן יותר' };
    }

    return { isValid: true, message: 'תנוחה נכונה!' };
  };

  const checkWallPushupForm = (landmarks: any[]): { isValid: boolean; message: string } => {
    // Get relevant landmarks
    const leftShoulder = landmarks[11];
    const leftElbow = landmarks[13];
    const leftWrist = landmarks[15];
    const rightShoulder = landmarks[12];
    const rightElbow = landmarks[14];
    const rightWrist = landmarks[16];

    if (!leftShoulder || !leftElbow || !leftWrist || !rightShoulder || !rightElbow || !rightWrist) {
      return { isValid: false, message: 'לא ניתן לזהות את כל נקודות הגוף הנדרשות' };
    }

    // Calculate arm angles
    const leftArmAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
    const rightArmAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);

    // Check if arms are bent enough (between 70 and 110 degrees)
    if (leftArmAngle < 70 || leftArmAngle > 110 || rightArmAngle < 70 || rightArmAngle > 110) {
      return { isValid: false, message: 'כופף את הידיים יותר' };
    }

    return { isValid: true, message: 'תנוחה נכונה!' };
  };

  const calculateAngle = (a: any, b: any, c: any): number => {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs(radians * 180.0 / Math.PI);
    if (angle > 180.0) {
      angle = 360 - angle;
    }
    return angle;
  };

  const calculateBackAngle = (landmarks: any[]): number => {
    const leftShoulder = landmarks[11];
    const leftHip = landmarks[23];
    const leftAnkle = landmarks[27];

    if (!leftShoulder || !leftHip || !leftAnkle) {
      return 0;
    }

    return calculateAngle(leftShoulder, leftHip, leftAnkle);
  };

  const calculateBodyLineAngle = (landmarks: any[]): number => {
    const leftShoulder = landmarks[11];
    const leftHip = landmarks[23];
    const leftAnkle = landmarks[27];

    if (!leftShoulder || !leftHip || !leftAnkle) {
      return 0;
    }

    return calculateAngle(leftShoulder, leftHip, leftAnkle);
  };

  const calculateHipAngle = (landmarks: any[]): number => {
    const leftShoulder = landmarks[11];
    const leftHip = landmarks[23];
    const leftKnee = landmarks[25];

    if (!leftShoulder || !leftHip || !leftKnee) {
      return 0;
    }

    return calculateAngle(leftShoulder, leftHip, leftKnee);
  };

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.container}>
      <video
        ref={videoRef}
        className={styles.video}
        width={640}
        height={480}
      />
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        width={640}
        height={480}
      />
    </div>
  );
};

export default PoseDetection; 