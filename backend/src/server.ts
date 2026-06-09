import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import appointmentsRouter from './routes/appointments.js';
import aiRouter from './routes/ai.js';

const app = express();
const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

// Middleware
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

// Routes
app.use('/api/appointments', appointmentsRouter);
app.use('/api/ai', aiRouter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'smilecare-backend' });
});

app.listen(PORT, () => {
  console.log(`SmileCare backend running on http://localhost:${PORT}`);
});
