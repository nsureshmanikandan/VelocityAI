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
