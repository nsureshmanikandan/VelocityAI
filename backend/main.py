from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.routers import developers, tasks, metrics, insights
from app import models  # noqa: F401 — ensures models are registered with Base

Base.metadata.create_all(bind=engine)

from app.seed import seed
seed()

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
