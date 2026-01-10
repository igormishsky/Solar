import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';
import customersRouter from './routes/customers';
import projectsRouter from './routes/projects';
import tasksRouter from './routes/tasks';
import professionalsRouter from './routes/professionals';
import formsRouter from './routes/forms';
import documentsRouter from './routes/documents';
import reportsRouter from './routes/reports';
import healthRouter from './routes/health';
import usersRouter from './routes/users';
import auditRouter from './routes/audit';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// General rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.',
});
app.use('/api/', generalLimiter);

// Stricter rate limiting for sensitive endpoints (user management, password reset)
const sensitiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: 'Too many requests to sensitive endpoint, please try again later.',
});

// Very strict rate limiting for authentication-related endpoints
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 requests per hour
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true, // Don't count successful requests
});

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check (no auth required)
app.use('/api/health', healthRouter);

// Protected routes
app.use('/api/customers', authMiddleware, customersRouter);
app.use('/api/projects', authMiddleware, projectsRouter);
app.use('/api/tasks', authMiddleware, tasksRouter);
app.use('/api/professionals', authMiddleware, professionalsRouter);
app.use('/api/forms', authMiddleware, formsRouter);
app.use('/api/documents', authMiddleware, documentsRouter);
app.use('/api/reports', authMiddleware, reportsRouter);

// User management routes with stricter rate limiting
app.use('/api/users', sensitiveLimiter, authMiddleware, usersRouter);
// Password reset endpoint with authentication-level rate limiting
app.use('/api/users/:id/reset-password', authLimiter);

// Audit logs route (sensitive - admin only)
app.use('/api/audit', sensitiveLimiter, authMiddleware, auditRouter);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
