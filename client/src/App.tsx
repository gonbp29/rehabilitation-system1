import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HomeIcon, UserGroupIcon, ClipboardDocumentListIcon, ChartBarIcon, CalendarIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import TherapistDashboard from './pages/TherapistDashboard';
import TherapistProfile from './pages/TherapistProfile';
import PatientProfile from './pages/PatientProfile';
import RehabPlanDetails from './pages/RehabPlanDetails';
import ExerciseSessionComponent from './pages/ExerciseSession';
import PatientDashboard from './pages/PatientDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ExerciseList from './pages/ExerciseList';
import PatientAppointments from './pages/PatientAppointments';
import PatientProgress from './pages/PatientProgress';
import AppointmentDetails from './pages/AppointmentDetails';
import PatientList from './pages/PatientList';
import AppointmentList from './pages/AppointmentList';
import RehabPlanList from './pages/RehabPlanList';
import Reports from './pages/Reports';
import CreateRehabPlan from './pages/CreateRehabPlan';
import styles from './App.module.css';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import rtlPlugin from 'stylis-plugin-rtl';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // TODO: Replace with actual auth check
  const isAuthenticated = localStorage.getItem('user') !== null;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

// Layout Component
const Layout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className={styles.app}>
      <nav className={styles.sidebar}>
        <div style={{ marginBottom: '30px' }}>
          <h1>מסלו"ל</h1>
        </div>
        <NavLink to="/therapist-dashboard" className={({ isActive }) => `${styles.navigationLink} ${isActive ? styles.active : ''}`}>
          <HomeIcon className={styles.navigationIcon} />
          דף הבית
        </NavLink>
        <NavLink to="/patients" className={({ isActive }) => `${styles.navigationLink} ${isActive ? styles.active : ''}`}>
          <UserGroupIcon className={styles.navigationIcon} />
          מטופלים
        </NavLink>
        <NavLink to="/appointments" className={({ isActive }) => `${styles.navigationLink} ${isActive ? styles.active : ''}`}>
          <CalendarIcon className={styles.navigationIcon} />
          פגישות
        </NavLink>
        <NavLink to="/rehab-plans" className={({ isActive }) => `${styles.navigationLink} ${isActive ? styles.active : ''}`}>
          <ClipboardDocumentListIcon className={styles.navigationIcon} />
          תוכניות שיקום
        </NavLink>
        <NavLink to="/reports" className={({ isActive }) => `${styles.navigationLink} ${isActive ? styles.active : ''}`}>
          <ChartBarIcon className={styles.navigationIcon} />
          דוחות
        </NavLink>
        <button onClick={handleLogout} className={styles.logoutButton}>
          <ArrowRightOnRectangleIcon className={styles.navigationIcon} />
          התנתקות
        </button>
      </nav>
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
};

// Patient Layout Component
const PatientLayout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className={styles.app}>
      <nav className={styles.sidebar}>
        <div style={{ marginBottom: '30px' }}>
          <h1>מסלו"ל</h1>
        </div>
        <NavLink to="/patient-dashboard" className={({ isActive }) => `${styles.navigationLink} ${isActive ? styles.active : ''}`}>
          <HomeIcon className={styles.navigationIcon} />
          דף הבית
        </NavLink>
        <NavLink to="/my-exercises" className={({ isActive }) => `${styles.navigationLink} ${isActive ? styles.active : ''}`}>
          <ClipboardDocumentListIcon className={styles.navigationIcon} />
          התרגילים שלי
        </NavLink>
        <NavLink to="/my-appointments" className={({ isActive }) => `${styles.navigationLink} ${isActive ? styles.active : ''}`}>
          <CalendarIcon className={styles.navigationIcon} />
          הפגישות שלי
        </NavLink>
        <NavLink to="/my-progress" className={({ isActive }) => `${styles.navigationLink} ${isActive ? styles.active : ''}`}>
          <ChartBarIcon className={styles.navigationIcon} />
          ההתקדמות שלי
        </NavLink>
        <button onClick={handleLogout} className={styles.logoutButton}>
          <ArrowRightOnRectangleIcon className={styles.navigationIcon} />
          התנתקות
        </button>
      </nav>
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
};

// Create RTL cache
const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

// Create theme
const theme = createTheme({
  direction: 'rtl',
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const App: React.FC = () => {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <CacheProvider value={cacheRtl}>
          <ThemeProvider theme={theme}>
            <Router>
              <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<Navigate to="/login" replace />} />
                
                {/* Protected Routes - Therapist */}
                <Route
                  path="/therapist-dashboard"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <TherapistDashboard />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/patients"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <PatientList />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/appointments"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <AppointmentList />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/rehab-plans"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <RehabPlanList />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/create-program"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <RehabPlanDetails />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/program/:id"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <RehabPlanDetails />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/therapist/:id"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <TherapistProfile />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/patient/:id"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <PatientProfile />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/appointment/:id"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <AppointmentDetails />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/exercise-session/:sessionId"
                  element={
                    <ProtectedRoute>
                      <ExerciseSessionComponent />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Routes - Patient */}
                <Route
                  path="/patient-dashboard"
                  element={
                    <ProtectedRoute>
                      <PatientLayout>
                        <PatientDashboard />
                      </PatientLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-exercises"
                  element={
                    <ProtectedRoute>
                      <PatientLayout>
                        <ExerciseList />
                      </PatientLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-appointments"
                  element={
                    <ProtectedRoute>
                      <PatientLayout>
                        <PatientAppointments />
                      </PatientLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-progress"
                  element={
                    <ProtectedRoute>
                      <PatientLayout>
                        <PatientProgress />
                      </PatientLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/exercise-session/:sessionId"
                  element={
                    <ProtectedRoute>
                      <ExerciseSessionComponent />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/reports"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Reports />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/create-rehab-plan"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <CreateRehabPlan />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Router>
          </ThemeProvider>
        </CacheProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
};

export default App; 