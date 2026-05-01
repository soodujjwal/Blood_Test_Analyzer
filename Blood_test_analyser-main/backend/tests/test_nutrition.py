import pytest
from app.services.nutrition_logic import get_targeted_groceries

def test_get_targeted_groceries_high_ldl():
    details = [{"name": "LDL Cholesterol", "status": "high"}]
    result = get_targeted_groceries(details)
    
    assert "Oats and barley" in result["veg"]
    assert "Fatty fish (Salmon, Mackerel)" in result["non_veg"]

def test_get_targeted_groceries_normal():
    details = [{"name": "LDL Cholesterol", "status": "normal"}]
    result = get_targeted_groceries(details)
    
    # Should return default healthy groceries
    assert "Mixed organic greens" in result["veg"]
    assert "Wild-caught Salmon" in result["non_veg"]

def test_get_targeted_groceries_low_hemoglobin():
    details = [{"name": "Hemoglobin", "status": "low"}]
    result = get_targeted_groceries(details)
    
    assert "Spinach" in result["veg"]
    assert "Grass-fed beef" in result["non_veg"]

def test_get_targeted_groceries_empty():
    result = get_targeted_groceries([])
    assert "Mixed organic greens" in result["veg"]
