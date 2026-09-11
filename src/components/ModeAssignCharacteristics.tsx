import React, { useState, useEffect, useMemo } from 'react';
import { 
  MicroorganismCard, 
  OrganismType, 
  ReservoirType, 
  DirectTransmission, 
  IndirectTransmission, 
  MorphologyTag, 
  ID50Type, 
  IncubationType, 
  QuizAttempt 
} from '../types';
import { MICROORGANISMS, CHARACTERISTIC_OPTIONS } from '../data/microorganisms';
import { loadAllOrganisms } from '../utils/storage';
import { OrganismCardView } from './OrganismCardView';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  ChevronRight, 
  RotateCcw, 
  Sparkles, 
  Eye, 
  Filter, 
  Award, 
  BookOpen, 
  Volume2, 
  ShieldAlert,
  Dna 
} from 'lucide-react';

interface ModeAssignCharacteristicsProps {
  onRecordAttempt: (attempt: QuizAttempt, perOrganismResults: Record<string, boolean>) => void;
  bookmarkedIds: string[];
  onToggleBookmark: (id: string) => void;
  cards?: MicroorganismCard[];
}

interface UserSelectionState {
  organismType: OrganismType | null;
  reservoir: ReservoirType[];
  morphologyTags: MorphologyTag[];
  incubationPeriod: IncubationType | null;
  id50: ID50Type | null;
  transmissionDirect: DirectTransmission[];
  transmissionIndirect: IndirectTransmission[];
  hasVaccine: boolean | null;
  virulenceInput: string;
  virulenceSelfGrade: boolean | null;
  virulenceRevealed: boolean;
}

const emptySelection: UserSelectionState = {
  organismType: null,
  reservoir: [],
  morphologyTags: [],
  incubationPeriod: null,
  id50: null,
  transmissionDirect: [],
  transmissionIndirect: [],
  hasVaccine: null,
  virulenceInput: '',
  virulenceSelfGrade: null,
  virulenceRevealed: false,
};

export const ModeAssignCharacteristics: React.FC<ModeAssignCharacteristicsProps> = ({
  onRecordAttempt,
  bookmarkedIds,
  onToggleBookmark,
  cards,
}) => {
  // Filter settings
  const [filterType, setFilterType] = useState<'all' | 'bacteria' | 'virus' | 'bookmarked'>('all');
  const [sessionLength, setSessionLength] = useState<number>(5);

  // Deck queue
  const [deck, setDeck] = useState<MicroorganismCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userSelection, setUserSelection] = useState<UserSelectionState>(emptySelection);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showOfficialCard, setShowOfficialCard] = useState<boolean>(false);

  // Session stats
  const [sessionAnswers, setSessionAnswers] = useState<{
    organismId: string;
    scorePercent: number;
    isPass: boolean;
  }[]>([]);
  const [sessionCompleted, setSessionCompleted] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number>(Date.now());

  // Filter pool
  const allCardsPool = useMemo(() => cards || loadAllOrganisms(), [cards]);
  const filteredCards = useMemo(() => {
    let list = [...allCardsPool];
    if (filterType === 'bacteria') {
      list = list.filter((c) => c.organismType === 'Bacteria');
    } else if (filterType === 'virus') {
      list = list.filter((c) => c.organismType === 'Virus');
    } else if (filterType === 'bookmarked') {
      list = list.filter((c) => bookmarkedIds.includes(c.id));
      if (list.length === 0) list = [...allCardsPool];
    }
    return list;
  }, [filterType, bookmarkedIds, allCardsPool]);

  // Start / restart quiz deck
  const startNewDeck = () => {
    const shuffled = [...filteredCards].sort(() => 0.5 - Math.random());
    const count = Math.min(sessionLength, shuffled.length);
    const selectedDeck = shuffled.slice(0, count);

    setDeck(selectedDeck);
    setCurrentIndex(0);
    setUserSelection(emptySelection);
    setIsSubmitted(false);
    setShowHint(false);
    setShowOfficialCard(false);
    setSessionAnswers([]);
    setSessionCompleted(false);
    setStartTime(Date.now());
  };

  useEffect(() => {
    startNewDeck();
  }, [filterType, sessionLength, allCardsPool]);

  const currentCard = deck[currentIndex];

  // Helper toggle for array selections
  const toggleArrayItem = <T,>(field: keyof UserSelectionState, item: T) => {
    if (isSubmitted) return;
    setUserSelection((prev) => {
      const currentList = prev[field] as T[];
      const exists = currentList.includes(item);
      const updated = exists ? currentList.filter((x) => x !== item) : [...currentList, item];
      return { ...prev, [field]: updated };
    });
  };

  // Evaluation breakdown
  const evaluation = useMemo(() => {
    if (!currentCard) return null;

    // 1. Organism Type (weight 15)
    const typeCorrect = userSelection.organismType === currentCard.organismType;

    // 2. Morphology & Genome tags (weight 20)
    // Tags include: 'Gram-pos', 'Gram-neg', 'RNA', 'DNA', 'Single-stranded', 'Double-stranded', 'Naked', 'Enveloped'
    const targetMorph = new Set(currentCard.morphologyTags);
    const userMorph = new Set(userSelection.morphologyTags);
    const morphMatches = currentCard.morphologyTags.filter((t) => userMorph.has(t)).length;
    const morphExtra = userSelection.morphologyTags.filter((t) => !targetMorph.has(t)).length;
    const morphCorrect = targetMorph.size === 0 
      ? userMorph.size === 0 
      : morphMatches === targetMorph.size && morphExtra === 0;

    // 3. Reservoir (weight 15)
    const targetRes = new Set(currentCard.reservoir);
    const userRes = new Set(userSelection.reservoir);
    const resMatches = currentCard.reservoir.filter((r) => userRes.has(r)).length;
    const resExtra = userSelection.reservoir.filter((r) => !targetRes.has(r)).length;
    const reservoirCorrect = resMatches === targetRes.size && resExtra === 0;

    // 4. Transmission (weight 20: 10 direct, 10 indirect)
    const targetDirect = new Set(currentCard.transmissionDirect);
    const userDirect = new Set(userSelection.transmissionDirect);
    const directMatches = currentCard.transmissionDirect.filter((d) => userDirect.has(d)).length;
    const directExtra = userSelection.transmissionDirect.filter((d) => !targetDirect.has(d)).length;
    const directCorrect = targetDirect.size === 0 
      ? userDirect.size === 0 
      : directMatches === targetDirect.size && directExtra === 0;

    const targetIndirect = new Set(currentCard.transmissionIndirect);
    const userIndirect = new Set(userSelection.transmissionIndirect);
    const indirectMatches = currentCard.transmissionIndirect.filter((i) => userIndirect.has(i)).length;
    const indirectExtra = userSelection.transmissionIndirect.filter((i) => !targetIndirect.has(i)).length;
    const indirectCorrect = targetIndirect.size === 0 
      ? userIndirect.size === 0 
      : indirectMatches === targetIndirect.size && indirectExtra === 0;

    // 5. Vaccine (weight 10)
    const vaccineCorrect = userSelection.hasVaccine === currentCard.hasVaccine;

    // 6. Incubation (weight 10)
    const incubationCorrect = userSelection.incubationPeriod === currentCard.incubationPeriod;

    // 7. Virulence Factors Self-Assessment (weight 10)
    const virulenceCorrect = userSelection.virulenceSelfGrade === true;

    let earnedScore = 0;
    if (typeCorrect) earnedScore += 15;

    if (morphCorrect) earnedScore += 20;
    else if (morphMatches > 0 && morphExtra === 0) {
      earnedScore += Math.round((morphMatches / (targetMorph.size || 1)) * 20);
    }

    if (reservoirCorrect) earnedScore += 15;
    else if (resMatches > 0 && resExtra === 0) earnedScore += 8;

    if (directCorrect) earnedScore += 10;
    else if (directMatches > 0 && directExtra === 0) earnedScore += 5;

    if (indirectCorrect) earnedScore += 10;
    else if (indirectMatches > 0 && indirectExtra === 0) earnedScore += 5;

    if (vaccineCorrect) earnedScore += 10;
    if (incubationCorrect) earnedScore += 10;
    if (virulenceCorrect) earnedScore += 10;

    const percent = Math.min(100, Math.round(earnedScore));
    const isPass = percent >= 75;

    return {
      typeCorrect,
      morphCorrect,
      reservoirCorrect,
      directCorrect,
      indirectCorrect,
      vaccineCorrect,
      incubationCorrect,
      virulenceCorrect,
      scorePercent: percent,
      isPass,
    };
  }, [currentCard, userSelection]);

  // Keep session answers in sync when virulence self-grade or answers change after submit
  useEffect(() => {
    if (isSubmitted && currentCard && evaluation) {
      setSessionAnswers((prev) => {
        const copy = [...prev];
        const idx = copy.findIndex((a) => a.organismId === currentCard.id);
        if (idx !== -1) {
          copy[idx] = {
            organismId: currentCard.id,
            scorePercent: evaluation.scorePercent,
            isPass: evaluation.isPass,
          };
          return copy;
        }
        return prev;
      });
    }
  }, [isSubmitted, currentCard, evaluation]);

  const setVirulenceGrade = (isRight: boolean) => {
    setUserSelection((prev) => ({
      ...prev,
      virulenceSelfGrade: isRight,
      virulenceRevealed: true,
    }));
  };

  const handleSubmit = () => {
    if (!currentCard || !evaluation) return;
    setIsSubmitted(true);
    // Reveal official virulence factors automatically on submission
    setUserSelection((prev) => ({ ...prev, virulenceRevealed: true }));

    if (evaluation.scorePercent === 100) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch (e) {}
    }

    const updatedSessionAnswers = [
      ...sessionAnswers,
      {
        organismId: currentCard.id,
        scorePercent: evaluation.scorePercent,
        isPass: evaluation.isPass,
      }
    ];
    setSessionAnswers(updatedSessionAnswers);
  };

  const handleNext = () => {
    if (currentIndex + 1 < deck.length) {
      setCurrentIndex((prev) => prev + 1);
      setUserSelection(emptySelection);
      setIsSubmitted(false);
      setShowHint(false);
      setShowOfficialCard(false);
    } else {
      // Session finished
      setSessionCompleted(true);
      const totalQuestions = deck.length;
      const passedCount = sessionAnswers.filter((a) => a.isPass).length;
      const avgScore = Math.round(
        sessionAnswers.reduce((acc, curr) => acc + curr.scorePercent, 0) / (sessionAnswers.length || 1)
      );

      const perOrganismResults: Record<string, boolean> = {};
      sessionAnswers.forEach((ans) => {
        perOrganismResults[ans.organismId] = ans.isPass;
      });

      const missedOrganismIds = sessionAnswers
        .filter((a) => !a.isPass)
        .map((a) => a.organismId);

      onRecordAttempt(
        {
          id: `att-m1-${Date.now()}`,
          timestamp: Date.now(),
          mode: 'assign-characteristics',
          totalQuestions,
          correctAnswers: passedCount,
          scorePercentage: avgScore,
          durationSeconds: Math.round((Date.now() - startTime) / 1000),
          missedOrganismIds,
        },
        perOrganismResults
      );

      if (avgScore >= 80) {
        try {
          confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
        } catch (e) {}
      }
    }
  };

  const handlePronounce = () => {
    if (currentCard && 'speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(currentCard.scientificName);
      u.rate = 0.9;
      window.speechSynthesis.speak(u);
    }
  };

  if (!currentCard) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200 shadow-sm max-w-lg mx-auto">
        <h3 className="text-lg font-bold text-slate-800 mb-2">No Microorganisms Found</h3>
        <p className="text-sm text-slate-600 mb-4">
          Try selecting "All Organisms" or add cards to your bookmarks first.
        </p>
        <button
          onClick={() => setFilterType('all')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
        >
          Reset Filter to All
        </button>
      </div>
    );
  }

  // Summary Screen when session completes
  if (sessionCompleted) {
    const avgScore = Math.round(
      sessionAnswers.reduce((acc, curr) => acc + curr.scorePercent, 0) / (sessionAnswers.length || 1)
    );
    const passedCount = sessionAnswers.filter((a) => a.isPass).length;

    return (
      <div id="mode1-summary-card" className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 text-center">
        <div className="w-16 h-16 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <Award className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-1">Study Session Complete!</h2>
        <p className="text-sm text-slate-600 mb-6">
          Mode 1: Characteristic Assignment • MCRO 251
        </p>

        <div className="grid grid-cols-3 gap-4 mb-8 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <div className="text-2xl font-black text-blue-700">{avgScore}%</div>
            <div className="text-xs font-semibold text-slate-500 uppercase mt-0.5">Average Accuracy</div>
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-600">
              {passedCount} / {deck.length}
            </div>
            <div className="text-xs font-semibold text-slate-500 uppercase mt-0.5">Cards Mastered</div>
          </div>
          <div>
            <div className="text-2xl font-black text-purple-700">
              {Math.round((Date.now() - startTime) / 1000)}s
            </div>
            <div className="text-xs font-semibold text-slate-500 uppercase mt-0.5">Session Time</div>
          </div>
        </div>

        <div className="text-left mb-8">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Review of Tested Cards:</h3>
          <div className="space-y-2">
            {deck.map((card, idx) => {
              const res = sessionAnswers[idx];
              return (
                <div
                  key={card.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white"
                >
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">{card.scientificName}</div>
                    <div className="text-xs text-slate-500">{card.disease} ({card.organismType})</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      (res?.scorePercent || 0) >= 75
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {res?.scorePercent || 0}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-center gap-3">
          <button
            id="restart-session-btn"
            onClick={startNewDeck}
            className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-sm transition-colors flex items-center gap-2 text-sm"
          >
            <RotateCcw className="w-4 h-4" /> Practice Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Session Controls & Progress Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            Card {currentIndex + 1} of {deck.length}
          </div>
          <div className="w-32 bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
            <div
              className="bg-blue-600 h-full transition-all duration-300"
              style={{ width: `${((currentIndex + (isSubmitted ? 1 : 0)) / deck.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500 font-medium">Deck:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="bg-slate-50 border border-slate-300 text-slate-700 rounded-lg px-2 py-1 font-medium focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Organisms (17)</option>
            <option value="bacteria">Bacteria Only</option>
            <option value="virus">Viruses Only</option>
            <option value="bookmarked">Bookmarked Only ({bookmarkedIds.length})</option>
          </select>

          <select
            value={sessionLength}
            onChange={(e) => setSessionLength(Number(e.target.value))}
            className="bg-slate-50 border border-slate-300 text-slate-700 rounded-lg px-2 py-1 font-medium focus:ring-2 focus:ring-blue-500"
          >
            <option value={5}>5 Cards</option>
            <option value={10}>10 Cards</option>
            <option value={17}>Full Deck (17)</option>
          </select>
        </div>
      </div>

      {/* The Target Prompt */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/40 text-blue-100 text-xs font-semibold tracking-wider uppercase border border-blue-400/30">
                Mode 1: Assign Characteristics
              </span>
              <button
                type="button"
                onClick={handlePronounce}
                title="Hear pronunciation"
                className="p-1 rounded bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold italic font-serif tracking-tight text-white">
              {currentCard.scientificName}
            </h2>
            <p className="text-blue-100 text-sm mt-1">
              Primary Disease: <span className="font-semibold text-white">{currentCard.disease}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              id="hint-toggle-btn"
              type="button"
              onClick={() => setShowHint(!showHint)}
              className="px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              {showHint ? 'Hide Hint' : 'Need a Hint?'}
            </button>
          </div>
        </div>

        {/* Hint Disclosure */}
        {showHint && (
          <div className="mt-4 p-3 bg-blue-900/70 border border-blue-400/40 rounded-xl text-xs text-blue-100 space-y-1">
            <div>
              <span className="font-bold text-amber-300">Clinical Hallmark: </span>
              {currentCard.signsAndSymptoms}
            </div>
            <div>
              <span className="font-bold text-amber-300">At-Risk: </span>
              {currentCard.atRiskPopulations}
            </div>
          </div>
        )}
      </div>

      {/* The Assignment Form (Interactive Card Builder) */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-sm p-5 sm:p-7 space-y-6">
        <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
            <span>Assign Characteristics for</span>
            <span className="italic font-serif text-blue-700">{currentCard.scientificName}</span>
          </h3>
          {isSubmitted && evaluation && (
            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
              evaluation.scorePercent >= 75 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}>
              Score: {evaluation.scorePercent}%
            </span>
          )}
        </div>

        {/* 1. Organism Classification */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              1. Organism Category <span className="text-rose-500">*</span>
            </label>
            {isSubmitted && (
              <span className="text-xs font-semibold flex items-center gap-1">
                {evaluation?.typeCorrect ? (
                  <span className="text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Correct ({currentCard.organismType})
                  </span>
                ) : (
                  <span className="text-rose-600 flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" /> Incorrect (Should be: {currentCard.organismType})
                  </span>
                )}
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {CHARACTERISTIC_OPTIONS.organismTypes.map((type) => {
              const isSelected = userSelection.organismType === type;
              const isTarget = currentCard.organismType === type;
              let btnClass = 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100';

              if (isSubmitted) {
                if (isTarget) {
                  btnClass = 'bg-emerald-100 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-400';
                } else if (isSelected && !isTarget) {
                  btnClass = 'bg-rose-100 border-rose-400 text-rose-950 line-through';
                }
              } else if (isSelected) {
                btnClass = 'bg-blue-600 border-blue-700 text-white font-bold shadow-xs';
              }

              return (
                <button
                  key={type}
                  id={`org-type-${type.toLowerCase()}`}
                  type="button"
                  disabled={isSubmitted}
                  onClick={() => setUserSelection({ ...userSelection, organismType: type })}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border text-center transition-all ${btnClass}`}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Morphology & Structure Tags */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              2. Morphology & Structure Tags <span className="text-slate-400 font-normal">(Select all that apply)</span>
            </label>
            {isSubmitted && (
              <span className="text-xs font-semibold">
                {evaluation?.morphCorrect ? (
                  <span className="text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Morphology matched!
                  </span>
                ) : (
                  <span className="text-rose-600 flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" /> Correct: {currentCard.morphologyTags.join(', ') || 'None'}
                  </span>
                )}
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {CHARACTERISTIC_OPTIONS.morphologyTags.map((tag) => {
              const isSelected = userSelection.morphologyTags.includes(tag);
              const isTarget = currentCard.morphologyTags.includes(tag);
              let btnClass = 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100';

              if (isSubmitted) {
                if (isTarget && isSelected) {
                  btnClass = 'bg-emerald-100 border-emerald-500 text-emerald-950 font-bold';
                } else if (isTarget && !isSelected) {
                  btnClass = 'bg-amber-100 border-amber-400 text-amber-950 font-bold border-dashed';
                } else if (!isTarget && isSelected) {
                  btnClass = 'bg-rose-100 border-rose-400 text-rose-950 line-through';
                }
              } else if (isSelected) {
                btnClass = 'bg-blue-600 border-blue-700 text-white font-bold shadow-xs';
              }

              return (
                <button
                  key={tag}
                  id={`morph-tag-${tag.toLowerCase()}`}
                  type="button"
                  disabled={isSubmitted}
                  onClick={() => toggleArrayItem('morphologyTags', tag)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border text-center transition-all ${btnClass}`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
          {isSubmitted && (
            <p className="text-xs text-slate-500 italic mt-1.5">
              Card description: {currentCard.morphologyDescription}
            </p>
          )}
        </div>

        {/* 3. Reservoir & Incubation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Reservoir */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                3. Reservoir <span className="text-slate-400 font-normal">(Select all that apply)</span>
              </label>
              {isSubmitted && (
                <span className="text-xs font-semibold">
                  {evaluation?.reservoirCorrect ? (
                    <span className="text-emerald-600">✓ Correct</span>
                  ) : (
                    <span className="text-rose-600">Correct: {currentCard.reservoir.join(', ')}</span>
                  )}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {CHARACTERISTIC_OPTIONS.reservoirs.map((res) => {
                const isSelected = userSelection.reservoir.includes(res);
                const isTarget = currentCard.reservoir.includes(res);
                let btnClass = 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100';

                if (isSubmitted) {
                  if (isTarget && isSelected) {
                    btnClass = 'bg-emerald-100 border-emerald-500 text-emerald-950 font-bold';
                  } else if (isTarget && !isSelected) {
                    btnClass = 'bg-amber-100 border-amber-400 text-amber-950 border-dashed';
                  } else if (!isTarget && isSelected) {
                    btnClass = 'bg-rose-100 border-rose-400 text-rose-950 line-through';
                  }
                } else if (isSelected) {
                  btnClass = 'bg-blue-600 border-blue-700 text-white font-bold shadow-xs';
                }

                return (
                  <button
                    key={res}
                    type="button"
                    disabled={isSubmitted}
                    onClick={() => toggleArrayItem('reservoir', res)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium border text-center transition-all ${btnClass}`}
                  >
                    {res}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Incubation Period */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                4. Incubation Period
              </label>
              {isSubmitted && (
                <span className="text-xs font-semibold">
                  {evaluation?.incubationCorrect ? (
                    <span className="text-emerald-600">✓ Correct</span>
                  ) : (
                    <span className="text-rose-600">Correct: {currentCard.incubationPeriod}</span>
                  )}
                </span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['Short', 'Long', 'N/A (Average)'] as IncubationType[]).map((inc) => {
                const isSelected = userSelection.incubationPeriod === inc;
                const isTarget = currentCard.incubationPeriod === inc || (inc === 'Short' && currentCard.incubationPeriod.includes('Short'));
                let btnClass = 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100';

                if (isSubmitted) {
                  if (isTarget) {
                    btnClass = 'bg-emerald-100 border-emerald-500 text-emerald-950 font-bold';
                  } else if (isSelected && !isTarget) {
                    btnClass = 'bg-rose-100 border-rose-400 text-rose-950 line-through';
                  }
                } else if (isSelected) {
                  btnClass = 'bg-blue-600 border-blue-700 text-white font-bold shadow-xs';
                }

                return (
                  <button
                    key={inc}
                    type="button"
                    disabled={isSubmitted}
                    onClick={() => setUserSelection({ ...userSelection, incubationPeriod: inc })}
                    className={`px-3 py-2 rounded-xl text-xs font-medium border text-center transition-all ${btnClass}`}
                  >
                    {inc}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 4. Transmission Routes (Direct & Indirect) */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-2">
            5. Transmission Routes <span className="text-slate-400 font-normal">(Direct & Indirect)</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            {/* Direct */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-700">Direct Transmission:</span>
                {isSubmitted && (
                  <span className="text-[11px] font-semibold text-slate-500">
                    Target: {currentCard.transmissionDirect.join(', ') || 'None'}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {CHARACTERISTIC_OPTIONS.transmissionDirect.map((direct) => {
                  const isSelected = userSelection.transmissionDirect.includes(direct);
                  const isTarget = currentCard.transmissionDirect.includes(direct);
                  let btnClass = 'bg-white border-slate-300 text-slate-700';

                  if (isSubmitted) {
                    if (isTarget && isSelected) {
                      btnClass = 'bg-emerald-100 border-emerald-500 text-emerald-950 font-bold';
                    } else if (isTarget && !isSelected) {
                      btnClass = 'bg-amber-100 border-amber-400 text-amber-950 border-dashed';
                    } else if (!isTarget && isSelected) {
                      btnClass = 'bg-rose-100 border-rose-400 text-rose-950 line-through';
                    }
                  } else if (isSelected) {
                    btnClass = 'bg-blue-600 border-blue-700 text-white font-bold';
                  }

                  return (
                    <button
                      key={direct}
                      type="button"
                      disabled={isSubmitted}
                      onClick={() => toggleArrayItem('transmissionDirect', direct)}
                      className={`px-2 py-1.5 rounded-lg text-xs font-medium border text-center transition-all ${btnClass}`}
                    >
                      {direct}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Indirect */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-700">Indirect Transmission:</span>
                {isSubmitted && (
                  <span className="text-[11px] font-semibold text-slate-500">
                    Target: {currentCard.transmissionIndirect.join(', ') || 'None'}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {CHARACTERISTIC_OPTIONS.transmissionIndirect.map((indirect) => {
                  const isSelected = userSelection.transmissionIndirect.includes(indirect);
                  const isTarget = currentCard.transmissionIndirect.includes(indirect);
                  let btnClass = 'bg-white border-slate-300 text-slate-700';

                  if (isSubmitted) {
                    if (isTarget && isSelected) {
                      btnClass = 'bg-emerald-100 border-emerald-500 text-emerald-950 font-bold';
                    } else if (isTarget && !isSelected) {
                      btnClass = 'bg-amber-100 border-amber-400 text-amber-950 border-dashed';
                    } else if (!isTarget && isSelected) {
                      btnClass = 'bg-rose-100 border-rose-400 text-rose-950 line-through';
                    }
                  } else if (isSelected) {
                    btnClass = 'bg-blue-600 border-blue-700 text-white font-bold';
                  }

                  return (
                    <button
                      key={indirect}
                      type="button"
                      disabled={isSubmitted}
                      onClick={() => toggleArrayItem('transmissionIndirect', indirect)}
                      className={`px-2 py-1.5 rounded-lg text-[11px] font-medium border text-center transition-all ${btnClass}`}
                    >
                      {indirect}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 5. Vaccine Availability */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              6. Vaccine Available?
            </label>
            {isSubmitted && (
              <span className="text-xs font-semibold">
                {evaluation?.vaccineCorrect ? (
                  <span className="text-emerald-600">✓ Correct</span>
                ) : (
                  <span className="text-rose-600">
                    Correct: {currentCard.hasVaccine ? 'Yes!' : 'NO ☹'}
                  </span>
                )}
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 max-w-xs">
            <button
              id="vaccine-yes-btn"
              type="button"
              disabled={isSubmitted}
              onClick={() => setUserSelection({ ...userSelection, hasVaccine: true })}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                isSubmitted
                  ? currentCard.hasVaccine
                    ? 'bg-emerald-100 border-emerald-500 text-emerald-950 ring-2 ring-emerald-400'
                    : userSelection.hasVaccine === true
                    ? 'bg-rose-100 border-rose-400 text-rose-950 line-through'
                    : 'bg-slate-50 border-slate-300 text-slate-500'
                  : userSelection.hasVaccine === true
                  ? 'bg-emerald-600 border-emerald-700 text-white'
                  : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Yes! (Vaccine Available)
            </button>

            <button
              id="vaccine-no-btn"
              type="button"
              disabled={isSubmitted}
              onClick={() => setUserSelection({ ...userSelection, hasVaccine: false })}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                isSubmitted
                  ? !currentCard.hasVaccine
                    ? 'bg-emerald-100 border-emerald-500 text-emerald-950 ring-2 ring-emerald-400'
                    : userSelection.hasVaccine === false
                    ? 'bg-rose-100 border-rose-400 text-rose-950 line-through'
                    : 'bg-slate-50 border-slate-300 text-slate-500'
                  : userSelection.hasVaccine === false
                  ? 'bg-rose-600 border-rose-700 text-white'
                  : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              NO ☹ (No Vaccine)
            </button>
          </div>
        </div>

        {/* 7. Virulence Factors (Free Recall & Self-Assessment) */}
        <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-purple-950 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-700" />
              <span>7. Virulence Factors (Free Recall & Self-Assessment)</span>
            </label>
            {userSelection.virulenceSelfGrade !== null && (
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                userSelection.virulenceSelfGrade 
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                  : 'bg-rose-100 text-rose-800 border border-rose-300'
              }`}>
                {userSelection.virulenceSelfGrade ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Self-Assessed: Correct (+10 pts)
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5" /> Self-Assessed: Missed / Incorrect
                  </>
                )}
              </span>
            )}
          </div>

          <p className="text-xs text-purple-900/80 mb-2">
            Enter the virulence factors (toxins, adhesins, capsules, enzymes, intracellular evasion, etc.) you associate with this organism:
          </p>

          <textarea
            id="virulence-factor-input"
            rows={3}
            value={userSelection.virulenceInput}
            onChange={(e) => setUserSelection({ ...userSelection, virulenceInput: e.target.value })}
            placeholder="Type your recalled virulence factors here..."
            className="w-full px-3 py-2 text-xs border border-purple-300 rounded-lg bg-white text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
          />

          {/* Reveal & Self-Grading Block */}
          {!userSelection.virulenceRevealed ? (
            <div className="mt-2.5 flex items-center justify-between flex-wrap gap-2">
              <button
                id="reveal-virulence-btn"
                type="button"
                onClick={() => setUserSelection({ ...userSelection, virulenceRevealed: true })}
                className="px-3.5 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" /> Check Official Virulence Factors
              </button>
              <span className="text-[11px] text-slate-500 italic">
                Reveals the official card factors so you can self-check
              </span>
            </div>
          ) : (
            <div className="mt-3 p-3.5 bg-white rounded-lg border border-purple-200 shadow-2xs space-y-3">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-purple-950 mb-1 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-purple-700" />
                  Official Virulence Factors:
                </div>
                <div className="p-2.5 bg-purple-50/70 rounded-md border border-purple-200 text-xs font-semibold text-purple-950 leading-relaxed">
                  {currentCard.virulenceFactors || 'None reported'}
                </div>
              </div>

              {userSelection.virulenceInput.trim() && (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Your Response:
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-md border border-slate-200 text-xs text-slate-800 italic">
                    "{userSelection.virulenceInput.trim()}"
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100">
                <div className="text-xs font-bold text-slate-800 mb-2">
                  Based on the official response, were you right or wrong?
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    id="virulence-selfgrade-right-btn"
                    type="button"
                    onClick={() => setVirulenceGrade(true)}
                    className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      userSelection.virulenceSelfGrade === true
                        ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    I Was Right (+10 pts)
                  </button>

                  <button
                    id="virulence-selfgrade-wrong-btn"
                    type="button"
                    onClick={() => setVirulenceGrade(false)}
                    className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      userSelection.virulenceSelfGrade === false
                        ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-400'
                        : 'bg-rose-50 text-rose-800 border border-rose-300 hover:bg-rose-100'
                    }`}
                  >
                    <XCircle className="w-4 h-4" />
                    I Was Wrong / Missed
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div>
            {isSubmitted && (
              <button
                id="show-official-card-btn"
                type="button"
                onClick={() => setShowOfficialCard(!showOfficialCard)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5" />
                {showOfficialCard ? 'Hide Official Card' : 'View Dr. Cramer Card'}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isSubmitted ? (
              <button
                id="submit-characteristics-btn"
                type="button"
                onClick={handleSubmit}
                className="px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 shadow-sm transition-all flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Check Assignment
              </button>
            ) : (
              <button
                id="next-card-btn"
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 shadow-sm transition-all flex items-center gap-2"
              >
                Next Microorganism <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Official Dr. Cramer Card Modal / Expandable view */}
      {isSubmitted && showOfficialCard && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Official Course Reference Card:
            </span>
          </div>
          <OrganismCardView
            card={currentCard}
            isBookmarked={bookmarkedIds.includes(currentCard.id)}
            onToggleBookmark={onToggleBookmark}
          />
        </div>
      )}
    </div>
  );
};
