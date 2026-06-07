import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import connectDB from './config/db.js';
import { errorHandler } from './middleware/errorMiddleware.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';
import atsRoutes from './routes/atsRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Express Configuration
app.use(cors({ origin: '*' })); // Allow all for local integration
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create necessary upload/report storage directories on startup
const uploadsDir = path.join(process.cwd(), 'uploads');
const reportsDir = path.join(process.cwd(), 'generated-reports');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// Serve uploaded files statically if needed (for previews)
app.use('/uploads', express.static(uploadsDir));

// Route Mountings
app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/ats', atsRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/ai', aiRoutes);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// 404 Route handler
app.use((req, res, next) => {
  res.status(404);
  const error = new Error(`Route Not Found - ${req.originalUrl}`);
  next(error);
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in developer mode on port ${PORT}`);
});
