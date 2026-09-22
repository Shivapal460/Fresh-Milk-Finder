from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from .database import Base


class Vendor(Base):
    __tablename__ = "vendors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    milk_type = Column(String, nullable=False)  # cow / buffalo / A2
    price_per_litre = Column(Float, nullable=False)
    milking_time = Column(String)  # morning / evening
    home_delivery = Column(Boolean, default=False)

    reviews = relationship("Review", back_populates="vendor")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id"), nullable=False)
    rating = Column(Integer, nullable=False)  # 1 to 5
    comment = Column(String)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    vendor = relationship("Vendor", back_populates="reviews")
