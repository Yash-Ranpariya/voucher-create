import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import healthRouter from './routes/health';
import authRouter from './routes/auth';
import usersRouter from './routes/users';
import vouchersRouter from './routes/vouchers';
import dashboardRouter from './routes/dashboard';
import uploadRouter from './routes/upload';
import notificationsRouter from './routes/notifications';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Middlewares
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 5000,
  skip: () => process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development'
});
app.use(limiter);

// Routes
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/vouchers', vouchersRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/notifications', notificationsRouter);

app.use('/uploads', express.static('uploads'));

// Central error handler
app.use(errorHandler);

export default app;
