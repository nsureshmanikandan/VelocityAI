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
