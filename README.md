# VelocityAI

Developer productivity dashboard that tracks and quantifies the impact of GitHub Copilot adoption on team performance. Teams log tasks from both "Before AI" (manual/PowerApps era) and "After AI" (Copilot-assisted) periods, then visualize productivity gains through charts, KPIs, and GPT-4-powered insights.

**Stack:** React 19 + Vite + TypeScript + Tailwind CSS + shadcn/ui + Recharts | FastAPI + SQLite + SQLAlchemy | Azure OpenAI GPT-4

---

## Quick Start

### Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env   # fill in your Azure OpenAI credentials
python -m uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

### Docker Compose

```bash
docker compose up --build
```

Backend runs on port 8000, frontend on port 5173.

---

## Environment Variables (backend/.env)

| Variable | Description |
|----------|-------------|
| `AZURE_OPENAI_API_KEY` | Your Azure OpenAI API key |
| `AZURE_OPENAI_ENDPOINT` | e.g. `https://your-resource.openai.azure.com/` |
| `AZURE_OPENAI_DEPLOYMENT_NAME` | e.g. `gpt-4` |
| `AZURE_OPENAI_API_VERSION` | e.g. `2024-02-01` |

---

## Features

### Role-Based Navigation

Users select a profile at login. The app adapts its navigation based on role:

- **Managers** see Dashboard, My Tasks, Team View, and AI Insights
- **Developers** see My Tasks and AI Insights

Session state is persisted in localStorage via Zustand so the selection survives page reloads.

### Dashboard (Manager)

- **KPI Cards** — Avg task time after AI (with % improvement delta), avg Copilot usage, avg confidence score, total tasks logged
- **Before vs After Charts** — Side-by-side bar charts comparing task time, confidence, and Copilot usage pre- and post-adoption
- **Copilot Adoption Trend** — Weekly line chart showing average Copilot usage percentage progression over time

### My Tasks (All Users)

- **Task Logging Form** — Log tasks with:
  - Task name and category (coding, debugging, styling, architecture)
  - Date and time taken (hours)
  - Copilot usage percentage (0–100%)
  - Confidence score (1–5)
  - Completion status (completed, in progress, blocked)
  - Period designation (Before AI / After AI)
  - Optional notes
- **Personal Before vs After Chart** — Visualizes your own average task time before and after AI adoption
- **Task History Table** — Full sortable list of logged tasks with status badges, period indicators, and delete actions

### Team View (Manager)

- **Developer Metrics Table** — Per-developer breakdown showing tasks logged, avg hours, Copilot usage (with progress bar), and confidence score
- **Interactive Drill-in** — Click a developer to view their personal Before vs After comparison chart and task count breakdown

### AI Insights (All Users)

- **GPT-4 Analysis** — Generates a structured productivity report powered by Azure OpenAI covering:
  1. Key Productivity Gains
  2. Copilot Adoption Analysis
  3. Confidence & Learning Curve
  4. Recommendations for the Team
- **Streaming Display** — Insights stream in real-time via Server-Sent Events with an animated cursor indicator
- **Error Handling** — Friendly messages for authentication or connectivity issues with instructions to fix `.env` credentials

### User Picker

- Modal-based profile selection on first visit
- Lists all registered developers with name and role
- Switch User button in the top nav bar

---

## API Endpoints

### Developers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/developers` | List all developers |
| POST | `/api/developers` | Create a new developer |
| GET | `/api/developers/{id}` | Get a specific developer |

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks?developer_id=X` | List tasks (optional filter by developer) |
| POST | `/api/tasks` | Create a new task |
| PUT | `/api/tasks/{id}` | Update task fields |
| DELETE | `/api/tasks/{id}` | Delete a task |

### Metrics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/metrics/summary` | Aggregated before/after metrics across all developers |
| GET | `/api/metrics/team` | Per-developer performance metrics |

### Insights

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/insights/generate` | Stream GPT-4 productivity analysis (SSE) |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | API health check |

---

## Data Models

### Developer

| Field | Type | Description |
|-------|------|-------------|
| id | int | Primary key |
| name | string | Developer's name |
| role | string | `developer` or `manager` |
| team | string | Team name |
| created_at | datetime | Auto-generated timestamp |

### Task

| Field | Type | Description |
|-------|------|-------------|
| id | int | Primary key |
| developer_id | int | FK to Developer |
| name | string | Task description |
| category | string | `coding`, `debugging`, `styling`, or `architecture` |
| date | date | When the task was performed |
| time_taken_hours | float | Hours spent on the task |
| copilot_usage_pct | int (0–100) | Percentage of work assisted by Copilot |
| confidence_score | int (1–5) | Developer's confidence in the output |
| completion_status | string | `completed`, `in_progress`, or `blocked` |
| is_before_ai | boolean | Whether this task was from the pre-AI period |
| notes | text | Optional notes |
| created_at | datetime | Auto-generated timestamp |

---

## Seed Data

The database auto-seeds on first startup with:

- **5 developers** — 3 developers + 2 managers (MarketingOps team)
- **60 tasks** — 10 before-AI and 10 after-AI tasks per developer
- Realistic metrics: time drops from 4–9h (before) to 2–5h (after), Copilot usage jumps from 0–15% to 65–85%, confidence improves from 1–3 to 3–5

---

## Tech Stack

### Frontend

| Layer | Technology |
|-------|------------|
| Framework | React 19 + TypeScript |
| Build Tool | Vite 8 |
| Routing | React Router v7 |
| State | Zustand (with localStorage persistence) |
| HTTP | Axios |
| Charts | Recharts |
| Styling | Tailwind CSS 4 |
| UI Components | shadcn/ui (Radix UI primitives) |
| Forms | React Hook Form + Zod |
| Notifications | Sonner |
| Linter | Oxlint |

### Backend

| Layer | Technology |
|-------|------------|
| Framework | FastAPI |
| Server | Uvicorn (ASGI) |
| ORM | SQLAlchemy 2.0 |
| Database | SQLite |
| Validation | Pydantic 2 |
| AI | Azure OpenAI (GPT-4) |
| Config | python-dotenv |
| Testing | Pytest + pytest-asyncio |

### Infrastructure

| Component | Technology |
|-----------|------------|
| Containerization | Docker |
| Orchestration | Docker Compose |
| CORS | Configured for localhost:5173 |

---

## Project Structure

```
├── backend/
│   ├── main.py                  # FastAPI app entry point
│   ├── requirements.txt         # Python dependencies
│   ├── Dockerfile
│   └── app/
│       ├── database.py          # SQLAlchemy engine & session
│       ├── seed.py              # Auto-seeds sample data
│       ├── models/              # SQLAlchemy models (Developer, Task)
│       ├── schemas/             # Pydantic request/response schemas
│       ├── routers/             # API route handlers
│       └── services/            # Business logic (metrics, OpenAI)
├── frontend/
│   ├── src/
│   │   ├── api/                 # Axios API client functions
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/               # Route-level page components
│   │   ├── store/               # Zustand state management
│   │   └── types/               # TypeScript interfaces
│   ├── package.json
│   ├── vite.config.ts
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```
