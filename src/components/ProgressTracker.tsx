import React, { useState } from 'react';
import { UserStats, MicroorganismCard } from '../types';
import { MICROORGANISMS } from '../data/microorganisms';
import { 
  Trophy, 
  Target, 
  Flame, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  BookOpen, 
  RotateCcw,
  Sparkles,
  BarChart3,
  Calendar,
  Dna
} from 'lucide-react';

interface ProgressTrackerProps {
  stats: UserStats;
  onResetStats: () => void;
  onSelectOrganismForStudy: (organismId: string, mode: 'mode1' | 'mode2') => void;
  cards?: MicroorganismCard[];
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  stats,
  onResetStats,
  onSelectOrganismForStudy,
  cards = MICROORGANISMS,
}) => {
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  // Calculate mastery statistics
  const totalCards = cards.length;
  let masteredCount = 0;
  let learningCount = 0;
  let unattemptedCount = 0;

  const organismStatsList = cards.map((m) => {
    const data = stats.organismMastery[m.id] || { correct: 0, incorrect: 0 };
    const total = data.correct + data.incorrect;
    const accuracy = total > 0 ? Math.round((data.correct / total) * 100) : 0;

    let status: 'mastered' | 'learning' | 'unattempted' = 'unattempted';
    if (total === 0) {
      unattemptedCount += 1;
      status = 'unattempted';
    } else if (accuracy >= 75 && total >= 2) {
      masteredCount += 1;
      status = 'mastered';
    } else {
      learningCount += 1;
      status = 'learning';
    }

    return {
      card: m,
      total,
      correct: data.correct,
      incorrect: data.incorrect,
      accuracy,
      status,
    };
  });

  // Identify top tricky cards (most incorrect attempts or lowest accuracy with at least 1 attempt)
  const trickyCards = [...organismStatsList]
    .filter((o) => o.total > 0 && o.accuracy < 75)
    .sort((a, b) => a.accuracy - b.accuracy || b.incorrect - a.incorrect)
    .slice(0, 4);

  const overallAccuracy = stats.totalAnswered > 0 
    ? Math.round((stats.totalCorrect / stats.totalAnswered) * 100) 
    : 0;

  const masteryPercent = Math.round((masteredCount / totalCards) * 100);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Mastery */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{masteryPercent}%</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Deck Mastery</div>
            <div className="text-[11px] text-slate-400 mt-0.5">{masteredCount} of {totalCards} cards</div>
          </div>
        </div>

        {/* Card 2: Accuracy */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{overallAccuracy}%</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Overall Accuracy</div>
            <div className="text-[11px] text-slate-400 mt-0.5">{stats.totalCorrect} / {stats.totalAnswered} questions</div>
          </div>
        </div>

        {/* Card 3: Streak */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{stats.streakDays} Day{stats.streakDays === 1 ? '' : 's'}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Study Streak</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Active today</div>
          </div>
        </div>

        {/* Card 4: Mode breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{stats.totalAttempts}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Study Sessions</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              M1: {stats.mode1Attempts} • M2: {stats.mode2Attempts}
            </div>
          </div>
        </div>
      </div>

      {/* Mastery Progress Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Microorganism Retention Breakdown</h3>
            <p className="text-xs text-slate-500">Based on your performance in Mode 1 & Mode 2</p>
          </div>
          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            {masteredCount} Mastered • {learningCount} In Review • {unattemptedCount} Unattempted
          </span>
        </div>

        <div className="h-4 bg-slate-100 rounded-full overflow-hidden flex border border-slate-200">
          <div
            className="bg-emerald-500 h-full transition-all duration-500"
            style={{ width: `${(masteredCount / totalCards) * 100}%` }}
            title={`Mastered: ${masteredCount}`}
          />
          <div
            className="bg-amber-400 h-full transition-all duration-500"
            style={{ width: `${(learningCount / totalCards) * 100}%` }}
            title={`In Progress: ${learningCount}`}
          />
          <div
            className="bg-slate-200 h-full transition-all duration-500"
            style={{ width: `${(unattemptedCount / totalCards) * 100}%` }}
            title={`Unattempted: ${unattemptedCount}`}
          />
        </div>

        <div className="flex items-center gap-4 text-xs pt-1">
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span>Mastered (≥75% accuracy, 2+ reviews)</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
            <span>Learning / Needs Practice (&lt;75%)</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" />
            <span>Not yet tested</span>
          </div>
        </div>
      </div>

      {/* Tricky Microorganisms Alert */}
      {trickyCards.length > 0 && (
        <div className="bg-amber-50/80 border border-amber-200/80 p-5 rounded-2xl shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Recommended Focus: Needs Review Before Exam</span>
          </div>
          <p className="text-xs text-amber-800">
            You have missed these organisms recently. Strengthen your recall by reviewing their characteristics!
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            {trickyCards.map((item) => (
              <div
                key={item.card.id}
                className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="font-serif italic font-bold text-slate-900 text-sm">
                    {item.card.scientificName}
                  </div>
                  <div className="text-xs text-slate-500">{item.card.disease}</div>
                  <div className="mt-2 text-xs font-semibold text-rose-600">
                    Accuracy: {item.accuracy}% ({item.correct}/{item.total})
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex gap-1.5">
                  <button
                    onClick={() => onSelectOrganismForStudy(item.card.id, 'mode1')}
                    className="flex-1 py-1 px-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-[11px] font-bold text-center transition-colors"
                  >
                    Mode 1
                  </button>
                  <button
                    onClick={() => onSelectOrganismForStudy(item.card.id, 'mode2')}
                    className="flex-1 py-1 px-2 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 text-[11px] font-bold text-center transition-colors"
                  >
                    Mode 2
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comprehensive Organism Mastery Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base">
            Organism-by-Organism Mastery ({MICROORGANISMS.length})
          </h3>
          <span className="text-xs text-slate-500 font-medium">MCRO 251 Course Deck</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 divide-y divide-slate-200">
            <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[11px] tracking-wider">
              <tr>
                <th className="px-5 py-3">Microorganism</th>
                <th className="px-3 py-3">Disease</th>
                <th className="px-3 py-3">Tested</th>
                <th className="px-3 py-3">Accuracy</th>
                <th className="px-3 py-3">Mastery Status</th>
                <th className="px-5 py-3 text-right">Targeted Study</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {organismStatsList.map((item) => (
                <tr key={item.card.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3">
                    <div className="font-serif italic font-bold text-slate-900 text-sm">
                      {item.card.scientificName}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[11px] text-slate-500">{item.card.organismType}</span>
                      {item.card.strandedness !== 'N/A' && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
                          {item.card.strandedness === 'Single-stranded' ? 'ss' : 'ds'} {item.card.nucleicAcidType}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3 font-medium text-slate-800">
                    {item.card.disease}
                  </td>
                  <td className="px-3 py-3 text-slate-600">
                    {item.total} times ({item.correct}✓ {item.incorrect}✗)
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                        <div
                          className={`h-full ${
                            item.accuracy >= 75
                              ? 'bg-emerald-500'
                              : item.accuracy >= 50
                              ? 'bg-amber-400'
                              : 'bg-rose-400'
                          }`}
                          style={{ width: `${item.total > 0 ? item.accuracy : 0}%` }}
                        />
                      </div>
                      <span className="font-bold text-[11px]">
                        {item.total > 0 ? `${item.accuracy}%` : '—'}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    {item.status === 'mastered' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 w-fit">
                        <CheckCircle2 className="w-3 h-3" /> Mastered
                      </span>
                    )}
                    {item.status === 'learning' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1 w-fit">
                        <RotateCcw className="w-3 h-3" /> In Review
                      </span>
                    )}
                    {item.status === 'unattempted' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500 w-fit">
                        Unattempted
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="inline-flex gap-1.5">
                      <button
                        onClick={() => onSelectOrganismForStudy(item.card.id, 'mode1')}
                        title="Assign characteristics in Mode 1"
                        className="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-[11px] font-bold transition-colors"
                      >
                        Mode 1
                      </button>
                      <button
                        onClick={() => onSelectOrganismForStudy(item.card.id, 'mode2')}
                        title="Identify in Mode 2"
                        className="px-2 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded text-[11px] font-bold transition-colors"
                      >
                        Mode 2
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Session History Log */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <span>Recent Quiz Sessions</span>
          </h3>
          <span className="text-xs text-slate-400">Past 25 attempts logged</span>
        </div>

        {stats.recentAttempts.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-4">
            No quiz sessions completed yet. Start studying in Mode 1 or Mode 2 to log your history!
          </p>
        ) : (
          <div className="space-y-2.5">
            {stats.recentAttempts.map((attempt) => (
              <div
                key={attempt.id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs ${
                      attempt.mode === 'assign-characteristics'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {attempt.mode === 'assign-characteristics' ? 'M1' : 'M2'}
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 text-xs">
                      {attempt.mode === 'assign-characteristics'
                        ? 'Mode 1: Assign Characteristics'
                        : 'Mode 2: Identify Microorganism'}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {new Date(attempt.timestamp).toLocaleDateString()} at{' '}
                      {new Date(attempt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                      {attempt.durationSeconds}s duration
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                      attempt.scorePercentage >= 80
                        ? 'bg-emerald-100 text-emerald-800'
                        : attempt.scorePercentage >= 60
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {attempt.scorePercentage}% ({attempt.correctAnswers}/{attempt.totalQuestions})
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Danger Zone / Reset Stats */}
      <div className="pt-4 flex justify-end">
        {!showConfirmReset ? (
          <button
            onClick={() => setShowConfirmReset(true)}
            className="text-xs text-rose-600 hover:text-rose-800 font-medium flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Study Progress
          </button>
        ) : (
          <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl flex items-center gap-3 text-xs">
            <span className="text-rose-900 font-medium">
              Are you sure? This will clear your quiz history and mastery scores.
            </span>
            <button
              onClick={() => {
                onResetStats();
                setShowConfirmReset(false);
              }}
              className="px-3 py-1 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700"
            >
              Yes, Reset
            </button>
            <button
              onClick={() => setShowConfirmReset(false)}
              className="px-3 py-1 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
