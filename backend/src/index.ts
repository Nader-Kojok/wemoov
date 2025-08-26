import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Import des routes
import authRoutes from './routes/auth';
import bookingRoutes from './routes/bookings';
import userRoutes from './routes/users';
import serviceRoutes from './routes/services';
import vehicleRoutes from './routes/vehicles';
import paymentRoutes from './routes/payments';
import geocodingRoutes from './routes/geocoding';
import dashboardRoutes from './routes/dashboard';
import driversRoutes from './routes/drivers';

// Import des middlewares
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import { rateLimiter } from './middleware/rateLimiter';

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

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/geocoding', geocodingRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', driversRoutes);

// Middlewares de gestion d'erreurs
app.use(notFound);
app.use(errorHandler);

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 WeMoov API server is running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS enabled for: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
  console.log(`📊 Health check available at: http://localhost:${PORT}/health`);
});

export default app;