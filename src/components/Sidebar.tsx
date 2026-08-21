import React from 'react';
import { 
  SlidersHorizontal, 
  Layers, 
  Scale, 
  Star, 
  History, 
  CalendarClock, 
  Trash2, 
  ChevronRight,
  BookOpen,
  Zap,
  GraduationCap
} from 'lucide-react';
import { DifficultyLevel, StudyMode, HistoryItem, FavoriteItem, ScheduleSuggestion } from '../types';

interface SidebarProps {
  difficulty: DifficultyLevel;
  onSelectDifficulty: (d: DifficultyLevel) => void;
  studyMode: StudyMode;
  onSelectStudyMode: (m: StudyMode) => void;
  isCompareMode: boolean;
  onToggleCompareMode: (enabled: boolean) => void;
  favorites: FavoriteItem[];
  history: HistoryItem[];
  scheduleSuggestions: ScheduleSuggestion[];
  onSelectTopic: (topic: string, diff?: DifficultyLevel, mode?: StudyMode) => void;
  onToggleFavorite: (topic: string, diff: DifficultyLevel, mode: StudyMode) => void;
  onClearHistory: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  difficulty,
  onSelectDifficulty,
  studyMode,
  onSelectStudyMode,
  isCompareMode,
  onToggleCompareMode,
  favorites,
  history,
  scheduleSuggestions,
  onSelectTopic,
  onToggleFavorite,
  onClearHistory,
}) => {
  const difficultyLevels: { id: DifficultyLevel; label: string; icon: string }[] = [
    { id: 'Beginner', label: 'Beginner', icon: '🌱' },
    { id: 'Intermediate', label: 'Intermediate', icon: '🌿' },
    { id: 'Advanced', label: 'Advanced', icon: '🌳' },
  ];

  const studyModes: { id: StudyMode; label: string; desc: string; icon: React.ReactNode }[] = [
    { id: 'Learn Mode', label: 'Learn Mode', desc: 'Comprehensive guide + 3 quiz checks', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'Revision Mode', label: 'Revision Mode', desc: 'High-speed summary + 4 quiz questions', icon: <Zap className="w-3.5 h-3.5" /> },
    { id: 'Exam Mode', label: 'Exam Mode', desc: 'Deep dive + 10 questions (5 MCQ + 5 Short)', icon: <GraduationCap className="w-3.5 h-3.5" /> },
  ];

  return (
    <aside className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-5 p-4 lg:p-5 bg-slate-900/40 border-b lg:border-b-0 lg:border-r border-slate-800/80 rounded-2xl lg:rounded-none">
      {/* Compare Mode Switcher Banner */}
      <div className="bg-gradient-to-r from-indigo-950/40 to-slate-900/80 border border-indigo-500/20 p-3.5 rounded-xl">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-semibold text-slate-200">Compare Mode</span>
          </div>
          <button
            onClick={() => onToggleCompareMode(!isCompareMode)}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
              isCompareMode
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30 font-semibold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
            id="compare-mode-toggle-btn"
          >
            {isCompareMode ? 'Active (2 Topics)' : 'Enable'}
          </button>
        </div>
        <p className="text-[11px] text-slate-400 mt-1.5 leading-snug">
          {isCompareMode
            ? 'Compare two concepts side-by-side with similarity & difference tables.'
            : 'Want to compare 2 topics? Switch to Compare Mode anytime.'}
        </p>
      </div>

      {/* Difficulty Setting */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
          <span>Difficulty Level</span>
        </label>
        <div className="grid grid-cols-3 gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80">
          {difficultyLevels.map((lvl) => (
            <button
              key={lvl.id}
              onClick={() => onSelectDifficulty(lvl.id)}
              className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
                difficulty === lvl.id
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
              id={`difficulty-btn-${lvl.id.toLowerCase()}`}
            >
              <span>{lvl.icon}</span>
              <span className="truncate">{lvl.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Study Mode Setting */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span>Study Mode</span>
        </label>
        <div className="space-y-1.5">
          {studyModes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => onSelectStudyMode(mode.id)}
              className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-start gap-2.5 ${
                studyMode === mode.id
                  ? 'bg-indigo-950/50 border-indigo-500/50 text-indigo-200 shadow-sm'
                  : 'bg-slate-950/30 border-slate-800/60 text-slate-300 hover:border-slate-700 hover:bg-slate-900/50'
              }`}
              id={`studymode-btn-${mode.id.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div className={`p-1.5 rounded-lg mt-0.5 ${studyMode === mode.id ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                {mode.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold flex items-center justify-between">
                  <span>{mode.label}</span>
                  {studyMode === mode.id && <span className="text-[10px] text-indigo-400 font-mono">SELECTED</span>}
                </div>
                <div className="text-[11px] text-slate-400 leading-tight mt-0.5 truncate">{mode.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Spaced Repetition / Review Today */}
      {scheduleSuggestions.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <label className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <CalendarClock className="w-3.5 h-3.5 text-amber-400" />
            <span>Review Today (Spaced)</span>
          </label>
          <div className="space-y-1.5">
            {scheduleSuggestions.map((item, idx) => (
              <button
                key={idx}
                onClick={() => onSelectTopic(item.topic)}
                className="w-full text-left p-2.5 rounded-xl bg-amber-950/20 border border-amber-500/20 hover:border-amber-500/40 transition-colors group"
              >
                <div className="text-xs font-semibold text-amber-200 group-hover:text-amber-100 flex items-center justify-between">
                  <span className="truncate">{item.topic}</span>
                  <ChevronRight className="w-3 h-3 text-amber-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{item.reason}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Starred Favorites */}
      {favorites.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Favorites ({favorites.length})</span>
            </label>
          </div>
          <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
            {favorites.map((fav) => (
              <div
                key={fav.id}
                className="flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-950/40 border border-slate-800/60 hover:border-slate-700 text-xs text-slate-300 group"
              >
                <button
                  onClick={() => onSelectTopic(fav.topic, fav.difficulty, fav.study_mode)}
                  className="flex-1 text-left truncate font-medium hover:text-indigo-300 transition-colors"
                >
                  {fav.topic}
                </button>
                <button
                  onClick={() => onToggleFavorite(fav.topic, fav.difficulty, fav.study_mode)}
                  className="text-slate-500 hover:text-rose-400 p-1 opacity-60 group-hover:opacity-100 transition-opacity"
                  title="Remove from favorites"
                >
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History */}
      <div className="space-y-2 pt-2 border-t border-slate-800/80 flex-1 min-h-[120px]">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-indigo-400" />
            <span>Recent Topics</span>
          </label>
          {history.length > 0 && (
            <button
              onClick={onClearHistory}
              className="text-[11px] text-slate-500 hover:text-rose-400 flex items-center gap-1 transition-colors"
              title="Clear history"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-2">No study history yet. Search a topic to get started!</p>
        ) : (
          <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
            {history.slice(0, 8).map((item) => (
              <button
                key={item.id}
                onClick={() => onSelectTopic(item.topic, item.difficulty, item.study_mode)}
                className="w-full text-left px-2.5 py-1.5 rounded-lg bg-slate-950/30 hover:bg-slate-800/60 border border-slate-800/40 text-xs text-slate-300 hover:text-white transition-colors flex items-center justify-between group"
              >
                <span className="truncate flex-1 font-medium">{item.topic}</span>
                <span className="text-[10px] text-slate-500 font-mono ml-2 group-hover:text-indigo-300">
                  {item.difficulty ? item.difficulty[0] : 'I'}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick Keyboard shortcut reminder */}
      <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Focus Search</span>
        <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] border border-slate-700">
          Ctrl + /
        </kbd>
      </div>
    </aside>
  );
};
