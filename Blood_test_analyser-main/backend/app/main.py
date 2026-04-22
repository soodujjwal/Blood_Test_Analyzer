from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

from app.routes import auth, analyze

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://mongodb:27017")
DB_NAME = os.getenv("DB_NAME", "blood_test_analyzer")

mongo_client = None
db = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global mongo_client, db
    try:
        # Add a timeout to prevent indefinite hanging on connection
        mongo_client = MongoClient(
            MONGO_URI, 
            server_api=ServerApi('1'),
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000
        )
        mongo_client.admin.command('ping')
        db = mongo_client[DB_NAME]
        app.state.db = db
        app.state.mongo_client = mongo_client
        print("✓ MongoDB connected")
    except Exception as e:
        print(f"✗ MongoDB connection failed: {e}")
        # Ensure db is at least None so routes don't crash on missing attribute
        app.state.db = None

    yield

    if mongo_client:
        mongo_client.close()
        print("✓ MongoDB disconnected")

app = FastAPI(
    title="Blood Test Analyzer API",
    description="AI-powered blood test analysis with user history",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

# Include routes
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(analyze.router, prefix="/api/analyze", tags=["analyze"])

@app.get("/")
async def root():
    return {"message": "Blood Test Analyzer API is running", "docs": "/docs"}

@app.get("/health")
async def health_check(req: Request):
    client = getattr(req.app.state, "mongo_client", None)
    try:
        if client:
            client.admin.command('ping')
            return {"status": "healthy", "database": "connected"}
        return {"status": "degraded", "database": "not connected"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}
