import React, { useState } from 'react';
import { Sparkles, Plus, Trash2, ShoppingBag, UtensilsCrossed, CheckCircle2 } from 'lucide-react';
import { analyzeAPI, getErrorMessage } from '../services/api';

const TEST_CATEGORIES = {
  'Cholesterol Panel': [
    { name: 'Total Cholesterol', unit: 'mg/dL' },
    { name: 'LDL Cholesterol', unit: 'mg/dL' },
    { name: 'HDL Cholesterol', unit: 'mg/dL' },
    { name: 'Triglycerides', unit: 'mg/dL' },
  ],
  'Complete Blood Count': [
    { name: 'Hemoglobin', unit: 'g/dL' },
    { name: 'RBC Count', unit: 'M/µL' },
    { name: 'WBC Count', unit: 'K/µL' },
    { name: 'Platelets', unit: 'K/µL' },
  ],
  'Metabolic Panel': [
    { name: 'Glucose', unit: 'mg/dL' },
    { name: 'Creatinine', unit: 'mg/dL' },
    { name: 'Calcium', unit: 'mg/dL' },
    { name: 'Sodium', unit: 'mEq/L' },
  ],
};

export default function Home() {
  const [results, setResults] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');

  const addResult = (testName, unit) => {
    setResults([...results, { name: testName, unit, value: '' }]);
  };

  const updateResult = (index, value) => {
    const updated = [...results];
    updated[index].value = value;
    setResults(updated);
  };

  const removeResult = (index) => {
    setResults(results.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const resultsData = results
        .filter(r => r.value)
        .map(r => ({
          name: r.name,
          value: parseFloat(r.value),
          unit: r.unit
        }));

      if (resultsData.length === 0) {
        setError('Please enter at least one test result');
        setLoading(false);
        return;
      }

      const patientInfo = age || gender ? { age: age ? parseInt(age) : undefined, gender: gender || undefined } : null;

      const response = await analyzeAPI.analyze(resultsData, patientInfo);
      setAnalysis(response.data);
    } catch (err) {
      setError(getErrorMessage(err, 'Analysis failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Input Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Enter Test Results</h2>

        {/* Patient Info */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-4">Patient Info (Optional)</h3>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="border rounded px-3 py-2"
            />
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="">Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Quick Add */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-700 mb-3">Quick Add</h3>
          <div className="space-y-2">
            {Object.entries(TEST_CATEGORIES).map(([category, tests]) => (
              <div key={category}>
                <p className="text-sm font-medium text-gray-600 mb-2">{category}</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {tests.map((test) => (
                    <button
                      key={test.name}
                      onClick={() => addResult(test.name, test.unit)}
                      className="flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded text-sm hover:bg-indigo-200"
                    >
                      <Plus className="w-4 h-4" /> {test.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Added Results */}
        {results.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700">Added Results ({results.length})</h3>
            {results.map((result, index) => (
              <div key={index} className="flex gap-2 items-end bg-gray-50 p-3 rounded">
                <div className="flex-1">
                  <label className="text-sm text-gray-600">{result.name} ({result.unit})</label>
                  <input
                    type="number"
                    placeholder="Value"
                    value={result.value}
                    onChange={(e) => updateResult(index, e.target.value)}
                    className="w-full border rounded px-3 py-2 mt-1"
                  />
                </div>
                <button
                  onClick={() => removeResult(index)}
                  className="p-2 text-red-600 hover:bg-red-100 rounded"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {error && <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

        <button
          onClick={handleAnalyze}
          disabled={loading || results.length === 0}
          className="w-full mt-6 flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          <Sparkles className="w-5 h-5" />
          {loading ? 'Analyzing...' : 'Analyze Results'}
        </button>
      </div>

      {/* Results Section */}
      {analysis && (
        <div className="bg-white rounded-lg shadow-lg p-6 overflow-y-auto max-h-[800px]">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Analysis Report</h2>

          {/* Summary */}
          <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
            <h3 className="font-semibold text-gray-700 mb-2">Summary</h3>
            {analysis.summary?.map((s, i) => (
              <p key={i} className="text-gray-700 text-sm mb-2">{s}</p>
            ))}
          </div>

          {/* Details */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-3">Test Details</h3>
            <div className="space-y-2">
              {analysis.details?.map((detail, i) => (
                <div key={i} className="border rounded p-3 bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-gray-800">{detail.name}</span>
                    <span className={`px-2 py-1 rounded text-sm font-semibold ${
                      detail.status === 'normal' ? 'bg-green-100 text-green-800' :
                      detail.status === 'low' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {detail.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Value:</strong> {detail.value} {detail.unit}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Reference:</strong> {detail.reference_range}
                  </p>
                  <p className="text-sm text-gray-700">{detail.note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Suggestions */}
          {analysis.suggestions?.length > 0 && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded">
              <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" /> Suggestions
              </h3>
              <ul className="space-y-1">
                {analysis.suggestions.map((s, i) => (
                  <li key={i} className="text-gray-700 text-sm">• {s}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Grocery List */}
          {analysis.grocery_list?.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-indigo-600" /> Shopping List
              </h3>
              <ul className="space-y-1">
                {analysis.grocery_list.map((item, i) => (
                  <li key={i} className="text-gray-700 text-sm">✓ {item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Disclaimer */}
          <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded text-sm text-gray-700">
            <p>{analysis.disclaimer}</p>
          </div>
        </div>
      )}
    </div>
  );
}
