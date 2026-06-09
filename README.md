# SmileCare Dental Clinic

A full-stack dental clinic management application with a React frontend and Express backend.

## Project Structure

```
smilecare-dental-clinic/
├── frontend/               # React + Vite + Tailwind UI
│   ├── src/
│   │   ├── App.tsx         # Main application component
│   │   ├── main.tsx        # React entry point
│   │   ├── index.css       # Global styles (Tailwind)
│   │   ├── types.ts        # Shared TypeScript types & constants
│   │   └── mockData.ts     # Seed appointment data
│   ├── assets/
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── package.json
│   └── .env.example
│
├── backend/                # Express + TypeScript API server
│   ├── src/
│   │   ├── server.ts       # Entry point — Express app setup
│   │   ├── types.ts        # Shared backend types
│   │   ├── routes/
│   │   │   ├── appointments.ts   # CRUD endpoints for appointments
│   │   │   └── ai.ts             # Gemini AI clinical notes endpoint
│   │   └── middleware/
│   │       └── errorHandler.ts   # Global error handler
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── package.json            # Root scripts
└── README.md
```

## Getting Started

### 1. Install dependencies

```bash
npm run install:all
```

Or individually:
```bash
cd frontend && npm install
cd ../backend && npm install
```

### 2. Configure environment variables

**Frontend** — copy `.env.example` to `.env.local`:
```bash
cd frontend
cp .env.example .env.local
# Edit VITE_API_URL if your backend runs on a different port
```

**Backend** — copy `.env.example` to `.env`:
```bash
cd backend
cp .env.example .env
# Fill in your GEMINI_API_KEY
```

### 3. Run development servers

In two separate terminals:

```bash
# Terminal 1 — backend (http://localhost:5000)
npm run dev:backend

# Terminal 2 — frontend (http://localhost:3000)
npm run dev:frontend
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health check |
| GET | `/api/appointments` | List appointments (filter: `?status=pending`) |
| GET | `/api/appointments/:id` | Get single appointment |
| POST | `/api/appointments` | Book new appointment |
| PATCH | `/api/appointments/:id` | Update status / notes / billing |
| DELETE | `/api/appointments/:id` | Cancel appointment |
| POST | `/api/ai/suggest-notes` | Generate AI clinical notes via Gemini |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4, Recharts, Lucide |
| Backend | Node.js, Express 4, TypeScript, tsx |
| AI | Google Gemini 2.0 Flash via `@google/genai` |
