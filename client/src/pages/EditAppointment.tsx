import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getAppointment, updateAppointment, getTherapistPatients, getRehabPlans } from '../services/api';
import { Appointment, Patient, RehabPlan } from '../types';
import styles from './CreateAppointment.module.css';

const therapistId = '1'; // TODO: get from auth context

const EditAppointment: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: appointment, isLoading } = useQuery<Appointment>({
    queryKey: ['appointment', id],
    queryFn: () => getAppointment(id!),
    enabled: !!id,
  });
  const { data: patients } = useQuery<Patient[]>({
    queryKey: ['therapistPatients', therapistId],
    queryFn: () => getTherapistPatients(therapistId),
  });
  const { data: rehabPlans } = useQuery<RehabPlan[]>({
    queryKey: ['rehabPlans', appointment?.patientId],
    queryFn: () => getRehabPlans(appointment?.patientId!),
    enabled: !!appointment?.patientId,
  });
  const [form, setForm] = useState({
    patientId: '',
    planId: '',
    date: '',
    time: '',
    type: '' as Appointment['type'],
    location: '',
    notes: '',
    reminderTime: '1hour' as Appointment['reminderTime'],
  });

  useEffect(() => {
    if (appointment) {
      setForm({
        patientId: appointment.patientId,
        planId: appointment.planId,
        date: appointment.date,
        time: appointment.time,
        type: appointment.type,
        location: appointment.location || '',
        notes: appointment.notes || '',
        reminderTime: appointment.reminderTime || '1hour',
      });
    }
  }, [appointment]);

  const mutation = useMutation({
    mutationFn: (data: Partial<Appointment>) => updateAppointment(id!, data),
    onSuccess: () => {
      navigate('/appointments');
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'type' ? value as Appointment['type'] : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      ...form,
      patientName: patients?.find(p => p.id === form.patientId)?.firstName || '',
    });
  };

  if (isLoading || !appointment) return <div>טוען...</div>;

  return (
    <div className={styles.container}>
      <h1>עריכת פגישה</h1>
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

        <button type="submit" disabled={mutation.isPending}>עדכן פגישה</button>
      </form>
    </div>
  );
};

export default EditAppointment; 