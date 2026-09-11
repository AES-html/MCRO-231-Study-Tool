import React, { useState, useEffect, useMemo } from 'react';
import { MicroorganismCard, QuizAttempt } from '../types';
import { MICROORGANISMS } from '../data/microorganisms';
import { loadAllOrganisms } from '../utils/storage';
import { OrganismCardView } from './OrganismCardView';
import confetti from 'canvas-confetti';
import { 
  HelpCircle, 
  ChevronRight, 
  RotateCcw, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Eye, 
  Filter, 
  Award,
  Layers,
  FlaskConical,
  ShieldAlert,
  Syringe,
  Pill,
  Dna
} from 'lucide-react';

interface ModeIdentifyMicroorganismProps {
  onRecordAttempt: (attempt: QuizAttempt, perOrganismResults: Record<string, boolean>) => void;
  bookmarkedIds: string[];
  onToggleBookmark: (id: string) => void;
  cards?: MicroorganismCard[];
}

export const ModeIdentifyMicroorganism: React.FC<ModeIdentifyMicroorganismProps> = ({
  onRecordAttempt,
  bookmarkedIds,
  onToggleBookmark,
  cards,
}) => {
  // Config
  const [inputStyle, setInputStyle] = useState<'multiple-choice' | 'free-recall'>('multiple-choice');
  const [filterType, setFilterType] = useState<'all' | 'bacteria' | 'virus' | 'bookmarked'>('all');
  const [sessionLength, setSessionLength] = useState<number>(5);

  // Deck queue
  const [deck, setDeck] = useState<MicroorganismCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // User input states
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [freeRecallSearch, setFreeRecallSearch] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [showFullCard, setShowFullCard] = useState<boolean>(false);

  // Clue reveal levels (progressive reveal for extra challenge)
  const [revealClues, setRevealClues] = useState<boolean>(false);

  // Session results
  const [sessionAnswers, setSessionAnswers] = useState<{
    organismId: string;
    chosenId: string | null;
    isCorrect: boolean;
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

  const startNewDeck = () => {
    const shuffled = [...filteredCards].sort(() => 0.5 - Math.random());
    const count = Math.min(sessionLength, shuffled.length);
    const selectedDeck = shuffled.slice(0, count);

    setDeck(selectedDeck);
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setFreeRecallSearch('');
    setIsSubmitted(false);
    setShowFullCard(false);
    setRevealClues(false);
    setSessionAnswers([]);
    setSessionCompleted(false);
    setStartTime(Date.now());
  };

  useEffect(() => {
    startNewDeck();
  }, [filterType, sessionLength, allCardsPool]);

  const currentCard = deck[currentIndex];

  // Generate 4 multiple-choice options (1 correct + 3 plausible distractors)
  const multipleChoiceOptions = useMemo(() => {
    if (!currentCard) return [];

    // Prioritize distractors of the same organism type if available, else random
    const sameType = allCardsPool.filter((c) => c.id !== currentCard.id && c.organismType === currentCard.organismType);
    const otherType = allCardsPool.filter((c) => c.id !== currentCard.id && c.organismType !== currentCard.organismType);

    const shuffledSame = [...sameType].sort(() => 0.5 - Math.random());
    const shuffledOthers = [...otherType].sort(() => 0.5 - Math.random());

    const distractors = [...shuffledSame, ...shuffledOthers].slice(0, 3);
    const allOptions = [currentCard, ...distractors].sort(() => 0.5 - Math.random());
    return allOptions;
  }, [currentCard]);

  // Free recall matching suggestions
  const searchSuggestions = useMemo(() => {
    if (!freeRecallSearch.trim()) return [];
    const q = freeRecallSearch.toLowerCase();
    return MICROORGANISMS.filter(
      (m) => m.scientificName.toLowerCase().includes(q)
    ).slice(0, 5);
  }, [freeRecallSearch]);

  const handleSubmit = (chosenId?: string) => {
    const finalChosenId = chosenId || selectedOptionId;
    if (!currentCard || !finalChosenId) return;

    setSelectedOptionId(finalChosenId);
    setIsSubmitted(true);

    const isCorrect = finalChosenId === currentCard.id;
    if (isCorrect) {
      try {
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
      } catch (e) {}
    }

    setSessionAnswers((prev) => [
      ...prev,
      {
        organismId: currentCard.id,
        chosenId: finalChosenId,
        isCorrect,
      },
    ]);
  };

  const handleNext = () => {
    if (currentIndex + 1 < deck.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOptionId(null);
      setFreeRecallSearch('');
      setIsSubmitted(false);
      setShowFullCard(false);
      setRevealClues(false);
    } else {
      // Complete
      setSessionCompleted(true);
      const totalQuestions = deck.length;
      const correctCount = sessionAnswers.filter((a) => a.isCorrect).length;
      const scorePct = Math.round((correctCount / (totalQuestions || 1)) * 100);

      const perOrganismResults: Record<string, boolean> = {};
      sessionAnswers.forEach((ans) => {
        perOrganismResults[ans.organismId] = ans.isCorrect;
      });

      const missedOrganismIds = sessionAnswers
        .filter((a) => !a.isCorrect)
        .map((a) => a.organismId);

      onRecordAttempt(
        {
          id: `att-m2-${Date.now()}`,
          timestamp: Date.now(),
          mode: 'identify-organism',
          totalQuestions,
          correctAnswers: correctCount,
          scorePercentage: scorePct,
          durationSeconds: Math.round((Date.now() - startTime) / 1000),
          missedOrganismIds,
        },
        perOrganismResults
      );

      if (scorePct >= 80) {
        try {
          confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
        } catch (e) {}
      }
    }
  };

  if (!currentCard) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200 shadow-sm max-w-lg mx-auto">
        <h3 className="text-lg font-bold text-slate-800 mb-2">No Microorganisms Found</h3>
        <button
          onClick={() => setFilterType('all')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
        >
          Reset Filter to All
        </button>
      </div>
    );
  }

  // Summary Screen
  if (sessionCompleted) {
    const correctCount = sessionAnswers.filter((a) => a.isCorrect).length;
    const scorePct = Math.round((correctCount / (deck.length || 1)) * 100);

    return (
      <div id="mode2-summary-card" className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 text-center">
        <div className="w-16 h-16 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <Award className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-1">Session Complete!</h2>
        <p className="text-sm text-slate-600 mb-6">
          Mode 2: Identify Microorganism • MCRO 251
        </p>

        <div className="grid grid-cols-3 gap-4 mb-8 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <div className="text-2xl font-black text-purple-700">{scorePct}%</div>
            <div className="text-xs font-semibold text-slate-500 uppercase mt-0.5">Accuracy</div>
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-600">
              {correctCount} / {deck.length}
            </div>
            <div className="text-xs font-semibold text-slate-500 uppercase mt-0.5">Identified Correctly</div>
          </div>
          <div>
            <div className="text-2xl font-black text-blue-700">
              {Math.round((Date.now() - startTime) / 1000)}s
            </div>
            <div className="text-xs font-semibold text-slate-500 uppercase mt-0.5">Session Duration</div>
          </div>
        </div>

        <div className="text-left mb-8 space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Question Breakdown:</h3>
          {deck.map((card, idx) => {
            const ans = sessionAnswers[idx];
            return (
              <div
                key={card.id}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white"
              >
                <div>
                  <div className="font-bold text-slate-900 text-sm">{card.scientificName}</div>
                  <div className="text-xs text-slate-500">
                    {card.organismType} • {card.morphologyDescription}
                  </div>
                </div>
                <div>
                  {ans?.isCorrect ? (
                    <span className="px-2.5 py-1 rounded text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded text-xs font-bold bg-rose-100 text-rose-800 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> Incorrect
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <button
          id="restart-mode2-btn"
          onClick={startNewDeck}
          className="px-6 py-2.5 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 shadow-sm transition-colors flex items-center gap-2 mx-auto text-sm"
        >
          <RotateCcw className="w-4 h-4" /> Practice Again
        </button>
      </div>
    );
  }

  const isCurrentCorrect = selectedOptionId === currentCard.id;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Session Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            Question {currentIndex + 1} of {deck.length}
          </div>
          <div className="w-32 bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
            <div
              className="bg-purple-600 h-full transition-all duration-300"
              style={{ width: `${((currentIndex + (isSubmitted ? 1 : 0)) / deck.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs flex-wrap">
          {/* Input style toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              id="toggle-multiple-choice"
              type="button"
              onClick={() => setInputStyle('multiple-choice')}
              className={`px-2.5 py-1 rounded-md font-semibold text-xs transition-colors ${
                inputStyle === 'multiple-choice'
                  ? 'bg-white text-purple-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Multiple Choice
            </button>
            <button
              id="toggle-free-recall"
              type="button"
              onClick={() => setInputStyle('free-recall')}
              className={`px-2.5 py-1 rounded-md font-semibold text-xs transition-colors ${
                inputStyle === 'free-recall'
                  ? 'bg-white text-purple-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Free Search / Recall
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="bg-slate-50 border border-slate-300 text-slate-700 rounded-lg px-2 py-1 font-medium focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Organisms</option>
              <option value="bacteria">Bacteria Only</option>
              <option value="virus">Viruses Only</option>
              <option value="bookmarked">Bookmarked Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Characteristic Case Dossier (The "Mystery Microbe") */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-purple-800 to-indigo-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-purple-200">
              Mode 2: Identify Microorganism • Mystery Microbe #{currentIndex + 1}
            </div>
            <div className="text-xl font-bold tracking-tight text-white flex items-center gap-2 mt-0.5">
              <span>Mystery Organism Clues</span>
              <span className="text-xs bg-purple-950/60 px-2.5 py-0.5 rounded-full border border-purple-400/30 text-purple-200 font-mono">
                {currentCard.organismType}
              </span>
            </div>
          </div>

          <button
            id="clue-reveal-toggle"
            type="button"
            onClick={() => setRevealClues(!revealClues)}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            {revealClues ? 'Hide High-Yield Buzzword' : 'Reveal High-Yield Clue'}
          </button>
        </div>

        {/* High Yield Clue if requested */}
        {revealClues && currentCard.highYieldBuzzwords && (
          <div className="bg-amber-50 px-6 py-3 border-b border-amber-200 flex items-center gap-2 text-xs text-amber-900">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Clinical Buzzword Clue:</strong> {currentCard.highYieldBuzzwords.slice(0, 2).join(' • ')}
            </span>
          </div>
        )}

        {/* The Card Characteristics Table */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Box 1: Morphology & Structure */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <FlaskConical className="w-3.5 h-3.5 text-purple-600" />
                <span>Morphology & Structure</span>
              </div>
              <div className="flex flex-wrap gap-1 mb-2">
                {currentCard.morphologyTags.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-purple-100 text-purple-900 border border-purple-200"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <p className="text-xs text-slate-700 italic leading-relaxed">
                {currentCard.morphologyDescription}
              </p>
            </div>

            {/* Box 2: Transmission & Reservoir */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                Transmission & Reservoir
              </div>
              <div className="text-xs space-y-1 text-slate-700">
                <div>
                  <span className="font-semibold text-slate-900">Reservoir: </span>
                  {currentCard.reservoir.join(', ')}
                </div>
                <div>
                  <span className="font-semibold text-slate-900">Direct Route: </span>
                  {currentCard.transmissionDirect.join(', ') || 'None noted'}
                </div>
                <div>
                  <span className="font-semibold text-slate-900">Indirect Route: </span>
                  {currentCard.transmissionIndirect.join(', ') || 'None noted'}
                </div>
                <div>
                  <span className="font-semibold text-slate-900">Incubation: </span>
                  {currentCard.incubationPeriod}
                </div>
              </div>
            </div>

            {/* Box 3: Virulence Factors */}
            <div className="p-3.5 bg-purple-50/50 rounded-xl border border-purple-200/80">
              <div className="text-xs font-bold text-purple-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-700" />
                Virulence Factors
              </div>
              <p className="text-xs text-purple-950 font-medium leading-relaxed">
                {currentCard.virulenceFactors}
              </p>
            </div>

            {/* Box 4: Signs, Symptoms & At-Risk */}
            <div className="p-3.5 bg-amber-50/50 rounded-xl border border-amber-200/80">
              <div className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
                Signs, Symptoms & Patient Risk
              </div>
              <p className="text-xs text-slate-800 leading-relaxed mb-1">
                <strong>Symptoms:</strong> {currentCard.signsAndSymptoms}
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong>At-Risk:</strong> {currentCard.atRiskPopulations}
              </p>
            </div>
          </div>

          {/* Box 5: Treatment & Prevention */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Pill className="w-4 h-4 text-slate-500" />
              <span className="text-slate-600">Treatment:</span>
              <span className="font-medium text-slate-900">{currentCard.treatment}</span>
            </div>

            <div className="flex items-center gap-2">
              <Syringe className="w-4 h-4 text-emerald-600" />
              <span className="text-slate-600">Vaccine:</span>
              <span className={`px-2 py-0.5 rounded font-bold ${
                currentCard.hasVaccine ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {currentCard.hasVaccine ? 'Yes!' : 'NO ☹'}
              </span>
            </div>
          </div>
        </div>

        {/* Student Response Section */}
        <div className="p-6 bg-slate-50/80 border-t border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              What is the scientific name of this microorganism?
            </label>
            {isSubmitted && (
              <span className="text-xs font-bold">
                {isCurrentCorrect ? (
                  <span className="text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Correct Answer!
                  </span>
                ) : (
                  <span className="text-rose-600 flex items-center gap-1">
                    <XCircle className="w-4 h-4" /> Incorrect
                  </span>
                )}
              </span>
            )}
          </div>

          {/* Mode A: Multiple Choice */}
          {inputStyle === 'multiple-choice' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {multipleChoiceOptions.map((opt) => {
                const isSelected = selectedOptionId === opt.id;
                const isTarget = opt.id === currentCard.id;
                let btnStyle = 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100 hover:border-slate-400';

                if (isSubmitted) {
                  if (isTarget) {
                    btnStyle = 'bg-emerald-100 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-400';
                  } else if (isSelected && !isTarget) {
                    btnStyle = 'bg-rose-100 border-rose-400 text-rose-950 line-through';
                  } else {
                    btnStyle = 'bg-white/50 border-slate-200 text-slate-400 opacity-60';
                  }
                } else if (isSelected) {
                  btnStyle = 'bg-purple-600 border-purple-700 text-white font-bold shadow-xs';
                }

                return (
                  <button
                    key={opt.id}
                    id={`opt-btn-${opt.id}`}
                    type="button"
                    disabled={isSubmitted}
                    onClick={() => setSelectedOptionId(opt.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${btnStyle}`}
                  >
                    <div>
                      <div className="font-serif italic font-bold text-sm">{opt.scientificName}</div>
                    </div>
                    {isSubmitted && isTarget && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    {isSubmitted && isSelected && !isTarget && <XCircle className="w-4 h-4 text-rose-600" />}
                  </button>
                );
              })}
            </div>
          ) : (
            /* Mode B: Free Recall Search */
            <div className="space-y-2 relative">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="free-recall-input"
                  type="text"
                  disabled={isSubmitted}
                  value={freeRecallSearch}
                  onChange={(e) => setFreeRecallSearch(e.target.value)}
                  placeholder="Type microorganism name (e.g. Klebsiella, Bordetella, Treponema)..."
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              {/* Autocomplete Suggestions */}
              {!isSubmitted && searchSuggestions.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden divide-y divide-slate-100">
                  {searchSuggestions.map((sug) => (
                    <button
                      key={sug.id}
                      type="button"
                      onClick={() => {
                        setSelectedOptionId(sug.id);
                        setFreeRecallSearch(sug.scientificName);
                        handleSubmit(sug.id);
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-purple-50 transition-colors flex items-center justify-between"
                    >
                      <div>
                        <span className="italic font-serif font-bold text-sm text-purple-950">
                          {sug.scientificName}
                        </span>
                      </div>
                      <span className="text-xs text-purple-600 font-medium">Select</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Action Row */}
          <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              {isSubmitted && (
                <button
                  id="show-mode2-card-btn"
                  type="button"
                  onClick={() => setShowFullCard(!showFullCard)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-purple-700 bg-purple-100/70 hover:bg-purple-200 border border-purple-200 transition-colors flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  {showFullCard ? 'Hide Full Reference Card' : 'Inspect Dr. Cramer Card'}
                </button>
              )}
            </div>

            <div>
              {!isSubmitted ? (
                <button
                  id="submit-identity-btn"
                  type="button"
                  disabled={!selectedOptionId}
                  onClick={() => handleSubmit()}
                  className="px-6 py-2.5 bg-purple-600 text-white text-sm font-bold rounded-xl hover:bg-purple-700 shadow-sm transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" /> Check Answer
                </button>
              ) : (
                <button
                  id="next-identity-btn"
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 shadow-sm transition-all flex items-center gap-2"
                >
                  Next Question <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Full Reference Card */}
      {isSubmitted && showFullCard && (
        <div className="space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
            Complete Organism Card for: <span className="italic text-purple-900">{currentCard.scientificName}</span>
          </div>
          <OrganismCardView
            card={currentCard}
            isBookmarked={bookmarkedIds.includes(currentCard.id)}
            onToggleBookmark={onToggleBookmark}
            hideDisease={true}
          />
        </div>
      )}
    </div>
  );
};
