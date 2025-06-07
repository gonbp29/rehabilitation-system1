import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createAppointment, getTherapistPatients, getRehabPlans } from '../services/api';
import { Appointment, Patient, RehabPlan } from '../types';
import styles from './CreateAppointment.module.css';

const therapistId = '1'; // TODO: get from auth context

const CreateAppointment: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    patientId: '',
    planId: '',
    date: '',
    time: '',
    type: '',
    location: '',
    notes: '',
    reminderTime: '1hour',
  });

  const { data: patients } = useQuery<Patient[]>({
    queryKey: ['therapistPatients', therapistId],
    queryFn: () => getTherapistPatients(therapistId),
  });

  const { data: rehabPlans } = useQuery<RehabPlan[]>({
    queryKey: ['rehabPlans', form.patientId],
    queryFn: () => getRehabPlans(form.patientId),
    enabled: !!form.patientId,
  });

  const mutation = useMutation({
    mutationFn: createAppointment,
    onSuccess: () => {
      navigate('/appointments');
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      ...form,
      therapistId,
      status: 'scheduled',
      patientName: patients?.find(p => p.id === form.patientId)?.firstName || '',
    } as Omit<Appointment, 'id'>);
  };

  return (
    <div className={styles.container}>
      <h1>יצירת פגישה חדשה</h1>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label>מטופל</label>
          <select name="patientId" value={form.patientId} onChange={handleChange} required>
            <option value="">בחר מטופל</option>
            {patients?.map(patient => (
              <option key={patient.id} value={patient.id}>{patient.firstName}</option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>תוכנית שיקום</label>
          <select name="planId" value={form.planId} onChange={handleChange} required>
            <option value="">בחר תוכנית</option>
            {rehabPlans?.map(plan => (
              <option key={plan.id} value={plan.id}>{plan.title}</option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>תאריך</label>
          <input type="date" name="date" value={form.date} onChange={handleChange} required />
        </div>

        <div className={styles.formGroup}>
          <label>שעה</label>
          <input type="time" name="time" value={form.time} onChange={handleChange} required />
        </div>

        <div className={styles.formGroup}>
          <label>סוג פגישה</label>
          <select name="type" value={form.type} onChange={handleChange} required>
            <option value="">בחר סוג</option>
            <option value="initial">פגישה ראשונה</option>
            <option value="follow-up">מעקב</option>
            <option value="exercise">תרגול מונחה</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>מיקום</label>
          <input type="text" name="location" value={form.location} onChange={handleChange} required />
        </div>

        <div className={styles.formGroup}>
          <label>הערות</label>
          <textarea name="notes" value={form.notes} onChange={handleChange} />
        </div>

        <div className={styles.formGroup}>
          <label>תזכורת</label>
          <select name="reminderTime" value={form.reminderTime} onChange={handleChange}>
            <option value="30min">30 דקות לפני</option>
            <option value="1hour">שעה לפני</option>
            <option value="1day">יום לפני</option>
          </select>
        </div>

        <button type="submit" disabled={mutation.isPending}>צור פגישה</button>
      </form>
    </div>
  );
};

export default CreateAppointment; 