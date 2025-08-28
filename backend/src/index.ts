import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Import des routes
import authRoutes from './routes/auth.js';
import bookingRoutes from './routes/bookings.js';
import publicBookingRoutes from './routes/publicBookings.js';
import userRoutes from './routes/users.js';
import serviceRoutes from './routes/services.js';
import vehicleRoutes from './routes/vehicles.js';
import paymentRoutes from './routes/payments.js';
import geocodingRoutes from './routes/geocoding.js';
import dashboardRoutes from './routes/dashboard.js';
import driversRoutes from './routes/drivers.js';
import schedulerRoutes from './routes/scheduler.js';

// Import des middlewares
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import { rateLimiter } from './middleware/rateLimiter.js';

// Import du service de planification
import { SchedulerService } from './services/schedulerService.js';

// Configuration des variables d'environnement
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares de sécurité
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middlewares de base
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use(rateLimiter);

// Routes de santé
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'WeMoov API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Health route for API prefix (Vercel compatibility)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'WeMoov API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
});

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/public/bookings', publicBookingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/geocoding', geocodingRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', driversRoutes);
app.use('/api/scheduler', schedulerRoutes);

// Middlewares de gestion d'erreurs
app.use(notFound);
app.use(errorHandler);

// Variable globale pour le scheduler
let schedulerInterval: NodeJS.Timeout | null = null;

// Démarrage du serveur (seulement en développement local)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 WeMoov API server is running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 CORS enabled for: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
    console.log(`📊 Health check available at: http://localhost:${PORT}/health`);
    
    // Démarrer le scheduler automatique
    const schedulerIntervalMinutes = parseInt(process.env.SCHEDULER_INTERVAL_MINUTES || '1');
    schedulerInterval = SchedulerService.startScheduler(schedulerIntervalMinutes);
    console.log(`⏰ Scheduler démarré avec un intervalle de ${schedulerIntervalMinutes} minute(s)`);
  });
}

// Gestion propre de l'arrêt du serveur
process.on('SIGTERM', () => {
  console.log('🛑 Arrêt du serveur en cours...');
  if (schedulerInterval) {
    SchedulerService.stopScheduler(schedulerInterval);
  }
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Arrêt du serveur en cours...');
  if (schedulerInterval) {
    SchedulerService.stopScheduler(schedulerInterval);
  }
  process.exit(0);
});

export default app;