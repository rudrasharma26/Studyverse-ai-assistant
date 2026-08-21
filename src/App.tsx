import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { TopicSearch } from './components/TopicSearch';
import { StudyView } from './components/StudyView';
import { CompareView } from './components/CompareView';
import { OnboardingModal } from './components/OnboardingModal';
import { 
  StudyMaterial, 
  DifficultyLevel, 
  StudyMode, 
  HistoryItem, 
  FavoriteItem, 
  ScheduleSuggestion, 
  UserProfile 
} from './types';
import { 
  getUserProfile, 
  saveUserProfile, 
  updateStreak, 
  getHistory, 
  addHistory, 
  clearHistory, 
  getFavorites, 
  toggleFavorite, 
  isFavorite, 
  isTourDone, 
  markTourDone 
} from './utils/storageUtils';

export function App() {
  const [profile, setProfile] = useState<UserProfile>(getUserProfile());
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Intermediate');
  const [studyMode, setStudyMode] = useState<StudyMode>('Learn Mode');
  const [material, setMaterial] = useState<StudyMaterial | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [autoDifficulty, setAutoDifficulty] = useState<DifficultyLevel | null>(null);
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [scheduleSuggestions, setScheduleSuggestions] = useState<ScheduleSuggestion[]>([]);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize on mount
  useEffect(() => {
    const loadedProfile = getUserProfile();
    setProfile(loadedProfile);
    setHistory(getHistory());
    setFavorites(getFavorites());

    // Update streak for active day
    const updatedStreak = updateStreak();
    setProfile((prev) => ({ ...prev, streakCount: updatedStreak }));

    // Apply theme
    if (loadedProfile.theme === 'light') {
      document.documentElement.classList.add('light-theme');
    }

    // Check first-time tour
    if (!isTourDone()) {
      setIsTourOpen(true);
    }

    // Fetch spaced repetition schedule
    fetchSchedule(getHistory());
  }, []);

  const fetchSchedule = async (hist: HistoryItem[]) => {
    if (!hist || hist.length === 0) return;
    try {
      const res = await fetch('/api/study/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: hist }),
      });
      const data = await res.json();
      if (data.suggestions) {
        setScheduleSuggestions(data.suggestions);
      }
    } catch (e) {
      console.warn('Could not fetch schedule suggestions:', e);
    }
  };

  // Debounced auto-difficulty detection
  useEffect(() => {
    if (!topic || topic.trim().length < 4) {
      setAutoDifficulty(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/study/auto-difficulty', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic }),
        });
        const data = await res.json();
        if (data.difficulty) {
          setAutoDifficulty(data.difficulty as DifficultyLevel);
        }
      } catch (e) {
        // Silent fallback
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [topic]);

  const handleGenerate = async (customTopic?: string, customDiff?: DifficultyLevel, customMode?: StudyMode) => {
    const targetTopic = (customTopic || topic).trim();
    if (!targetTopic) return;

    const targetDiff = customDiff || difficulty;
    const targetMode = customMode || studyMode;

    setIsLoading(true);
    setErrorMessage(null);
    if (customTopic) setTopic(customTopic);
    if (customDiff) setDifficulty(customDiff);
    if (customMode) setStudyMode(customMode);

    try {
      const res = await fetch('/api/study/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: targetTopic,
          difficulty: targetDiff,
          study_mode: targetMode,
        }),
      });

      const json = await res.json();
      if (json.data) {
        setMaterial(json.data);
        const updatedHistory = addHistory(targetTopic, targetDiff, targetMode);
        setHistory(updatedHistory);
        fetchSchedule(updatedHistory);
      } else {
        setErrorMessage(json.error || 'Failed to generate study content.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error while connecting to assistant.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTopicFromSidebar = (selectedTopic: string, diff?: DifficultyLevel, mode?: StudyMode) => {
    setTopic(selectedTopic);
    setIsCompareMode(false);
    handleGenerate(selectedTopic, diff, mode);
  };

  const handleToggleFavorite = (favTopic: string, favDiff: DifficultyLevel, favMode: StudyMode) => {
    toggleFavorite(favTopic, favDiff, favMode);
    setFavorites(getFavorites());
  };

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
    setScheduleSuggestions([]);
  };

  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
    const saved = saveUserProfile(updated);
    setProfile(saved);
  };

  const handleCloseTour = () => {
    markTourDone();
    setIsTourOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <Header
        profile={profile}
        onUpdateProfile={handleUpdateProfile}
        onOpenTour={() => setIsTourOpen(true)}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col lg:flex-row gap-0">
        {/* Left Sidebar */}
        <Sidebar
          difficulty={difficulty}
          onSelectDifficulty={setDifficulty}
          studyMode={studyMode}
          onSelectStudyMode={setStudyMode}
          isCompareMode={isCompareMode}
          onToggleCompareMode={setIsCompareMode}
          favorites={favorites}
          history={history}
          scheduleSuggestions={scheduleSuggestions}
          onSelectTopic={handleSelectTopicFromSidebar}
          onToggleFavorite={handleToggleFavorite}
          onClearHistory={handleClearHistory}
        />

        {/* Center Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          {isCompareMode ? (
            <CompareView
              difficulty={difficulty}
              onCloseCompare={() => setIsCompareMode(false)}
            />
          ) : (
            <>
              {/* Search & Topic Selector */}
              <TopicSearch
                topic={topic}
                onChangeTopic={setTopic}
                onGenerate={() => handleGenerate()}
                isLoading={isLoading}
                autoDifficulty={autoDifficulty}
                onSelectDifficulty={setDifficulty}
              />

              {/* Error Banner if any */}
              {errorMessage && (
                <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-sm">
                  {errorMessage}
                </div>
              )}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="p-12 rounded-2xl bg-slate-900/40 border border-slate-800 text-center space-y-4">
                  <div className="w-12 h-12 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold text-white">Synthesizing Study Material...</h3>
                    <p className="text-xs text-slate-400">
                      Structuring concepts, generating summaries, and assembling quiz questions
                    </p>
                  </div>
                </div>
              )}

              {/* Study Material Result */}
              {!isLoading && material && (
                <StudyView
                  material={material}
                  isFavorite={isFavorite(material.topic)}
                  onToggleFavorite={handleToggleFavorite}
                />
              )}

              {/* Empty State / Welcome Hero when no topic generated yet */}
              {!isLoading && !material && (
                <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-slate-900/50 to-slate-950 border border-slate-800/80 text-center space-y-5 max-w-2xl mx-auto my-8">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-3xl mx-auto shadow-xl shadow-indigo-600/10">
                    💡
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                      What would you like to master today?
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                      Enter any concept or question above. Get comprehensive explanations, key points, and interactive AI-graded quizzes formatted for your study style.
                    </p>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs">
                    {['Photosynthesis', 'Quantum Physics', 'Database Indexing', 'French Revolution'].map((quickTopic, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setTopic(quickTopic);
                          handleGenerate(quickTopic);
                        }}
                        className="px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-indigo-950 border border-slate-800 hover:border-indigo-500/40 text-slate-300 hover:text-indigo-200 transition-all font-medium"
                      >
                        Try "{quickTopic}"
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Onboarding Tour Modal */}
      <OnboardingModal
        isOpen={isTourOpen}
        onClose={handleCloseTour}
      />
    </div>
  );
}
export default App;
