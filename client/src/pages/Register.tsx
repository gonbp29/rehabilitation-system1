import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Register.module.css';
import { RegisterData, registerUser } from '../services/api';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    role: 'patient'
  });
  const [error, setError] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await registerUser(formData);
      navigate('/login');
    } catch (err) {
      setError('שגיאה בהרשמה. אנא נסה שוב.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginWrapper}>
        <div className={styles.logoContainer}>
          <p className={styles.subtitle}>מערכת סיוע לשיקום וטיפול</p>
        </div>
        <div className={styles.card}>
          <h2 className={styles.title}>הרשמה למערכת</h2>
          {error && <div className={styles.error}>{error}</div>}
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="role" className={styles.label}>
                סוג משתמש
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={styles.select}
                required
              >
                <option value="patient">מטופל</option>
                <option value="therapist">מטפל</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={styles.input}
                placeholder='דוא"ל'
                required
              />
            </div>
            <div className={styles.formGroup}>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={styles.input}
                placeholder="סיסמה"
                required
              />
            </div>
            <div className={styles.formGroup}>
              <input
                id="firstName"
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={styles.input}
                placeholder="שם פרטי"
                required
              />
            </div>
            <div className={styles.formGroup}>
              <input
                id="lastName"
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={styles.input}
                placeholder="שם משפחה"
                required
              />
            </div>
            <div className={styles.formGroup}>
              <input
                id="phoneNumber"
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className={styles.input}
                placeholder="מספר טלפון"
                required
              />
            </div>
            <button type="submit" className={styles.button}>
              הרשמה
            </button>
            <div className={styles.footer}>
              <p className={styles.loginText}>
                כבר יש לך חשבון?{' '}
                <Link to="/login" className={styles.link}>
                  התחבר כאן
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;