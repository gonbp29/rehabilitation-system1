import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPatient, createRehabPlan } from '../services/api';
import styles from './PatientProfile.module.css';
import ReactModal from 'react-modal';
import exerciseBank from '../data/exerciseBank.json';

const PatientProfile: React.FC = () => {
  const { id: patientId } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [planTitle, setPlanTitle] = useState('');

  useEffect(() => {
    if (!patientId) return;
    setLoading(true);
    getPatient(patientId)
      .then((data) => {
        setPatient(data);
        setError('');
      })
      .catch(() => {
        setPatient(null);
        setError('לא נמצא מטופל');
      })
      .finally(() => setLoading(false));
  }, [patientId]);

  const handleExerciseToggle = (id: string) => {
    setSelectedExercises((prev) =>
      prev.includes(id) ? prev.filter((eid) => eid !== id) : [...prev, id]
    );
  };

  const handleSavePlan = async () => {
    if (!planTitle || selectedExercises.length === 0) {
      alert('יש להזין שם תוכנית ולבחור לפחות תרגיל אחד');
      return;
    }
    try {
      await createRehabPlan({
        title: planTitle,
        description: '',
        status: 'active',
        startDate: new Date().toISOString().slice(0, 10),
        endDate: '',
        progress: 0,
        patientId: patientId || '',
        therapistId: patient?.therapistId || '',
        exercises: exerciseBank
          .filter((ex: any) => selectedExercises.includes(ex.id))
          .map((ex: any) => ({
            ...ex,
            sets: 3,
            repetitions: 10,
            duration: 10,
            status: 'active',
          })),
        goals: [],
      });
      setShowModal(false);
      setPlanTitle('');
      setSelectedExercises([]);
      // Refresh patient data to show new plan
      if (patientId) {
        setLoading(true);
        getPatient(patientId)
          .then((data) => {
            setPatient(data);
            setError('');
          })
          .catch(() => {
            setPatient(null);
            setError('לא נמצא מטופל');
          })
          .finally(() => setLoading(false));
      }
    } catch (err) {
      alert('שגיאה בשמירת התוכנית');
    }
  };

  if (loading) return <div>טוען...</div>;
  if (error || !patient) return <div>{error || 'לא נמצא מטופל'}</div>;

  const activeRehabPlans = (patient.rehabPlans || []).filter((plan: any) => plan.status === 'active');
  const completedRehabPlans = (patient.rehabPlans || []).filter((plan: any) => plan.status === 'completed');

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>{patient.User.firstName} {patient.User.lastName}</h1>
        <div className={styles.contactInfo}>
          <p>Email: {patient.User.email}</p>
          <p>Phone: {patient.User.phoneNumber}</p>
        </div>
        <button className={styles.addPlanButton} onClick={() => setShowModal(true)}>
          הוסף תוכנית שיקום
        </button>
      </div>
      // @ts-ignore
      <ReactModal
        isOpen={showModal}
        onRequestClose={() => setShowModal(false)}
        contentLabel="הוספת תוכנית שיקום"
        className={styles.modal}
        overlayClassName={styles.overlay}
        ariaHideApp={false}
      >
        <h2>יצירת תוכנית שיקום חדשה</h2>
        <div className={styles.formGroup}>
          <label className={styles.label}>שם התוכנית:</label>
          <input
            type="text"
            value={planTitle}
            onChange={e => setPlanTitle(e.target.value)}
            className={styles.input}
          />
        </div>
        <h3 className={styles.subtitle}>בחר תרגילים מהמאגר:</h3>
        <div className={styles.exerciseGrid}>
          {exerciseBank.map((ex: any) => (
            <div key={ex.id} className={styles.exerciseCard}>
              <strong className={styles.exerciseName}>{ex.name}</strong>
              <div className={styles.exerciseDesc}>{ex.description}</div>
              <div className={styles.exerciseMeta}>קטגוריה: {ex.category}</div>
              <div className={styles.exerciseMeta}>רמת קושי: {ex.difficulty}</div>
              <div className={styles.exerciseMeta}>ציוד: {ex.equipment}</div>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={selectedExercises.includes(ex.id)}
                  onChange={() => handleExerciseToggle(ex.id)}
                  className={styles.checkbox}
                />
                הוסף לתוכנית
              </label>
            </div>
          ))}
        </div>
        <button className={styles.saveButton} onClick={handleSavePlan}>
          שמור תוכנית שיקום
        </button>
        <button className={styles.cancelButton} onClick={() => setShowModal(false)}>
          ביטול
        </button>
      </ReactModal>
      <div className={styles.content}>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Active Rehabilitation Plans</h2>
          <div className={styles.rehabPlansList}>
            {activeRehabPlans.map((plan: any) => (
              <div key={plan.id} className={styles.rehabPlanCard}>
                <div className={styles.rehabPlanHeader}>
                  <h3>{plan.title}</h3>
                  <span className={styles.status}>{plan.status}</span>
                </div>
                <div className={styles.progress}>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${plan.progress || 0}%` }}
                    />
                  </div>
                  <span className={styles.progressText}>{plan.progress || 0}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Completed Rehabilitation Plans</h2>
          <div className={styles.rehabPlansList}>
            {completedRehabPlans.map((plan: any) => (
              <div key={plan.id} className={styles.rehabPlanCard}>
                <div className={styles.rehabPlanHeader}>
                  <h3>{plan.title}</h3>
                  <span className={styles.status}>{plan.status}</span>
                </div>
                <div className={styles.progress}>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${plan.progress || 0}%` }}
                    />
                  </div>
                  <span className={styles.progressText}>{plan.progress || 0}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientProfile; 