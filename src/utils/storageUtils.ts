import { UserProfile, HistoryItem, FavoriteItem, DifficultyLevel, StudyMode } from '../types';

const STORAGE_KEYS = {
  PROFILE: 'ai_study_profile',
  HISTORY: 'ai_study_history',
  FAVORITES: 'ai_study_favorites',
  NOTES: 'ai_study_notes',
  TOUR: 'ai_study_tour_done',
};

export function getUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load profile:', e);
  }
  return {
    username: 'Student',
    streakCount: 1,
    lastActiveDate: new Date().toISOString().split('T')[0],
    theme: 'dark',
    notes: {},
  };
}

export function saveUserProfile(profile: Partial<UserProfile>): UserProfile {
  const current = getUserProfile();
  const updated: UserProfile = { ...current, ...profile };
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save profile:', e);
  }
  return updated;
}

export function updateStreak(): number {
  const profile = getUserProfile();
  const today = new Date().toISOString().split('T')[0];
  const lastActive = profile.lastActiveDate;

  if (lastActive === today) {
    return profile.streakCount || 1;
  }

  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  let newStreak = 1;
  if (lastActive === yesterday) {
    newStreak = (profile.streakCount || 0) + 1;
  }

  saveUserProfile({
    streakCount: newStreak,
    lastActiveDate: today,
  });

  return newStreak;
}

export function getHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load history:', e);
  }
  return [];
}

export function addHistory(topic: string, difficulty: DifficultyLevel, study_mode: StudyMode): HistoryItem[] {
  if (!topic || !topic.trim()) return getHistory();
  const history = getHistory().filter(h => h.topic.toLowerCase() !== topic.toLowerCase());
  const newItem: HistoryItem = {
    id: `${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    topic: topic.trim(),
    difficulty,
    study_mode,
    timestamp: new Date().toISOString(),
  };
  const updated = [newItem, ...history].slice(0, 30);
  try {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save history:', e);
  }
  return updated;
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
  } catch (e) {
    console.error('Failed to clear history:', e);
  }
}

export function getFavorites(): FavoriteItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load favorites:', e);
  }
  return [];
}

export function isFavorite(topic: string): boolean {
  if (!topic) return false;
  const favs = getFavorites();
  return favs.some(f => f.topic.toLowerCase() === topic.trim().toLowerCase());
}

export function toggleFavorite(topic: string, difficulty: DifficultyLevel, study_mode: StudyMode): boolean {
  if (!topic || !topic.trim()) return false;
  const favs = getFavorites();
  const cleanTopic = topic.trim();
  const exists = favs.some(f => f.topic.toLowerCase() === cleanTopic.toLowerCase());

  let updated: FavoriteItem[];
  if (exists) {
    updated = favs.filter(f => f.topic.toLowerCase() !== cleanTopic.toLowerCase());
  } else {
    updated = [
      {
        id: `fav_${Date.now()}`,
        topic: cleanTopic,
        difficulty,
        study_mode,
        timestamp: new Date().toISOString(),
      },
      ...favs,
    ];
  }

  try {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to update favorites:', e);
  }
  return !exists;
}

export function getTopicNotes(topic: string): string {
  if (!topic) return '';
  const profile = getUserProfile();
  return profile.notes?.[topic.toLowerCase().trim()] || '';
}

export function saveTopicNotes(topic: string, notes: string): void {
  if (!topic) return;
  const profile = getUserProfile();
  const updatedNotes = { ...(profile.notes || {}), [topic.toLowerCase().trim()]: notes };
  saveUserProfile({ notes: updatedNotes });
}

export function isTourDone(): boolean {
  return localStorage.getItem(STORAGE_KEYS.TOUR) === 'true';
}

export function markTourDone(): void {
  localStorage.setItem(STORAGE_KEYS.TOUR, 'true');
}
