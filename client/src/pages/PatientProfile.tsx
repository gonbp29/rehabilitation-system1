import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPatient, getPatientExercises, getExerciseLibrary, assignExercises } from '../services/api';
import { Patient, PatientExercise, Exercise } from '../types';
import styles from './PatientProfile.module.css';
import ReactModal from 'react-modal';

const PatientProfile: React.FC = () => {
  const { id: patientId } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const [showModal, setShowModal] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState<Partial<PatientExercise>[]>([]);

  const { data: patient, isLoading: patientLoading } = useQuery<Patient>({
    queryKey: ['patient', patientId],
    queryFn: () => getPatient(patientId!),
    enabled: !!patientId,
  });

  const { data: assignedExercises, isLoading: exercisesLoading } = useQuery<PatientExercise[]>({
      queryKey: ['patientExercises', patientId],
      queryFn: () => getPatientExercises(patientId!),
      enabled: !!patientId,
  });

  const { data: exerciseLibrary } = useQuery<Exercise[]>({
      queryKey: ['exerciseLibrary'],
      queryFn: () => getExerciseLibrary(),
  });

  const assignMutation = useMutation({
      mutationFn: (exercises: Partial<PatientExercise>[]) => assignExercises(patientId!, exercises),
      onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['patientExercises', patientId] });
          setShowModal(false);
          setSelectedExercises([]);
      },
      onError: (error) => {
          console.error("Error assigning exercises", error);
          alert("Failed to assign exercises.");
      }
  });

  const handleSelectExercise = (exercise: Exercise) => {
      const newAssignment: Partial<PatientExercise> = {
          exercise_id: exercise.id,
          sets: exercise.default_sets,
          repetitions: exercise.default_repetitions,
          duration_seconds: exercise.default_duration_seconds,
          status: 'assigned',
          exercise,
      };
      setSelectedExercises(prev => [...prev, newAssignment]);
  }

  const handleSaveAssignments = () => {
    const assignmentsToSave = selectedExercises.map(ex => ({
        exercise_id: ex.exercise_id,
        sets: ex.sets,
        repetitions: ex.repetitions,
        duration_seconds: ex.duration_seconds,
        frequency_per_week: 7, // Default to 7 days a week
    }));
    assignMutation.mutate(assignmentsToSave);
  };


  if (patientLoading || exercisesLoading) return <div>טוען...</div>;
  if (!patient) return <div>לא נמצא מטופל</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>{patient.user?.first_name} {patient.user?.last_name}</h1>
        <div className={styles.contactInfo}>
          <p>Email: {patient.user?.email}</p>
          <p>Phone: {patient.user?.phone}</p>
          <p>Condition: {patient.condition}</p>
        </div>
        <button className={styles.addPlanButton} onClick={() => setShowModal(true)}>
          הקצאת תרגילים
        </button>
      </div>

      <ReactModal
        isOpen={showModal}
        onRequestClose={() => setShowModal(false)}
        contentLabel="הקצאת תרגילים"
        className={styles.modal}
        overlayClassName={styles.overlay}
        ariaHideApp={false}
      >
        <h2>הקצאת תרגילים חדשים</h2>
        <div className={styles.modalContent}>
            <div className={styles.exerciseSelection}>
                <h3>מאגר תרגילים</h3>
                <div className={styles.exerciseGrid}>
                    {exerciseLibrary?.map((ex) => (
                        <div key={ex.id} className={styles.exerciseCard} onClick={() => handleSelectExercise(ex)}>
                           {ex.name}
                        </div>
                    ))}
                </div>
            </div>
            <div className={styles.selectedExercises}>
                <h3>תרגילים שנבחרו</h3>
                {selectedExercises.map((se, index) => (
                    <div key={index} className={styles.selectedCard}>
                        {se.exercise?.name}
                    </div>
                ))}
            </div>
        </div>
        <button className={styles.saveButton} onClick={handleSaveAssignments} disabled={assignMutation.isPending}>
          {assignMutation.isPending ? 'מקצה...' : 'שמור הקצאה'}
        </button>
        <button className={styles.cancelButton} onClick={() => setShowModal(false)}>ביטול</button>
      </ReactModal>

      <div className={styles.content}>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>תרגילים שהוקצו</h2>
          <div className={styles.assignedList}>
            {assignedExercises?.map((pe) => (
              <div key={pe.id} className={styles.assignedCard}>
                <h4>{pe.exercise?.name}</h4>
                <p>סטים: {pe.sets}, חזרות: {pe.repetitions}, משך: {pe.duration_seconds} שניות</p>
                <p>סטטוס: {pe.status}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientProfile; 