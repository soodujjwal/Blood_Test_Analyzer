import React, { useState, useRef } from 'react';
import {
  Sparkles, Plus, ShoppingBag, ChefHat, CheckCircle,
  AlertTriangle, AlertCircle, Upload, FileText, X,
  ChevronDown, ChevronUp, User, Clipboard,
} from 'lucide-react';
import { analyzeAPI, getErrorMessage } from '../services/api';

const TEST_CATEGORIES = {
  'Cholesterol Panel': [
    { name: 'Total Cholesterol', unit: 'mg/dL' },
    { name: 'LDL Cholesterol', unit: 'mg/dL' },
    { name: 'HDL Cholesterol', unit: 'mg/dL' },
    { name: 'Triglycerides', unit: 'mg/dL' },
    { name: 'VLDL Cholesterol', unit: 'mg/dL' },
  ],
  'Complete Blood Count': [
    { name: 'Hemoglobin', unit: 'g/dL' },
    { name: 'RBC Count', unit: 'M/µL' },
    { name: 'WBC Count', unit: 'K/µL' },
    { name: 'Platelets', unit: 'K/µL' },
    { name: 'Hematocrit', unit: '%' },
    { name: 'MCV', unit: 'fL' },
  ],
  'Metabolic Panel': [
    { name: 'Glucose', unit: 'mg/dL' },
    { name: 'Creatinine', unit: 'mg/dL' },
    { name: 'Calcium', unit: 'mg/dL' },
    { name: 'Sodium', unit: 'mEq/L' },
    { name: 'Potassium', unit: 'mEq/L' },
    { name: 'HbA1c', unit: '%' },
  ],
  'Liver & Kidney': [
    { name: 'ALT', unit: 'U/L' },
    { name: 'AST', unit: 'U/L' },
    { name: 'Albumin', unit: 'g/dL' },
    { name: 'Total Bilirubin', unit: 'mg/dL' },
    { name: 'BUN (Blood Urea Nitrogen)', unit: 'mg/dL' },
    { name: 'Uric Acid', unit: 'mg/dL' },
  ],
  'Vitamins & Hormones': [
    { name: 'Vitamin D', unit: 'ng/mL' },
    { name: 'Vitamin B12', unit: 'pg/mL' },
    { name: 'TSH', unit: 'mIU/L' },
    { name: 'Ferritin', unit: 'ng/mL' },
  ],
};

const STATUS_CONFIG = {
  normal: {
    badge: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    icon: CheckCircle,
    iconColor: 'text-emerald-400',
    card: 'bg-emerald-500/5 border-emerald-500/20',
  },
  low: {
    badge: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    icon: AlertTriangle,
    iconColor: 'text-amber-400',
    card: 'bg-amber-500/5 border-amber-500/20',
  },
  high: {
    badge: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
    icon: AlertCircle,
    iconColor: 'text-rose-400',
    card: 'bg-rose-500/5 border-rose-500/20',
  },
};

const inputClass =
  'w-full px-3 py-2 text-sm bg-zinc-800/60 border border-white/10 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition';

const cardClass =
  'bg-zinc-900/70 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-2xl';

function RecipeCard({ recipe }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/[0.08] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white/[0.03] hover:bg-white/[0.06] transition text-left"
      >
        <div className="flex items-center gap-2">
          <ChefHat className="w-4 h-4 text-fuchsia-400" />
          <span className="font-medium text-zinc-300 text-sm">{recipe.name}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-zinc-600" /> : <ChevronDown className="w-4 h-4 text-zinc-600" />}
      </button>
      {open && (
        <div className="px-4 py-3 space-y-3 bg-black/20">
          <div>
            <p className="text-xs font-semibold text-zinc-600 uppercase tracking-widest mb-2">Ingredients</p>
            <ul className="space-y-1">
              {recipe.ingredients.map((ing, i) => (
                <li key={i} className="text-sm text-zinc-400 flex items-start gap-2">
                  <span className="text-violet-500 mt-0.5">•</span>{ing}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-600 uppercase tracking-widest mb-2">Instructions</p>
            <ol className="space-y-1">
              {recipe.instructions.map((step, i) => (
                <li key={i} className="text-sm text-zinc-400 flex items-start gap-2">
                  <span className="text-violet-400 font-semibold shrink-0">{i + 1}.</span>{step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}

function AnalysisResults({ analysis }) {
  const normalCount = analysis.details?.filter(d => d.status === 'normal').length || 0;
  const abnormalCount = (analysis.details?.length || 0) - normalCount;

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Tests', value: analysis.details?.length || 0, color: 'text-zinc-100', bg: 'bg-white/[0.04] border-white/[0.08]' },
          { label: 'Normal', value: normalCount, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Flagged', value: abnormalCount, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`rounded-xl border p-3 text-center ${bg}`}>
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-zinc-600 font-medium mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* AI Summary */}
      {analysis.summary?.length > 0 && (
        <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-4">
          <h3 className="text-xs font-semibold text-violet-400 uppercase tracking-widest mb-2 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" /> AI Summary
          </h3>
          {analysis.summary.map((s, i) => (
            <p key={i} className="text-sm text-zinc-300 leading-relaxed">{s}</p>
          ))}
        </div>
      )}

      {/* Test details */}
      {analysis.details?.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-zinc-600 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Clipboard className="w-3.5 h-3.5" /> Test Results
          </h3>
          <div className="space-y-2">
            {analysis.details.map((detail, i) => {
              const cfg = STATUS_CONFIG[detail.status] || STATUS_CONFIG.normal;
              const Icon = cfg.icon;
              return (
                <div key={i} className={`border rounded-xl p-4 ${cfg.card}`}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 shrink-0 ${cfg.iconColor}`} />
                      <span className="font-semibold text-zinc-100 text-sm">{detail.name}</span>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${cfg.badge}`}>
                      {detail.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-zinc-500 mb-1.5">
                    <span className="font-semibold text-zinc-300">{detail.value} {detail.unit}</span>
                    <span>Ref: {detail.reference_range}</span>
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed">{detail.note}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {analysis.suggestions?.length > 0 && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
          <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-2">
            <CheckCircle className="w-3.5 h-3.5" /> Suggestions
          </h3>
          <ul className="space-y-1.5">
            {analysis.suggestions.map((s, i) => (
              <li key={i} className="text-sm text-zinc-300 flex items-start gap-2">
                <span className="text-emerald-500 shrink-0">→</span>{s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Grocery list */}
      {analysis.grocery_list?.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-zinc-600 uppercase tracking-widest mb-3 flex items-center gap-2">
            <ShoppingBag className="w-3.5 h-3.5" /> Shopping List
          </h3>
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {analysis.grocery_list.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-zinc-400">
                  <div className="w-4 h-4 rounded border border-white/15 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recipes */}
      {analysis.recipes?.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-zinc-600 uppercase tracking-widest mb-3 flex items-center gap-2">
            <ChefHat className="w-3.5 h-3.5" /> Recipes
          </h3>
          <div className="space-y-2">
            {analysis.recipes.map((recipe, i) => (
              <RecipeCard key={i} recipe={recipe} />
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      {analysis.disclaimer && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-500/80 leading-relaxed">
          ⚠ {analysis.disclaimer}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [mode, setMode] = useState('manual');
  const [results, setResults] = useState([]);
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const addResult = (testName, unit) => {
    if (results.some(r => r.name === testName)) return;
    setResults([...results, { name: testName, unit, value: '' }]);
  };

  const updateResult = (index, value) => {
    const updated = [...results];
    updated[index].value = value;
    setResults(updated);
  };

  const removeResult = (index) => setResults(results.filter((_, i) => i !== index));

  const handleFileChange = (file) => {
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      setError(null);
    } else if (file) {
      setError('Please upload a PDF file.');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFileChange(e.dataTransfer.files[0]);
  };

  const handleAnalyzeManual = async () => {
    const resultsData = results
      .filter(r => r.value !== '' && r.value !== null)
      .map(r => ({ name: r.name, value: parseFloat(r.value), unit: r.unit }));

    if (resultsData.length === 0) {
      setError('Please enter at least one test value before analyzing.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const patientInfo = age || gender
        ? { age: age ? parseInt(age) : undefined, gender: gender || undefined }
        : null;
      const response = await analyzeAPI.analyze(resultsData, patientInfo);
      setAnalysis(response.data);
    } catch (err) {
      setError(getErrorMessage(err, 'Analysis failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzePDF = async () => {
    if (!pdfFile) {
      setError('Please select a PDF file first.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const formData = new FormData();
      formData.append('file', pdfFile);
      const response = await analyzeAPI.analyzePDF(formData);
      setAnalysis(response.data);
    } catch (err) {
      setError(getErrorMessage(err, 'PDF analysis failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* ── Input panel ── */}
      <div className="space-y-4">
        {/* Mode tabs */}
        <div className={`${cardClass} p-1 flex gap-1`}>
          {[
            { id: 'manual', label: 'Manual Entry', Icon: Clipboard },
            { id: 'pdf', label: 'Upload PDF', Icon: FileText },
          ].map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => { setMode(id); setError(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                mode === id
                  ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/20'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {mode === 'manual' ? (
          <div className={`${cardClass} p-5 space-y-5`}>
            {/* Patient info */}
            <div>
              <p className="text-xs font-semibold text-zinc-600 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <User className="w-3 h-3" /> Patient Info (optional)
              </p>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className={inputClass}
                />
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className={inputClass + ' bg-zinc-800/60'}
                >
                  <option value="" className="bg-zinc-900">Sex</option>
                  <option value="Male" className="bg-zinc-900">Male</option>
                  <option value="Female" className="bg-zinc-900">Female</option>
                  <option value="Other" className="bg-zinc-900">Other</option>
                </select>
              </div>
            </div>

            {/* Quick add */}
            <div>
              <p className="text-xs font-semibold text-zinc-600 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Plus className="w-3 h-3" /> Quick Add
              </p>
              <div className="space-y-3">
                {Object.entries(TEST_CATEGORIES).map(([category, tests]) => (
                  <div key={category}>
                    <p className="text-xs font-medium text-zinc-600 mb-2">{category}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {tests.map((test) => {
                        const added = results.some(r => r.name === test.name);
                        return (
                          <button
                            key={test.name}
                            onClick={() => addResult(test.name, test.unit)}
                            disabled={added}
                            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                              added
                                ? 'bg-violet-500/15 border-violet-500/30 text-violet-400 cursor-not-allowed'
                                : 'bg-zinc-800/60 border-white/10 text-zinc-400 hover:border-violet-500/40 hover:text-violet-300'
                            }`}
                          >
                            {added ? '✓' : <Plus className="w-3 h-3" />}
                            {test.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Added tests */}
            {results.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-zinc-600 uppercase tracking-widest mb-3">
                  Added Tests ({results.length})
                </p>
                <div className="space-y-2">
                  {results.map((result, index) => (
                    <div key={index} className="flex items-center gap-2 bg-white/[0.03] rounded-xl p-3 border border-white/[0.06]">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-zinc-500 mb-1.5">
                          {result.name} <span className="text-zinc-700">({result.unit})</span>
                        </p>
                        <input
                          type="number"
                          placeholder="Enter value"
                          value={result.value}
                          onChange={(e) => updateResult(index, e.target.value)}
                          className={inputClass}
                        />
                      </div>
                      <button
                        onClick={() => removeResult(index)}
                        className="p-1.5 text-zinc-700 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs">
                {error}
              </div>
            )}

            <button
              onClick={handleAnalyzeManual}
              disabled={loading || results.filter(r => r.value).length === 0}
              className="w-full py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white font-semibold text-sm rounded-full shadow-lg shadow-violet-500/25 disabled:opacity-40 transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {loading ? 'Analyzing…' : 'Analyze Results'}
            </button>
          </div>
        ) : (
          <div className={`${cardClass} p-5 space-y-5`}>
            <div>
              <h3 className="text-sm font-semibold text-zinc-200 mb-1">Upload Blood Test PDF</h3>
              <p className="text-xs text-zinc-500">
                Upload a text-based PDF — AI will extract and analyze all values automatically.
              </p>
            </div>

            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
                dragOver
                  ? 'border-violet-500/60 bg-violet-500/10'
                  : pdfFile
                  ? 'border-emerald-500/40 bg-emerald-500/5'
                  : 'border-white/10 hover:border-violet-500/30 hover:bg-white/[0.02]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files[0])}
              />
              {pdfFile ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-emerald-500/15 border border-emerald-500/30 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-emerald-400" />
                  </div>
                  <p className="font-medium text-sm text-zinc-200">{pdfFile.name}</p>
                  <p className="text-xs text-zinc-600">{(pdfFile.size / 1024).toFixed(1)} KB</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); setPdfFile(null); }}
                    className="mt-1 text-xs text-rose-400 hover:underline flex items-center gap-1"
                  >
                    <X className="w-3 h-3" /> Remove
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-white/[0.04] border border-white/10 rounded-xl flex items-center justify-center">
                    <Upload className="w-6 h-6 text-zinc-500" />
                  </div>
                  <p className="font-medium text-sm text-zinc-400">
                    {dragOver ? 'Drop it here ✦' : 'Click or drag PDF here'}
                  </p>
                  <p className="text-xs text-zinc-600">PDF files only · Text-based reports work best</p>
                </div>
              )}
            </div>

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs">
                {error}
              </div>
            )}

            <button
              onClick={handleAnalyzePDF}
              disabled={loading || !pdfFile}
              className="w-full py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white font-semibold text-sm rounded-full shadow-lg shadow-violet-500/25 disabled:opacity-40 transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {loading ? 'Analyzing PDF…' : 'Analyze PDF Report'}
            </button>
          </div>
        )}
      </div>

      {/* ── Results panel ── */}
      <div>
        {loading ? (
          <div className={`${cardClass} p-12 flex flex-col items-center justify-center gap-5 min-h-[300px]`}>
            <div className="relative">
              <div className="w-14 h-14 rounded-full border-[3px] border-violet-800 border-t-violet-400 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-violet-400" />
              </div>
            </div>
            <div className="text-center">
              <p className="font-semibold text-zinc-200">Analyzing your results…</p>
              <p className="text-sm text-zinc-600 mt-1">This may take a few seconds</p>
            </div>
          </div>
        ) : analysis ? (
          <div className={`${cardClass} p-5`}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-zinc-100">Analysis Report</h2>
              <button
                onClick={() => setAnalysis(null)}
                className="text-xs text-zinc-600 hover:text-zinc-400 flex items-center gap-1 transition"
              >
                <X className="w-3.5 h-3.5" /> Clear
              </button>
            </div>
            <AnalysisResults analysis={analysis} />
          </div>
        ) : (
          <div className={`${cardClass} p-12 flex flex-col items-center justify-center gap-4 text-center min-h-[300px]`}>
            <div className="w-16 h-16 bg-gradient-to-br from-violet-500/15 to-fuchsia-500/15 border border-violet-500/20 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-violet-400" />
            </div>
            <div>
              <p className="font-semibold text-zinc-300">No analysis yet</p>
              <p className="text-sm text-zinc-600 mt-1">
                Add test values or upload a PDF to get started
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
