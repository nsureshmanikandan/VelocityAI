# VelocityAI

Developer productivity dashboard tracking GitHub Copilot adoption impact (Before vs After AI metrics).

**Stack:** React 18 + Vite + TypeScript + shadcn/ui + Recharts | FastAPI + SQLite + SQLAlchemy | Azure OpenAI GPT-4

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

## Environment Variables (backend/.env)

| Variable | Description |
|----------|-------------|
| AZURE_OPENAI_API_KEY | Your Azure OpenAI API key |
| AZURE_OPENAI_ENDPOINT | e.g. https://your-resource.openai.azure.com/ |
| AZURE_OPENAI_DEPLOYMENT_NAME | e.g. gpt-4 |
| AZURE_OPENAI_API_VERSION | e.g. 2024-02-01 |

## Features

- **Dashboard** (Manager) — KPI cards, Before/After charts, Copilot adoption trend
- **My Tasks** (Developer) — Log tasks, view history, personal Before/After chart
- **Team View** (Manager) — Per-developer metrics table with drill-in
- **AI Insights** (Both) — Azure OpenAI GPT-4 streaming productivity analysis
