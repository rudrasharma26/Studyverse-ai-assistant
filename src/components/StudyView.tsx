import React, { useState, useEffect } from 'react';
import { 
  Copy, 
  Download, 
  FileText, 
  Star, 
  BookOpen, 
  FileCheck2, 
  Sparkles, 
  HelpCircle, 
  MessageSquare, 
  Save, 
  Wand2, 
  Check, 
  Send 
} from 'lucide-react';
import { StudyMaterial, DifficultyLevel, StudyMode } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { QuizSection } from './QuizSection';
import { exportToTxt, exportToPdf, copyToClipboard } from '../utils/exportUtils';
import { getTopicNotes, saveTopicNotes } from '../utils/storageUtils';

interface StudyViewProps {
  material: StudyMaterial;
  isFavorite: boolean;
  onToggleFavorite: (topic: string, diff: DifficultyLevel, mode: StudyMode) => void;
}

type TabType = 'Explanation' | 'Summary' | 'Important Points' | 'Quiz';

export const StudyView: React.FC<StudyViewProps> = ({ material, isFavorite, onToggleFavorite }) => {
  const [activeTab, setActiveTab] = useState<TabType>('Explanation');
  const [copiedAll, setCopiedAll] = useState(false);
  const [notes, setNotes] = useState('');
  const [notesSaved, setNotesSaved] = useState(false);
  const [isPolishing, setIsPolishing] = useState(false);
  const [followupQuestion, setFollowupQuestion] = useState('');
  const [followupAnswer, setFollowupAnswer] = useState<string | null>(null);
  const [isAnsweringFollowup, setIsAnsweringFollowup] = useState(false);

  useEffect(() => {
    setNotes(getTopicNotes(material.topic));
    setFollowupAnswer(null);
    setFollowupQuestion('');
  }, [material.topic]);

  const handleCopyAll = async () => {
    const success = await copyToClipboard(material.raw || `${material.explanation}\n\n${material.summary}\n\n${material.important_points}`);
    if (success) {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    }
  };

  const handleSaveNotes = () => {
    saveTopicNotes(material.topic, notes);
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2000);
  };

  const handlePolishNotes = async () => {
    if (!notes.trim()) return;
    setIsPolishing(true);
    try {
      const res = await fetch('/api/study/polish-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: material.topic, notes }),
      });
      const data = await res.json();
      if (data.polished) {
        setNotes(data.polished);
        saveTopicNotes(material.topic, data.polished);
        setNotesSaved(true);
        setTimeout(() => setNotesSaved(false), 2000);
      }
    } catch (err) {
      console.error('Failed to polish notes:', err);
    } finally {
      setIsPolishing(false);
    }
  };

  const handleAskFollowup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!followupQuestion.trim()) return;

    setIsAnsweringFollowup(true);
    setFollowupAnswer('');

    try {
      const res = await fetch('/api/study/followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: material.topic,
          context: activeTab === 'Explanation' ? material.explanation : activeTab === 'Summary' ? material.summary : material.important_points,
          question: followupQuestion,
        }),
      });
      const data = await res.json();
      setFollowupAnswer(data.answer || 'No response generated.');
    } catch (err) {
      setFollowupAnswer('Failed to get answer. Please check connection and try again.');
    } finally {
      setIsAnsweringFollowup(false);
    }
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'Explanation', label: 'Explanation', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'Summary', label: 'Summary', icon: <FileCheck2 className="w-4 h-4" /> },
    { id: 'Important Points', label: 'Key Points', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'Quiz', label: `Quiz (${material.quiz?.length || 0})`, icon: <HelpCircle className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header Topic Bar with Badges and Actions */}
      <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Topic Info */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {material.topic}
            </h2>
            <button
              onClick={() => onToggleFavorite(material.topic, material.difficulty, material.study_mode)}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 transition-colors"
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-400' : 'text-slate-400'}`} />
            </button>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
              {material.difficulty}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/20 font-medium">
              {material.study_mode}
            </span>
          </div>
        </div>

        {/* Right Export Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Copy All */}
          <button
            onClick={handleCopyAll}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
            id="copy-all-btn"
          >
            {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copiedAll ? 'Copied!' : 'Copy All'}</span>
          </button>

          {/* Download TXT */}
          <button
            onClick={() => exportToTxt(material)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
            id="download-txt-btn"
          >
            <FileText className="w-3.5 h-3.5 text-sky-400" />
            <span>TXT</span>
          </button>

          {/* Download PDF */}
          <button
            onClick={() => exportToPdf(material)}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-indigo-500/20 transition-colors"
            id="download-pdf-btn"
          >
            <Download className="w-3.5 h-3.5" />
            <span>PDF Notes</span>
          </button>
        </div>
      </div>

      {/* Pill Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/60 border border-slate-800 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-indigo-600 to-sky-600 text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
            id={`study-tab-${tab.id.toLowerCase().replace(/\s+/g, '-')}`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Main Tab Content Card */}
      <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/90 shadow-xl space-y-6">
        {activeTab === 'Explanation' && (
          <div className="space-y-4">
            <MarkdownRenderer content={material.explanation} />
          </div>
        )}

        {activeTab === 'Summary' && (
          <div className="space-y-4">
            <MarkdownRenderer content={material.summary} />
          </div>
        )}

        {activeTab === 'Important Points' && (
          <div className="space-y-4">
            <MarkdownRenderer content={material.important_points} />
          </div>
        )}

        {activeTab === 'Quiz' && (
          <QuizSection quiz={material.quiz} topic={material.topic} />
        )}
      </div>

      {/* Interactive Follow-up Question Box (for non-quiz tabs) */}
      {activeTab !== 'Quiz' && (
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-300">
            <MessageSquare className="w-4 h-4 text-indigo-400" />
            <span>Ask a Follow-up Question</span>
          </div>

          <form onSubmit={handleAskFollowup} className="flex gap-2">
            <input
              type="text"
              value={followupQuestion}
              onChange={(e) => setFollowupQuestion(e.target.value)}
              placeholder="e.g. Can you explain this with a real-life analogy or simpler formula?"
              className="flex-1 bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={isAnsweringFollowup || !followupQuestion.trim()}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {isAnsweringFollowup ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>Ask</span>
            </button>
          </form>

          {followupAnswer && (
            <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-xs sm:text-sm text-slate-200 mt-2">
              <MarkdownRenderer content={followupAnswer} />
            </div>
          )}
        </div>
      )}

      {/* Per-Topic Notes Section */}
      <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
            <FileText className="w-4 h-4 text-sky-400" />
            <span>My Personal Study Notes</span>
          </div>
          {notesSaved && (
            <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
              <Check className="w-3.5 h-3.5" /> Saved
            </span>
          )}
        </div>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Jot down your custom takeaways, formulas, or questions here..."
          rows={3}
          className="w-full bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-y"
        />

        <div className="flex items-center justify-end gap-2">
          <button
            onClick={handlePolishNotes}
            disabled={isPolishing || !notes.trim()}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-indigo-300 hover:text-indigo-200 disabled:opacity-50 flex items-center gap-1.5 transition-colors"
          >
            {isPolishing ? (
              <div className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Wand2 className="w-3.5 h-3.5 text-indigo-400" />
            )}
            <span>Polish with AI</span>
          </button>

          <button
            onClick={handleSaveNotes}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Notes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
