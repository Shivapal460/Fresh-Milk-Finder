from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/vendors/{vendor_id}/reviews", tags=["Reviews"])


@router.post("/", response_model=schemas.ReviewOut, status_code=201)
def add_review(vendor_id: int, review: schemas.ReviewCreate, db: Session = Depends(get_db)):
    vendor = db.query(models.Vendor).filter(models.Vendor.id == vendor_id).first()
    if vendor is None:
        raise HTTPException(status_code=404, detail="Vendor not found")

    db_review = models.Review(vendor_id=vendor_id, **review.model_dump())
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review


@router.get("/", response_model=list[schemas.ReviewOut])
def list_reviews(vendor_id: int, db: Session = Depends(get_db)):
    vendor = db.query(models.Vendor).filter(models.Vendor.id == vendor_id).first()
    if vendor is None:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return db.query(models.Review).filter(models.Review.vendor_id == vendor_id).all()
