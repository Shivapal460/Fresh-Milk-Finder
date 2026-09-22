from fastapi import FastAPI

from . import models
from .database import engine
from .routes import vendors

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Fresh Milk Finder")
app.include_router(vendors.router)


@app.get("/")
def home():
    return {"message": "Fresh Milk Finder API is running"}
