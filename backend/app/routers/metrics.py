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
