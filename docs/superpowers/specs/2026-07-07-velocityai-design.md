# VelocityAI — Design Spec
**Date:** 2026-07-07  
**Stack:** React 18 + Vite + TypeScript + shadcn/ui | Python 3.11 + FastAPI + SQLite + SQLAlchemy | Azure OpenAI GPT-4

---

## 1. Purpose

VelocityAI is a developer productivity dashboard that tracks and visualizes the before/after impact of GitHub Copilot adoption during a team's migration from Microsoft PowerApps to React. It gives developers a place to log task outcomes and gives managers aggregated team-level insights, with GPT-4-powered analysis via Azure OpenAI.

---

## 2. Users & Roles

| Role | Capabilities |
|------|-------------|
| **Developer** | Log tasks, view personal metrics, access AI insights |
| **Manager** | View team dashboard, per-developer breakdown, AI insights |

No authentication in v1 — developer selected from a dropdown at app launch (stored in localStorage). A "Switch User" button is always accessible in the nav bar.

---

## 3. Data Models

### Developer
| Field | Type | Notes |
|-------|------|-------|
| id | INTEGER PK | Auto-increment |
| name | VARCHAR | Full name |
| role | ENUM | developer / manager |
| team | VARCHAR | Team name |
| created_at | DATETIME | Auto |

### Task
| Field | Type | Notes |
|-------|------|-------|
| id | INTEGER PK | Auto-increment |
| developer_id | FK → Developer | |
| name | VARCHAR | Task description |
| category | ENUM | coding / debugging / styling / architecture |
| date | DATE | Task date |
| time_taken_hours | FLOAT | Hours spent |
| copilot_usage_pct | INTEGER | 0–100% |
| confidence_score | INTEGER | 1–5 |
| completion_status | ENUM | completed / in_progress / blocked |
| is_before_ai | BOOLEAN | true = logged before Copilot adoption |
| notes | TEXT | Optional |
| created_at | DATETIME | Auto |

---

## 4. Frontend Pages

### Dashboard (Manager)
- KPI cards: avg completion time, avg Copilot usage %, avg confidence score
- Before vs After bar chart (time taken, effort)
- Copilot adoption trend line chart (by week)
- Team productivity heatmap (developer × metric)

### My Tasks (Developer)
- Form to log a new task (all Task fields)
- Personal task history table (sortable, filterable)
- Personal Before/After comparison mini-chart

### Team View (Manager)
- Table: developer name, tasks logged, avg time, avg Copilot %, avg confidence
- Click row → drill into individual developer metrics

### AI Insights (Both)
- Button: "Generate Insights"
- Sends metrics summary to Azure OpenAI GPT-4
- Streams GPT-4 response as formatted recommendations
- Covers: productivity trends, Copilot adoption gaps, suggested focus areas

---

## 5. Backend API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/developers | List all developers |
| POST | /api/developers | Create developer |
| GET | /api/developers/{id} | Get single developer |
| GET | /api/tasks | List tasks (filter by developer_id, date range) |
| POST | /api/tasks | Log a new task |
| PUT | /api/tasks/{id} | Update task |
| DELETE | /api/tasks/{id} | Delete task |
| GET | /api/metrics/summary | Aggregated Before/After metrics |
| GET | /api/metrics/team | Per-developer metrics for manager view |
| POST | /api/insights/generate | Send metrics to GPT-4, stream response |

---

## 6. Azure OpenAI Integration

- **Model:** GPT-4 (deployment name configurable via `.env`)
- **Trigger:** POST `/api/insights/generate` — called from AI Insights page
- **Input:** Structured JSON of developer/team metrics summary
- **Output:** Streamed markdown response to frontend via Server-Sent Events (SSE)
- **Prompt pattern:** System prompt sets context as "senior engineering productivity analyst"; user message contains metrics JSON

---

## 7. Project Structure

```
VelocityAI/
├── frontend/                  # React 18 + Vite + TypeScript + shadcn/ui
│   ├── src/
│   │   ├── pages/             # Dashboard, MyTasks, TeamView, Insights
│   │   ├── components/        # KPICard, TaskForm, MetricsChart, InsightsPanel
│   │   ├── api/               # Axios client, typed API functions
│   │   └── store/             # Zustand: developer profile, role
│   └── package.json
├── backend/                   # FastAPI + SQLAlchemy + SQLite
│   ├── app/
│   │   ├── routers/           # developers.py, tasks.py, metrics.py, insights.py
│   │   ├── models/            # Developer, Task ORM models
│   │   ├── schemas/           # Pydantic schemas (request/response)
│   │   ├── services/          # metrics_service.py, openai_service.py
│   │   └── database.py        # SQLite engine, session, Base
│   ├── main.py
│   └── requirements.txt
├── .env.example               # AZURE_OPENAI_KEY, ENDPOINT, DEPLOYMENT_NAME
└── docker-compose.yml
```

---

## 8. Non-Functional Requirements

- CORS enabled on FastAPI for localhost:5173
- Alembic for DB migrations (auto-run on startup in dev)
- Recharts for all frontend charts
- shadcn/ui component library (Tailwind CSS v3)
- Seeded demo data: 5 developers (3 developer role, 2 manager role), 30 tasks split across before/after AI periods
- `.env.example` committed; actual `.env` in `.gitignore`
- API error responses follow RFC 7807 `{ detail: string }` pattern (FastAPI default)
- Frontend shows toast notifications (shadcn/ui Toaster) on API errors
- All chart colors follow a consistent purple/violet brand palette (matching slide theme)

## 9. Environment Variables

```env
AZURE_OPENAI_API_KEY=your_key_here
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4
AZURE_OPENAI_API_VERSION=2024-02-01
```
