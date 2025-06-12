import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getExerciseLibrary, createExercise, deleteExercise, updateExerciseVideo, getTherapistPatients, assignExercises } from '../services/api';
import { Exercise, Patient } from '../types';
import styles from './ExerciseLibrary.module.css';
import ReactModal from 'react-modal';
import { PlusIcon, TrashIcon, VideoCameraIcon, LinkIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const ExerciseLibrary: React.FC = () => {
    const { user } = useAuth();
    const therapistId = user?.role_id;
    const queryClient = useQueryClient();
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [videoModalIsOpen, setVideoModalIsOpen] = useState(false);
    const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
    const [newExercise, setNewExercise] = useState<Partial<Exercise>>({
        name: '',
        description: '',
        instructions: '',
        default_sets: 3,
        default_repetitions: 10,
        default_duration_seconds: 60,
        type: 'strength',
        category: 'פלג גוף עליון',
        difficulty_level: 'beginner',
    });
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [assignExercise, setAssignExercise] = useState<Exercise | null>(null);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const navigate = useNavigate();

    const { data: exercises, isLoading, error } = useQuery<Exercise[]>({
        queryKey: ['exerciseLibrary'],
        queryFn: getExerciseLibrary,
    });

    const { data: patients, isLoading: isLoadingPatients } = useQuery<Patient[]>({
        queryKey: ['therapistPatients', therapistId],
        queryFn: () => getTherapistPatients(therapistId!),
        enabled: !!therapistId,
    });

    const createExerciseMutation = useMutation({
        mutationFn: createExercise,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['exerciseLibrary'] });
            setModalIsOpen(false);
        },
        onError: (err) => {
            console.error("Failed to create exercise:", err);
            alert('Failed to create exercise.');
        }
    });

    const deleteExerciseMutation = useMutation({
        mutationFn: deleteExercise,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['exerciseLibrary'] });
        },
        onError: (err) => {
            console.error("Failed to delete exercise:", err);
            alert('Failed to delete exercise.');
        }
    });

    const updateVideoMutation = useMutation({
        mutationFn: updateExerciseVideo,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['exerciseLibrary'] });
            setVideoModalIsOpen(false);
        },
        onError: (err) => {
            console.error("Failed to update video:", err);
            alert('Failed to update video.');
        }
    });

    const assignMutation = useMutation({
        mutationFn: async ({ patientId, exercise }: { patientId: string, exercise: Exercise }) => {
            const result = await assignExercises(patientId, [{
                exercise_id: exercise.id,
                sets: exercise.default_sets || 3,
                repetitions: exercise.default_repetitions || 10,
                duration_seconds: exercise.default_duration_seconds || 60,
                frequency_per_week: 3,
                status: 'assigned',
            }]);
            return result;
        },
        onSuccess: (data) => {
            setAssignModalOpen(false);
            setAssignExercise(null);
            setSelectedPatient(null);
            if (data && data.length > 0) {
                navigate(`/exercise/${data[0].id}`);
            } else {
                alert('התרגיל הוקצה בהצלחה!');
            }
        },
        onError: () => alert('שגיאה בהקצאת התרגיל'),
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewExercise(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createExerciseMutation.mutate(newExercise);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('האם אתה בטוח שברצונך למחוק תרגיל זה?')) {
            deleteExerciseMutation.mutate(id);
        }
    };

    const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && selectedExercise) {
            const formData = new FormData();
            formData.append('video', file);
            updateVideoMutation.mutate({ exerciseId: selectedExercise.id, video: formData });
        }
    };

    const handleYoutubeLink = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const youtubeLink = form.youtubeLink.value;
        if (youtubeLink && selectedExercise) {
            updateVideoMutation.mutate({ 
                exerciseId: selectedExercise.id, 
                youtubeLink: youtubeLink 
            });
        }
    };

    if (isLoading) return <div className={styles.loading}>טוען...</div>;
    if (error) return <div className={styles.error}>שגיאה בטעינת התרגילים.</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>מאגר התרגילים</h1>
                <p className={styles.subtitle}>מאגר כל התרגילים הזמינים במערכת</p>
                <button className={styles.addButton} onClick={() => setModalIsOpen(true)}>
                    <PlusIcon />
                    צור תרגיל חדש
                </button>
            </div>

            <div className={styles.exerciseGrid}>
                {exercises?.map((exercise) => (
                    <div key={exercise.id} className={styles.exerciseCard}>
                        <div className={styles.cardHeader}>
                           <h3 className={styles.exerciseName}>{exercise.name}</h3>
                           <div className={styles.cardActions}>
                               <button 
                                   onClick={() => {
                                       setSelectedExercise(exercise);
                                       setVideoModalIsOpen(true);
                                   }} 
                                   className={styles.videoButton}
                                   title="הוסף סרטון הדגמה"
                               >
                                   <VideoCameraIcon />
                               </button>
                               <button 
                                   onClick={() => handleDelete(exercise.id)} 
                                   className={styles.deleteButton}
                                   title="מחק תרגיל"
                               >
                                   <TrashIcon />
                               </button>
                               <button
                                   className={styles.assignButton}
                                   onClick={() => {
                                       setAssignExercise(exercise);
                                       setAssignModalOpen(true);
                                   }}
                               >
                                   הוסף למטופל
                               </button>
                           </div>
                        </div>
                        <p className={styles.exerciseDescription}>{exercise.description}</p>
                        {exercise.video_url && (
                            <div className={styles.videoPreview}>
                                <video controls>
                                    <source src={exercise.video_url} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                        )}
                        {exercise.youtube_link && (
                            <div className={styles.youtubeLink}>
                                <LinkIcon className={styles.linkIcon} />
                                <a href={exercise.youtube_link} target="_blank" rel="noopener noreferrer">
                                    צפה בסרטון ביוטיוב
                                </a>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <ReactModal
                isOpen={modalIsOpen}
                onRequestClose={() => setModalIsOpen(false)}
                contentLabel="Create New Exercise"
                className={styles.modal}
                overlayClassName={styles.overlay}
                ariaHideApp={false}
            >
                <h2>צור תרגיל חדש</h2>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <input type="text" name="name" placeholder="שם התרגיל" onChange={handleInputChange} required />
                    <textarea name="description" placeholder="תיאור" onChange={handleInputChange}></textarea>
                    <textarea name="instructions" placeholder="הוראות" onChange={handleInputChange}></textarea>
                    <select name="type" value={newExercise.type} onChange={handleInputChange} required>
                        <option value="strength">כוח</option>
                        <option value="core">ליבה</option>
                        <option value="flexibility">גמישות</option>
                        <option value="balance">שיווי משקל</option>
                        <option value="aerobic">אירובי</option>
                    </select>
                    <select name="category" value={newExercise.category} onChange={handleInputChange} required>
                        <option value="פלג גוף עליון">פלג גוף עליון</option>
                        <option value="רגליים">רגליים</option>
                        <option value="ליבה">ליבה</option>
                        <option value="גב">גב</option>
                        <option value="כללי">כללי</option>
                    </select>
                    <select name="difficulty_level" value={newExercise.difficulty_level} onChange={handleInputChange} required>
                        <option value="beginner">מתחילים</option>
                        <option value="intermediate">בינוני</option>
                        <option value="advanced">מתקדם</option>
                    </select>
                    <input type="number" name="default_sets" placeholder="סטים" onChange={handleInputChange} />
                    <input type="number" name="default_repetitions" placeholder="חזרות" onChange={handleInputChange} />
                    <input type="number" name="default_duration_seconds" placeholder="משך (שניות)" onChange={handleInputChange} />
                    <div className={styles.formActions}>
                        <button type="submit" className={styles.submitButton} disabled={createExerciseMutation.isPending}>
                            {createExerciseMutation.isPending ? 'יוצר...' : 'צור תרגיל'}
                        </button>
                        <button type="button" className={styles.cancelButton} onClick={() => setModalIsOpen(false)}>ביטול</button>
                    </div>
                </form>
            </ReactModal>

            <ReactModal
                isOpen={videoModalIsOpen}
                onRequestClose={() => setVideoModalIsOpen(false)}
                contentLabel="Add Exercise Video"
                className={styles.modal}
                overlayClassName={styles.overlay}
                ariaHideApp={false}
            >
                <h2>הוסף סרטון הדגמה</h2>
                <div className={styles.videoUploadSection}>
                    <h3>העלאת סרטון</h3>
                    <input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoUpload}
                        className={styles.fileInput}
                    />
                    <p className={styles.uploadNote}>או</p>
                    <h3>קישור ליוטיוב</h3>
                    <form onSubmit={handleYoutubeLink} className={styles.youtubeForm}>
                        <input
                            type="url"
                            name="youtubeLink"
                            placeholder="הדבק קישור ליוטיוב"
                            required
                            className={styles.youtubeInput}
                        />
                        <button type="submit" className={styles.submitButton}>
                            שמור קישור
                        </button>
                    </form>
                </div>
                <button 
                    type="button" 
                    className={styles.cancelButton} 
                    onClick={() => setVideoModalIsOpen(false)}
                >
                    סגור
                </button>
            </ReactModal>

            <ReactModal
                isOpen={assignModalOpen}
                onRequestClose={() => setAssignModalOpen(false)}
                contentLabel="Assign Exercise"
                className={styles.modal}
                overlayClassName={styles.overlay}
                ariaHideApp={false}
            >
                <h2>הקצה תרגיל למטופל</h2>
                {isLoadingPatients ? (
                    <div className={styles.loading}>טוען רשימת מטופלים...</div>
                ) : patients && patients.length > 0 ? (
                    <div className={styles.assignForm}>
                        <select
                            className={styles.patientSelect}
                            value={selectedPatient?.id || ''}
                            onChange={(e) => {
                                const patient = patients.find(p => p.id === e.target.value);
                                setSelectedPatient(patient || null);
                            }}
                        >
                            <option value="">בחר מטופל...</option>
                            {patients.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.user?.first_name} {p.user?.last_name} ({p.user?.email})
                                </option>
                            ))}
                        </select>
                        <div className={styles.modalActions}>
                            <button
                                className={styles.submitButton}
                                disabled={!selectedPatient || !assignExercise || assignMutation.isPending}
                                onClick={() => {
                                    if (selectedPatient && assignExercise) {
                                        assignMutation.mutate({ patientId: selectedPatient.id, exercise: assignExercise });
                                    }
                                }}
                            >
                                {assignMutation.isPending ? 'מוסיף...' : 'הוסף'}
                            </button>
                            <button className={styles.cancelButton} onClick={() => setAssignModalOpen(false)}>ביטול</button>
                        </div>
                    </div>
                ) : (
                    <div className={styles.noPatients}>אין מטופלים זמינים</div>
                )}
            </ReactModal>
        </div>
    );
};

export default ExerciseLibrary;
