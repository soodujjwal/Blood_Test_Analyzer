import OpenAI from "openai";

const REFERENCE_RANGES = {
  "Hemoglobin (Hb)": { low: 12, high: 17.5, unit: "g/dL", category: "CBC" },
  Hemoglobin: { low: 12, high: 17.5, unit: "g/dL", category: "CBC" },
  "Hematocrit (Hct)": { low: 36, high: 53, unit: "%", category: "CBC" },
  Hematocrit: { low: 36, high: 53, unit: "%", category: "CBC" },
  "WBC (White Blood Cells)": { low: 4, high: 11, unit: "×10³/µL", category: "CBC" },
  "WBC Count": { low: 4.5, high: 11, unit: "K/µL", category: "CBC" },
  "RBC (Red Blood Cells)": { low: 4.2, high: 5.9, unit: "×10⁶/µL", category: "CBC" },
  "RBC Count": { low: 4.5, high: 5.9, unit: "M/µL", category: "CBC" },
  "Platelets": { low: 150, high: 400, unit: "×10³/µL", category: "CBC" },
  "MCV": { low: 80, high: 100, unit: "fL", category: "CBC" },
  "MCH": { low: 27, high: 33, unit: "pg", category: "CBC" },
  "MCHC": { low: 32, high: 36, unit: "g/dL", category: "CBC" },
  Glucose: { low: 70, high: 100, unit: "mg/dL", category: "Metabolic" },
  "Fasting Glucose": { low: 70, high: 100, unit: "mg/dL", category: "Metabolic" },
  "Postprandial Glucose": { low: 0, high: 140, unit: "mg/dL", category: "Metabolic" },
  Creatinine: { low: 0.6, high: 1.2, unit: "mg/dL", category: "Kidney" },
  "BUN (Blood Urea Nitrogen)": { low: 7, high: 18, unit: "mg/dL", category: "Kidney" },
  "Blood Urea Nitrogen": { low: 7, high: 20, unit: "mg/dL", category: "Kidney" },
  Sodium: { low: 136, high: 146, unit: "mEq/L", category: "Electrolytes" },
  Potassium: { low: 3.5, high: 5.0, unit: "mEq/L", category: "Electrolytes" },
  Chloride: { low: 95, high: 105, unit: "mEq/L", category: "Electrolytes" },
  "Bicarbonate (HCO3)": { low: 22, high: 28, unit: "mEq/L", category: "Electrolytes" },
  "Total Cholesterol": { low: 0, high: 200, unit: "mg/dL", category: "Lipids" },
  "HDL Cholesterol": { low: 40, high: 60, unit: "mg/dL", category: "Lipids" },
  "LDL Cholesterol": { low: 0, high: 160, unit: "mg/dL", category: "Lipids" },
  Triglycerides: { low: 0, high: 150, unit: "mg/dL", category: "Lipids" },
  "ALT (SGPT)": { low: 7, high: 56, unit: "U/L", category: "Liver" },
  ALT: { low: 7, high: 56, unit: "U/L", category: "Liver" },
  "AST (SGOT)": { low: 10, high: 40, unit: "U/L", category: "Liver" },
  AST: { low: 10, high: 40, unit: "U/L", category: "Liver" },
  "Alkaline Phosphatase": { low: 44, high: 147, unit: "U/L", category: "Liver" },
  "Total Bilirubin": { low: 0.1, high: 1.2, unit: "mg/dL", category: "Liver" },
  Albumin: { low: 3.5, high: 5.5, unit: "g/dL", category: "Liver" },
  Calcium: { low: 8.4, high: 10.2, unit: "mg/dL", category: "Metabolic" },
  "TSH (Thyroid)": { low: 0.4, high: 4.0, unit: "mIU/L", category: "Thyroid" },
  TSH: { low: 0.4, high: 4.0, unit: "mIU/L", category: "Thyroid" },
  "HbA1c": { low: 4, high: 5.6, unit: "%", category: "Diabetes" },
  "Vitamin D (25-OH)": { low: 30, high: 100, unit: "ng/mL", category: "Vitamins" },
  "Vitamin D": { low: 30, high: 100, unit: "ng/mL", category: "Vitamins" },
  "Vitamin B12": { low: 200, high: 900, unit: "pg/mL", category: "Vitamins" },
  Ferritin: { low: 30, high: 400, unit: "ng/mL", category: "Iron" },
  "VLDL Cholesterol": { low: 5, high: 40, unit: "mg/dL", category: "Lipids" },
  Magnesium: { low: 1.7, high: 2.2, unit: "mg/dL", category: "Electrolytes" },
  "Uric Acid": { low: 3.5, high: 7.2, unit: "mg/dL", category: "Kidney" },
};

function getRef(name) {
  const k = Object.keys(REFERENCE_RANGES).find(
    (key) => key.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(key.toLowerCase())
  );
  return k ? REFERENCE_RANGES[k] : null;
}

function fallbackAnalysis(results, patientInfo) {
  const summary = [];
  const details = [];
  let abnormalCount = 0;

  for (const r of results) {
    const ref = getRef(r.name) || { low: null, high: null, unit: r.unit || "", category: "Other" };
    const val = parseFloat(r.value);
    if (isNaN(val)) continue;

    let status = "normal";
    if (ref.low != null && val < ref.low) {
      status = "low";
      abnormalCount++;
    } else if (ref.high != null && val > ref.high) {
      status = "high";
      abnormalCount++;
    }

    const rangeStr =
      ref.low != null && ref.high != null ? `${ref.low}–${ref.high} ${ref.unit}` : "—";
    details.push({
      name: r.name,
      value: val,
      unit: ref.unit || r.unit || "",
      referenceRange: rangeStr,
      status,
      note:
        status === "low"
          ? "Below reference range. Discuss with your healthcare provider."
          : status === "high"
            ? "Above reference range. Discuss with your healthcare provider."
            : "Within reference range.",
    });
  }

  if (abnormalCount > 0) {
    summary.push(
      `${abnormalCount} value(s) outside reference range. This does not diagnose any condition—always share your full report with a doctor.`
    );
  } else if (details.length > 0) {
    summary.push("All reported values are within reference ranges. Keep following your provider’s advice.");
  }

  return {
    summary: summary.length ? summary : ["Enter results above and click Analyze to get an interpretation."],
    details,
    suggestions: [],
    groceryList: [],
    recipes: [],
    disclaimer:
      "This tool is for education only. It is not a substitute for medical advice. Always consult a qualified healthcare provider about your lab results.",
  };
}

export async function analyzeBloodTest(results, patientInfo = {}) {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return fallbackAnalysis(results, patientInfo);
  }

  const refBlob = results
    .map((r) => {
      const ref = getRef(r.name);
      const range = ref ? `${ref.low}–${ref.high} ${ref.unit}` : "—";
      return `${r.name}: ${r.value} ${r.unit || ""} (ref: ${range})`;
    })
    .join("\n");

  const prompt = `You are a helpful medical education assistant. The user has shared blood test results. Your job is to:
1. Briefly summarize the overall picture in 2–4 short, clear sentences. Mention which values are normal, low, or high.
2. For each result, state: value, reference range, normal/low/high, and a one-sentence plain-language note. Do not diagnose diseases or prescribe.
3. Give 1–3 practical suggestions (e.g., "Discuss these results with your doctor," "Consider repeating fasting glucose").
4. Provide a "groceryList": an array of EXACTLY what to buy—specific, shoppable items with pack sizes or quantities. Each entry must be concrete, e.g. "Fresh spinach, 1 bag (≈200 g)", "Rolled oats, 1 kg", "Salmon fillet, 300 g (fresh or frozen)", "Extra-virgin olive oil, 500 ml", "Almonds, raw unsalted, 200 g", "Canned chickpeas, 400 g tin", "Eggs, 1 dozen", "Milk fortified with vitamin D, 1 L". No vague categories like "leafy greens" or "nuts"—always name the exact product and size. Base it on abnormal results only (low/high). No supplements. 8–16 items. If all normal, give a short general list with the same precise format.

5. Provide a "recipes": array of 3–5 simple recipes that USE the groceryList items. Each recipe: "name" (string), "ingredients" (array of strings, e.g. "Red lentils, 150 g", "Fresh spinach, 1 bag"), "instructions" (array of short steps, e.g. "Heat oil in a pot. Sauté onion 5 min."). Use only items from groceryList plus common pantry (onion, garlic, salt, pepper, oil). Keep steps brief and practical.

Patient context (if any): ${JSON.stringify(patientInfo)}

Results:
${refBlob}

Respond in valid JSON only, no markdown or extra text:
{
  "summary": ["string", "..."],
  "details": [{"name": "...", "value": number, "unit": "...", "referenceRange": "...", "status": "normal|low|high", "note": "..."}],
  "suggestions": ["string", "..."],
  "groceryList": ["Fresh spinach, 1 bag", "Rolled oats, 1 kg", "Salmon fillet, 300 g", "..."],
  "recipes": [{"name": "...", "ingredients": ["...", "..."], "instructions": ["...", "..."]}],
  "disclaimer": "This is for education only. Not medical advice. Always consult a healthcare provider."
}`;

  const openai = new OpenAI({ apiKey });
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
  });

  const raw = completion.choices[0]?.message?.content?.trim() || "{}";
  let parsed;
  try {
    const cleaned = raw.replace(/```json\n?|\n?```/g, "").trim();
    parsed = JSON.parse(cleaned);
  } catch {
    return fallbackAnalysis(results, patientInfo);
  }

  const groceryList = Array.isArray(parsed.groceryList) ? parsed.groceryList : [];
  const recipes = Array.isArray(parsed.recipes) && parsed.recipes.length > 0
    ? parsed.recipes.filter((r) => r && r.name && Array.isArray(r.ingredients) && Array.isArray(r.instructions))
    : [];

  return {
    summary: Array.isArray(parsed.summary) ? parsed.summary : [],
    details: Array.isArray(parsed.details) ? parsed.details : [],
    suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
    groceryList,
    recipes,
    disclaimer:
      typeof parsed.disclaimer === "string"
        ? parsed.disclaimer
        : "This is for education only. Not medical advice. Always consult a healthcare provider.",
  };
}
