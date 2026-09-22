from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/vendors", tags=["Vendors"])


@router.post("/", response_model=schemas.VendorOut, status_code=201)
def create_vendor(vendor: schemas.VendorCreate, db: Session = Depends(get_db)):
    db_vendor = models.Vendor(**vendor.model_dump())
    db.add(db_vendor)
    db.commit()
    db.refresh(db_vendor)
    return db_vendor


@router.get("/", response_model=list[schemas.VendorOut])
def list_vendors(
    milk_type: str | None = None,
    max_price: float | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(models.Vendor)
    if milk_type:
        query = query.filter(models.Vendor.milk_type == milk_type)
    if max_price is not None:
        query = query.filter(models.Vendor.price_per_litre <= max_price)
    return query.all()


@router.get("/{vendor_id}", response_model=schemas.VendorOut)
def get_vendor(vendor_id: int, db: Session = Depends(get_db)):
    vendor = db.query(models.Vendor).filter(models.Vendor.id == vendor_id).first()
    if vendor is None:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return vendor
