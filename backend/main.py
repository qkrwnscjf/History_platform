from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from database import collection, init_db
import os

app = FastAPI(title="History Map API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    await init_db()

@app.get("/api/events")
async def get_events(min_year: int = -3000, max_year: int = 2026):
    cursor = collection.find({"year": {"$gte": min_year, "$lte": max_year}}).limit(1000)
    events = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        events.append(doc)
    return events

@app.get("/api/search")
async def search_events(q: str):
    if not q: return []
    cursor = collection.find({
        "title": {"$regex": q, "$options": "i"}
    }).limit(5)
    results = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        results.append(doc)
    return results

@app.get("/api/stats")
async def get_stats():
    count = await collection.count_documents({})
    return {"total_events": count}
