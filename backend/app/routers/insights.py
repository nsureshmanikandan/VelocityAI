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
        try:
            for token in stream_insights(metrics_json):
                yield f"data: {json.dumps({'token': token})}\n\n"
        except Exception as e:
            error_msg = str(e)
            if "401" in error_msg or "authentication" in error_msg.lower() or "invalid subscription" in error_msg.lower():
                error_msg = "Azure OpenAI authentication failed — check your API key and endpoint in backend/.env"
            elif "connection" in error_msg.lower() or "endpoint" in error_msg.lower():
                error_msg = "Cannot reach Azure OpenAI endpoint — check AZURE_OPENAI_ENDPOINT in backend/.env"
            yield f"data: {json.dumps({'error': error_msg})}\n\n"
        finally:
            yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
