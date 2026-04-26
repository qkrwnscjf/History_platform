import os
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_DETAILS = os.getenv("MONGO_DETAILS", "mongodb://mongodb:27017")
DB_NAME = os.getenv("DB_NAME", "history_map")

client = AsyncIOMotorClient(MONGO_DETAILS)
db = client[DB_NAME]
collection = db.events

async def init_db():
    await collection.create_index([("location", "2dsphere")])
    await collection.create_index([("title", "text"), ("summary", "text")])
