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
