import React from 'react';
import { useQuery } from '@tanstack/react-query';
import styles from './ExerciseLibrary.module.css';
import { getExerciseLibrary } from '../services/api';
import { Exercise } from '../types';

const ExerciseLibrary: React.FC = () => {
    const { data: exercises, isLoading } = useQuery<Exercise[]>({
        queryKey: ['exerciseLibrary'],
        queryFn: getExerciseLibrary,
    });

    if (isLoading) return <div className={styles.loading}>טוען...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>מאגר התרגילים</h1>
                <p>מאגר כל התרגילים הזמינים במערכת</p>
            </div>
            <div className={styles.exercisesGrid}>
                {(exercises || []).map(ex => (
                    <div key={ex.id} className={styles.exerciseCard}>
                        <h3>{ex.name}</h3>
                        <p>{ex.description}</p>
                        <div className={styles.details}>
                            <span>קטגוריה: {ex.category}</span>
                            <span>רמת קושי: {ex.difficulty_level}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ExerciseLibrary;
