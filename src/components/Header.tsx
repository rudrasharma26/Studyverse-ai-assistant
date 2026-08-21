import React, { useState } from 'react';
import { Sparkles, Flame, Moon, Sun, Edit2, Check } from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderProps {
  profile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onOpenTour: () => void;
}

export const Header: React.FC<HeaderProps> = ({ profile, onUpdateProfile, onOpenTour }) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(profile.username);

  const handleSaveName = () => {
    if (tempName.trim()) {
      onUpdateProfile({ username: tempName.trim() });
    }
    setIsEditingName(false);
  };

  const toggleTheme = () => {
    const nextTheme = profile.theme === 'dark' ? 'light' : 'dark';
    onUpdateProfile({ theme: nextTheme });
    if (nextTheme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
  };

  return (
    <header className="border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center shadow-md shadow-indigo-500/20 text-xl select-none">
            🧠
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base sm:text-lg tracking-tight text-white flex items-center gap-1.5">
                AI Study Assistant
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                v2.0 Pro
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Master any topic with AI-generated explanations & smart quizzes
            </p>
          </div>
        </div>

        {/* Right: User status, streak & actions */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Greeting / User Name */}
          <div className="flex items-center gap-1.5 bg-slate-800/60 border border-slate-700/50 px-2.5 py-1.5 rounded-lg text-xs">
            <span className="text-slate-400">Hi,</span>
            {isEditingName ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  className="w-20 bg-slate-900 border border-indigo-500/60 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleSaveName}
                  className="text-emerald-400 hover:text-emerald-300 p-0.5"
                  title="Save Name"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditingName(true)}
                className="font-medium text-slate-200 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                title="Click to edit name"
              >
                <span>{profile.username || 'Student'}</span>
                <Edit2 className="w-3 h-3 text-slate-400 opacity-60 hover:opacity-100" />
              </button>
            )}
          </div>

          {/* Streak Counter */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-semibold select-none shadow-sm shadow-amber-500/5"
            title={`${profile.streakCount || 1} day study streak! Keep studying daily to maintain it.`}
          >
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
            <span>{profile.streakCount || 1}d Streak</span>
          </div>

          {/* Tour Button */}
          <button
            onClick={onOpenTour}
            className="hidden md:flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            title="App Tour & Tips"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Tour</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-700/60 transition-colors"
            title={`Switch to ${profile.theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            id="theme-toggle-btn"
          >
            {profile.theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-300" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-300" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
