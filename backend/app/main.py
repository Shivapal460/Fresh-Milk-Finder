from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import models
from .database import engine
from .routes import vendors, reviews

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Fresh Milk Finder")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(vendors.router)
app.include_router(reviews.router)


@app.get("/")
def home():
    return {"message": "Fresh Milk Finder API is running"}