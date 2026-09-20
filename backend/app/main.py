from fastapi import FastAPI

app = FastAPI(title="Fresh Milk Finder")

@app.get("/")
def home():
    return {"message": "Fresh Milk Finder API is running"}