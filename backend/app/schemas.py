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
