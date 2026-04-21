import React, { useState, useEffect } from 'react';
import { analyzeAPI } from '../services/api';
import {
  Trash2, Calendar, Clock, ChevronRight, CheckCircle,
  Sparkles, ShoppingBag, ChefHat, ChevronDown, ChevronUp,
  ClipboardList, X,
} from 'lucide-react';

const STATUS_CONFIG = {
  normal: { badge: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' },
  low: { badge: 'bg-amber-500/15 text-amber-400 border border-amber-500/30' },
  high: { badge: 'bg-rose-500/15 text-rose-400 border border-rose-500/30' },
};

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
            <p className="text-xs font-semibold text-zinc-600 uppercase tracking-widest mb-1.5">Ingredients</p>
            <ul className="space-y-1">
              {recipe.ingredients.map((ing, i) => (
                <li key={i} className="text-sm text-zinc-400 flex items-start gap-1.5">
                  <span className="text-violet-500">•</span>{ing}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-600 uppercase tracking-widest mb-1.5">Instructions</p>
            <ol className="space-y-1">
              {recipe.instructions.map((step, i) => (
                <li key={i} className="text-sm text-zinc-400 flex items-start gap-1.5">
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

export default function History() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-[3px] border-violet-800 border-t-violet-400 animate-spin" />
          <p className="text-sm text-zinc-600">Loading history…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
      {/* List panel */}
      <div className={`${cardClass} overflow-hidden`}>
        <div className="p-4 border-b border-white/[0.06]">
          <h2 className="font-bold text-zinc-100 flex items-center gap-2 text-sm">
            <ClipboardList className="w-4 h-4 text-violet-400" />
            Analysis History
          </h2>
          {analyses.length > 0 && (
            <p className="text-xs text-zinc-600 mt-0.5">{analyses.length} report{analyses.length !== 1 ? 's' : ''}</p>
          )}
        </div>

        {error && (
          <div className="m-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs">{error}</div>
        )}

        {analyses.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 bg-white/[0.04] border border-white/[0.08] rounded-2xl flex items-center justify-center mx-auto mb-3">
              <ClipboardList className="w-5 h-5 text-zinc-600" />
            </div>
            <p className="font-medium text-zinc-500 text-sm">No analyses yet</p>
            <p className="text-zinc-700 text-xs mt-1">Your reports will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {analyses.map((analysis) => {
              const details = analysis.analysis.details || [];
              const abnormal = details.filter(d => d.status !== 'normal').length;
              const isSelected = selected?.id === analysis.id;
              return (
                <button
                  key={analysis.id}
                  onClick={() => { setSelected(analysis); setConfirmDelete(false); }}
                  className={`w-full text-left px-4 py-3.5 flex items-center justify-between transition-all ${
                    isSelected ? 'bg-violet-500/10' : 'hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-600 mb-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(analysis.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-zinc-300">
                        {details.length} test{details.length !== 1 ? 's' : ''}
                      </span>
                      {abnormal > 0 ? (
                        <span className="text-xs px-1.5 py-0.5 bg-rose-500/15 text-rose-400 rounded-full border border-rose-500/30 font-medium">
                          {abnormal} flagged
                        </span>
                      ) : details.length > 0 ? (
                        <span className="text-xs px-1.5 py-0.5 bg-emerald-500/15 text-emerald-400 rounded-full border border-emerald-500/30 font-medium">
                          All normal
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 shrink-0 transition-colors ${isSelected ? 'text-violet-400' : 'text-zinc-700'}`} />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail panel */}
      {selected ? (
        <div className={`${cardClass} overflow-hidden`}>
          <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
            <div>
              <h3 className="font-bold text-zinc-100 text-sm">Report Details</h3>
              <p className="text-xs text-zinc-600 mt-0.5 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(selected.created_at).toLocaleString('en-US', {
                  month: 'long', day: 'numeric', year: 'numeric',
                  hour: 'numeric', minute: '2-digit',
                })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {confirmDelete ? (
                <>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="text-xs px-3 py-1.5 border border-white/10 rounded-full text-zinc-500 hover:text-zinc-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="text-xs px-3 py-1.5 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition font-medium"
                  >
                    Confirm Delete
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 border border-white/[0.06] rounded-full transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              )}
            </div>
          </div>

          <div className="p-4 overflow-y-auto max-h-[calc(100vh-220px)] space-y-5">
            {/* Summary */}
            {selected.analysis.summary?.length > 0 && (
              <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-4">
                <h4 className="text-xs font-semibold text-violet-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" /> Summary
                </h4>
                {selected.analysis.summary.map((s, i) => (
                  <p key={i} className="text-sm text-zinc-300 leading-relaxed">{s}</p>
                ))}
              </div>
            )}

            {/* Details */}
            {selected.analysis.details?.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-zinc-600 uppercase tracking-widest mb-3">Test Results</h4>
                <div className="space-y-2">
                  {selected.analysis.details.map((detail, i) => {
                    const cfg = STATUS_CONFIG[detail.status] || STATUS_CONFIG.normal;
                    return (
                      <div key={i} className="flex items-center justify-between p-3 bg-white/[0.03] rounded-xl border border-white/[0.06]">
                        <div>
                          <p className="font-medium text-zinc-200 text-sm">{detail.name}</p>
                          <p className="text-xs text-zinc-600 mt-0.5">{detail.value} {detail.unit} · Ref: {detail.reference_range}</p>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ml-2 ${cfg.badge}`}>
                          {detail.status.toUpperCase()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {selected.analysis.suggestions?.length > 0 && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5" /> Suggestions
                </h4>
                <ul className="space-y-1">
                  {selected.analysis.suggestions.map((s, i) => (
                    <li key={i} className="text-sm text-zinc-300 flex items-start gap-1.5">
                      <span className="text-emerald-500 shrink-0">→</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Grocery list */}
            {selected.analysis.grocery_list?.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-zinc-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <ShoppingBag className="w-3.5 h-3.5" /> Shopping List
                </h4>
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {selected.analysis.grocery_list.map((item, i) => (
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
            {selected.analysis.recipes?.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-zinc-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <ChefHat className="w-3.5 h-3.5" /> Recipes
                </h4>
                <div className="space-y-2">
                  {selected.analysis.recipes.map((recipe, i) => (
                    <RecipeCard key={i} recipe={recipe} />
                  ))}
                </div>
              </div>
            )}

            {/* Disclaimer */}
            {selected.analysis.disclaimer && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-500/80 leading-relaxed">
                ⚠ {selected.analysis.disclaimer}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className={`${cardClass} flex items-center justify-center text-center p-12 min-h-[300px]`}>
          <div>
            <div className="w-14 h-14 bg-white/[0.04] border border-white/[0.08] rounded-2xl flex items-center justify-center mx-auto mb-3">
              <ChevronRight className="w-6 h-6 text-zinc-700" />
            </div>
            <p className="font-medium text-zinc-500 text-sm">Select a report to view details</p>
          </div>
        </div>
      )}
    </div>
  );
}
