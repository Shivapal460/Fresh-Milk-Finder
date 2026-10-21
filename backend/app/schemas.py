from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class VendorBase(BaseModel):
    name: str
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    milk_type: str  # cow / buffalo / A2
    price_per_litre: float = Field(gt=0)
    milking_time: str | None = None  # morning / evening
    home_delivery: bool = False


class VendorCreate(VendorBase):
    pass


class VendorOut(VendorBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    average_rating: float | None = None
    review_count: int = 0


class VendorNearby(VendorOut):
    distance_km: float


class ReviewCreate(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: str | None = None


class ReviewOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    vendor_id: int
    rating: int
    comment: str | None = None
    created_at: datetime
