import React, { useState } from 'react';
import { Scale, Sparkles, Download, FileText, ArrowRightLeft } from 'lucide-react';
import { CompareResult, DifficultyLevel } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { exportCompareToTxt, exportCompareToPdf } from '../utils/exportUtils';

interface CompareViewProps {
  difficulty: DifficultyLevel;
  onCloseCompare: () => void;
}

export const CompareView: React.FC<CompareViewProps> = ({ difficulty, onCloseCompare }) => {
  const [topicA, setTopicA] = useState('');
  const [topicB, setTopicB] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CompareResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCompare = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topicA.trim() || !topicB.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/study/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic_a: topicA.trim(),
          topic_b: topicB.trim(),
          difficulty,
        }),
      });
      const data = await res.json();
      if (data.data) {
        setResult(data.data);
      } else {
        setError(data.error || 'Failed to compare topics.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwap = () => {
    const temp = topicA;
    setTopicA(topicB);
    setTopicB(temp);
  };

  return (
    <div className="space-y-6">
      {/* Compare Inputs Header */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-white">Compare Mode</h3>
          </div>
          <button
            onClick={onCloseCompare}
            className="text-xs text-slate-400 hover:text-slate-200 px-2.5 py-1 rounded-lg bg-slate-800"
          >
            Exit Compare Mode
          </button>
        </div>

        <form onSubmit={handleCompare} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center">
            <div className="md:col-span-5">
              <label className="text-xs font-semibold text-slate-400 block mb-1">Topic A</label>
              <input
                type="text"
                value={topicA}
                onChange={(e) => setTopicA(e.target.value)}
                placeholder="e.g. SQL (Relational)"
                className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="md:col-span-1 flex justify-center pt-4 md:pt-0">
              <button
                type="button"
                onClick={handleSwap}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Swap Topics"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </button>
            </div>

            <div className="md:col-span-5">
              <label className="text-xs font-semibold text-slate-400 block mb-1">Topic B</label>
              <input
                type="text"
                value={topicB}
                onChange={(e) => setTopicB(e.target.value)}
                placeholder="e.g. MongoDB (NoSQL)"
                className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading || !topicA.trim() || !topicB.trim()}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 disabled:opacity-50 text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Analyzing Differences...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Compare Topics</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* Comparison Results */}
      {result && (
        <div className="space-y-6">
          {/* Header Action Bar */}
          <div className="flex items-center justify-between flex-wrap gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
              <span className="px-3 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {result.topic_a}
              </span>
              <span className="text-slate-400 font-mono text-xs">VS</span>
              <span className="px-3 py-1 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/30">
                {result.topic_b}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => exportCompareToTxt(result)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-sky-400" />
                <span>TXT</span>
              </button>
              <button
                onClick={() => exportCompareToPdf(result)}
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF Comparison</span>
              </button>
            </div>
          </div>

          {/* Section Cards */}
          <div className="grid grid-cols-1 gap-5">
            {/* Overview */}
            <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-2">
              <h4 className="text-sm font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                <span>🔍 Overview</span>
              </h4>
              <MarkdownRenderer content={result.overview} />
            </div>

            {/* Similarities */}
            <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-2">
              <h4 className="text-sm font-bold text-sky-300 uppercase tracking-wider flex items-center gap-2">
                <span>🤝 Similarities</span>
              </h4>
              <MarkdownRenderer content={result.similarities} />
            </div>

            {/* Key Differences Table */}
            <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-2">
              <h4 className="text-sm font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                <span>⚡ Key Differences</span>
              </h4>
              <MarkdownRenderer content={result.differences} />
            </div>

            {/* When to Use Which */}
            <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-2">
              <h4 className="text-sm font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                <span>🎯 When to Use Which</span>
              </h4>
              <MarkdownRenderer content={result.use_cases} />
            </div>

            {/* Quick Summary */}
            <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-2">
              <h4 className="text-sm font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                <span>📌 Quick Summary</span>
              </h4>
              <MarkdownRenderer content={result.summary} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
