from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..services.geo import haversine_km

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


# NOTE: this route must stay ABOVE "/{vendor_id}"
@router.get("/nearby", response_model=list[schemas.VendorNearby])
def nearby_vendors(
    lat: float = Query(ge=-90, le=90),
    lng: float = Query(ge=-180, le=180),
    radius: float = Query(5, gt=0, le=100, description="Search radius in km"),
    milk_type: str | None = None,
    max_price: float | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(models.Vendor)
    if milk_type:
        query = query.filter(models.Vendor.milk_type == milk_type)
    if max_price is not None:
        query = query.filter(models.Vendor.price_per_litre <= max_price)

    results = []
    for v in query.all():
        distance = haversine_km(lat, lng, v.latitude, v.longitude)
        if distance <= radius:
            data = schemas.VendorOut.model_validate(v).model_dump()
            results.append(schemas.VendorNearby(**data, distance_km=round(distance, 2)))

    results.sort(key=lambda item: item.distance_km)
    return results


@router.get("/{vendor_id}", response_model=schemas.VendorOut)
def get_vendor(vendor_id: int, db: Session = Depends(get_db)):
    vendor = db.query(models.Vendor).filter(models.Vendor.id == vendor_id).first()
    if vendor is None:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return vendor
