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
