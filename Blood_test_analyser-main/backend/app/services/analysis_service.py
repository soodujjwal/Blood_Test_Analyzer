import asyncio
import json
import logging
import os
from typing import List, Dict

import google.generativeai as genai

logger = logging.getLogger(__name__)

REFERENCE_RANGES = {
    "Hemoglobin (Hb)": {"low": 12, "high": 17.5, "unit": "g/dL", "category": "CBC"},
    "Hemoglobin": {"low": 12, "high": 17.5, "unit": "g/dL", "category": "CBC"},
    "Hematocrit (Hct)": {"low": 36, "high": 53, "unit": "%", "category": "CBC"},
    "Hematocrit": {"low": 36, "high": 53, "unit": "%", "category": "CBC"},
    "WBC (White Blood Cells)": {"low": 4, "high": 11, "unit": "×10³/µL", "category": "CBC"},
    "WBC Count": {"low": 4.5, "high": 11, "unit": "K/µL", "category": "CBC"},
    "RBC (Red Blood Cells)": {"low": 4.2, "high": 5.9, "unit": "×10⁶/µL", "category": "CBC"},
    "RBC Count": {"low": 4.5, "high": 5.9, "unit": "M/µL", "category": "CBC"},
    "Platelets": {"low": 150, "high": 400, "unit": "×10³/µL", "category": "CBC"},
    "MCV": {"low": 80, "high": 100, "unit": "fL", "category": "CBC"},
    "MCH": {"low": 27, "high": 33, "unit": "pg", "category": "CBC"},
    "MCHC": {"low": 32, "high": 36, "unit": "g/dL", "category": "CBC"},
    "Glucose": {"low": 70, "high": 100, "unit": "mg/dL", "category": "Metabolic"},
    "Fasting Glucose": {"low": 70, "high": 100, "unit": "mg/dL", "category": "Metabolic"},
    "Postprandial Glucose": {"low": 0, "high": 140, "unit": "mg/dL", "category": "Metabolic"},
    "Creatinine": {"low": 0.6, "high": 1.2, "unit": "mg/dL", "category": "Kidney"},
    "BUN (Blood Urea Nitrogen)": {"low": 7, "high": 18, "unit": "mg/dL", "category": "Kidney"},
    "Blood Urea Nitrogen": {"low": 7, "high": 20, "unit": "mg/dL", "category": "Kidney"},
    "Sodium": {"low": 136, "high": 146, "unit": "mEq/L", "category": "Electrolytes"},
    "Potassium": {"low": 3.5, "high": 5.0, "unit": "mEq/L", "category": "Electrolytes"},
    "Chloride": {"low": 95, "high": 105, "unit": "mEq/L", "category": "Electrolytes"},
    "Bicarbonate (HCO3)": {"low": 22, "high": 28, "unit": "mEq/L", "category": "Electrolytes"},
    "Total Cholesterol": {"low": 0, "high": 200, "unit": "mg/dL", "category": "Lipids"},
    "HDL Cholesterol": {"low": 40, "high": 60, "unit": "mg/dL", "category": "Lipids"},
    "LDL Cholesterol": {"low": 0, "high": 160, "unit": "mg/dL", "category": "Lipids"},
    "Triglycerides": {"low": 0, "high": 150, "unit": "mg/dL", "category": "Lipids"},
    "ALT (SGPT)": {"low": 7, "high": 56, "unit": "U/L", "category": "Liver"},
    "ALT": {"low": 7, "high": 56, "unit": "U/L", "category": "Liver"},
    "AST (SGOT)": {"low": 10, "high": 40, "unit": "U/L", "category": "Liver"},
    "AST": {"low": 10, "high": 40, "unit": "U/L", "category": "Liver"},
    "Alkaline Phosphatase": {"low": 44, "high": 147, "unit": "U/L", "category": "Liver"},
    "Total Bilirubin": {"low": 0.1, "high": 1.2, "unit": "mg/dL", "category": "Liver"},
    "Albumin": {"low": 3.5, "high": 5.5, "unit": "g/dL", "category": "Liver"},
    "Calcium": {"low": 8.4, "high": 10.2, "unit": "mg/dL", "category": "Metabolic"},
    "TSH (Thyroid)": {"low": 0.4, "high": 4.0, "unit": "mIU/L", "category": "Thyroid"},
    "TSH": {"low": 0.4, "high": 4.0, "unit": "mIU/L", "category": "Thyroid"},
    "HbA1c": {"low": 4, "high": 5.6, "unit": "%", "category": "Diabetes"},
    "Vitamin D (25-OH)": {"low": 30, "high": 100, "unit": "ng/mL", "category": "Vitamins"},
    "Vitamin D": {"low": 30, "high": 100, "unit": "ng/mL", "category": "Vitamins"},
    "Vitamin B12": {"low": 200, "high": 900, "unit": "pg/mL", "category": "Vitamins"},
    "Ferritin": {"low": 30, "high": 400, "unit": "ng/mL", "category": "Iron"},
    "VLDL Cholesterol": {"low": 5, "high": 40, "unit": "mg/dL", "category": "Lipids"},
    "Magnesium": {"low": 1.7, "high": 2.2, "unit": "mg/dL", "category": "Electrolytes"},
    "Uric Acid": {"low": 3.5, "high": 7.2, "unit": "mg/dL", "category": "Kidney"},
}

def get_reference(name: str):
    k = next((key for key in REFERENCE_RANGES.keys() 
              if key.lower() in name.lower() or name.lower() in key.lower()), None)
    return REFERENCE_RANGES[k] if k else None

def fallback_analysis(results: List[Dict], patient_info: Dict = None):
    summary = []
    details = []
    abnormal_count = 0

    for r in results:
        ref = get_reference(r["name"]) or {"low": None, "high": None, "unit": r.get("unit", ""), "category": "Other"}
        val = float(r["value"])
        
        status = "normal"
        if ref["low"] is not None and val < ref["low"]:
            status = "low"
            abnormal_count += 1
        elif ref["high"] is not None and val > ref["high"]:
            status = "high"
            abnormal_count += 1

        range_str = f"{ref['low']}–{ref['high']} {ref['unit']}" if ref["low"] is not None and ref["high"] is not None else "—"
        
        details.append({
            "name": r["name"],
            "value": val,
            "unit": ref["unit"] or r.get("unit", ""),
            "reference_range": range_str,
            "status": status,
            "note": "Below reference range. Discuss with your healthcare provider." if status == "low" 
                   else "Above reference range. Discuss with your healthcare provider." if status == "high"
                   else "Within reference range."
        })

    if abnormal_count > 0:
        summary.append(f"{abnormal_count} value(s) outside reference range. This does not diagnose any condition—always share your full report with a doctor.")
    elif details:
        summary.append("All reported values are within reference ranges. Keep following your provider's advice.")

    return {
        "summary": summary or ["Enter results above and click Analyze to get an interpretation."],
        "details": details,
        "suggestions": [],
        "grocery_list": [],
        "recipes": [],
        "disclaimer": "This tool is for education only. It is not a substitute for medical advice. Always consult a qualified healthcare provider about your lab results."
    }

async def analyze_blood_test(results: List[Dict], patient_info: Dict = None):
    api_key = os.getenv("GOOGLE_API_KEY", "").strip()

    if not api_key:
        return fallback_analysis(results, patient_info)

    def _ref_str(name):
        ref = get_reference(name)
        if ref:
            return f"{ref['low']}–{ref['high']} {ref.get('unit', '')}"
        return "n/a"

    ref_blob = "\n".join([
        f"{r['name']}: {r['value']} {r.get('unit', '')} (ref: {_ref_str(r['name'])})"
        for r in results
    ])

    prompt = f"""You are a helpful medical education assistant. The user has shared blood test results. Your job is to:
1. Briefly summarize the overall picture in 2–4 short, clear sentences. Mention which values are normal, low, or high.
2. For each result, state: value, reference range, normal/low/high, and a one-sentence plain-language note. Do not diagnose diseases or prescribe.
3. Give 1–3 practical suggestions (e.g., "Discuss these results with your doctor," "Consider repeating fasting glucose").
4. Provide a "grocery_list": an array of EXACTLY what to buy—specific, shoppable items with pack sizes or quantities. Each entry must be concrete, e.g. "Fresh spinach, 1 bag (≈200 g)". No vague categories. 8–16 items.
5. Provide a "recipes": array of 3–5 simple recipes that USE the grocery_list items.

Patient context (if any): {patient_info or {}}

Results:
{ref_blob}

Respond in valid JSON only:
{{
  "summary": ["string"],
  "details": [{{"name": "...", "value": 0, "unit": "...", "reference_range": "...", "status": "normal|low|high", "note": "..."}}],
  "suggestions": ["string"],
  "grocery_list": ["Fresh spinach, 1 bag"],
  "recipes": [{{"name": "...", "ingredients": ["..."], "instructions": ["..."]}}],
  "disclaimer": "This is for education only."
}}"""

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-2.0-flash")
        response = await asyncio.to_thread(
            model.generate_content,
            prompt
        )

        raw = response.text.strip()
        cleaned = raw.replace("```json\n", "").replace("\n```", "").strip()
        parsed = json.loads(cleaned)

        return {
            "summary": parsed.get("summary", []),
            "details": parsed.get("details", []),
            "suggestions": parsed.get("suggestions", []),
            "grocery_list": parsed.get("grocery_list", []),
            "recipes": parsed.get("recipes", []),
            "disclaimer": parsed.get("disclaimer", "This is for education only. Not medical advice.")
        }
    except Exception as e:
        logger.error("Gemini API error: %s", e)
        return fallback_analysis(results, patient_info)
