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
