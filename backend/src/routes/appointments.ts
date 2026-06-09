import { Router, Request, Response } from 'express';
import type { Appointment } from '../types.js';

const router = Router();

// In-memory store (replace with a real DB like PostgreSQL/MongoDB in production)
let appointments: Appointment[] = [];

// GET /api/appointments — list all, optionally filter by status
router.get('/', (_req: Request, res: Response) => {
  const { status } = _req.query;
  const result = status && status !== 'all'
    ? appointments.filter(a => a.status === status)
    : appointments;
  res.json(result);
});

// GET /api/appointments/:id
router.get('/:id', (req: Request, res: Response) => {
  const apt = appointments.find(a => a.id === req.params.id);
  if (!apt) return res.status(404).json({ error: 'Appointment not found' });
  res.json(apt);
});

// POST /api/appointments — book a new appointment
router.post('/', (req: Request, res: Response) => {
  const body = req.body as Omit<Appointment, 'id' | 'code' | 'createdAt' | 'status'>;
  const newApt: Appointment = {
    ...body,
    id: `APT_${Date.now()}`,
    code: `SC${Math.floor(1000 + Math.random() * 9000)}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  appointments.push(newApt);
  res.status(201).json(newApt);
});

// PATCH /api/appointments/:id — update status, notes, or billing
router.patch('/:id', (req: Request, res: Response) => {
  const idx = appointments.findIndex(a => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Appointment not found' });
  appointments[idx] = { ...appointments[idx], ...req.body };
  res.json(appointments[idx]);
});

// DELETE /api/appointments/:id
router.delete('/:id', (req: Request, res: Response) => {
  const idx = appointments.findIndex(a => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Appointment not found' });
  appointments.splice(idx, 1);
  res.status(204).send();
});

export default router;
