import React, { useState, useEffect } from 'react';
import { UserStats, QuizAttempt } from './types';
import { 
  loadUserStats, 
  recordQuizAttempt, 
  toggleBookmarkInStorage, 
  resetAllStats 
} from './utils/storage';
import { MICROORGANISMS } from './data/microorganisms';
import { OrganismLibrary } from './components/OrganismLibrary';
import { ModeAssignCharacteristics } from './components/ModeAssignCharacteristics';
import { ModeIdentifyMicroorganism } from './components/ModeIdentifyMicroorganism';
import { ProgressTracker } from './components/ProgressTracker';
import { 
  BookOpen, 
  CheckSquare, 
  Search, 
  BarChart2, 
  Flame, 
  GraduationCap, 
  Trophy,
  Microscope,
  Info
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'library' | 'mode1' | 'mode2' | 'progress'>('library');
  const [stats, setStats] = useState<UserStats>(() => loadUserStats());
  const [infoModalOpen, setInfoModalOpen] = useState(false);

  const cards = MICROORGANISMS;

  // Sync stats from storage
  useEffect(() => {
    setStats(loadUserStats());
  }, []);

  const handleRecordAttempt = (attempt: QuizAttempt, perOrganismResults: Record<string, boolean>) => {
    const updated = recordQuizAttempt(attempt, perOrganismResults);
    setStats({ ...updated });
  };

  const handleToggleBookmark = (id: string) => {
    const updated = toggleBookmarkInStorage(id);
    setStats({ ...updated });
  };

  const handleResetStats = () => {
    const fresh = resetAllStats();
    setStats({ ...fresh });
  };

  const handleSelectOrganismForStudy = (organismId: string, mode: 'mode1' | 'mode2') => {
    if (mode === 'mode1') {
      setActiveTab('mode1');
    } else {
      setActiveTab('mode2');
    }
  };

  // Quick stats calculation
  const masteredCount = Object.values(stats.organismMastery).filter(
    (item: { correct: number; incorrect: number }) =>
      item.correct + item.incorrect >= 2 &&
      Math.round((item.correct / (item.correct + item.incorrect)) * 100) >= 75
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top Course Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo / Course Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center shadow-xs">
                <Microscope className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight">
                    MCRO 251
                  </span>
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                    Dr. Cramer
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-medium hidden sm:block">
                  Introduction to Medical Microbiology • Study Hub
                </div>
              </div>
            </div>

            {/* Quick Progress Highlights */}
            <div className="flex items-center gap-4 text-xs">
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-900 rounded-full border border-amber-200 font-semibold">
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>{stats.streakDays} Day Streak</span>
              </div>

              <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-900 rounded-full border border-emerald-200 font-semibold">
                <Trophy className="w-3.5 h-3.5 text-emerald-600" />
                <span>{masteredCount} / {cards.length} Mastered</span>
              </div>

              <button
                id="course-info-btn"
                onClick={() => setInfoModalOpen(true)}
                title="About MCRO 251 Organism Cards"
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Course Card Info"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1 sm:space-x-2 border-t border-slate-100 pt-1 -mb-px overflow-x-auto scrollbar-none">
            <button
              id="tab-library"
              onClick={() => setActiveTab('library')}
              className={`px-3.5 py-2.5 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
                activeTab === 'library'
                  ? 'border-blue-600 text-blue-700 bg-blue-50/40'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Organism Library</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200/80 text-slate-700 font-mono">
                {cards.length}
              </span>
            </button>

            <button
              id="tab-mode1"
              onClick={() => setActiveTab('mode1')}
              className={`px-3.5 py-2.5 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
                activeTab === 'mode1'
                  ? 'border-blue-600 text-blue-700 bg-blue-50/40'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <CheckSquare className="w-4 h-4 text-blue-600" />
              <span>Mode 1: Assign Characteristics</span>
            </button>

            <button
              id="tab-mode2"
              onClick={() => setActiveTab('mode2')}
              className={`px-3.5 py-2.5 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
                activeTab === 'mode2'
                  ? 'border-purple-600 text-purple-700 bg-purple-50/40'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Search className="w-4 h-4 text-purple-600" />
              <span>Mode 2: Identify Microorganism</span>
            </button>

            <button
              id="tab-progress"
              onClick={() => setActiveTab('progress')}
              className={`px-3.5 py-2.5 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
                activeTab === 'progress'
                  ? 'border-emerald-600 text-emerald-700 bg-emerald-50/40'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <BarChart2 className="w-4 h-4 text-emerald-600" />
              <span>Progress Tracker</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'library' && (
          <OrganismLibrary
            cards={cards}
            bookmarkedIds={stats.bookmarkedIds}
            onToggleBookmark={handleToggleBookmark}
            onSelectOrganismForStudy={handleSelectOrganismForStudy}
          />
        )}

        {activeTab === 'mode1' && (
          <ModeAssignCharacteristics
            cards={cards}
            onRecordAttempt={handleRecordAttempt}
            bookmarkedIds={stats.bookmarkedIds}
            onToggleBookmark={handleToggleBookmark}
          />
        )}

        {activeTab === 'mode2' && (
          <ModeIdentifyMicroorganism
            cards={cards}
            onRecordAttempt={handleRecordAttempt}
            bookmarkedIds={stats.bookmarkedIds}
            onToggleBookmark={handleToggleBookmark}
          />
        )}

        {activeTab === 'progress' && (
          <ProgressTracker
            cards={cards}
            stats={stats}
            onResetStats={handleResetStats}
            onSelectOrganismForStudy={handleSelectOrganismForStudy}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-slate-700">MCRO 251 Medical Microbiology</span>
            <span>• Organism Cards with Dr. Cramer</span>
          </div>
          <div className="text-slate-400">
            All 17 course reference cards indexed with active spaced repetition tracking.
          </div>
        </div>
      </footer>

      {/* Info / About Modal */}
      {infoModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setInfoModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Microscope className="w-5 h-5 text-blue-600" />
                <span>About MCRO 251 Study Hub</span>
              </h3>
              <button
                onClick={() => setInfoModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
              <p>
                Welcome to the <strong>MCRO 251: Introduction to Medical Microbiology</strong> study website! This app is built to accompany <strong>Dr. Cramer's Organism Cards</strong> to help students master all high-yield microbes for exams.
              </p>

              <div className="p-3 bg-blue-50 text-blue-900 rounded-xl space-y-1.5 border border-blue-200">
                <div className="font-bold">Two Targeted Study Modes:</div>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    <strong>Mode 1 (Name ➔ Characteristics):</strong> You are given a microorganism (e.g., <em>Klebsiella pneumoniae</em>) and must fill in its organism type, Gram/morphology, reservoir, transmission routes, and vaccine availability.
                  </li>
                  <li>
                    <strong>Mode 2 (Characteristics ➔ Name):</strong> You are given a clinical dossier of signs, symptoms, morphology, and virulence factors and must identify the causative pathogen!
                  </li>
                </ul>
              </div>

              <p>
                Your progress, accuracy rate, and streaks are automatically tracked locally so you can easily review your weak spots before the test.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setInfoModalOpen(false)}
                className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl text-xs hover:bg-blue-700"
              >
                Got It, Let's Study!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
