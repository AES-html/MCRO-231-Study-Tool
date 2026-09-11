import { UserStats, QuizAttempt, MicroorganismCard } from '../types';
import { MICROORGANISMS } from '../data/microorganisms';

const STORAGE_KEY = 'mcro251_user_stats_v1';

const getDefaultStats = (): UserStats => {
  const masteryInit: Record<string, { correct: number; incorrect: number }> = {};
  MICROORGANISMS.forEach((m) => {
    masteryInit[m.id] = { correct: 0, incorrect: 0 };
  });

  return {
    totalAttempts: 0,
    mode1Attempts: 0,
    mode2Attempts: 0,
    totalCorrect: 0,
    totalAnswered: 0,
    streakDays: 1,
    lastActiveDate: new Date().toISOString().split('T')[0],
    organismMastery: masteryInit,
    recentAttempts: [],
    bookmarkedIds: []
  };
};

export function loadUserStats(): UserStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultStats();
    const parsed = JSON.parse(raw);
    
    // Ensure all current organisms exist in mastery map
    const defaultStats = getDefaultStats();
    const mergedMastery = { ...defaultStats.organismMastery, ...(parsed.organismMastery || {}) };
    
    // Check streak
    const today = new Date().toISOString().split('T')[0];
    let streak = parsed.streakDays || 1;
    if (parsed.lastActiveDate && parsed.lastActiveDate !== today) {
      const last = new Date(parsed.lastActiveDate);
      const curr = new Date(today);
      const diffDays = Math.round((curr.getTime() - last.getTime()) / (1000 * 3600 * 24));
      if (diffDays > 1) {
        streak = 1;
      } else if (diffDays === 1) {
        streak += 1;
      }
    }

    return {
      ...defaultStats,
      ...parsed,
      streakDays: streak,
      lastActiveDate: today,
      organismMastery: mergedMastery,
      bookmarkedIds: parsed.bookmarkedIds || [],
      recentAttempts: parsed.recentAttempts || []
    };
  } catch (e) {
    console.error('Failed to load user stats:', e);
    return getDefaultStats();
  }
}

export function saveUserStats(stats: UserStats): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save user stats:', e);
  }
}

export function recordQuizAttempt(attempt: QuizAttempt, perOrganismResults: Record<string, boolean>): UserStats {
  const stats = loadUserStats();
  
  stats.totalAttempts += 1;
  if (attempt.mode === 'assign-characteristics') {
    stats.mode1Attempts += 1;
  } else {
    stats.mode2Attempts += 1;
  }

  stats.totalCorrect += attempt.correctAnswers;
  stats.totalAnswered += attempt.totalQuestions;

  // Update per-organism mastery
  Object.entries(perOrganismResults).forEach(([orgId, isCorrect]) => {
    if (!stats.organismMastery[orgId]) {
      stats.organismMastery[orgId] = { correct: 0, incorrect: 0 };
    }
    if (isCorrect) {
      stats.organismMastery[orgId].correct += 1;
    } else {
      stats.organismMastery[orgId].incorrect += 1;
    }
  });

  stats.recentAttempts = [attempt, ...(stats.recentAttempts || [])].slice(0, 25);
  stats.lastActiveDate = new Date().toISOString().split('T')[0];

  saveUserStats(stats);
  return stats;
}

export function toggleBookmarkInStorage(organismId: string): UserStats {
  const stats = loadUserStats();
  const current = new Set(stats.bookmarkedIds);
  if (current.has(organismId)) {
    current.delete(organismId);
  } else {
    current.add(organismId);
  }
  stats.bookmarkedIds = Array.from(current);
  saveUserStats(stats);
  return stats;
}

export function resetAllStats(): UserStats {
  const fresh = getDefaultStats();
  saveUserStats(fresh);
  return fresh;
}

/**
 * Loads all organisms from the central course deck definition in src/data/microorganisms.ts.
 * Adding or editing cards in src/data/microorganisms.ts immediately updates the whole app.
 */
export function loadAllOrganisms(): MicroorganismCard[] {
  // Clear any legacy custom card storage if present to ensure student client stays synced with server code
  try {
    localStorage.removeItem('mcro251_custom_cards_v1');
  } catch {
    // Ignore in non-browser/restricted environments
  }
  return MICROORGANISMS;
}

