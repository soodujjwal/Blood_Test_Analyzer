import pytest
from app.routes.analyze import parse_lab_values_from_text

def test_parse_lab_values_simple():
    text = "Glucose: 95 mg/dL\nHemoglobin: 14.2 g/dL"
    results = parse_lab_values_from_text(text)
    
    assert len(results) == 2
    assert results[0]["name"] == "Glucose"
    assert results[0]["value"] == 95.0
    assert results[0]["unit"] == "mg/dL"
    
    assert results[1]["name"] == "Hemoglobin"
    assert results[1]["value"] == 14.2
    assert results[1]["unit"] == "g/dL"

def test_parse_lab_values_messy():
    text = "Some random text\nLDL Cholesterol - 130.5\nTriglycerides 150 mg/L"
    results = parse_lab_values_from_text(text)
    
    assert len(results) == 2
    assert results[0]["name"] == "LDL Cholesterol"
    assert results[0]["value"] == 130.5
    
    assert results[1]["name"] == "Triglycerides"
    assert results[1]["value"] == 150.0
    assert results[1]["unit"] == "mg/L"
