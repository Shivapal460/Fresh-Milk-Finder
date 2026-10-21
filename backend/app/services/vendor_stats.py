from sqlalchemy import func
from sqlalchemy.orm import Session

from . import models, schemas


def to_vendor_out(db: Session, vendor: models.Vendor) -> dict:
    avg_rating, count = (
        db.query(func.avg(models.Review.rating), func.count(models.Review.id))
        .filter(models.Review.vendor_id == vendor.id)
        .one()
    )
    data = schemas.VendorOut.model_validate(vendor).model_dump()
    data["average_rating"] = round(avg_rating, 2) if avg_rating is not None else None
    data["review_count"] = count or 0
    return data
