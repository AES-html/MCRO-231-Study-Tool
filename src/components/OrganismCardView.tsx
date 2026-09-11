import React, { useState } from 'react';
import { MicroorganismCard } from '../types';
import { Volume2, Bookmark, BookmarkCheck, Sparkles, Check, X, ShieldAlert, Pill, Syringe, Dna } from 'lucide-react';

interface OrganismCardViewProps {
  card: MicroorganismCard;
  isBookmarked?: boolean;
  onToggleBookmark?: (id: string) => void;
  compact?: boolean;
}

export const OrganismCardView: React.FC<OrganismCardViewProps> = ({
  card,
  isBookmarked = false,
  onToggleBookmark,
  compact = false
}) => {
  const [speaking, setSpeaking] = useState(false);

  const speakName = (e: React.MouseEvent) => {
    e.stopPropagation();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(card.scientificName);
      utterance.rate = 0.9;
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const isChecked = (condition: boolean) => (
    <span className={`inline-flex items-center justify-center w-4 h-4 mr-1.5 rounded border text-xs font-bold leading-none ${
      condition 
        ? 'bg-blue-600 border-blue-700 text-white shadow-xs' 
        : 'bg-white border-slate-300 text-transparent'
    }`}>
      {condition ? '✓' : ''}
    </span>
  );

  return (
    <div
      id={`organism-card-${card.id}`}
      className="bg-white rounded-xl border border-slate-300 shadow-sm overflow-hidden flex flex-col text-slate-800 transition-all hover:shadow-md"
    >
      {/* Authentic Card Header matching Dr. Cramer's design */}
      <div className="bg-blue-700 text-white px-4 py-3 relative flex items-center justify-between border-b border-blue-800">
        <div>
          <div className="text-xs font-semibold tracking-wider uppercase text-blue-200">
            MCRO 251 • Organism Cards
          </div>
          <div className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
            <span>{card.disease}</span>
            <span className="text-xs font-normal text-blue-200 bg-blue-900/50 px-2 py-0.5 rounded-full border border-blue-400/30">
              {card.organismType}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            id={`speak-btn-${card.id}`}
            type="button"
            onClick={speakName}
            title="Listen to pronunciation"
            className={`p-2 rounded-lg text-white hover:bg-blue-600 transition-colors ${
              speaking ? 'bg-blue-600 ring-2 ring-white/50 animate-pulse' : ''
            }`}
            aria-label={`Pronounce ${card.scientificName}`}
          >
            <Volume2 className="w-4 h-4" />
          </button>

          {onToggleBookmark && (
            <button
              id={`bookmark-btn-${card.id}`}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark(card.id);
              }}
              title={isBookmarked ? 'Remove from review list' : 'Bookmark for review'}
              className={`p-2 rounded-lg transition-colors ${
                isBookmarked 
                  ? 'bg-amber-400 text-amber-950 font-medium' 
                  : 'text-blue-200 hover:bg-blue-600 hover:text-white'
              }`}
              aria-label="Bookmark card"
            >
              {isBookmarked ? <BookmarkCheck className="w-4 h-4 fill-amber-950" /> : <Bookmark className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Scientific Name Subheader */}
      <div className="bg-amber-50/70 border-b border-amber-200/70 px-4 py-2 flex items-baseline justify-between flex-wrap gap-2">
        <div className="text-xs font-bold text-amber-900 uppercase tracking-wide">Scientific Name:</div>
        <div className="text-base italic font-serif font-bold text-purple-900">
          {card.scientificName}
        </div>
      </div>

      {/* Grid Table Layout (Matching the Dr. Cramer card grid) */}
      <div className="p-4 space-y-3.5 text-xs">
        {/* Row 1: Organism / Reservoir / ID50 / Incubation */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-2.5 bg-slate-50 rounded-lg border border-slate-200">
          <div>
            <div className="font-bold text-slate-700 mb-1 border-b border-slate-200 pb-0.5">Organism</div>
            <ul className="space-y-0.5 text-[11px] text-slate-700">
              <li className="flex items-center">{isChecked(card.organismType === 'Bacteria')} Bacteria</li>
              <li className="flex items-center">{isChecked(card.organismType === 'Virus')} Virus</li>
              <li className="flex items-center">{isChecked(card.organismType === 'Protozoan')} Protozoan</li>
              <li className="flex items-center">{isChecked(card.organismType === 'Helminth')} Helminth</li>
              <li className="flex items-center">{isChecked(card.organismType === 'Fungi')} Fungi</li>
              {card.organismType === 'Misfolded Protein' && (
                <li className="flex items-center text-purple-800 font-semibold">{isChecked(true)} Misfolded Protein</li>
              )}
            </ul>
          </div>

          <div>
            <div className="font-bold text-slate-700 mb-1 border-b border-slate-200 pb-0.5">Reservoir</div>
            <ul className="space-y-0.5 text-[11px] text-slate-700">
              <li className="flex items-center">{isChecked(card.reservoir.includes('Human'))} Human</li>
              <li className="flex items-center">{isChecked(card.reservoir.includes('Animal'))} Animal</li>
              <li className="flex items-center">{isChecked(card.reservoir.includes('Zoonosis'))} Zoonosis</li>
              <li className="flex items-center">{isChecked(card.reservoir.includes('Environmental'))} Environmental</li>
            </ul>
          </div>

          <div>
            <div className="font-bold text-slate-700 mb-1 border-b border-slate-200 pb-0.5">ID₅₀</div>
            <ul className="space-y-0.5 text-[11px] text-slate-700">
              <li className="flex items-center">{isChecked(card.id50 === 'Low ID50')} Low ID₅₀</li>
              <li className="flex items-center">{isChecked(card.id50 === 'High ID50')} High ID₅₀</li>
              <li className="flex items-center">{isChecked(card.id50 === 'NA/unknown')} NA / Unknown</li>
              {card.id50 === 'Depends on where the infection is' && (
                <li className="flex items-center text-blue-900 font-semibold">{isChecked(true)} Depends on site</li>
              )}
            </ul>
          </div>

          <div>
            <div className="font-bold text-slate-700 mb-1 border-b border-slate-200 pb-0.5">Incubation</div>
            <ul className="space-y-0.5 text-[11px] text-slate-700">
              <li className="flex items-center">{isChecked(card.incubationPeriod === 'Short')} Short</li>
              <li className="flex items-center">{isChecked(card.incubationPeriod === 'Long')} Long</li>
              <li className="flex items-center">{isChecked(card.incubationPeriod === 'N/A (Average)')} N/A (Average)</li>
              {card.incubationPeriod.includes('food poisoning') && (
                <li className="flex items-center text-amber-900 font-semibold">{isChecked(true)} Variable</li>
              )}
            </ul>
          </div>
        </div>

        {/* Row 2: Transmission */}
        <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
          <div className="font-bold text-slate-700 mb-1.5 pb-0.5 border-b border-slate-200 flex items-center justify-between">
            <span>Transmission Routes</span>
            <span className="text-[10px] font-normal text-slate-500">Direct & Indirect</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Direct:</span>
              <ul className="space-y-0.5 text-[11px] text-slate-700">
                <li className="flex items-center">{isChecked(card.transmissionDirect.includes('Touch'))} Touch</li>
                <li className="flex items-center">{isChecked(card.transmissionDirect.includes('Blood'))} Blood</li>
                <li className="flex items-center">{isChecked(card.transmissionDirect.includes('Lg Droplet'))} Lg Droplet</li>
                <li className="flex items-center">{isChecked(card.transmissionDirect.includes('Bite'))} Bite</li>
                <li className="flex items-center">{isChecked(card.transmissionDirect.includes('Sex'))} Sex</li>
              </ul>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Indirect:</span>
              <ul className="space-y-0.5 text-[11px] text-slate-700">
                <li className="flex items-center">{isChecked(card.transmissionIndirect.includes('Droplet nuclei'))} Droplet nuclei</li>
                <li className="flex items-center">{isChecked(card.transmissionIndirect.includes('Fomites'))} Fomites</li>
                <li className="flex items-center">{isChecked(card.transmissionIndirect.includes('Water'))} Water</li>
                <li className="flex items-center">{isChecked(card.transmissionIndirect.includes('Food'))} Food</li>
                <li className="flex items-center">{isChecked(card.transmissionIndirect.includes('Vector Tick/mosquito'))} Vector (Tick/mosquito)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Row 3: Morphology & At-Risk */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          <div className="p-2.5 bg-blue-50/60 rounded-lg border border-blue-200">
            <div className="font-bold text-blue-950 mb-1 flex items-center gap-1.5">
              <Dna className="w-3.5 h-3.5 text-blue-700" />
              <span>Morphology & Structure:</span>
            </div>

            <div className="flex gap-1 flex-wrap my-1.5">
              {['Gram-pos', 'Gram-neg', 'RNA', 'DNA', 'Single-stranded', 'Double-stranded', 'Naked', 'Enveloped'].map((tag) => {
                const hasTag = card.morphologyTags.includes(tag as any);
                return (
                  <span
                    key={tag}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                      hasTag 
                        ? 'bg-blue-600 text-white border-blue-700 font-bold' 
                        : 'bg-white text-slate-400 border-slate-200'
                    }`}
                  >
                    {tag}
                  </span>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-700 leading-relaxed italic">
              {card.morphologyDescription}
            </p>
          </div>

          <div className="p-2.5 bg-amber-50/50 rounded-lg border border-amber-100">
            <div className="font-bold text-amber-900 mb-1 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
              <span>At-Risk Populations:</span>
            </div>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              {card.atRiskPopulations}
            </p>
          </div>
        </div>

        {/* Row 4: Signs/Symptoms & Virulence Factors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
            <div className="font-bold text-slate-800 mb-1">Signs and Symptoms:</div>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              {card.signsAndSymptoms}
            </p>
          </div>

          <div className="p-2.5 bg-purple-50/40 rounded-lg border border-purple-100">
            <div className="font-bold text-purple-900 mb-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-700" />
              <span>Virulence Factors:</span>
            </div>
            <p className="text-[11px] text-purple-950 leading-relaxed font-medium">
              {card.virulenceFactors}
            </p>
          </div>
        </div>

        {/* Row 5: Prevention, Treatment, and Vaccine Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
            <div className="font-bold text-slate-800 mb-1">Prevention:</div>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              {card.prevention}
            </p>
          </div>

          <div className="p-2.5 bg-emerald-50/50 rounded-lg border border-emerald-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-emerald-200/70 pb-1 mb-1">
                <span className="font-bold text-emerald-950 flex items-center gap-1">
                  <Syringe className="w-3.5 h-3.5 text-emerald-700" />
                  Vaccine Available?
                </span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold inline-flex items-center gap-1 ${
                  card.hasVaccine 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-rose-100 text-rose-800 border border-rose-200'
                }`}>
                  {card.hasVaccine ? (
                    <>
                      <Check className="w-3 h-3" /> Yes!
                    </>
                  ) : (
                    <>
                      <X className="w-3 h-3" /> NO ☹
                    </>
                  )}
                </span>
              </div>
              <div className="font-bold text-slate-800 mb-0.5 text-[11px] flex items-center gap-1">
                <Pill className="w-3.5 h-3.5 text-slate-600" />
                Treatment:
              </div>
              <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
                {card.treatment}
              </p>
            </div>
          </div>
        </div>

        {/* High-Yield Buzzwords */}
        {card.highYieldBuzzwords && card.highYieldBuzzwords.length > 0 && !compact && (
          <div className="pt-2 border-t border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1.5">
              High-Yield Exam Buzzwords:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {card.highYieldBuzzwords.map((buzz, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300/60 rounded text-[11px] font-medium"
                >
                  ⚡ {buzz}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
