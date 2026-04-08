import React, { useState, useEffect } from 'react';
import { analyzeAPI } from '../services/api';
import { Trash2, Calendar } from 'lucide-react';

export default function History() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

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

  const deleteAnalysis = async (id) => {
    if (!window.confirm('Are you sure you want to delete this analysis?')) return;
    
    try {
      await analyzeAPI.deleteAnalysis(id);
      setAnalyses(analyses.filter(a => a.id !== id));
      setSelectedAnalysis(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Delete failed');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading history...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* List */}
      <div className="lg:col-span-1 bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Analysis History</h2>
        {error && <div className="text-red-600 text-sm mb-4">{error}</div>}
        
        {analyses.length === 0 ? (
          <p className="text-gray-600">No analyses yet. Start by analyzing your blood test.</p>
        ) : (
          <div className="space-y-2">
            {analyses.map((analysis) => (
              <button
                key={analysis.id}
                onClick={() => setSelectedAnalysis(analysis)}
                className={`w-full text-left p-3 rounded border ${
                  selectedAnalysis?.id === analysis.id
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  {new Date(analysis.created_at).toLocaleDateString()}
                </div>
                <div className="text-sm font-medium text-gray-800 mt-1">
                  {analysis.analysis.details?.length} tests
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Detail */}
      {selectedAnalysis && (
        <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-gray-800">
              {new Date(selectedAnalysis.created_at).toLocaleString()}
            </h3>
            <button
              onClick={() => deleteAnalysis(selectedAnalysis.id)}
              className="p-2 text-red-600 hover:bg-red-100 rounded"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          {/* Summary */}
          {selectedAnalysis.analysis.summary?.length > 0 && (
            <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
              <h4 className="font-semibold text-gray-700 mb-2">Summary</h4>
              {selectedAnalysis.analysis.summary.map((s, i) => (
                <p key={i} className="text-gray-700 text-sm mb-2">{s}</p>
              ))}
            </div>
          )}

          {/* Details */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-700 mb-3">Test Details</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {selectedAnalysis.analysis.details?.map((detail, i) => (
                <div key={i} className="border rounded p-3 bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-gray-800">{detail.name}</span>
                    <span className={`px-2 py-1 rounded text-sm font-semibold ${
                      detail.status === 'normal' ? 'bg-green-100 text-green-800' :
                      detail.status === 'low' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {detail.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {detail.value} {detail.unit}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
