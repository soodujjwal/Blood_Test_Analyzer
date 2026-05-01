import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeAPI } from '../services/api';
import {
  Trash2, Calendar, Clock, ChevronRight, CircleCheck,
  Sparkles, ShoppingBag, ChevronDown, ChevronUp,
  ClipboardList, X, Activity, Beaker, TriangleAlert, CircleAlert, Info,
  Search, Filter
} from 'lucide-react';

const STATUS_CONFIG = {
  normal: {
    badge: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    icon: CircleCheck,
    iconColor: 'text-emerald-400',
    card: 'bg-emerald-500/[0.02] border-emerald-500/10',
  },
  low: {
    badge: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    icon: TriangleAlert,
    iconColor: 'text-amber-400',
    card: 'bg-amber-500/[0.02] border-amber-500/10',
  },
  high: {
    badge: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    icon: CircleAlert,
    iconColor: 'text-rose-400',
    card: 'bg-rose-500/[0.02] border-rose-500/10',
  },
};

const cardClass =
  'bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] rounded-[2rem] shadow-2xl';

export default function History() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await analyzeAPI.getHistory();
      setAnalyses(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    try {
      await analyzeAPI.deleteAnalysis(selected.id);
      setAnalyses(analyses.filter(a => a.id !== selected.id));
      setSelected(null);
      setConfirmDelete(false);
    } catch (err) {
      setError(err.response?.data?.detail || 'Delete failed');
    }
  };

  const filteredAnalyses = analyses.filter(a => {
    const date = new Date(a.created_at).toLocaleDateString().toLowerCase();
    const tests = (a.analysis.details || []).map(d => d.name.toLowerCase()).join(' ');
    return date.includes(searchQuery.toLowerCase()) || tests.includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-6"
        >
          <div className="relative">
            <div className="w-16 h-16 border-[3px] border-white/5 border-t-violet-500 rounded-full animate-spin" />
            <Activity className="absolute inset-0 m-auto w-6 h-6 text-violet-400 animate-pulse" />
          </div>
          <p className="text-sm text-white/40 font-black uppercase tracking-[0.2em]">Retrieving Archive...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Sidebar - History List */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="lg:col-span-4 space-y-6"
      >
        <div className={`${cardClass} p-6 flex flex-col gap-6 border-white/[0.08]`}>
          <div className="flex items-center justify-between px-2">
            <h2 className="font-black text-white text-lg flex items-center gap-3">
              <div className="p-2 rounded-xl bg-violet-500/20 border border-violet-500/20">
                <ClipboardList className="w-5 h-5 text-violet-400" />
              </div>
              Archive
            </h2>
            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-lg border border-white/10">
              {analyses.length} Reports
            </span>
          </div>

          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-violet-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition-all backdrop-blur-md"
            />
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredAnalyses.length === 0 ? (
              <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.01]">
                <Activity className="w-10 h-10 text-white/5 mx-auto mb-4" />
                <p className="text-sm font-bold text-white/20 uppercase tracking-widest">No reports found</p>
              </div>
            ) : (
              filteredAnalyses.map((analysis, idx) => {
                const details = analysis.analysis.details || [];
                const abnormal = details.filter(d => d.status !== 'normal').length;
                const isSelected = selected?.id === analysis.id;
                return (
                  <motion.button
                    key={analysis.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => { setSelected(analysis); setConfirmDelete(false); }}
                    className={`group w-full text-left p-5 rounded-2xl transition-all duration-300 border ${
                      isSelected 
                      ? 'bg-gradient-to-br from-violet-600/10 to-fuchsia-600/10 border-violet-500/40 shadow-lg scale-[1.02]' 
                      : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/20'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-lg transition-colors ${isSelected ? 'bg-violet-500/20 text-violet-300' : 'bg-white/5 text-white/20 group-hover:text-white/40'}`}>
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-white/30 uppercase tracking-widest leading-none mb-1">Created on</p>
                          <p className="text-sm font-bold text-white">
                            {new Date(analysis.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 transition-all duration-300 ${isSelected ? 'text-violet-400 translate-x-1' : 'text-white/10 group-hover:text-white/30'}`} />
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black text-white/40 uppercase tracking-wider">
                        {details.length} Markers
                      </div>
                      {abnormal > 0 ? (
                        <div className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[10px] font-black text-rose-400 uppercase tracking-wider">
                          {abnormal} Flagged
                        </div>
                      ) : (
                        <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-400 uppercase tracking-wider">
                          Optimal
                        </div>
                      )}
                    </div>
                  </motion.button>
                );
              })
            )}
          </div>
        </div>
      </motion.div>

      {/* Main Panel - Report Details */}
      <div className="lg:col-span-8">
        <AnimatePresence mode="wait">
          {selected ? (
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`${cardClass} p-8 sm:p-12 border-white/[0.12]`}
            >
              {/* Report Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12 pb-8 border-b border-white/5">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-xl shadow-violet-500/20">
                    <Activity className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="font-black text-white text-2xl tracking-tight">Clinical Report Analysis</h2>
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-white/30 uppercase tracking-widest">
                        <Clock className="w-3 h-3" />
                        {new Date(selected.created_at).toLocaleString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                          hour: 'numeric', minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <AnimatePresence mode="wait">
                    {confirmDelete ? (
                      <motion.div 
                        key="confirm"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex items-center gap-2 w-full"
                      >
                        <button
                          onClick={() => setConfirmDelete(false)}
                          className="flex-1 sm:flex-none px-5 py-2.5 border border-white/10 rounded-xl text-xs font-black text-white/40 hover:text-white transition-colors uppercase tracking-widest"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleDelete}
                          className="flex-1 sm:flex-none px-5 py-2.5 bg-rose-500 text-white rounded-xl text-xs font-black hover:bg-rose-600 transition-colors uppercase tracking-widest shadow-lg shadow-rose-500/20"
                        >
                          Confirm
                        </button>
                      </motion.div>
                    ) : (
                      <motion.button
                        key="trigger"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        onClick={() => setConfirmDelete(true)}
                        className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-black text-white/40 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all uppercase tracking-widest"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Report
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Report Body */}
              <div className="space-y-10">
                {/* Stats Summary */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Markers', value: selected.analysis.details?.length || 0, color: 'text-blue-400', bg: 'bg-blue-500/10', icon: Beaker },
                    { label: 'Optimal', value: selected.analysis.details?.filter(d => d.status === 'normal').length || 0, color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: CircleCheck },
                    { label: 'Flagged', value: selected.analysis.details?.filter(d => d.status !== 'normal').length || 0, color: 'text-rose-400', bg: 'bg-rose-500/10', icon: TriangleAlert },
                  ].map(({ label, value, color, bg, icon: Icon }) => (
                    <div key={label} className={`rounded-2xl border border-white/5 p-5 text-center ${bg} backdrop-blur-xl`}>
                      <div className={`text-2xl font-black ${color} mb-1`}>{value}</div>
                      <div className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em]">{label}</div>
                    </div>
                  ))}
                </div>

                {/* Markers Grid */}
                <div className="space-y-5">
                  <h3 className="text-[10px] font-black text-white/20 uppercase tracking-widest flex items-center gap-2 px-1">
                    <Beaker className="w-3 h-3" /> Biomarker details
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {selected.analysis.details?.map((detail, i) => {
                      const cfg = STATUS_CONFIG[detail.status] || STATUS_CONFIG.normal;
                      const Icon = cfg.icon;
                      return (
                        <div key={i} className={`group border rounded-2xl p-5 ${cfg.card} transition-all hover:bg-white/[0.04]`}>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className={`p-3 rounded-xl bg-black/40 ${cfg.iconColor} border border-white/5`}><Icon className="w-5 h-5" /></div>
                              <div>
                                <span className="font-black text-white text-base block">{detail.name}</span>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${cfg.badge}`}>{detail.status}</span>
                                  <span className="text-[11px] text-white/40 font-medium tracking-wide">Ref: {detail.reference_range}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-black text-white">{detail.value} <span className="text-xs text-white/30 font-bold">{detail.unit}</span></div>
                            </div>
                          </div>
                          {detail.note && (
                            <div className="mt-4 pt-4 border-t border-white/5 flex gap-3">
                              <Info className="w-4 h-4 text-white/20 shrink-0 mt-0.5" />
                              <p className="text-xs text-white/50 leading-relaxed">{detail.note}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Nutrition & Recipes */}
                <div className="grid grid-cols-1 gap-8 pt-6">
                  {(selected.analysis.grocery_list?.veg?.length > 0 || selected.analysis.grocery_list?.non_veg?.length > 0) ? (
                    <div className="space-y-6">
                      {/* Veg Section */}
                      {selected.analysis.grocery_list.veg?.length > 0 && (
                        <div className="bg-emerald-500/[0.03] border border-emerald-500/10 rounded-[2rem] p-7">
                          <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <ShoppingBag className="w-3 h-3" /> Vegetarian Nutrition
                          </h3>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {selected.analysis.grocery_list.veg.map((item, i) => (
                              <div key={i} className="flex items-center gap-3 text-xs text-white/70 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-emerald-500/30 transition-all group">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/40 group-hover:bg-emerald-400 transition-all" />
                                <span className="truncate">{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Non-Veg Section */}
                      {selected.analysis.grocery_list.non_veg?.length > 0 && (
                        <div className="bg-rose-500/[0.03] border border-rose-500/10 rounded-[2rem] p-7">
                          <h3 className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <ShoppingBag className="w-3 h-3" /> Non-Vegetarian Nutrition
                          </h3>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {selected.analysis.grocery_list.non_veg.map((item, i) => (
                              <div key={i} className="flex items-center gap-3 text-xs text-white/70 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-rose-500/30 transition-all group">
                                <div className="w-1.5 h-1.5 rounded-full bg-rose-400/40 group-hover:bg-rose-400 transition-all" />
                                <span className="truncate">{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : Array.isArray(selected.analysis.grocery_list) && selected.analysis.grocery_list.length > 0 ? (
                    <div className="bg-blue-500/[0.03] border border-blue-500/10 rounded-[2rem] p-7">
                      <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <ShoppingBag className="w-3 h-3" /> Nutrition Protocol
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {selected.analysis.grocery_list.map((item, i) => (
                          <div key={i} className="flex items-center gap-3 text-xs text-white/70 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-blue-500/30 transition-all group">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400/40 group-hover:bg-blue-400 transition-all" />
                            <span className="truncate">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>

                {selected.analysis.disclaimer && (
                  <div className="pt-10 border-t border-white/5">
                    <p className="text-[10px] text-white/20 italic text-center leading-relaxed">
                      {selected.analysis.disclaimer}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`${cardClass} p-20 flex flex-col items-center justify-center gap-8 min-h-[700px] border-dashed border-white/[0.06] bg-transparent backdrop-blur-none`}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-violet-500/10 blur-3xl rounded-full" />
                <div className="w-24 h-24 rounded-[2rem] bg-white/[0.03] border border-white/[0.06] flex items-center justify-center relative z-10">
                  <ClipboardList className="w-10 h-10 text-white/10" />
                </div>
              </div>
              <div className="text-center space-y-3">
                <h3 className="text-lg font-black text-white/40 tracking-tight">No Report Selected</h3>
                <p className="text-sm text-white/20 font-bold max-w-[240px] mx-auto leading-relaxed">Choose a record from the archive to view the clinical breakdown.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
