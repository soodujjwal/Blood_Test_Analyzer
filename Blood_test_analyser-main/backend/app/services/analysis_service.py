import os
import re
import json
import logging
from typing import Dict, Any, List, Optional, Union
from google import genai
from google.genai import types
from .nutrition_logic import get_targeted_groceries

logger = logging.getLogger(__name__)

# Minimal reference ranges for fallback analysis
REFERENCE_RANGES = {
    "hemoglobin": {"low": 13.8, "high": 17.2, "unit": "g/dL"},
    "wbc": {"low": 4.5, "high": 11.0, "unit": "10^3/uL"},
    "platelets": {"low": 150, "high": 450, "unit": "10^3/uL"},
    "rbc": {"low": 4.2, "high": 5.9, "unit": "10^6/uL"},
    "creatinine": {"low": 0.74, "high": 1.35, "unit": "mg/dL"},
    "glucose": {"low": 70, "high": 99, "unit": "mg/dL"},
    "cholesterol": {"low": 0, "high": 200, "unit": "mg/dL"},
    "ldl": {"low": 0, "high": 100, "unit": "mg/dL"},
    "hdl": {"low": 40, "high": 60, "unit": "mg/dL"},
    "triglycerides": {"low": 0, "high": 150, "unit": "mg/dL"},
    "vitamind": {"low": 30, "high": 100, "unit": "ng/mL"},
    "vitaminb12": {"low": 200, "high": 900, "unit": "pg/mL"},
    "tsh": {"low": 0.4, "high": 4.0, "unit": "mIU/L"},
    "ferritin": {"low": 15, "high": 150, "unit": "ng/mL"},
    "calcium": {"low": 8.5, "high": 10.2, "unit": "mg/dL"},
    "sodium": {"low": 135, "high": 145, "unit": "mEq/L"},
    "potassium": {"low": 3.6, "high": 5.2, "unit": "mEq/L"},
    "hba1c": {"low": 4.0, "high": 5.6, "unit": "%"},
    "alt": {"low": 7, "high": 55, "unit": "U/L"},
    "ast": {"low": 8, "high": 48, "unit": "U/L"},
    "albumin": {"low": 3.4, "high": 5.4, "unit": "g/dL"},
    "totalbilirubin": {"low": 0.1, "high": 1.2, "unit": "mg/dL"},
    "bun": {"low": 7, "high": 20, "unit": "mg/dL"},
    "uricacid": {"low": 2.4, "high": 7.0, "unit": "mg/dL"},
    "magnesium": {"low": 1.7, "high": 2.2, "unit": "mg/dL"},
    "iron": {"low": 60, "high": 170, "unit": "mcg/dL"},
    "crp": {"low": 0, "high": 1.0, "unit": "mg/dL"},
    "zinc": {"low": 70, "high": 120, "unit": "mcg/dL"},
    "vitamina": {"low": 20, "high": 60, "unit": "mcg/dL"},
    "vitaminc": {"low": 0.4, "high": 2.0, "unit": "mg/dL"},
    "vitamine": {"low": 5.5, "high": 17.0, "unit": "mcg/mL"},
    "testosterone": {"low": 15, "high": 1000, "unit": "ng/dL"},
    "estradiol": {"low": 15, "high": 350, "unit": "pg/mL"},
    "cortisol": {"low": 5, "high": 23, "unit": "mcg/dL"},
    "vitamink": {"low": 0.1, "high": 2.2, "unit": "ng/mL"},
    "folate": {"low": 3, "high": 20, "unit": "ng/mL"},
    "phosphorus": {"low": 2.5, "high": 4.5, "unit": "mg/dL"},
    "chloride": {"low": 96, "high": 106, "unit": "mEq/L"},
    "bicarbonate": {"low": 23, "high": 29, "unit": "mEq/L"},
    "gfr": {"low": 60, "high": 200, "unit": "mL/min/1.73m2"},
}

# small helper to normalize keys
def _normalize(name: str) -> str:
    return re.sub(r"[^a-z0-9]", "", name.lower())

# build a normalized map for quick lookup
NORMALIZED_REF_MAP = { _normalize(k): k for k in REFERENCE_RANGES.keys() }


def _normalize_parsed_details(details: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Ensure each detail has name,value,unit,reference_range,status,note"""
    out = []
    for d in details:
        name = d.get("name") or d.get("test") or d.get("analyte") or "unknown"
        try:
            value = float(d.get("value")) if d.get("value") is not None else 0.0
        except (ValueError, TypeError):
            value = 0.0
            
        unit = d.get("unit") or d.get("units") or ""
        
        # Try to find canonical name
        normalized_name = _normalize(name)
        canonical = None
        for k in NORMALIZED_REF_MAP:
            if k in normalized_name or normalized_name in k:
                canonical = NORMALIZED_REF_MAP[k]
                break
        
        ref_obj = REFERENCE_RANGES.get(canonical) if canonical else None
        ref_str = f"{ref_obj['low']} - {ref_obj['high']}" if ref_obj else "N/A"
        
        status = "normal"
        note = d.get("note") or ""
        
        if ref_obj:
            if value < ref_obj["low"]:
                status = "low"
                note = note or f"Below reference range ({ref_obj['low']} {ref_obj['unit']})"
            elif value > ref_obj["high"]:
                status = "high"
                note = note or f"Above reference range ({ref_obj['high']} {ref_obj['unit']})"
        
        out.append({
            "name": name,
            "value": value,
            "unit": unit,
            "reference_range": ref_str,
            "status": status,
            "note": note,
        })
    return out


def fallback_analysis(results: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Perform local analysis when AI is unavailable."""
    normalized = _normalize_parsed_details(results)
    
    grocery_list = get_targeted_groceries(normalized)
    
    return {
        "details": normalized,
        "suggestions": [
            "Consult with a healthcare professional regarding abnormal results.",
            "Maintain a balanced diet and regular exercise.",
            "Consider re-testing in 3-6 months if lifestyle changes are made."
        ],
        "grocery_list": grocery_list,
        "disclaimer": "This analysis is for informational purposes only and does not constitute medical advice. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition."
    }


async def analyze_blood_test(data: Union[str, List[Dict[str, Any]]], patient_info: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Primary analysis entrypoint. Handles both raw text and structured data."""
    results = []
    
    if isinstance(data, str):
        # Naive parse for raw text
        lines = [l.strip() for l in data.splitlines() if l.strip()]
        for ln in lines:
            m = re.match(r"([A-Za-z /]+)\s+([0-9]+\.?[0-9]*)\s*([a-zA-Z/%^0-9]*)", ln)
            if m:
                results.append({
                    "name": m.group(1).strip(),
                    "value": m.group(2),
                    "unit": m.group(3).strip()
                })
    else:
        results = data

    # Try Gemini if API key is present
    api_key = os.getenv("GOOGLE_API_KEY")
    if api_key and api_key != "your-gemini-api-key-here":
        try:
            return await analyze_with_gemini(results, patient_info)
        except Exception as e:
            logger.error(f"Gemini analysis failed: {e}")
            # Fallback to local
    
    return fallback_analysis(results)


async def analyze_with_gemini(results: List[Dict[str, Any]], patient_info: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Use Gemini to perform detailed analysis."""
    api_key = os.getenv("GOOGLE_API_KEY")
    client = genai.Client(api_key=api_key)
    
    prompt = f"""
    Analyze the following blood test results and provide a structured JSON response.
    
    Patient Info: {json.dumps(patient_info) if patient_info else "Not provided"}
    Results: {json.dumps(results)}
    
    IMPORTANT: 
    1. Be highly accurate with the 'status' (low, normal, high). 
    2. For vitamins (like Vitamin D, B12) and hormones (like TSH), ensure you use standard clinical reference ranges. 
    3. If a value is extremely high (e.g., >1000) or extremely low, it MUST be flagged as 'high' or 'low', never 'normal'.
    4. Provide specific notes explaining why a value is flagged.
    5. The 'grocery_list' MUST be an object with two keys: 'veg' and 'non_veg', each containing a list of strings.

    The response MUST be a JSON object matching this schema:
    {{
        "details": [
            {{
                "name": "string",
                "value": number,
                "unit": "string",
                "reference_range": "string",
                "status": "normal|low|high",
                "note": "string"
            }}
        ],
        "suggestions": ["string"],
        "grocery_list": {{
            "veg": ["string"],
            "non_veg": ["string"]
        }},
        "disclaimer": "string"
    }}
    
    Focus on nutritional advice and lifestyle changes. Be professional and cautious.
    """
    
    response = client.models.generate_content(
        model="gemini-1.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json"
        )
    )
    
    try:
        return json.loads(response.text)
    except Exception as e:
        logger.error(f"Failed to parse Gemini response: {e}\nResponse: {response.text}")
        raise


async def analyze_pdf_text(text: str, patient_info: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Wrapper used by routes when plain text is extracted from a PDF."""
    try:
        return await analyze_blood_test(text, patient_info)
    except Exception as e:
        logger.exception("Error in analyze_pdf_text")
        return fallback_analysis([])


async def analyze_file_multimodal(content: bytes, mime_type: str, patient_info: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Process binary content (image/pdf) using Gemini Multimodal."""
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key or api_key == "your-gemini-api-key-here":
        return fallback_analysis([])

    client = genai.Client(api_key=api_key)
    
    prompt = f"""
    Analyze this blood test report image/PDF. Extract all lab values and provide a detailed health analysis.

    Patient Info: {json.dumps(patient_info) if patient_info else "Not provided"}

    IMPORTANT: 
    1. Be highly accurate with the 'status' (low, normal, high). 
    2. For vitamins (like Vitamin D, B12) and hormones (like TSH), ensure you use standard clinical reference ranges. 
    3. If a value is extremely high or extremely low, it MUST be flagged as 'high' or 'low', never 'normal'.
    4. Extract the exact 'reference_range' if printed on the report, otherwise use standard clinical ranges.
    5. The 'grocery_list' MUST be an object with two keys: 'veg' and 'non_veg', each containing a list of strings.

    The response MUST be a JSON object matching this schema:
    {{
        "details": [
            {{
                "name": "string",
                "value": number,
                "unit": "string",
                "reference_range": "string",
                "status": "normal|low|high",
                "note": "string"
            }}
        ],
        "suggestions": ["string"],
        "grocery_list": {{
            "veg": ["string"],
            "non_veg": ["string"]
        }},
        "disclaimer": "string"
    }}
    """
    
    try:
        response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents=[
                prompt,
                types.Part.from_bytes(data=content, mime_type=mime_type)
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )
        return json.loads(response.text)
    except Exception as e:
        logger.error(f"Multimodal Gemini analysis failed: {e}")
        return fallback_analysis([])
