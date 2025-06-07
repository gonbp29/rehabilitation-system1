import React, { useState } from 'react';
import styles from './Reports.module.css';

function getDemoProgress(patientId: string, from: string, to: string) {
  const start = new Date(from);
  const end = new Date(to);
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Array.from({ length: days + 1 }, (_, i) => {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    return {
      date: date.toLocaleDateString('he-IL'),
      completed: Math.floor(Math.random() * 2),
    };
  });
}

function getNotes(patientId: string) {
  const notes = JSON.parse(localStorage.getItem('progressNotes') || '{}');
  return notes[patientId] || [];
}

const PatientProgress: React.FC = () => {
  // דמו: נניח שהמשתמש המחובר הוא הראשון ב-patients
  const patients = JSON.parse(localStorage.getItem('patients') || '[]');
  const patient = patients[0] || { id: '', name: '' };
  const patientId = patient.id;

  const [from, setFrom] = useState(() => new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));

  const progressData = patientId ? getDemoProgress(patientId, from, to) : [];
  const notes = patientId ? getNotes(patientId) : [];

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>התקדמות אישית</h2>
      <div className={styles.formRow}>
        <label>מתאריך:</label>
        <input type="date" value={from} onChange={e => setFrom(e.target.value)} className={styles.input} />
        <label>עד:</label>
        <input type="date" value={to} onChange={e => setTo(e.target.value)} className={styles.input} />
      </div>
      <div className={styles.chartSection}>
        <div className={styles.chartTitle}>התקדמות לאורך זמן</div>
        <div className={styles.chartContainer}>
          <ul style={{ direction: 'ltr', textAlign: 'left', width: '100%' }}>
            {progressData.map((item, idx) => (
              <li key={idx}>
                <strong>{item.date}:</strong> {item.completed ? '✔️' : '❌'}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className={styles.notesSection}>
        <h3>הערות מהמטפל</h3>
        <ul className={styles.notesList}>
          {notes.map((n: any, i: number) => (
            <li key={i} className={styles.noteItem}>
              <span className={styles.noteDate}>{new Date(n.date).toLocaleDateString('he-IL')}</span>
              <span className={styles.noteText}>{n.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PatientProgress; 