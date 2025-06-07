import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CreateRehabPlan.module.css';
import { getExercises, createRehabPlan } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import type { Exercise, RehabPlan, RehabGoal } from '../types';

const CreateRehabPlan: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    patientId: '',
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    goals: [] as RehabGoal[],
    exercises: [] as string[]
  });

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    targetDate: '',
    measurementCriteria: ''
  });

  React.useEffect(() => {
    const fetchExercises = async () => {
      try {
        const data = await getExercises();
        setExercises(data);
      } catch (err) {
        console.error('Error fetching exercises:', err);
        setError('שגיאה בטעינת התרגילים');
      }
    };

    fetchExercises();
  }, []);

  const handleExerciseToggle = (id: string) => {
    setForm(prev => ({
      ...prev,
      exercises: prev.exercises.includes(id)
        ? prev.exercises.filter(eid => eid !== id)
        : [...prev.exercises, id]
    }));
  };

  const handleAddGoal = () => {
    if (newGoal.title && newGoal.description && newGoal.targetDate && newGoal.measurementCriteria) {
      setForm(prev => ({
        ...prev,
        goals: [...prev.goals, {
          id: Date.now().toString(),
          planId: '',
          ...newGoal,
          status: 'pending',
          progress: 0
        }]
      }));
      setNewGoal({
        title: '',
        description: '',
        targetDate: '',
        measurementCriteria: ''
      });
    }
  };

  const handleRemoveGoal = (id: string) => {
    setForm(prev => ({
      ...prev,
      goals: prev.goals.filter(goal => goal.id !== id)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      setError('יש להתחבר למערכת');
      return;
    }

    if (!form.patientId || !form.title || form.exercises.length === 0) {
      setError('יש למלא את כל השדות החובה');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const plan: Omit<RehabPlan, 'id'> = {
        patientId: form.patientId,
        therapistId: user.id,
        title: form.title,
        description: form.description,
        startDate: form.startDate,
        endDate: form.endDate,
        status: 'active',
        goals: form.goals,
        exercises: exercises.filter(ex => form.exercises.includes(ex.id)),
        progress: 0
      };

      await createRehabPlan(plan);
      navigate('/rehab-plans');
    } catch (err) {
      console.error('Error creating rehab plan:', err);
      setError('שגיאה ביצירת תוכנית השיקום');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>טוען...</div>
      </div>
    );
  }

  return (
    <div className={styles.container} dir="rtl">
      <h2 className={styles.title}>יצירת תוכנית שיקום חדשה</h2>
      
      {error && <div className={styles.error}>{error}</div>}

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label}>שם מטופל:</label>
          <input
            type="text"
            value={form.patientId}
            onChange={e => setForm(prev => ({ ...prev, patientId: e.target.value }))}
            className={styles.input}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>כותרת:</label>
          <input
            type="text"
            value={form.title}
            onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
            className={styles.input}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>תיאור:</label>
          <textarea
            value={form.description}
            onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
            className={styles.textarea}
          />
        </div>

        <div className={styles.dateGroup}>
          <div className={styles.formGroup}>
            <label className={styles.label}>תאריך התחלה:</label>
            <input
              type="date"
              value={form.startDate}
              onChange={e => setForm(prev => ({ ...prev, startDate: e.target.value }))}
              className={styles.input}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>תאריך סיום:</label>
            <input
              type="date"
              value={form.endDate}
              onChange={e => setForm(prev => ({ ...prev, endDate: e.target.value }))}
              className={styles.input}
              required
            />
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>תרגילים</h3>
          <div className={styles.exercisesList}>
            {exercises.map(exercise => (
              <div key={exercise.id} className={styles.exerciseItem}>
                <input
                  type="checkbox"
                  id={exercise.id}
                  checked={form.exercises.includes(exercise.id)}
                  onChange={() => handleExerciseToggle(exercise.id)}
                />
                <label htmlFor={exercise.id}>
                  <h4>{exercise.name}</h4>
                  <p>{exercise.description}</p>
                  <span className={styles.difficulty}>{exercise.difficulty}</span>
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>יעדים</h3>
          <div className={styles.goalsList}>
            {form.goals.map(goal => (
              <div key={goal.id} className={styles.goalItem}>
                <h4>{goal.title}</h4>
                <p>{goal.description}</p>
                <p>תאריך יעד: {new Date(goal.targetDate).toLocaleDateString('he-IL')}</p>
                <button
                  type="button"
                  onClick={() => handleRemoveGoal(goal.id)}
                  className={styles.removeButton}
                >
                  הסר
                </button>
              </div>
            ))}
          </div>

          <div className={styles.addGoalForm}>
            <div className={styles.formGroup}>
              <label className={styles.label}>כותרת:</label>
              <input
                type="text"
                value={newGoal.title}
                onChange={e => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>תיאור:</label>
              <textarea
                value={newGoal.description}
                onChange={e => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                className={styles.textarea}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>תאריך יעד:</label>
              <input
                type="date"
                value={newGoal.targetDate}
                onChange={e => setNewGoal(prev => ({ ...prev, targetDate: e.target.value }))}
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>מדדי הצלחה:</label>
              <textarea
                value={newGoal.measurementCriteria}
                onChange={e => setNewGoal(prev => ({ ...prev, measurementCriteria: e.target.value }))}
                className={styles.textarea}
              />
            </div>
            <button
              type="button"
              onClick={handleAddGoal}
              className={styles.addButton}
            >
              הוסף יעד
            </button>
          </div>
        </div>

        <div className={styles.formActions}>
          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? 'שומר...' : 'שמור תוכנית'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/rehab-plans')}
            className={styles.cancelButton}
          >
            ביטול
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateRehabPlan; 