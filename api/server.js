/* eslint-env node */
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

import projectsRouter from './routes/projects.js';
import authRouter from './routes/auth.js';
import plotsRouter from './routes/plots.js';
import inquiriesRouter from './routes/inquiries.js';
import testimonialsRouter from './routes/testimonials.js';
import dashboardRouter from './routes/dashboard.js';
import settingsRouter from './routes/settings.js';
import uploadRouter from './routes/upload.js';
import usersRouter from './routes/users.js';
import sectionsRouter from './routes/sections.js';
import themeRouter from './routes/theme.js';
import navigationRouter from './routes/navigation.js';
import seoRouter from './routes/seo.js';
import galleryRouter from './routes/gallery.js';
import bookingsRouter from './routes/bookings.js';
import customersRouter from './routes/customers.js';
import reportsRouter from './routes/reports.js';
import notificationsRouter from './routes/notifications.js';
import marketingRouter from './routes/marketing.js';
import systemRouter from './routes/system.js';
import settingsAdvancedRouter from './routes/settings-advanced.js';

app.use('/api/projects', projectsRouter);
app.use('/api/auth', authRouter);
app.use('/api/plots', plotsRouter);
app.use('/api/inquiries', inquiriesRouter);
app.use('/api/testimonials', testimonialsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/users', usersRouter);
app.use('/api/sections', sectionsRouter);
app.use('/api/theme', themeRouter);
app.use('/api/navigation', navigationRouter);
app.use('/api/seo', seoRouter);
app.use('/api/gallery', galleryRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/customers', customersRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/marketing', marketingRouter);
app.use('/api/system', systemRouter);
app.use('/api/settings-advanced', settingsAdvancedRouter);

// Example API Route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend API is running via ES Modules!' });
});

// For Namecheap / Production: Serve the React "dist" directory
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// Fallback all other routes to React's index.html for client-side routing
app.use((err, req, res, _next) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
