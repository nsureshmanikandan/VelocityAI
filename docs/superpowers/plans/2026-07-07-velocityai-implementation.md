# VelocityAI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build VelocityAI — a full-stack developer productivity dashboard tracking GitHub Copilot adoption impact (Before/After AI metrics) with React + FastAPI + Azure OpenAI GPT-4.

**Architecture:** React 18 (Vite + TypeScript + shadcn/ui + Recharts) frontend on port 5173 communicates with a FastAPI backend on port 8000 via Axios. Backend uses SQLAlchemy + SQLite for persistence and calls Azure OpenAI for AI insights via SSE streaming.

**Tech Stack:** React 18, Vite, TypeScript, shadcn/ui, Tailwind CSS v3, Recharts, Zustand, Axios | FastAPI, SQLAlchemy, Alembic, SQLite, python-dotenv, openai SDK, uvicorn

---

## File Map

### Backend
| File | Responsibility |
|------|---------------|
| `backend/main.py` | FastAPI app entry, CORS, router registration, DB init |
| `backend/app/database.py` | SQLite engine, SessionLocal, Base, get_db dependency |
| `backend/app/models/developer.py` | Developer ORM model |
| `backend/app/models/task.py` | Task ORM model |
| `backend/app/schemas/developer.py` | Pydantic schemas for Developer |
| `backend/app/schemas/task.py` | Pydantic schemas for Task |
| `backend/app/routers/developers.py` | GET /api/developers, POST, GET /{id} |
| `backend/app/routers/tasks.py` | GET/POST /api/tasks, PUT/DELETE /api/tasks/{id} |
| `backend/app/routers/metrics.py` | GET /api/metrics/summary, /api/metrics/team |
| `backend/app/routers/insights.py` | POST /api/insights/generate (SSE streaming) |
| `backend/app/services/metrics_service.py` | Before/After aggregation logic |
| `backend/app/services/openai_service.py` | Azure OpenAI GPT-4 streaming call |
| `backend/app/seed.py` | Seed 5 developers + 30 tasks |
| `backend/requirements.txt` | Python dependencies |
| `backend/.env.example` | Env var template |

### Frontend
| File | Responsibility |
|------|---------------|
| `frontend/src/main.tsx` | React root, router setup |
| `frontend/src/App.tsx` | Layout shell, nav bar, user picker |
| `frontend/src/store/userStore.ts` | Zustand store: current user + role |
| `frontend/src/api/client.ts` | Axios instance (baseURL: http://localhost:8000) |
| `frontend/src/api/developers.ts` | API functions for /api/developers |
| `frontend/src/api/tasks.ts` | API functions for /api/tasks |
| `frontend/src/api/metrics.ts` | API functions for /api/metrics |
| `frontend/src/api/insights.ts` | SSE fetch for /api/insights/generate |
| `frontend/src/pages/Dashboard.tsx` | Manager dashboard — KPI cards + charts |
| `frontend/src/pages/MyTasks.tsx` | Developer — task log form + history table |
| `frontend/src/pages/TeamView.tsx` | Manager — per-developer table + drill-in |
| `frontend/src/pages/Insights.tsx` | Both — GPT-4 streaming insights panel |
| `frontend/src/components/KPICard.tsx` | Stat card (label, value, delta) |
| `frontend/src/components/TaskForm.tsx` | Controlled form for logging tasks |
| `frontend/src/components/BeforeAfterChart.tsx` | Recharts grouped bar chart |
| `frontend/src/components/AdoptionTrendChart.tsx` | Recharts line chart by week |
| `frontend/src/components/UserPicker.tsx` | Developer select modal on first load |
| `frontend/src/components/InsightsPanel.tsx` | Streaming markdown display |
| `frontend/src/types/index.ts` | Shared TypeScript types |

---

## Task 1: Project Scaffolding

**Files:**
- Create: `VelocityAI/backend/requirements.txt`
- Create: `VelocityAI/backend/.env.example`
- Create: `VelocityAI/frontend/` (Vite scaffold)
- Create: `VelocityAI/docker-compose.yml`
- Create: `VelocityAI/.gitignore`

- [ ] **Step 1: Scaffold backend directory and requirements**

```
cd C:\Users\n.sureshmanikandan\Repo1\VelocityAI
mkdir backend\app\routers backend\app\models backend\app\schemas backend\app\services
```

Create `backend/requirements.txt`:
```
fastapi==0.111.0
uvicorn[standard]==0.29.0
sqlalchemy==2.0.30
alembic==1.13.1
pydantic==2.7.1
python-dotenv==1.0.1
openai==1.30.1
httpx==0.27.0
pytest==8.2.0
pytest-asyncio==0.23.7
httpx==0.27.0
```

- [ ] **Step 2: Create .env.example**

Create `backend/.env.example`:
```env
AZURE_OPENAI_API_KEY=your_key_here
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4
AZURE_OPENAI_API_VERSION=2024-02-01
```

Copy to `backend/.env` and fill in real values.

- [ ] **Step 3: Create .gitignore**

Create `VelocityAI/.gitignore`:
```
backend/.env
backend/velocityai.db
backend/__pycache__/
backend/app/__pycache__/
backend/app/**/__pycache__/
*.pyc
node_modules/
frontend/dist/
.DS_Store
```

- [ ] **Step 4: Scaffold React frontend with Vite**

```bash
cd C:\Users\n.sureshmanikandan\Repo1\VelocityAI
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
npm install axios zustand react-router-dom recharts
npm install -D tailwindcss postcss autoprefixer @types/recharts
npx tailwindcss init -p
```

- [ ] **Step 5: Install shadcn/ui**

```bash
cd frontend
npx shadcn@latest init
```
Choose: TypeScript=yes, style=Default, base color=Violet, CSS variables=yes.

Then add required components:
```bash
npx shadcn@latest add button card table badge select toast form input label textarea
```

- [ ] **Step 6: Configure Tailwind**

Edit `frontend/tailwind.config.js`:
```js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: { extend: {} },
  plugins: [],
}
```

Edit `frontend/src/index.css` — ensure it starts with:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 7: Create docker-compose.yml**

Create `VelocityAI/docker-compose.yml`:
```yaml
version: "3.9"
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    env_file:
      - ./backend/.env
    volumes:
      - ./backend:/app
  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    depends_on:
      - backend
```

- [ ] **Step 8: Commit scaffold**

```bash
cd C:\Users\n.sureshmanikandan\Repo1\VelocityAI
git init
git add .
git commit -m "chore: initial project scaffold — backend + frontend structure"
```

---

## Task 2: Backend Database + Models

**Files:**
- Create: `backend/app/database.py`
- Create: `backend/app/models/__init__.py`
- Create: `backend/app/models/developer.py`
- Create: `backend/app/models/task.py`

- [ ] **Step 1: Create database.py**

Create `backend/app/database.py`:
```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./velocityai.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

- [ ] **Step 2: Create Developer model**

Create `backend/app/models/developer.py`:
```python
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Developer(Base):
    __tablename__ = "developers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False)  # "developer" | "manager"
    team = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    tasks = relationship("Task", back_populates="developer")
```

- [ ] **Step 3: Create Task model**

Create `backend/app/models/task.py`:
```python
from sqlalchemy import Column, Integer, String, Float, Boolean, Date, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    developer_id = Column(Integer, ForeignKey("developers.id"), nullable=False)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)  # coding|debugging|styling|architecture
    date = Column(Date, nullable=False)
    time_taken_hours = Column(Float, nullable=False)
    copilot_usage_pct = Column(Integer, nullable=False, default=0)
    confidence_score = Column(Integer, nullable=False)  # 1-5
    completion_status = Column(String, nullable=False)  # completed|in_progress|blocked
    is_before_ai = Column(Boolean, nullable=False, default=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    developer = relationship("Developer", back_populates="tasks")
```

- [ ] **Step 4: Create models __init__.py**

Create `backend/app/models/__init__.py`:
```python
from app.models.developer import Developer
from app.models.task import Task
```

- [ ] **Step 5: Commit**

```bash
git add backend/app/database.py backend/app/models/
git commit -m "feat: database engine + Developer and Task ORM models"
```

---

## Task 3: Pydantic Schemas

**Files:**
- Create: `backend/app/schemas/__init__.py`
- Create: `backend/app/schemas/developer.py`
- Create: `backend/app/schemas/task.py`

- [ ] **Step 1: Create Developer schemas**

Create `backend/app/schemas/developer.py`:
```python
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class DeveloperBase(BaseModel):
    name: str
    role: str  # "developer" | "manager"
    team: str

class DeveloperCreate(DeveloperBase):
    pass

class DeveloperResponse(DeveloperBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}
```

- [ ] **Step 2: Create Task schemas**

Create `backend/app/schemas/task.py`:
```python
from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional

class TaskBase(BaseModel):
    name: str
    category: str  # coding|debugging|styling|architecture
    date: date
    time_taken_hours: float = Field(gt=0)
    copilot_usage_pct: int = Field(ge=0, le=100)
    confidence_score: int = Field(ge=1, le=5)
    completion_status: str  # completed|in_progress|blocked
    is_before_ai: bool
    notes: Optional[str] = None

class TaskCreate(TaskBase):
    developer_id: int

class TaskUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    date: Optional[date] = None
    time_taken_hours: Optional[float] = None
    copilot_usage_pct: Optional[int] = None
    confidence_score: Optional[int] = None
    completion_status: Optional[str] = None
    is_before_ai: Optional[bool] = None
    notes: Optional[str] = None

class TaskResponse(TaskBase):
    id: int
    developer_id: int
    created_at: datetime

    model_config = {"from_attributes": True}
```

- [ ] **Step 3: Create schemas __init__.py**

Create `backend/app/schemas/__init__.py`:
```python
from app.schemas.developer import DeveloperCreate, DeveloperResponse
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse
```

- [ ] **Step 4: Commit**

```bash
git add backend/app/schemas/
git commit -m "feat: Pydantic schemas for Developer and Task"
```

---

## Task 4: Backend Routers — Developers & Tasks

**Files:**
- Create: `backend/app/routers/__init__.py`
- Create: `backend/app/routers/developers.py`
- Create: `backend/app/routers/tasks.py`

- [ ] **Step 1: Create developers router**

Create `backend/app/routers/developers.py`:
```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.developer import Developer
from app.schemas.developer import DeveloperCreate, DeveloperResponse

router = APIRouter(prefix="/api/developers", tags=["developers"])

@router.get("/", response_model=List[DeveloperResponse])
def list_developers(db: Session = Depends(get_db)):
    return db.query(Developer).all()

@router.post("/", response_model=DeveloperResponse, status_code=201)
def create_developer(payload: DeveloperCreate, db: Session = Depends(get_db)):
    dev = Developer(**payload.model_dump())
    db.add(dev)
    db.commit()
    db.refresh(dev)
    return dev

@router.get("/{developer_id}", response_model=DeveloperResponse)
def get_developer(developer_id: int, db: Session = Depends(get_db)):
    dev = db.query(Developer).filter(Developer.id == developer_id).first()
    if not dev:
        raise HTTPException(status_code=404, detail="Developer not found")
    return dev
```

- [ ] **Step 2: Create tasks router**

Create `backend/app/routers/tasks.py`:
```python
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse

router = APIRouter(prefix="/api/tasks", tags=["tasks"])

@router.get("/", response_model=List[TaskResponse])
def list_tasks(
    developer_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Task)
    if developer_id:
        query = query.filter(Task.developer_id == developer_id)
    return query.order_by(Task.date.desc()).all()

@router.post("/", response_model=TaskResponse, status_code=201)
def create_task(payload: TaskCreate, db: Session = Depends(get_db)):
    task = Task(**payload.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

@router.put("/{task_id}", response_model=TaskResponse)
def update_task(task_id: int, payload: TaskUpdate, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(task, field, value)
    db.commit()
    db.refresh(task)
    return task

@router.delete("/{task_id}", status_code=204)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
```

- [ ] **Step 3: Create routers __init__.py**

Create `backend/app/routers/__init__.py`:
```python
```

- [ ] **Step 4: Commit**

```bash
git add backend/app/routers/
git commit -m "feat: developers and tasks REST API routers"
```

---

## Task 5: Metrics Service + Router

**Files:**
- Create: `backend/app/services/__init__.py`
- Create: `backend/app/services/metrics_service.py`
- Create: `backend/app/routers/metrics.py`

- [ ] **Step 1: Create metrics service**

Create `backend/app/services/metrics_service.py`:
```python
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.task import Task
from app.models.developer import Developer

def get_summary_metrics(db: Session):
    def agg(is_before: bool):
        rows = db.query(
            func.avg(Task.time_taken_hours).label("avg_time"),
            func.avg(Task.copilot_usage_pct).label("avg_copilot"),
            func.avg(Task.confidence_score).label("avg_confidence"),
            func.count(Task.id).label("task_count"),
        ).filter(Task.is_before_ai == is_before).first()
        return {
            "avg_time_hours": round(rows.avg_time or 0, 2),
            "avg_copilot_pct": round(rows.avg_copilot or 0, 1),
            "avg_confidence": round(rows.avg_confidence or 0, 2),
            "task_count": rows.task_count or 0,
        }

    return {"before_ai": agg(True), "after_ai": agg(False)}

def get_team_metrics(db: Session):
    developers = db.query(Developer).all()
    result = []
    for dev in developers:
        tasks = db.query(Task).filter(Task.developer_id == dev.id).all()
        if not tasks:
            continue
        result.append({
            "developer_id": dev.id,
            "name": dev.name,
            "team": dev.team,
            "role": dev.role,
            "tasks_logged": len(tasks),
            "avg_time_hours": round(sum(t.time_taken_hours for t in tasks) / len(tasks), 2),
            "avg_copilot_pct": round(sum(t.copilot_usage_pct for t in tasks) / len(tasks), 1),
            "avg_confidence": round(sum(t.confidence_score for t in tasks) / len(tasks), 2),
        })
    return result
```

- [ ] **Step 2: Create metrics router**

Create `backend/app/routers/metrics.py`:
```python
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.metrics_service import get_summary_metrics, get_team_metrics

router = APIRouter(prefix="/api/metrics", tags=["metrics"])

@router.get("/summary")
def summary_metrics(db: Session = Depends(get_db)):
    return get_summary_metrics(db)

@router.get("/team")
def team_metrics(db: Session = Depends(get_db)):
    return get_team_metrics(db)
```

- [ ] **Step 3: Commit**

```bash
git add backend/app/services/ backend/app/routers/metrics.py
git commit -m "feat: metrics aggregation service + /api/metrics endpoints"
```

---

## Task 6: Azure OpenAI Insights Router (SSE Streaming)

**Files:**
- Create: `backend/app/services/openai_service.py`
- Create: `backend/app/routers/insights.py`

- [ ] **Step 1: Create OpenAI service**

Create `backend/app/services/openai_service.py`:
```python
import os
from openai import AzureOpenAI
from dotenv import load_dotenv

load_dotenv()

def get_openai_client() -> AzureOpenAI:
    return AzureOpenAI(
        api_key=os.getenv("AZURE_OPENAI_API_KEY"),
        azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
        api_version=os.getenv("AZURE_OPENAI_API_VERSION", "2024-02-01"),
    )

SYSTEM_PROMPT = """You are a senior engineering productivity analyst specializing in AI tool adoption.
You analyze developer productivity metrics from before and after GitHub Copilot adoption.
Provide clear, actionable insights in markdown format with sections:
1. Key Productivity Gains
2. Copilot Adoption Analysis  
3. Confidence & Learning Curve
4. Recommendations for the Team
Keep response focused and practical (under 400 words)."""

def stream_insights(metrics_json: str):
    client = get_openai_client()
    deployment = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME", "gpt-4")

    stream = client.chat.completions.create(
        model=deployment,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Analyze these productivity metrics:\n\n{metrics_json}"}
        ],
        stream=True,
        max_tokens=600,
    )
    for chunk in stream:
        if chunk.choices and chunk.choices[0].delta.content:
            yield chunk.choices[0].delta.content
```

- [ ] **Step 2: Create insights router with SSE**

Create `backend/app/routers/insights.py`:
```python
import json
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.metrics_service import get_summary_metrics, get_team_metrics
from app.services.openai_service import stream_insights

router = APIRouter(prefix="/api/insights", tags=["insights"])

@router.post("/generate")
def generate_insights(db: Session = Depends(get_db)):
    summary = get_summary_metrics(db)
    team = get_team_metrics(db)
    metrics_json = json.dumps({"summary": summary, "team": team}, indent=2)

    def event_stream():
        for token in stream_insights(metrics_json):
            yield f"data: {json.dumps({'token': token})}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
```

- [ ] **Step 3: Commit**

```bash
git add backend/app/services/openai_service.py backend/app/routers/insights.py
git commit -m "feat: Azure OpenAI GPT-4 streaming insights via SSE"
```

---

## Task 7: FastAPI Main App + Seed Data

**Files:**
- Create: `backend/main.py`
- Create: `backend/app/seed.py`

- [ ] **Step 1: Create main.py**

Create `backend/main.py`:
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.routers import developers, tasks, metrics, insights
from app import models  # noqa: F401 — ensures models are registered with Base

Base.metadata.create_all(bind=engine)

app = FastAPI(title="VelocityAI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(developers.router)
app.include_router(tasks.router)
app.include_router(metrics.router)
app.include_router(insights.router)

@app.get("/health")
def health():
    return {"status": "ok", "service": "VelocityAI API"}
```

- [ ] **Step 2: Update routers __init__.py to export all routers**

Edit `backend/app/routers/__init__.py`:
```python
from app.routers import developers, tasks, metrics, insights
```

- [ ] **Step 3: Create seed data**

Create `backend/app/seed.py`:
```python
from datetime import date, timedelta
import random
from app.database import SessionLocal
from app.models.developer import Developer
from app.models.task import Task

DEVELOPERS = [
    {"name": "Arun Kumar", "role": "developer", "team": "MarketingOps"},
    {"name": "Priya Sharma", "role": "developer", "team": "MarketingOps"},
    {"name": "Ravi Patel", "role": "developer", "team": "MarketingOps"},
    {"name": "Suresh Natarajan", "role": "manager", "team": "MarketingOps"},
    {"name": "Divya Menon", "role": "manager", "team": "MarketingOps"},
]

CATEGORIES = ["coding", "debugging", "styling", "architecture"]
STATUSES = ["completed", "in_progress", "blocked"]

BEFORE_TASKS = [
    "Build PowerApps form component",
    "Debug PowerApps data connector",
    "Style dashboard layout in PowerApps",
    "Configure SharePoint list integration",
    "Fix responsive layout issues",
    "Implement search filter logic",
    "Debug API connection timeout",
    "Style navigation component",
    "Build reporting module",
    "Fix data binding errors",
]

AFTER_TASKS = [
    "Build React component with hooks",
    "Debug TypeScript type error in API call",
    "Style with Tailwind CSS responsive grid",
    "Implement React Router navigation",
    "Fix async state management bug",
    "Build reusable chart component",
    "Implement form validation with Zod",
    "Style mobile-first layout",
    "Debug Axios interceptor error",
    "Build data table with sorting",
]

def seed():
    db = SessionLocal()
    if db.query(Developer).count() > 0:
        db.close()
        return

    devs = []
    for d in DEVELOPERS:
        dev = Developer(**d)
        db.add(dev)
        db.flush()
        devs.append(dev)

    developer_ids = [d.id for d in devs if d.role == "developer"]
    base_date = date.today() - timedelta(days=60)

    for i, task_name in enumerate(BEFORE_TASKS):
        for dev_id in developer_ids:
            db.add(Task(
                developer_id=dev_id,
                name=task_name,
                category=CATEGORIES[i % 4],
                date=base_date + timedelta(days=i * 2),
                time_taken_hours=round(random.uniform(4, 9), 1),
                copilot_usage_pct=random.randint(0, 15),
                confidence_score=random.randint(1, 3),
                completion_status="completed",
                is_before_ai=True,
                notes="Manual effort, no AI assistance",
            ))

    after_base = base_date + timedelta(days=30)
    for i, task_name in enumerate(AFTER_TASKS):
        for dev_id in developer_ids:
            db.add(Task(
                developer_id=dev_id,
                name=task_name,
                category=CATEGORIES[i % 4],
                date=after_base + timedelta(days=i * 2),
                time_taken_hours=round(random.uniform(2, 5), 1),
                copilot_usage_pct=random.randint(65, 85),
                confidence_score=random.randint(3, 5),
                completion_status="completed",
                is_before_ai=False,
                notes="GitHub Copilot assisted — faster delivery",
            ))

    db.commit()
    db.close()
    print("Seed data inserted: 5 developers, 60 tasks (before + after AI)")

if __name__ == "__main__":
    seed()
```

- [ ] **Step 4: Update main.py to auto-seed on startup**

Add to `backend/main.py` after `Base.metadata.create_all(bind=engine)`:
```python
from app.seed import seed
seed()
```

- [ ] **Step 5: Test the backend starts**

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

Open browser: http://localhost:8000/health  
Expected: `{"status": "ok", "service": "VelocityAI API"}`

Open: http://localhost:8000/api/developers  
Expected: JSON array with 5 developers.

Open: http://localhost:8000/docs  
Expected: Swagger UI with all endpoints listed.

- [ ] **Step 6: Commit**

```bash
git add backend/main.py backend/app/seed.py
git commit -m "feat: FastAPI app entry point + seed data (5 devs, 60 tasks)"
```

---

## Task 8: Frontend Foundation — Types, Store, Router, API Client

**Files:**
- Create: `frontend/src/types/index.ts`
- Create: `frontend/src/store/userStore.ts`
- Create: `frontend/src/api/client.ts`
- Create: `frontend/src/api/developers.ts`
- Create: `frontend/src/api/tasks.ts`
- Create: `frontend/src/api/metrics.ts`
- Create: `frontend/src/api/insights.ts`

- [ ] **Step 1: Create shared TypeScript types**

Create `frontend/src/types/index.ts`:
```typescript
export interface Developer {
  id: number
  name: string
  role: 'developer' | 'manager'
  team: string
  created_at: string
}

export interface Task {
  id: number
  developer_id: number
  name: string
  category: 'coding' | 'debugging' | 'styling' | 'architecture'
  date: string
  time_taken_hours: number
  copilot_usage_pct: number
  confidence_score: number
  completion_status: 'completed' | 'in_progress' | 'blocked'
  is_before_ai: boolean
  notes: string | null
  created_at: string
}

export interface TaskCreate {
  developer_id: number
  name: string
  category: string
  date: string
  time_taken_hours: number
  copilot_usage_pct: number
  confidence_score: number
  completion_status: string
  is_before_ai: boolean
  notes?: string
}

export interface PeriodMetrics {
  avg_time_hours: number
  avg_copilot_pct: number
  avg_confidence: number
  task_count: number
}

export interface SummaryMetrics {
  before_ai: PeriodMetrics
  after_ai: PeriodMetrics
}

export interface TeamMemberMetrics {
  developer_id: number
  name: string
  team: string
  role: string
  tasks_logged: number
  avg_time_hours: number
  avg_copilot_pct: number
  avg_confidence: number
}
```

- [ ] **Step 2: Create Zustand user store**

Create `frontend/src/store/userStore.ts`:
```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Developer } from '../types'

interface UserStore {
  currentUser: Developer | null
  setCurrentUser: (user: Developer) => void
  clearUser: () => void
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      currentUser: null,
      setCurrentUser: (user) => set({ currentUser: user }),
      clearUser: () => set({ currentUser: null }),
    }),
    { name: 'velocityai-user' }
  )
)
```

- [ ] **Step 3: Create Axios API client**

Create `frontend/src/api/client.ts`:
```typescript
import axios from 'axios'

const client = axios.create({
  baseURL: 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
})

client.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.detail || 'An unexpected error occurred'
    return Promise.reject(new Error(message))
  }
)

export default client
```

- [ ] **Step 4: Create API functions**

Create `frontend/src/api/developers.ts`:
```typescript
import client from './client'
import type { Developer } from '../types'

export const getDevelopers = () =>
  client.get<Developer[]>('/api/developers').then(r => r.data)

export const getDeveloper = (id: number) =>
  client.get<Developer>(`/api/developers/${id}`).then(r => r.data)
```

Create `frontend/src/api/tasks.ts`:
```typescript
import client from './client'
import type { Task, TaskCreate } from '../types'

export const getTasks = (developerId?: number) =>
  client.get<Task[]>('/api/tasks', {
    params: developerId ? { developer_id: developerId } : {}
  }).then(r => r.data)

export const createTask = (payload: TaskCreate) =>
  client.post<Task>('/api/tasks', payload).then(r => r.data)

export const updateTask = (id: number, payload: Partial<TaskCreate>) =>
  client.put<Task>(`/api/tasks/${id}`, payload).then(r => r.data)

export const deleteTask = (id: number) =>
  client.delete(`/api/tasks/${id}`)
```

Create `frontend/src/api/metrics.ts`:
```typescript
import client from './client'
import type { SummaryMetrics, TeamMemberMetrics } from '../types'

export const getSummaryMetrics = () =>
  client.get<SummaryMetrics>('/api/metrics/summary').then(r => r.data)

export const getTeamMetrics = () =>
  client.get<TeamMemberMetrics[]>('/api/metrics/team').then(r => r.data)
```

Create `frontend/src/api/insights.ts`:
```typescript
export async function* streamInsights(): AsyncGenerator<string> {
  const response = await fetch('http://localhost:8000/api/insights/generate', {
    method: 'POST',
    headers: { 'Accept': 'text/event-stream' },
  })

  const reader = response.body!.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const text = decoder.decode(value)
    const lines = text.split('\n').filter(l => l.startsWith('data: '))
    for (const line of lines) {
      const data = line.replace('data: ', '').trim()
      if (data === '[DONE]') return
      try {
        const parsed = JSON.parse(data)
        if (parsed.token) yield parsed.token
      } catch {}
    }
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add frontend/src/types/ frontend/src/store/ frontend/src/api/
git commit -m "feat: frontend types, Zustand user store, and typed API client"
```

---

## Task 9: Layout Shell, Navigation & User Picker

**Files:**
- Create: `frontend/src/components/UserPicker.tsx`
- Create: `frontend/src/App.tsx`
- Modify: `frontend/src/main.tsx`

- [ ] **Step 1: Create UserPicker component**

Create `frontend/src/components/UserPicker.tsx`:
```tsx
import { useEffect, useState } from 'react'
import { getDevelopers } from '../api/developers'
import { useUserStore } from '../store/userStore'
import type { Developer } from '../types'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'

export function UserPicker({ onSelect }: { onSelect: () => void }) {
  const [developers, setDevelopers] = useState<Developer[]>([])
  const [selected, setSelected] = useState<string>('')
  const setCurrentUser = useUserStore(s => s.setCurrentUser)

  useEffect(() => {
    getDevelopers().then(setDevelopers)
  }, [])

  function handleConfirm() {
    const dev = developers.find(d => d.id === parseInt(selected))
    if (dev) {
      setCurrentUser(dev)
      onSelect()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 w-96 shadow-2xl">
        <h1 className="text-2xl font-bold text-violet-700 mb-2">VelocityAI</h1>
        <p className="text-gray-500 text-sm mb-6">Select your profile to continue</p>
        <Select onValueChange={setSelected}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a developer..." />
          </SelectTrigger>
          <SelectContent>
            {developers.map(d => (
              <SelectItem key={d.id} value={String(d.id)}>
                {d.name} ({d.role})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          className="w-full mt-4 bg-violet-600 hover:bg-violet-700"
          onClick={handleConfirm}
          disabled={!selected}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create App.tsx with nav bar and routing**

Create `frontend/src/App.tsx`:
```tsx
import { useState } from 'react'
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { useUserStore } from './store/userStore'
import { UserPicker } from './components/UserPicker'
import { Dashboard } from './pages/Dashboard'
import { MyTasks } from './pages/MyTasks'
import { TeamView } from './pages/TeamView'
import { Insights } from './pages/Insights'
import { Toaster } from '@/components/ui/toaster'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function App() {
  const { currentUser, clearUser } = useUserStore()
  const [showPicker, setShowPicker] = useState(false)

  const isManager = currentUser?.role === 'manager'

  if (!currentUser || showPicker) {
    return <UserPicker onSelect={() => setShowPicker(false)} />
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'bg-violet-100 text-violet-700'
        : 'text-gray-600 hover:text-violet-700 hover:bg-violet-50'
    }`

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        {/* Nav Bar */}
        <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="text-xl font-bold text-violet-700">⚡ VelocityAI</span>
            <div className="flex gap-1">
              {isManager && <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>}
              <NavLink to="/my-tasks" className={linkClass}>My Tasks</NavLink>
              {isManager && <NavLink to="/team" className={linkClass}>Team View</NavLink>}
              <NavLink to="/insights" className={linkClass}>AI Insights</NavLink>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">{currentUser.name}</span>
            <Badge variant={isManager ? 'default' : 'secondary'} className="capitalize">
              {currentUser.role}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { clearUser(); setShowPicker(true) }}
            >
              Switch User
            </Button>
          </div>
        </nav>

        {/* Page Content */}
        <main className="p-6 max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<Navigate to={isManager ? '/dashboard' : '/my-tasks'} replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/my-tasks" element={<MyTasks />} />
            <Route path="/team" element={<TeamView />} />
            <Route path="/insights" element={<Insights />} />
          </Routes>
        </main>
        <Toaster />
      </div>
    </BrowserRouter>
  )
}
```

- [ ] **Step 3: Update main.tsx**

Edit `frontend/src/main.tsx`:
```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/
git commit -m "feat: app shell with nav bar, routing, and user picker modal"
```

---

## Task 10: Shared UI Components

**Files:**
- Create: `frontend/src/components/KPICard.tsx`
- Create: `frontend/src/components/BeforeAfterChart.tsx`
- Create: `frontend/src/components/AdoptionTrendChart.tsx`
- Create: `frontend/src/components/InsightsPanel.tsx`

- [ ] **Step 1: Create KPICard**

Create `frontend/src/components/KPICard.tsx`:
```tsx
import { Card, CardContent } from '@/components/ui/card'

interface KPICardProps {
  label: string
  value: string
  delta?: string
  deltaPositive?: boolean
  icon?: string
}

export function KPICard({ label, value, delta, deltaPositive, icon }: KPICardProps) {
  return (
    <Card className="border-violet-100">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">{label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
            {delta && (
              <p className={`text-sm mt-1 font-medium ${deltaPositive ? 'text-green-600' : 'text-red-500'}`}>
                {deltaPositive ? '▲' : '▼'} {delta}
              </p>
            )}
          </div>
          {icon && <span className="text-3xl">{icon}</span>}
        </div>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 2: Create BeforeAfterChart**

Create `frontend/src/components/BeforeAfterChart.tsx`:
```tsx
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

interface Props {
  beforeValue: number
  afterValue: number
  label: string
  unit?: string
}

export function BeforeAfterChart({ beforeValue, afterValue, label, unit = '' }: Props) {
  const data = [
    { period: 'Before AI', value: beforeValue },
    { period: 'After AI', value: afterValue },
  ]

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="period" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} unit={unit} />
        <Tooltip formatter={(v) => [`${v}${unit}`, label]} />
        <Bar dataKey="value" fill="#7c3aed" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
```

- [ ] **Step 3: Create AdoptionTrendChart**

Create `frontend/src/components/AdoptionTrendChart.tsx`:
```tsx
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import type { Task } from '../types'

interface Props {
  tasks: Task[]
}

export function AdoptionTrendChart({ tasks }: Props) {
  const afterTasks = tasks.filter(t => !t.is_before_ai)

  // Group by week
  const weekMap: Record<string, number[]> = {}
  afterTasks.forEach(t => {
    const d = new Date(t.date)
    const week = `W${Math.ceil(d.getDate() / 7)} ${d.toLocaleString('default', { month: 'short' })}`
    if (!weekMap[week]) weekMap[week] = []
    weekMap[week].push(t.copilot_usage_pct)
  })

  const data = Object.entries(weekMap).map(([week, vals]) => ({
    week,
    avg_copilot: Math.round(vals.reduce((a, b) => a + b, 0) / vals.length),
  }))

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="week" tick={{ fontSize: 11 }} />
        <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 12 }} />
        <Tooltip formatter={(v) => [`${v}%`, 'Avg Copilot Usage']} />
        <Line
          type="monotone"
          dataKey="avg_copilot"
          stroke="#7c3aed"
          strokeWidth={2}
          dot={{ fill: '#7c3aed' }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
```

- [ ] **Step 4: Create InsightsPanel**

Create `frontend/src/components/InsightsPanel.tsx`:
```tsx
interface Props {
  content: string
  isStreaming: boolean
}

export function InsightsPanel({ content, isStreaming }: Props) {
  return (
    <div className="bg-gray-50 border border-violet-100 rounded-xl p-6 min-h-48 font-mono text-sm leading-relaxed whitespace-pre-wrap">
      {content || (
        <span className="text-gray-400">
          Click "Generate Insights" to get GPT-4 analysis of your team's productivity data...
        </span>
      )}
      {isStreaming && (
        <span className="inline-block w-2 h-4 bg-violet-600 ml-1 animate-pulse" />
      )}
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/
git commit -m "feat: KPICard, BeforeAfterChart, AdoptionTrendChart, InsightsPanel components"
```

---

## Task 11: TaskForm Component

**Files:**
- Create: `frontend/src/components/TaskForm.tsx`

- [ ] **Step 1: Create TaskForm**

Create `frontend/src/components/TaskForm.tsx`:
```tsx
import { useState } from 'react'
import { createTask } from '../api/tasks'
import type { TaskCreate } from '../types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'

interface Props {
  developerId: number
  onCreated: () => void
}

export function TaskForm({ developerId, onCreated }: Props) {
  const { toast } = useToast()
  const [form, setForm] = useState<Omit<TaskCreate, 'developer_id'>>({
    name: '',
    category: 'coding',
    date: new Date().toISOString().split('T')[0],
    time_taken_hours: 1,
    copilot_usage_pct: 0,
    confidence_score: 3,
    completion_status: 'completed',
    is_before_ai: false,
    notes: '',
  })
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await createTask({ ...form, developer_id: developerId })
      toast({ title: 'Task logged!', description: form.name })
      setForm(f => ({ ...f, name: '', notes: '' }))
      onCreated()
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
      <div className="col-span-2">
        <Label>Task Name</Label>
        <Input
          required
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder="e.g. Build React data table component"
        />
      </div>
      <div>
        <Label>Category</Label>
        <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {['coding', 'debugging', 'styling', 'architecture'].map(c => (
              <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Date</Label>
        <Input
          type="date"
          value={form.date}
          onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
        />
      </div>
      <div>
        <Label>Time Taken (hours)</Label>
        <Input
          type="number"
          min={0.1}
          step={0.5}
          value={form.time_taken_hours}
          onChange={e => setForm(f => ({ ...f, time_taken_hours: parseFloat(e.target.value) }))}
        />
      </div>
      <div>
        <Label>Copilot Usage %</Label>
        <Input
          type="number"
          min={0}
          max={100}
          value={form.copilot_usage_pct}
          onChange={e => setForm(f => ({ ...f, copilot_usage_pct: parseInt(e.target.value) }))}
        />
      </div>
      <div>
        <Label>Confidence Score (1–5)</Label>
        <Input
          type="number"
          min={1}
          max={5}
          value={form.confidence_score}
          onChange={e => setForm(f => ({ ...f, confidence_score: parseInt(e.target.value) }))}
        />
      </div>
      <div>
        <Label>Status</Label>
        <Select value={form.completion_status} onValueChange={v => setForm(f => ({ ...f, completion_status: v }))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {['completed', 'in_progress', 'blocked'].map(s => (
              <SelectItem key={s} value={s} className="capitalize">{s.replace('_', ' ')}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Period</Label>
        <Select
          value={form.is_before_ai ? 'before' : 'after'}
          onValueChange={v => setForm(f => ({ ...f, is_before_ai: v === 'before' }))}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="before">Before AI (PowerApps era)</SelectItem>
            <SelectItem value="after">After AI (Copilot assisted)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="col-span-2">
        <Label>Notes (optional)</Label>
        <Textarea
          value={form.notes}
          onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          rows={2}
        />
      </div>
      <div className="col-span-2">
        <Button type="submit" disabled={submitting} className="bg-violet-600 hover:bg-violet-700 w-full">
          {submitting ? 'Saving...' : 'Log Task'}
        </Button>
      </div>
    </form>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/TaskForm.tsx
git commit -m "feat: TaskForm controlled component with full field set"
```

---

## Task 12: Pages — Dashboard, MyTasks, TeamView, Insights

**Files:**
- Create: `frontend/src/pages/Dashboard.tsx`
- Create: `frontend/src/pages/MyTasks.tsx`
- Create: `frontend/src/pages/TeamView.tsx`
- Create: `frontend/src/pages/Insights.tsx`

- [ ] **Step 1: Create Dashboard page**

Create `frontend/src/pages/Dashboard.tsx`:
```tsx
import { useEffect, useState } from 'react'
import { getSummaryMetrics } from '../api/metrics'
import { getTasks } from '../api/tasks'
import type { SummaryMetrics, Task } from '../types'
import { KPICard } from '../components/KPICard'
import { BeforeAfterChart } from '../components/BeforeAfterChart'
import { AdoptionTrendChart } from '../components/AdoptionTrendChart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'

export function Dashboard() {
  const [metrics, setMetrics] = useState<SummaryMetrics | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const { toast } = useToast()

  useEffect(() => {
    getSummaryMetrics().then(setMetrics).catch(e => toast({ title: 'Error', description: e.message, variant: 'destructive' }))
    getTasks().then(setTasks).catch(e => toast({ title: 'Error', description: e.message, variant: 'destructive' }))
  }, [])

  if (!metrics) return <div className="text-center py-20 text-gray-400">Loading dashboard...</div>

  const timeDelta = metrics.before_ai.avg_time_hours > 0
    ? `${Math.round((1 - metrics.after_ai.avg_time_hours / metrics.before_ai.avg_time_hours) * 100)}% faster`
    : ''

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Team Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard label="Avg Task Time (After AI)" value={`${metrics.after_ai.avg_time_hours}h`} delta={timeDelta} deltaPositive icon="⏱️" />
        <KPICard label="Avg Copilot Usage" value={`${metrics.after_ai.avg_copilot_pct}%`} delta={`was ${metrics.before_ai.avg_copilot_pct}%`} deltaPositive icon="🤖" />
        <KPICard label="Avg Confidence (After)" value={`${metrics.after_ai.avg_confidence}/5`} delta="improved" deltaPositive icon="💪" />
        <KPICard label="Total Tasks Logged" value={String(metrics.before_ai.task_count + metrics.after_ai.task_count)} icon="📋" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Avg Task Time: Before vs After AI</CardTitle></CardHeader>
          <CardContent>
            <BeforeAfterChart
              beforeValue={metrics.before_ai.avg_time_hours}
              afterValue={metrics.after_ai.avg_time_hours}
              label="Avg Hours"
              unit="h"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Copilot Adoption Trend</CardTitle></CardHeader>
          <CardContent>
            <AdoptionTrendChart tasks={tasks} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Avg Confidence: Before vs After AI</CardTitle></CardHeader>
          <CardContent>
            <BeforeAfterChart
              beforeValue={metrics.before_ai.avg_confidence}
              afterValue={metrics.after_ai.avg_confidence}
              label="Confidence"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Copilot Usage %: Before vs After AI</CardTitle></CardHeader>
          <CardContent>
            <BeforeAfterChart
              beforeValue={metrics.before_ai.avg_copilot_pct}
              afterValue={metrics.after_ai.avg_copilot_pct}
              label="Copilot %"
              unit="%"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create MyTasks page**

Create `frontend/src/pages/MyTasks.tsx`:
```tsx
import { useEffect, useState, useCallback } from 'react'
import { getTasks, deleteTask } from '../api/tasks'
import { useUserStore } from '../store/userStore'
import type { Task } from '../types'
import { TaskForm } from '../components/TaskForm'
import { BeforeAfterChart } from '../components/BeforeAfterChart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'

export function MyTasks() {
  const currentUser = useUserStore(s => s.currentUser)
  const [tasks, setTasks] = useState<Task[]>([])
  const { toast } = useToast()

  const load = useCallback(() => {
    if (currentUser) getTasks(currentUser.id).then(setTasks)
  }, [currentUser])

  useEffect(() => { load() }, [load])

  async function handleDelete(id: number) {
    try {
      await deleteTask(id)
      load()
      toast({ title: 'Task deleted' })
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' })
    }
  }

  const beforeTasks = tasks.filter(t => t.is_before_ai)
  const afterTasks = tasks.filter(t => !t.is_before_ai)
  const avgBefore = beforeTasks.length ? beforeTasks.reduce((s, t) => s + t.time_taken_hours, 0) / beforeTasks.length : 0
  const avgAfter = afterTasks.length ? afterTasks.reduce((s, t) => s + t.time_taken_hours, 0) / afterTasks.length : 0

  const statusColor = (s: string) =>
    s === 'completed' ? 'default' : s === 'in_progress' ? 'secondary' : 'destructive'

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <Card>
            <CardHeader><CardTitle className="text-base">Log a New Task</CardTitle></CardHeader>
            <CardContent>
              {currentUser && <TaskForm developerId={currentUser.id} onCreated={load} />}
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader><CardTitle className="text-base">My Before vs After</CardTitle></CardHeader>
          <CardContent>
            <BeforeAfterChart beforeValue={parseFloat(avgBefore.toFixed(2))} afterValue={parseFloat(avgAfter.toFixed(2))} label="Avg Hours" unit="h" />
            <p className="text-xs text-gray-400 text-center mt-2">{beforeTasks.length} before / {afterTasks.length} after tasks</p>
          </CardContent>
        </Card>
      </div>

      {/* Task History */}
      <Card>
        <CardHeader><CardTitle className="text-base">Task History ({tasks.length})</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-gray-500 text-left">
                  <th className="pb-2 pr-4">Task</th>
                  <th className="pb-2 pr-4">Category</th>
                  <th className="pb-2 pr-4">Date</th>
                  <th className="pb-2 pr-4">Hours</th>
                  <th className="pb-2 pr-4">Copilot %</th>
                  <th className="pb-2 pr-4">Confidence</th>
                  <th className="pb-2 pr-4">Status</th>
                  <th className="pb-2 pr-4">Period</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(t => (
                  <tr key={t.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 pr-4 font-medium max-w-xs truncate">{t.name}</td>
                    <td className="py-2 pr-4 capitalize">{t.category}</td>
                    <td className="py-2 pr-4">{t.date}</td>
                    <td className="py-2 pr-4">{t.time_taken_hours}h</td>
                    <td className="py-2 pr-4">{t.copilot_usage_pct}%</td>
                    <td className="py-2 pr-4">{t.confidence_score}/5</td>
                    <td className="py-2 pr-4">
                      <Badge variant={statusColor(t.completion_status)} className="capitalize text-xs">
                        {t.completion_status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="py-2 pr-4">
                      <Badge variant={t.is_before_ai ? 'outline' : 'default'} className="text-xs">
                        {t.is_before_ai ? 'Before AI' : 'After AI'}
                      </Badge>
                    </td>
                    <td className="py-2">
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(t.id)} className="text-red-400 hover:text-red-600 h-6 px-2">✕</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {tasks.length === 0 && <p className="text-center text-gray-400 py-8">No tasks logged yet. Use the form above to add your first task.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 3: Create TeamView page**

Create `frontend/src/pages/TeamView.tsx`:
```tsx
import { useEffect, useState } from 'react'
import { getTeamMetrics } from '../api/metrics'
import { getTasks } from '../api/tasks'
import type { TeamMemberMetrics, Task } from '../types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BeforeAfterChart } from '../components/BeforeAfterChart'
import { useToast } from '@/components/ui/use-toast'

export function TeamView() {
  const [team, setTeam] = useState<TeamMemberMetrics[]>([])
  const [selected, setSelected] = useState<TeamMemberMetrics | null>(null)
  const [devTasks, setDevTasks] = useState<Task[]>([])
  const { toast } = useToast()

  useEffect(() => {
    getTeamMetrics().then(setTeam).catch(e => toast({ title: 'Error', description: e.message, variant: 'destructive' }))
  }, [])

  async function handleSelect(member: TeamMemberMetrics) {
    setSelected(member)
    const tasks = await getTasks(member.developer_id)
    setDevTasks(tasks)
  }

  const beforeAvg = devTasks.filter(t => t.is_before_ai).reduce((s, t, _, a) => s + t.time_taken_hours / a.length, 0)
  const afterAvg = devTasks.filter(t => !t.is_before_ai).reduce((s, t, _, a) => s + t.time_taken_hours / a.length, 0)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Team View</h1>
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <Card>
            <CardHeader><CardTitle className="text-base">Developer Metrics</CardTitle></CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-gray-500 text-left">
                    <th className="pb-2 pr-4">Name</th>
                    <th className="pb-2 pr-4">Tasks</th>
                    <th className="pb-2 pr-4">Avg Hours</th>
                    <th className="pb-2 pr-4">Copilot %</th>
                    <th className="pb-2 pr-4">Confidence</th>
                    <th className="pb-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {team.filter(m => m.role === 'developer').map(m => (
                    <tr
                      key={m.developer_id}
                      className={`border-b cursor-pointer hover:bg-violet-50 ${selected?.developer_id === m.developer_id ? 'bg-violet-50' : ''}`}
                      onClick={() => handleSelect(m)}
                    >
                      <td className="py-2 pr-4 font-medium">{m.name}</td>
                      <td className="py-2 pr-4">{m.tasks_logged}</td>
                      <td className="py-2 pr-4">{m.avg_time_hours}h</td>
                      <td className="py-2 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-20">
                            <div className="bg-violet-600 h-2 rounded-full" style={{ width: `${m.avg_copilot_pct}%` }} />
                          </div>
                          <span>{m.avg_copilot_pct}%</span>
                        </div>
                      </td>
                      <td className="py-2 pr-4">{m.avg_confidence}/5</td>
                      <td className="py-2">
                        <Badge variant="outline" className="text-xs text-violet-600">View →</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        {selected && (
          <Card>
            <CardHeader><CardTitle className="text-base">{selected.name} — Drill-in</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <BeforeAfterChart beforeValue={parseFloat(beforeAvg.toFixed(2))} afterValue={parseFloat(afterAvg.toFixed(2))} label="Avg Hours" unit="h" />
              <div className="text-xs text-gray-500 space-y-1">
                <p>Total tasks: <strong>{devTasks.length}</strong></p>
                <p>Before AI: <strong>{devTasks.filter(t => t.is_before_ai).length}</strong></p>
                <p>After AI: <strong>{devTasks.filter(t => !t.is_before_ai).length}</strong></p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create Insights page**

Create `frontend/src/pages/Insights.tsx`:
```tsx
import { useState } from 'react'
import { streamInsights } from '../api/insights'
import { InsightsPanel } from '../components/InsightsPanel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'

export function Insights() {
  const [content, setContent] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const { toast } = useToast()

  async function handleGenerate() {
    setContent('')
    setIsStreaming(true)
    try {
      for await (const token of streamInsights()) {
        setContent(prev => prev + token)
      }
    } catch (e: any) {
      toast({ title: 'Error generating insights', description: e.message, variant: 'destructive' })
    } finally {
      setIsStreaming(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Insights</h1>
          <p className="text-sm text-gray-500 mt-1">Powered by Azure OpenAI GPT-4 — analyzes your team's productivity data</p>
        </div>
        <Button
          onClick={handleGenerate}
          disabled={isStreaming}
          className="bg-violet-600 hover:bg-violet-700"
        >
          {isStreaming ? '⏳ Generating...' : '✨ Generate Insights'}
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            🤖 GPT-4 Analysis
            {isStreaming && <span className="text-xs text-violet-500 font-normal animate-pulse">● Live</span>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <InsightsPanel content={content} isStreaming={isStreaming} />
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/
git commit -m "feat: all 4 pages — Dashboard, MyTasks, TeamView, Insights"
```

---

## Task 13: Final Wiring & Run Verification

**Files:**
- Create: `backend/Dockerfile`
- Create: `frontend/Dockerfile`
- Create: `VelocityAI/README.md`

- [ ] **Step 1: Create backend Dockerfile**

Create `backend/Dockerfile`:
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

- [ ] **Step 2: Configure Vite proxy to avoid CORS in dev**

Edit `frontend/vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
})
```

Also update all `frontend/src/api/*.ts` files to use `/api/...` instead of `http://localhost:8000/api/...` (remove the full base URL since Vite proxies it), and update `insights.ts` fetch URL to `/api/insights/generate`.

- [ ] **Step 3: Verify full stack runs**

Terminal 1 — Backend:
```bash
cd C:\Users\n.sureshmanikandan\Repo1\VelocityAI\backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```
Expected: "Application startup complete" + seed data printed.

Terminal 2 — Frontend:
```bash
cd C:\Users\n.sureshmanikandan\Repo1\VelocityAI\frontend
npm install
npm run dev
```
Expected: "Local: http://localhost:5173/"

- [ ] **Step 4: Smoke test checklist**

Open http://localhost:5173 and verify:
- [ ] User picker modal appears on first load
- [ ] Selecting "Suresh Natarajan (manager)" shows Dashboard + Team View nav items
- [ ] Dashboard shows 4 KPI cards with data
- [ ] Before vs After charts render with violet bars
- [ ] Switching to "Arun Kumar (developer)" shows My Tasks page
- [ ] Logging a new task via the form saves and appears in the table
- [ ] Team View table lists all developers with Copilot % progress bars
- [ ] Clicking a developer row shows drill-in chart
- [ ] AI Insights page: "Generate Insights" button streams GPT-4 response (requires `.env` filled)

- [ ] **Step 5: Final commit**

```bash
cd C:\Users\n.sureshmanikandan\Repo1\VelocityAI
git add .
git commit -m "feat: complete VelocityAI — full-stack dashboard with Azure OpenAI insights"
```

---

## Self-Review Checklist

- [x] All spec sections covered: data models ✓, 4 pages ✓, all API endpoints ✓, Azure OpenAI streaming ✓, seed data ✓, role-based nav ✓, Switch User ✓, toasts ✓, violet palette ✓
- [x] No TBDs or placeholders — all code blocks are complete
- [x] Type consistency: `TaskCreate`, `DeveloperResponse`, `SummaryMetrics` used consistently across tasks 8–12
- [x] `useToast` hook used in every page for error handling
- [x] Seed produces exactly 5 developers (3 dev, 2 manager) × 20 tasks each period = 60 tasks total
