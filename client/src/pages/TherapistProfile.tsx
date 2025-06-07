import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  AcademicCapIcon,
  UserGroupIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { getTherapist, getTherapistAppointments, type Therapist, type Appointment, type Patient, type RehabPlan } from '../services/api';
import styles from './TherapistProfile.module.css';

const TherapistProfile: React.FC = () => {
  const { therapistId } = useParams<{ therapistId: string }>();

  const { data: therapist, isLoading: isLoadingTherapist } = useQuery<Therapist>({
    queryKey: ['therapist', therapistId],
    queryFn: () => getTherapist(therapistId!),
    enabled: !!therapistId,
  });

  const { data: appointments = [], isLoading: isLoadingAppointments } = useQuery<Appointment[]>({
    queryKey: ['therapistAppointments', therapistId],
    queryFn: () => getTherapistAppointments(therapistId!),
    enabled: !!therapistId,
  });

  if (isLoadingTherapist || isLoadingAppointments || !therapist) {
    return <div>Loading...</div>;
  }

  const upcomingAppointments = appointments.filter((apt: Appointment) => apt.status === 'pending');

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.profileInfo}>
          <img
            src={therapist.avatarUrl || '/default-avatar.png'}
            alt={`${therapist.firstName} ${therapist.lastName}`}
            className={styles.avatar}
          />
          <div className={styles.details}>
            <h1 className={styles.name}>{therapist.firstName} {therapist.lastName}</h1>
            <div className={styles.specialization}>
              <AcademicCapIcon className={styles.specializationIcon} />
              {therapist.specialization}
            </div>
            <div className={styles.contactInfo}>
              <p>{therapist.email}</p>
              <p>{therapist.phoneNumber}</p>
            </div>
          </div>
        </div>
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <UserGroupIcon className={styles.statIcon} />
            <div className={styles.statContent}>
              <span className={styles.statValue}>{therapist.patients.length}</span>
              <span className={styles.statLabel}>מטופלים פעילים</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>מטופלים</h2>
          <div className={styles.patientsList}>
            {therapist.patients.map((patient: Patient) => (
              <Link
                key={patient.id}
                to={`/patient/${patient.id}`}
                className={styles.patientCard}
              >
                <div className={styles.patientInfo}>
                  <div className={styles.patientHeader}>
                    <h3>{patient.firstName}</h3>
                    <span className={styles.status}>{patient.status}</span>
                  </div>
                  <div className={styles.patientDetails}>
                    <span>תוכניות פעילות: {patient.rehabPlans.filter((plan: RehabPlan) => plan.status === 'active').length}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>פגישות קרובות</h2>
          <div className={styles.appointmentsList}>
            {upcomingAppointments.map((appointment: Appointment) => (
              <Link
                key={appointment.id}
                to={`/appointment/${appointment.id}`}
                className={styles.appointmentCard}
              >
                <div className={styles.appointmentHeader}>
                  <h3>{appointment.patientName}</h3>
                  <span className={styles.status}>{appointment.status}</span>
                </div>
                <div className={styles.appointmentTime}>
                  <CalendarIcon className={styles.icon} />
                  <span>{appointment.time}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>תחומי התמחות</h2>
          <div className={styles.specialtiesList}>
            {therapist.specialties.map((specialty: string, index: number) => (
              <div key={index} className={styles.specialtyTag}>
                {specialty}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TherapistProfile; 