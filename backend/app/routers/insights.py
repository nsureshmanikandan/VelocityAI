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
