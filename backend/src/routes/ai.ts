import { Router, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';

const router = Router();

// POST /api/ai/suggest-notes  — AI-generated clinical notes for a completed appointment
router.post('/suggest-notes', async (req: Request, res: Response) => {
  const { service, message, patientName } = req.body as {
    service: string;
    message: string;
    patientName: string;
  };

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured on server' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are a dental clinic assistant. Write concise clinical notes for a completed appointment.
Patient: ${patientName}
Service: ${service}
Patient's complaint / request: ${message}

Write 2-3 sentences of professional clinical notes summarising the likely procedure performed and any follow-up instructions. Be specific and clinical.`;

    const result = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const text = result.text ?? '';
    res.json({ notes: text });
  } catch (err) {
    console.error('Gemini error:', err);
    res.status(500).json({ error: 'AI generation failed' });
  }
});

export default router;
