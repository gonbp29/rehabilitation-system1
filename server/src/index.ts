import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sequelize } from './models';

// Import routes
import authRoutes from './routes/auth';
import exercisesRoutes from './routes/exercises';
import rehabPlansRoutes from './routes/rehab-plans';
import rehabPlanExercisesRoutes from './routes/rehab-plan-exercises';
import appointmentsRoutes from './routes/appointments';
import patientsRoutes from './routes/patients';
import therapistsRoutes from './routes/therapists';
import googleRoutes from './routes/google';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com'] // החלף עם הדומיין של הפרונטאנד
    : 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/exercises', exercisesRoutes);
app.use('/api/rehab-plans', rehabPlansRoutes);
app.use('/api/rehab-plan-exercises', rehabPlanExercisesRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/patients', patientsRoutes);
app.use('/api/therapists', therapistsRoutes);
app.use('/api/google', googleRoutes);

// Health check route for Render
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Sync database models
    await sequelize.sync({ force: true }); // Use force: true for development to recreate tables
    console.log('Database models synchronized successfully.');

    // Start listening
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
  }
};

startServer(); 