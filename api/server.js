import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

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

app.use('/api/projects', projectsRouter);
app.use('/api/auth', authRouter);
app.use('/api/plots', plotsRouter);
app.use('/api/inquiries', inquiriesRouter);
app.use('/api/testimonials', testimonialsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/users', usersRouter);

// Example API Route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend API is running via ES Modules!' });
});

// For Namecheap / Production: Serve the React "dist" directory
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// Fallback all other routes to React's index.html for client-side routing
app.use((req, res, next) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
