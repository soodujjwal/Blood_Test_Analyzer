import { useState } from "react";
import {
  Upload,
  FileText,
  Sparkles,
  Star,
  Zap,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  CheckCircle2,
  UtensilsCrossed,
} from "lucide-react";

const TEST_CATEGORIES = {
  "Cholesterol Panel": [
    { name: "Total Cholesterol", unit: "mg/dL", normal: "Less than 200" },
    { name: "LDL Cholesterol", unit: "mg/dL", normal: "Less than 100" },
    { name: "HDL Cholesterol", unit: "mg/dL", normal: "Greater than 40" },
    { name: "Triglycerides", unit: "mg/dL", normal: "Less than 150" },
    { name: "VLDL Cholesterol", unit: "mg/dL", normal: "5-40" },
  ],
  "Diabetes Markers": [
    { name: "Fasting Glucose", unit: "mg/dL", normal: "70-100" },
    { name: "HbA1c", unit: "%", normal: "Less than 5.7" },
    { name: "Postprandial Glucose", unit: "mg/dL", normal: "Less than 140" },
    { name: "Insulin Fasting", unit: "μIU/mL", normal: "2.6-24.9" },
  ],
  "Complete Blood Count": [
    { name: "Hemoglobin", unit: "g/dL", normal: "13.5-17.5" },
    { name: "RBC Count", unit: "M/μL", normal: "4.5-5.9" },
    { name: "WBC Count", unit: "K/μL", normal: "4.5-11" },
    { name: "Platelets", unit: "K/μL", normal: "150-400" },
    { name: "Hematocrit", unit: "%", normal: "38-48" },
  ],
  "Liver Function": [
    { name: "ALT", unit: "U/L", normal: "7-56" },
    { name: "AST", unit: "U/L", normal: "10-40" },
    { name: "Alkaline Phosphatase", unit: "U/L", normal: "44-147" },
    { name: "Total Bilirubin", unit: "mg/dL", normal: "0.1-1.2" },
    { name: "Albumin", unit: "g/dL", normal: "3.5-5.5" },
  ],
  "Kidney Function": [
    { name: "Creatinine", unit: "mg/dL", normal: "0.7-1.3" },
    { name: "Blood Urea Nitrogen", unit: "mg/dL", normal: "7-20" },
    { name: "eGFR", unit: "mL/min", normal: "Greater than 60" },
    { name: "Uric Acid", unit: "mg/dL", normal: "3.5-7.2" },
  ],
  "Thyroid Function": [
    { name: "TSH", unit: "mIU/L", normal: "0.4-4.0" },
    { name: "Free T4", unit: "ng/dL", normal: "0.8-1.8" },
    { name: "Free T3", unit: "pg/mL", normal: "2.3-4.2" },
  ],
  "Vitamins and Minerals": [
    { name: "Vitamin D", unit: "ng/mL", normal: "30-100" },
    { name: "Vitamin B12", unit: "pg/mL", normal: "200-900" },
    { name: "Folate", unit: "ng/mL", normal: "2.7-17.0" },
    { name: "Iron", unit: "μg/dL", normal: "60-170" },
    { name: "Ferritin", unit: "ng/mL", normal: "20-250" },
  ],
  Electrolytes: [
    { name: "Sodium", unit: "mEq/L", normal: "135-145" },
    { name: "Potassium", unit: "mEq/L", normal: "3.5-5.0" },
    { name: "Calcium", unit: "mg/dL", normal: "8.5-10.2" },
    { name: "Magnesium", unit: "mg/dL", normal: "1.7-2.2" },
  ],
  "Urine Tests": [
    { name: "Urine Glucose", unit: "", normal: "Negative" },
    { name: "Urine Protein", unit: "mg/day", normal: "Less than 150" },
    { name: "Microalbumin", unit: "mg/g", normal: "Less than 30" },
  ],
};

function ReportView({ data, onBack }) {
  const { summary = [], details = [], suggestions = [], groceryList = [], recipes = [], disclaimer } = data;

  return (
    <div className="min-h-screen bg-black p-4 md:p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
      <div className="absolute top-40 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />

      <div className="max-w-4xl mx-auto relative z-10">
        <button
          type="button"
          onClick={onBack}
          className="mb-6 text-purple-400 font-black text-lg hover:text-purple-300 flex items-center gap-2 group"
        >
          <span className="group-hover:-translate-x-2 transition-transform">←</span>
          <span>Back to form</span>
        </button>

        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border-2 border-white/10 overflow-hidden mb-6">
          <div className="p-8 border-b border-white/10">
            <h2 className="text-2xl font-black text-white mb-4">Summary</h2>
            <ul className="space-y-2 text-gray-300">
              {summary.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>

          {details.length > 0 && (
            <div className="p-8 border-b border-white/10 overflow-x-auto">
              <h2 className="text-2xl font-black text-white mb-4">Results by marker</h2>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-gray-400 uppercase tracking-wider">
                    <th className="pb-3 pr-4">Marker</th>
                    <th className="pb-3 pr-4">Value</th>
                    <th className="pb-3 pr-4">Reference</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {details.map((d, i) => (
                    <tr key={i} className="border-t border-white/10">
                      <td className="py-3 pr-4 font-bold text-white">{d.name}</td>
                      <td className="py-3 pr-4 text-white font-mono">
                        {d.value} {d.unit}
                      </td>
                      <td className="py-3 pr-4 text-gray-400">{d.referenceRange}</td>
                      <td className="py-3 pr-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-xs font-bold uppercase ${
                            d.status === "normal"
                              ? "bg-green-500/20 text-green-400"
                              : d.status === "low"
                                ? "bg-amber-500/20 text-amber-400"
                                : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {d.status}
                        </span>
                      </td>
                      <td className="py-3 text-gray-400 max-w-xs">{d.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {suggestions?.length > 0 && (
            <div className="p-8 border-b border-white/10">
              <h2 className="text-2xl font-black text-white mb-4">Suggestions</h2>
              <ul className="space-y-2 text-gray-300">
                {suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          {groceryList?.length > 0 && (
            <div className="p-8 border-b border-white/10">
              <h2 className="text-2xl font-black text-white mb-2 flex items-center gap-3">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 w-10 h-10 rounded-xl flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-white" />
                </div>
                Grocery list — foods to help improve your results
              </h2>
              <p className="text-gray-400 text-sm mb-4">
                Exact items and pack sizes to buy—add these to your shopping list.
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {groceryList.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-green-400/30 rounded-xl px-4 py-3 transition-all group"
                  >
                    <CheckCircle2 className="w-5 h-5 text-green-400/70 group-hover:text-green-400 shrink-0" />
                    <span className="text-white font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {recipes?.length > 0 && (
            <div className="p-8 border-b border-white/10">
              <h2 className="text-2xl font-black text-white mb-2 flex items-center gap-3">
                <div className="bg-gradient-to-br from-amber-500 to-orange-600 w-10 h-10 rounded-xl flex items-center justify-center">
                  <UtensilsCrossed className="w-5 h-5 text-white" />
                </div>
                Recipes — cook with what you buy
              </h2>
              <p className="text-gray-400 text-sm mb-6">
                Simple dishes using your grocery list. Follow the steps to make meals that support your goals.
              </p>
              <div className="space-y-6">
                {recipes.map((r, i) => (
                  <article
                    key={i}
                    className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/30 rounded-2xl p-6 transition-all"
                  >
                    <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 font-bold text-sm flex items-center justify-center">
                        {i + 1}
                      </span>
                      {r.name}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-bold text-amber-400/90 uppercase tracking-wider mb-2">
                          Ingredients
                        </h4>
                        <ul className="space-y-1.5 text-gray-300 text-sm">
                          {r.ingredients.map((ing, j) => (
                            <li key={j} className="flex items-start gap-2">
                              <span className="text-amber-400/70 mt-0.5">•</span>
                              <span>{ing}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-amber-400/90 uppercase tracking-wider mb-2">
                          Instructions
                        </h4>
                        <ol className="space-y-2 text-gray-300 text-sm list-decimal list-inside">
                          {r.instructions.map((step, j) => (
                            <li key={j} className="pl-1">
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {disclaimer && (
            <div className="p-6 bg-white/5 border-l-4 border-purple-500">
              <p className="text-sm text-gray-400">{disclaimer}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [inputMethod, setInputMethod] = useState(null);
  const [manualData, setManualData] = useState([]);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addManualEntry = () => {
    setManualData([...manualData, { marker: "", value: "", unit: "" }]);
  };

  const addQuickTest = (testName, unit) => {
    setManualData([...manualData, { marker: testName, value: "", unit: unit }]);
  };

  const updateManualEntry = (index, field, value) => {
    const updated = [...manualData];
    updated[index][field] = value;
    setManualData(updated);
  };

  const removeManualEntry = (index) => {
    setManualData(manualData.filter((_, i) => i !== index));
  };

  const buildPayload = () => {
    return manualData
      .filter((d) => d.marker?.trim() && d.value?.toString().trim())
      .map((d) => {
        const v = parseFloat(d.value.toString().replace(/,/g, "."));
        return { name: d.marker.trim(), value: v, unit: (d.unit || "").trim() };
      })
      .filter((r) => r.name && !Number.isNaN(r.value));
  };

  const analyzeTests = async () => {
    const results = buildPayload();
    if (!results.length) {
      setError("Please add at least one test with a value.");
      return;
    }
    setError(null);
    setLoading(true);
    setReport(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ results, patientInfo: {} }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.fallback) setReport(data.fallback);
        else throw new Error(data.details || data.error || "Analysis failed");
      } else {
        setReport(data);
      }
    } catch (e) {
      setError(e.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (report && !loading) {
    return <ReportView data={report} onBack={() => setReport(null)} />;
  }

  return (
    <div className="min-h-screen bg-black p-4 md:p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
      <div className="absolute top-40 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <div className="flex items-center gap-3 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 p-1 rounded-2xl">
              <div className="bg-black px-6 py-3 rounded-xl flex items-center gap-3">
                <Zap className="w-6 h-6 text-yellow-400" />
                <span className="text-white font-black text-sm">ARTIFICIAL INTELLIGENCE POWERED</span>
                <Star className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          </div>
          <h1 className="text-6xl md:text-8xl font-black mb-4 leading-tight">
            <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              health
            </span>
            <br />
            <span className="text-white">decoded</span>
            <span className="text-pink-400">.</span>
          </h1>
          <p className="text-gray-400 text-xl font-bold max-w-2xl mx-auto">
            blood tests → personalized nutrition → glow up season
          </p>
        </div>

        {/* Home: Manual vs Upload */}
        {!inputMethod && (
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <button
              onClick={() => setInputMethod("manual")}
              className="group relative bg-white/5 backdrop-blur-xl p-12 rounded-3xl border-2 border-white/10 hover:border-purple-400/50 transition-all transform hover:scale-105 hover:-rotate-1"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <FileText className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-black text-white mb-3">manual entry</h2>
                <p className="text-gray-400 font-medium mb-4">type in your numbers</p>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full" />
                  <div className="w-2 h-2 bg-pink-400 rounded-full" />
                  <div className="w-2 h-2 bg-blue-400 rounded-full" />
                </div>
              </div>
            </button>

            <button
              onClick={() => setInputMethod("upload")}
              className="group relative bg-white/5 backdrop-blur-xl p-12 rounded-3xl border-2 border-white/10 hover:border-pink-400/50 transition-all transform hover:scale-105 hover:rotate-1"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-blue-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="bg-gradient-to-br from-pink-500 to-blue-500 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Upload className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-black text-white mb-3">upload file</h2>
                <p className="text-gray-400 font-medium mb-4">drag and drop your report</p>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-pink-400 rounded-full" />
                  <div className="w-2 h-2 bg-purple-400 rounded-full" />
                  <div className="w-2 h-2 bg-blue-400 rounded-full" />
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Manual Entry Form */}
        {inputMethod === "manual" && (
          <div className="max-w-5xl mx-auto">
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl border-2 border-white/10 overflow-hidden">
              <div className="p-8 border-b border-white/10">
                <button
                  onClick={() => setInputMethod(null)}
                  className="mb-6 text-purple-400 font-black text-lg hover:text-purple-300 flex items-center gap-2 group"
                >
                  <span className="group-hover:-translate-x-2 transition-transform">←</span>
                  <span>back</span>
                </button>
                <h2 className="text-4xl font-black text-white mb-3">enter your test results</h2>
                <p className="text-gray-400 text-lg">
                  add tests manually or use quick add to select common tests
                </p>
              </div>

              <div className="p-8 border-b border-white/10">
                <button
                  onClick={() => setShowQuickAdd(!showQuickAdd)}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-4 rounded-2xl font-black text-lg flex items-center justify-between hover:from-purple-600 hover:to-pink-600 transition-all"
                >
                  <span>quick add common tests</span>
                  {showQuickAdd ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                </button>

                {showQuickAdd && (
                  <div className="mt-6 max-h-96 overflow-y-auto bg-white/5 rounded-2xl p-6 border border-white/10">
                    {Object.entries(TEST_CATEGORIES).map(([category, tests]) => (
                      <div key={category} className="mb-6 last:mb-0">
                        <h3 className="text-white font-black text-lg mb-3 flex items-center gap-2">
                          <div className="w-1 h-6 bg-gradient-to-b from-purple-400 to-pink-400 rounded-full" />
                          {category}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {tests.map((test) => (
                            <button
                              key={test.name}
                              onClick={() => addQuickTest(test.name, test.unit)}
                              className="bg-white/10 hover:bg-white/20 border border-white/20 hover:border-purple-400/50 p-4 rounded-xl text-left transition-all group"
                            >
                              <div className="font-bold text-white text-sm mb-1 group-hover:text-purple-300 transition-colors">
                                {test.name}
                              </div>
                              <div className="text-xs text-gray-400">Normal: {test.normal}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-8">
                {manualData.length === 0 && (
                  <div className="text-center py-12 bg-white/5 rounded-2xl border-2 border-dashed border-white/20">
                    <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" />
                    <p className="text-gray-400 font-medium">
                      No tests added yet. Click &quot;quick add&quot; or &quot;add custom test&quot; below.
                    </p>
                  </div>
                )}

                {manualData.length > 0 && (
                  <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                    {manualData.map((entry, index) => (
                      <div
                        key={index}
                        className="bg-white/10 backdrop-blur-lg p-4 rounded-2xl border border-white/20 grid grid-cols-1 sm:grid-cols-4 gap-3"
                      >
                        <input
                          type="text"
                          placeholder="Test name"
                          value={entry.marker}
                          onChange={(e) => updateManualEntry(index, "marker", e.target.value)}
                          className="bg-white/10 border-2 border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 font-bold focus:border-purple-400 focus:outline-none"
                        />
                        <input
                          type="text"
                          inputMode="decimal"
                          placeholder="Value (required)"
                          value={entry.value}
                          onChange={(e) => updateManualEntry(index, "value", e.target.value)}
                          className="bg-yellow-500/20 border-2 border-yellow-400/50 rounded-xl px-4 py-3 text-white placeholder-yellow-300 font-black focus:border-yellow-400 focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Unit (e.g. mg/dL)"
                          value={entry.unit}
                          onChange={(e) => updateManualEntry(index, "unit", e.target.value)}
                          className="bg-white/10 border-2 border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 font-bold focus:border-purple-400 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => removeManualEntry(index)}
                          className="bg-red-500/20 border-2 border-red-400/50 rounded-xl hover:bg-red-500/30 transition-all flex items-center justify-center"
                        >
                          <Trash2 className="w-5 h-5 text-red-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-col md:flex-row gap-4">
                  <button
                    type="button"
                    onClick={addManualEntry}
                    className="flex items-center justify-center gap-3 px-8 py-4 bg-white/10 border-2 border-white/20 hover:border-purple-400/50 rounded-2xl text-white font-black transition-all hover:bg-white/20"
                  >
                    <Plus className="w-6 h-6" />
                    <span>add custom test</span>
                  </button>

                  <button
                    type="button"
                    onClick={analyzeTests}
                    disabled={manualData.length === 0 || loading}
                    className="flex-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white px-8 py-4 rounded-2xl font-black text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 transition-all"
                  >
                    {loading
                      ? "Analyzing…"
                      : manualData.length > 0
                        ? `analyze ${manualData.length} tests →`
                        : "analyze →"}
                  </button>
                </div>

                {error && <p className="mt-4 text-red-400 font-bold">{error}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Upload placeholder */}
        {inputMethod === "upload" && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/5 backdrop-blur-xl p-10 rounded-3xl border-2 border-white/10">
              <button
                type="button"
                onClick={() => setInputMethod(null)}
                className="mb-8 text-purple-400 font-black text-lg hover:text-purple-300 flex items-center gap-2 group"
              >
                <span className="group-hover:-translate-x-2 transition-transform">←</span>
                <span>back</span>
              </button>
              <div className="text-center py-12">
                <div className="inline-block bg-gradient-to-br from-pink-500 to-blue-500 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Upload className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-4xl font-black text-white mb-4">file upload</h2>
                <p className="text-gray-400 text-lg">coming soon!</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
