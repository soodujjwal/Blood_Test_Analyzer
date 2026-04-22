import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Plus, ShoppingBag, CircleCheck,
  TriangleAlert, CircleAlert, Upload, FileText, X,
  ChevronDown, ChevronUp, User, Clipboard, Activity,
  ArrowRight, Beaker, Zap, Heart, Info
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
    badge: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    icon: CircleCheck,
    iconColor: 'text-emerald-400',
    card: 'bg-emerald-500/[0.02] border-emerald-500/10',
    glow: 'shadow-[0_0_20px_rgba(16,185,129,0.05)]',
  },
  low: {
    badge: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    icon: TriangleAlert,
    iconColor: 'text-amber-400',
    card: 'bg-amber-500/[0.02] border-amber-500/10',
    glow: 'shadow-[0_0_20px_rgba(245,158,11,0.05)]',
  },
  high: {
    badge: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    icon: CircleAlert,
    iconColor: 'text-rose-400',
    card: 'bg-rose-500/[0.02] border-rose-500/10',
    glow: 'shadow-[0_0_20px_rgba(244,63,94,0.05)]',
  },
};

const inputClass =
  'w-full px-4 py-3.5 text-sm bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all backdrop-blur-md shadow-inner h-[50px] leading-none';

const cardClass =
  'bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] rounded-[2rem] shadow-2xl overflow-hidden';

function AnalysisResults({ analysis }) {
  const normalCount = analysis.details?.filter(d => d.status === 'normal').length || 0;
  const abnormalCount = (analysis.details?.length || 0) - normalCount;

  return (
    <div className="space-y-10">
      {/* Stats Dashboard */}
      <div className="grid grid-cols-3 gap-6">
        {[
          { label: 'Total Markers', value: analysis.details?.length || 0, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', icon: Beaker, shadow: 'shadow-blue-500/10' },
          { label: 'Optimal Level', value: normalCount, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: CircleCheck, shadow: 'shadow-emerald-500/10' },
          { label: 'Requires Attention', value: abnormalCount, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20', icon: TriangleAlert, shadow: 'shadow-rose-500/10' },
        ].map(({ label, value, color, bg, icon: Icon, shadow }) => (
          <div
            key={label}
            className={`relative group rounded-[2rem] border p-7 text-center ${bg} ${shadow} backdrop-blur-3xl transition-all duration-500 hover:scale-[1.03] hover:-translate-y-1 overflow-hidden flex flex-col items-center justify-center min-h-[140px]`}
          >
            <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
              <Icon size={96} />
            </div>
            <div className={`text-4xl font-black ${color} mb-2 drop-shadow-sm leading-none`}>{value}</div>
            <div className="text-[10px] text-white/50 font-black uppercase tracking-[0.25em] leading-tight max-w-[100px]">{label}</div>
          </div>
        ))}
      </div>

      {/* Flagged Markers (Prioritized) */}
      {abnormalCount > 0 && (
        <div className="space-y-6">
          <h3 className="text-[11px] font-black text-rose-400/80 uppercase tracking-[0.3em] flex items-center gap-3 px-2 leading-none">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
            Priority Biomarkers
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {analysis.details.filter(d => d.status !== 'normal').map((detail, i) => {
              const cfg = STATUS_CONFIG[detail.status];
              const Icon = cfg.icon;
              return (
                <motion.div 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  key={i} 
                  className={`group relative border rounded-[1.5rem] p-6 ${cfg.card} ${cfg.glow} transition-all duration-300 hover:bg-white/[0.05] hover:border-white/20`}
                >
                  <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-5 flex-1 min-w-0">
                      <div className={`p-4 rounded-2xl bg-black/40 ${cfg.iconColor} border border-white/10 shrink-0 shadow-inner`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-black text-white text-lg block leading-none truncate mb-2">{detail.name}</span>
                        <div className="flex items-center gap-3 leading-none">
                          <span className={`text-[10px] font-black px-2.5 py-1.5 rounded-lg uppercase tracking-wider ${cfg.badge}`}>{detail.status}</span>
                          <span className="text-xs text-white/30 font-bold tracking-wide truncate bg-white/5 px-2 py-1 rounded-md">Reference: {detail.reference_range}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-2xl font-black text-white leading-none tabular-nums">
                        {detail.value} <span className="text-sm text-white/20 font-black ml-1 uppercase">{detail.unit}</span>
                      </div>
                    </div>
                  </div>
                  {detail.note && (
                    <div className="mt-5 pt-5 border-t border-white/5 flex gap-4">
                      <div className="p-1 rounded bg-white/5 h-fit"><Info className="w-3.5 h-3.5 text-white/30 shrink-0" /></div>
                      <p className="text-sm text-white/50 leading-relaxed flex-1 font-medium italic">{detail.note}</p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Normal Markers */}
      {normalCount > 0 && (
        <div className="space-y-5">
          <h3 className="text-[11px] font-black text-white/20 uppercase tracking-[0.3em] flex items-center gap-3 px-2 leading-none">
            <CircleCheck className="w-3.5 h-3.5" />
            Optimal Results
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {analysis.details.filter(d => d.status === 'normal').map((detail, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 flex items-center justify-between group hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300 min-h-[64px]">
                <div className="flex items-center gap-4 min-w-0 mr-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 group-hover:scale-125 group-hover:bg-emerald-500/40 transition-all shrink-0" />
                  <span className="text-sm font-bold text-white/70 truncate leading-none group-hover:text-white transition-colors">{detail.name}</span>
                </div>
                <div className="text-sm font-black text-white/30 shrink-0 leading-none tabular-nums">
                  {detail.value} <span className="text-[10px] font-black ml-1 text-white/10">{detail.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Plan & Nutrition */}
      <div className="grid grid-cols-1 gap-10">
        {/* Recommendations */}
        {analysis.suggestions?.length > 0 && (
          <div className="relative overflow-hidden bg-emerald-500/[0.03] border border-emerald-500/20 rounded-[2.5rem] p-10">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Heart size={100} className="text-emerald-400" />
            </div>
            <h3 className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-3 leading-none relative z-10">
              <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/20"><Heart className="w-4 h-4" /></div>
              Clinical Health Protocol
            </h3>
            <div className="grid grid-cols-1 gap-4 relative z-10">
              {analysis.suggestions.map((s, i) => (
                <div key={i} className="text-sm text-white/80 flex items-start gap-5 bg-white/[0.03] p-5 rounded-[1.5rem] border border-white/5 transition-all hover:bg-white/[0.06] hover:translate-x-1 group">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <CircleCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="font-semibold leading-relaxed flex-1 mt-1">{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Grocery List */}
        {(analysis.grocery_list?.veg?.length > 0 || analysis.grocery_list?.non_veg?.length > 0) ? (
          <div className="space-y-8">
            {/* Vegetarian Section */}
            {analysis.grocery_list.veg?.length > 0 && (
              <div className="relative overflow-hidden bg-emerald-500/[0.03] border border-emerald-500/10 rounded-[2.5rem] p-10">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <ShoppingBag size={100} className="text-emerald-400" />
                </div>
                <h3 className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-3 leading-none relative z-10">
                  <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/20"><ShoppingBag className="w-4 h-4" /></div>
                  Vegetarian Nutrition List
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
                  {analysis.grocery_list.veg.map((item, i) => (
                    <div key={i} className="flex items-center gap-4 text-xs text-white/70 p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-emerald-500/40 hover:bg-white/[0.06] transition-all group min-h-[64px]">
                      <div className="w-2 h-2 rounded-full bg-emerald-400/20 border border-emerald-400/40 group-hover:scale-150 group-hover:bg-emerald-400 transition-all shrink-0" />
                      <span className="font-bold leading-tight flex-1">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Non-Vegetarian Section */}
            {analysis.grocery_list.non_veg?.length > 0 && (
              <div className="relative overflow-hidden bg-rose-500/[0.03] border border-rose-500/10 rounded-[2.5rem] p-10">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <ShoppingBag size={100} className="text-rose-400" />
                </div>
                <h3 className="text-[11px] font-black text-rose-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-3 leading-none relative z-10">
                  <div className="p-2 rounded-xl bg-rose-500/20 border border-rose-500/20"><ShoppingBag className="w-4 h-4" /></div>
                  Non-Vegetarian Nutrition List
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
                  {analysis.grocery_list.non_veg.map((item, i) => (
                    <div key={i} className="flex items-center gap-4 text-xs text-white/70 p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-rose-500/40 hover:bg-white/[0.06] transition-all group min-h-[64px]">
                      <div className="w-2 h-2 rounded-full bg-rose-400/20 border border-rose-400/40 group-hover:scale-150 group-hover:bg-rose-400 transition-all shrink-0" />
                      <span className="font-bold leading-tight flex-1">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-10 border border-dashed border-white/10 rounded-[2.5rem] text-center">
            <p className="text-xs text-white/30 font-bold uppercase tracking-widest">Compiling Nutritional Recommendations...</p>
          </div>
        )}
      </div>

      <div className="pt-12 border-t border-white/5">
        <div className="max-w-2xl mx-auto px-6 py-4 rounded-2xl bg-white/[0.01] border border-white/5">
          <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest text-center mb-2">Disclaimer</p>
          <p className="text-[10px] text-white/20 italic text-center leading-relaxed">
            {analysis.disclaimer}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [mode, setMode] = useState('manual');
  const [results, setResults] = useState([]);
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (analysis) {
      console.log("Analysis Data Received:", analysis);
    }
  }, [analysis]);

  const addAllTestsInCategory = (tests) => {
    const newResults = [...results];
    tests.forEach(test => {
      if (!newResults.some(r => r.name === test.name)) {
        newResults.push({ name: test.name, unit: test.unit, value: '' });
      }
    });
    setResults(newResults);
  };

  const updateResult = (index, value) => {
    const updated = [...results];
    updated[index].value = value;
    setResults(updated);
  };

  const removeResult = (index) => setResults(results.filter((_, i) => i !== index));
  const clearResults = () => setResults([]);

  const handleFileChange = (file) => {
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];
    if (file && allowedTypes.includes(file.type)) {
      setSelectedFile(file);
      setError(null);
    } else if (file) {
      setError('Please upload a valid PDF or Image file (PNG, JPG).');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFileChange(e.dataTransfer.files[0]);
  };

  const handleAnalyzeManual = async () => {
    if (!age || !gender) {
      setError('Please enter both age and gender.');
      return;
    }

    if (parseInt(age) <= 0) {
      setError('Please enter a valid age greater than 0.');
      return;
    }

    const resultsData = results
      .filter(r => r.value !== '' && r.value !== null)
      .map(r => ({ name: r.name, value: parseFloat(r.value), unit: r.unit }));

    if (resultsData.length === 0) {
      setError('Please add at least one test value to analyze.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const patientInfo = { age: parseInt(age), gender: gender };
      const response = await analyzeAPI.analyze(resultsData, patientInfo);
      setAnalysis(response.data);
    } catch (err) {
      setError(getErrorMessage(err, 'Analysis failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeFile = async () => {
    if (!selectedFile) {
      setError('No file selected.');
      return;
    }
    if (!age || !gender) {
      setError('Please enter both age and gender.');
      return;
    }
    if (parseInt(age) <= 0) {
      setError('Please enter a valid age greater than 0.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const formData = new FormData();
      formData.append('file', selectedFile);
      const response = await analyzeAPI.analyzeFile(formData, parseInt(age), gender);
      setAnalysis(response.data);
    } catch (err) {
      setError(getErrorMessage(err, 'Analysis failed. Check file format.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[1600px] mx-auto space-y-12 pb-20 px-4 sm:px-10"
    >
      {/* ── Enhanced Hero Section ── */}
      <section className="relative group w-full">
        <div className="absolute -inset-1 bg-gradient-to-r from-violet-600/20 via-fuchsia-600/20 to-pink-600/20 rounded-[2.5rem] blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>
        <div className={`${cardClass} relative px-8 py-14 sm:px-20 sm:py-20 text-center border-white/[0.12]`}>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 mb-8"
          >
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span className="text-[11px] font-black text-violet-300 uppercase tracking-[0.2em] leading-none">Next-Gen Biomarker Analysis</span>
          </motion.div>
          <h1 className="text-2xl sm:text-[22px] font-black text-white mb-6 tracking-tight leading-tight">
            Understand Your <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">Bloodwork</span> Like Never Before
          </h1>
          <p className="text-base sm:text-lg text-white/40 mb-12 max-w-none mx-auto leading-relaxed font-medium whitespace-nowrap">
            AI-powered clinical interpretations, personalized nutrition plans, and biomarker tracking in one unified experience.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            {Object.entries(TEST_CATEGORIES).map(([category, tests], i) => (
              <motion.button
                key={category}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => addAllTestsInCategory(tests)}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-sm font-bold text-white/80 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all flex items-center gap-3 backdrop-blur-md shadow-xl h-[54px] min-w-[140px] justify-center"
              >
                <span className="leading-none">{category}</span>
                <span className="text-[10px] bg-violet-500/20 text-violet-300 px-2.5 py-1 rounded-lg font-black border border-violet-500/20 leading-none">{tests.length}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
        {/* ── Unified Input Column (LHS) ── */}
        <div className="lg:col-span-5 space-y-8 flex flex-col min-h-[800px]">
          <div className={`${cardClass} p-2 flex gap-2 border-white/[0.08]`}>
            {['manual', 'pdf'].map((id) => (
              <button
                key={id}
                onClick={() => { setMode(id); setError(null); }}
                className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl text-sm font-black transition-all duration-300 h-[56px] leading-none ${
                  mode === id 
                  ? 'bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600 text-white shadow-[0_10px_20px_rgba(139,92,246,0.3)] scale-[1.02]' 
                  : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                }`}
              >
                {id === 'manual' ? <Clipboard className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                {id === 'manual' ? 'Smart Entry' : 'Fast Upload'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {mode === 'manual' ? (
              <motion.div 
                key="manual-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`${cardClass} p-8 sm:p-12 space-y-10 border-white/[0.08] flex-1 flex flex-col`}
              >
                <div className="space-y-5">
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] flex items-center gap-2 leading-none"><User className="w-4 h-4 text-violet-400" /> Patient Profile</p>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="relative group">
                      <input type="number" min="1" value={age} onChange={e => setAge(e.target.value)} placeholder="Age" className={inputClass} />
                    </div>
                    <div className="relative group">
                      <select value={gender} onChange={e => setGender(e.target.value)} className={`${inputClass} appearance-none cursor-pointer pr-10`}>
                        <option value="" className="bg-slate-900">Gender</option>
                        <option value="Male" className="bg-slate-900">Male</option>
                        <option value="Female" className="bg-slate-900">Female</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="space-y-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-center px-1 leading-none">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] flex items-center gap-2"><Beaker className="w-4 h-4 text-fuchsia-400" /> Biomarkers</p>
                    {results.length > 0 && (
                      <button onClick={clearResults} className="text-[10px] text-rose-400 hover:text-rose-300 font-black uppercase tracking-widest transition-colors flex items-center gap-1 leading-none">
                        <X className="w-3 h-3" /> Clear All
                      </button>
                    )}
                  </div>
                  
                  {results.length === 0 ? (
                    <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[2rem] bg-white/[0.01] group hover:bg-white/[0.03] transition-all cursor-default flex-1 flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <Plus className="w-6 h-6 text-white/20" />
                      </div>
                      <p className="text-sm font-bold text-white/20 max-w-[180px] mx-auto leading-relaxed">Select a panel from the hero section to start adding data</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar flex-1">
                      {results.map((result, index) => (
                        <motion.div 
                          layout
                          initial={{ scale: 0.95, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          key={result.name} 
                          className="group relative bg-white/5 p-5 rounded-2xl border border-white/10 hover:border-white/20 hover:bg-white/[0.08] transition-all"
                        >
                          <div className="flex justify-between items-center mb-3 px-1 leading-none">
                            <span className="text-xs font-black text-white/80 truncate flex-1 mr-2">{result.name}</span>
                            <span className="text-[10px] font-bold text-white/30 uppercase tracking-tighter bg-white/5 px-2 py-0.5 rounded-md shrink-0">{result.unit}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="relative flex-1">
                              <input 
                                type="number" 
                                value={result.value} 
                                onChange={e => updateResult(index, e.target.value)} 
                                placeholder="0.00" 
                                className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2.5 text-sm font-black text-violet-300 placeholder-white/10 focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition-all h-[44px]" 
                              />
                            </div>
                            <button 
                              onClick={() => removeResult(index)} 
                              className="w-11 h-11 rounded-xl flex items-center justify-center text-white/10 hover:text-rose-400 hover:bg-rose-500/10 transition-all shrink-0 border border-transparent hover:border-rose-500/20"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex gap-3 items-start"
                  >
                    <CircleAlert className="w-5 h-5 text-rose-400 shrink-0" />
                    <p className="text-xs text-rose-300 font-medium leading-relaxed flex-1">{error}</p>
                  </motion.div>
                )}

                <button 
                  onClick={handleAnalyzeManual} 
                  disabled={loading || results.length === 0} 
                  className="group relative w-full py-5 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600 text-white font-black rounded-2xl disabled:opacity-20 transition-all overflow-hidden shadow-[0_15px_30px_rgba(139,92,246,0.3)] hover:shadow-[0_20px_40px_rgba(139,92,246,0.4)] hover:-translate-y-1 active:translate-y-0 h-[64px]"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  <span className="relative flex items-center justify-center gap-3 text-base leading-none">
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        Analyzing Intelligence...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        Generate Clinical Report
                      </>
                    )}
                  </span>
                </button>
              </motion.div>
            ) : (
              <motion.div 
                key="pdf-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`${cardClass} p-10 space-y-8 text-center border-white/[0.08] flex-1 flex flex-col`}
              >
                <div className="space-y-5 text-left">
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] flex items-center gap-2 leading-none"><User className="w-4 h-4 text-violet-400" /> Patient Profile</p>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="relative group">
                      <input type="number" min="1" value={age} onChange={e => setAge(e.target.value)} placeholder="Age" className={inputClass} />
                    </div>
                    <div className="relative group">
                      <select value={gender} onChange={e => setGender(e.target.value)} className={`${inputClass} appearance-none cursor-pointer pr-10`}>
                        <option value="" className="bg-slate-900">Gender</option>
                        <option value="Male" className="bg-slate-900">Male</option>
                        <option value="Female" className="bg-slate-900">Female</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`group relative border-2 border-dashed rounded-[2.5rem] p-16 transition-all duration-500 cursor-pointer overflow-hidden flex-1 flex flex-col items-center justify-center ${
                    dragOver ? 'border-violet-500 bg-violet-500/10 scale-[0.98]' : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/20'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-fuchsia-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <input ref={fileInputRef} type="file" accept="application/pdf,image/png,image/jpeg,image/webp" className="hidden" onChange={e => handleFileChange(e.target.files[0])} />
                  
                  <div className="relative z-10">
                    <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-xl border border-white/10">
                      {selectedFile ? (selectedFile.type.startsWith('image/') ? <Activity className="w-10 h-10 text-violet-400" /> : <FileText className="w-10 h-10 text-violet-400" />) : <Upload className="w-10 h-10 text-white/20" />}
                    </div>
                    <h3 className="text-lg font-black text-white mb-2 leading-none">{selectedFile ? selectedFile.name : 'Report Image or PDF'}</h3>
                    <p className="text-sm font-bold text-white/30 max-w-[200px] mx-auto leading-relaxed">
                      {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready to process` : 'Drag and drop your report or click to browse'}
                    </p>
                  </div>
                </div>

                <button 
                  onClick={handleAnalyzeFile} 
                  disabled={loading || !selectedFile} 
                  className="group relative w-full py-5 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600 text-white font-black rounded-2xl disabled:opacity-20 transition-all overflow-hidden shadow-[0_15px_30px_rgba(139,92,246,0.3)] h-[64px]"
                >
                  <span className="relative flex items-center justify-center gap-3 leading-none">
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        Analyzing Document...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Start AI Analysis
                      </>
                    )}
                  </span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Dynamic Results Column (RHS) ── */}
        <div className="lg:col-span-7 flex flex-col min-h-[800px]">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loading-state"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`${cardClass} p-20 flex flex-col items-center justify-center gap-8 flex-1 relative overflow-hidden min-h-[800px]`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-transparent animate-pulse" />
                <div className="relative">
                  <div className="w-32 h-32 border-[3px] border-white/5 border-t-violet-500 rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 border-[3px] border-white/5 border-b-fuchsia-500 rounded-full animate-[spin_1.5s_linear_infinite_reverse]" />
                  </div>
                  <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-violet-400 animate-bounce" />
                </div>
                <div className="text-center space-y-3 relative z-10">
                  <h3 className="text-2xl font-black text-white tracking-tight leading-none">Synthesizing Bio-Data</h3>
                  <p className="text-sm text-white/30 font-bold max-w-xs mx-auto leading-relaxed">Gemini is correlating your markers with clinical literature to provide personalized insights...</p>
                </div>
              </motion.div>
            ) : analysis ? (
              <motion.div 
                key="results-state"
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className={`${cardClass} p-8 sm:p-12 border-white/[0.12] shadow-violet-500/5 flex-1`}
              >
                <div className="flex justify-between items-center mb-10 pb-6 border-b border-white/5 leading-none">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/20 shrink-0">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="font-black text-white text-xl tracking-tight leading-none">Clinical Analysis Report</h2>
                      <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em] mt-2.5 leading-none">Report ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setAnalysis(null)} 
                    className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20 hover:text-rose-400 hover:bg-rose-500/10 transition-all shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <AnalysisResults analysis={analysis} />
              </motion.div>
            ) : (
              <motion.div 
                key="empty-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`${cardClass} p-20 flex flex-col items-center justify-center gap-8 flex-1 border-dashed border-white/[0.06] bg-transparent backdrop-blur-none min-h-[800px]`}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-violet-500/20 blur-3xl rounded-full" />
                  <div className="w-24 h-24 rounded-[2rem] bg-white/[0.03] border border-white/[0.06] flex items-center justify-center relative z-10">
                    <Activity className="w-10 h-10 text-white/10" />
                  </div>
                  <Plus className="absolute -bottom-2 -right-2 w-8 h-8 text-white/5" />
                </div>
                <div className="text-center space-y-3 relative z-10">
                  <h3 className="text-lg font-black text-white/40 tracking-tight leading-none">No Data Analyzed</h3>
                  <p className="text-sm text-white/20 font-bold max-w-[240px] mx-auto leading-relaxed">Your personalized health report will appear here once you process your bloodwork.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.02] border border-white/[0.05] relative z-10">
                  <Sparkles className="w-3.5 h-3.5 text-violet-400/30" />
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-widest leading-none">Awaiting Input Signal</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
