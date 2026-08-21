import React from 'react';
import { Sparkles, X, Check, Search, GraduationCap, Scale, Mic, FileText, Flame } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const features = [
    {
      icon: <Search className="w-5 h-5 text-indigo-400" />,
      title: 'Search Any Topic',
      desc: 'Type any academic or practical topic. Our AI generates structured explanations, summaries, and key points.',
    },
    {
      icon: <GraduationCap className="w-5 h-5 text-sky-400" />,
      title: '3 Study Modes & Difficulty',
      desc: 'Switch between Learn, Revision, and Exam Mode with 10 questions (5 MCQ + 5 short-answer).',
    },
    {
      icon: <Scale className="w-5 h-5 text-amber-400" />,
      title: 'Compare Mode',
      desc: 'Compare two concepts side-by-side with similarity breakdowns and feature comparison tables.',
    },
    {
      icon: <Mic className="w-5 h-5 text-rose-400" />,
      title: 'Voice & Document Upload',
      desc: 'Speak your question or upload lecture PDFs/notes to study directly from your documents.',
    },
    {
      icon: <Flame className="w-5 h-5 text-orange-400" />,
      title: 'Daily Streak & Spaced Repetition',
      desc: 'Build your study streak and review recommended topics to reinforce long-term memory.',
    },
    {
      icon: <FileText className="w-5 h-5 text-emerald-400" />,
      title: 'Export to TXT & PDF',
      desc: 'Download clean, printable study guides or copy formatted notes to your clipboard.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-2xl shadow-lg shadow-indigo-500/20">
            🧠
          </div>
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              Welcome to AI Study Assistant
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Your comprehensive companion for learning anything, anytime.
            </p>
          </div>
        </div>

        {/* Grid of features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map((f, i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3.5"
            >
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex-shrink-0 mt-0.5">
                {f.icon}
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-200">{f.title}</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Got it! Let's Start Learning</span>
          </button>
        </div>
      </div>
    </div>
  );
};
