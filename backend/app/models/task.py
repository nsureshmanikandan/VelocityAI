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
