import pytest
from httpx import AsyncClient
from app.main import app

@pytest.mark.asyncio
async def test_read_root():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Blood Test Analyzer API is running", "docs": "/docs"}

@pytest.mark.asyncio
async def test_health_check_no_db():
    # This test might fail if MongoDB connection fails in lifespan, 
    # but let's see how it behaves with the current setup.
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/health")
    assert response.status_code == 200
    # We don't assert the exact content because it depends on DB connection
    assert "status" in response.json()
