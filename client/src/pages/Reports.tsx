import React, { useState } from 'react';
import {
  ChartBarIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import styles from './Reports.module.css';

interface ReportData {
  totalPatients: number;
  activePlans: number;
  completedExercises: number;
  change: number;
}

// Demo patients and progress data
const demoPatients = JSON.parse(localStorage.getItem('patients') || '[]');

function getDemoProgress(patientId: string, from: string, to: string) {
  // Generate fake progress data for the selected patient and date range
  const start = new Date(from);
  const end = new Date(to);
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Array.from({ length: days + 1 }, (_, i) => {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    return {
      date: date.toLocaleDateString('he-IL'),
      completed: Math.floor(Math.random() * 2), // 0 or 1 for demo
    };
  });
}

function getNotes(patientId: string) {
  const notes = JSON.parse(localStorage.getItem('progressNotes') || '{}');
  return notes[patientId] || [];
}

function addNote(patientId: string, text: string) {
  const notes = JSON.parse(localStorage.getItem('progressNotes') || '{}');
  if (!notes[patientId]) notes[patientId] = [];
  notes[patientId].push({ text, date: new Date().toISOString() });
  localStorage.setItem('progressNotes', JSON.stringify(notes));
}

const Reports: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [selectedPatient, setSelectedPatient] = useState('');
  const [from, setFrom] = useState(() => new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState('');
  const [refresh, setRefresh] = useState(0);

  const mockData: Record<'week' | 'month' | 'year', ReportData> = {
    week: {
      totalPatients: 12,
      activePlans: 8,
      completedExercises: 156,
      change: 15
    },
    month: {
      totalPatients: 45,
      activePlans: 32,
      completedExercises: 623,
      change: 25
    },
    year: {
      totalPatients: 189,
      activePlans: 145,
      completedExercises: 2845,
      change: 45
    }
  };

  const currentData = mockData[selectedPeriod];
  const progressData = selectedPatient ? getDemoProgress(selectedPatient, from, to) : [];
  const notes = selectedPatient ? getNotes(selectedPatient) : [];

  const handleAddNote = () => {
    if (!note.trim()) return;
    addNote(selectedPatient, note.trim());
    setNote('');
    setRefresh(r => r + 1);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>דוחות וסטטיסטיקות</h1>
        <div className={styles.periodSelector}>
          <button
            className={`${styles.periodButton} ${selectedPeriod === 'week' ? styles.active : ''}`}
            onClick={() => setSelectedPeriod('week')}
          >
            שבוע
          </button>
          <button
            className={`${styles.periodButton} ${selectedPeriod === 'month' ? styles.active : ''}`}
            onClick={() => setSelectedPeriod('month')}
          >
            חודש
          </button>
          <button
            className={`${styles.periodButton} ${selectedPeriod === 'year' ? styles.active : ''}`}
            onClick={() => setSelectedPeriod('year')}
          >
            שנה
          </button>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <UserGroupIcon />
          </div>
          <div className={styles.statInfo}>
            <h3>מטופלים פעילים</h3>
            <div className={styles.statValue}>{currentData.totalPatients}</div>
            <div className={styles.statChange}>
              <span className={styles.positive}>+{currentData.change}%</span> מהתקופה הקודמת
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <ClipboardDocumentListIcon />
          </div>
          <div className={styles.statInfo}>
            <h3>תוכניות פעילות</h3>
            <div className={styles.statValue}>{currentData.activePlans}</div>
            <div className={styles.statChange}>
              <span className={styles.positive}>+{currentData.change}%</span> מהתקופה הקודמת
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <CheckCircleIcon />
          </div>
          <div className={styles.statInfo}>
            <h3>תרגילים שהושלמו</h3>
            <div className={styles.statValue}>{currentData.completedExercises}</div>
            <div className={styles.statChange}>
              <span className={styles.positive}>+{currentData.change}%</span> מהתקופה הקודמת
            </div>
          </div>
        </div>
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

      <div className={styles.formRow}>
        <label>בחר מטופל:</label>
        <select value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)} className={styles.input}>
          <option value="">בחר...</option>
          {demoPatients.map((p: any) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <label>מתאריך:</label>
        <input type="date" value={from} onChange={e => setFrom(e.target.value)} className={styles.input} />
        <label>עד:</label>
        <input type="date" value={to} onChange={e => setTo(e.target.value)} className={styles.input} />
      </div>
      {selectedPatient && (
        <>
          <div className={styles.notesSection}>
            <h3>הערות למטופל</h3>
            <ul className={styles.notesList}>
              {notes.map((n: any, i: number) => (
                <li key={i} className={styles.noteItem}>
                  <span className={styles.noteDate}>{new Date(n.date).toLocaleDateString('he-IL')}</span>
                  <span className={styles.noteText}>{n.text}</span>
                </li>
              ))}
            </ul>
            <div className={styles.addNoteRow}>
              <input
                type="text"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="הוסף הערה מעודדת..."
                className={styles.input}
              />
              <button className={styles.addNoteButton} onClick={handleAddNote}>הוסף הערה</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports; 