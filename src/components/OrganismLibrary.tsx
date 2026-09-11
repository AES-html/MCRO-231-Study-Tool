import React, { useState, useMemo } from 'react';
import { MicroorganismCard, OrganismType, StrandednessType } from '../types';
import { MICROORGANISMS } from '../data/microorganisms';
import { OrganismCardView } from './OrganismCardView';
import { 
  Search, 
  Filter, 
  Bookmark, 
  BookmarkCheck, 
  Sparkles, 
  LayoutGrid, 
  ListFilter, 
  Columns3,
  Syringe,
  Pill,
  Check,
  X,
  Volume2,
  ChevronDown,
  ChevronUp,
  Dna
} from 'lucide-react';

interface OrganismLibraryProps {
  bookmarkedIds: string[];
  onToggleBookmark: (id: string) => void;
  onSelectOrganismForStudy?: (organismId: string, mode: 'mode1' | 'mode2') => void;
  cards?: MicroorganismCard[];
}

export const OrganismLibrary: React.FC<OrganismLibraryProps> = ({
  bookmarkedIds,
  onToggleBookmark,
  onSelectOrganismForStudy,
  cards = MICROORGANISMS,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [strandednessFilter, setStrandednessFilter] = useState<string>('all');
  const [gramFilter, setGramFilter] = useState<string>('all');
  const [vaccineFilter, setVaccineFilter] = useState<string>('all');
  const [onlyBookmarked, setOnlyBookmarked] = useState<boolean>(false);
  const [viewLayout, setViewLayout] = useState<'cards' | 'compact' | 'compare'>('cards');

  // Compare mode selections
  const [compareIds, setCompareIds] = useState<string[]>(['klebsiella-pneumoniae', 'streptococcus-pneumoniae']);

  // Filter logic
  const filteredOrganisms = useMemo(() => {
    return cards.filter((org) => {
      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = org.scientificName.toLowerCase().includes(q);
        const matchDisease = org.disease.toLowerCase().includes(q);
        const matchSigns = org.signsAndSymptoms.toLowerCase().includes(q);
        const matchVirulence = org.virulenceFactors.toLowerCase().includes(q);
        const matchMorph = org.morphologyDescription.toLowerCase().includes(q);
        const matchNucleic = (org.nucleicAcidType || '').toLowerCase().includes(q);
        const matchBuzzwords = org.highYieldBuzzwords?.some((b) => b.toLowerCase().includes(q));
        if (!matchName && !matchDisease && !matchSigns && !matchVirulence && !matchMorph && !matchBuzzwords && !matchNucleic) {
          return false;
        }
      }

      // Organism Type
      if (selectedType !== 'all') {
        if (org.organismType !== selectedType) return false;
      }

      // Strandedness Filter
      if (strandednessFilter !== 'all') {
        if (org.strandedness !== strandednessFilter) return false;
      }

      // Gram Filter
      if (gramFilter === 'gram-pos' && !org.morphologyTags.includes('Gram-pos')) return false;
      if (gramFilter === 'gram-neg' && !org.morphologyTags.includes('Gram-neg')) return false;

      // Vaccine Filter
      if (vaccineFilter === 'yes' && !org.hasVaccine) return false;
      if (vaccineFilter === 'no' && org.hasVaccine) return false;

      // Bookmarked
      if (onlyBookmarked && !bookmarkedIds.includes(org.id)) return false;

      return true;
    });
  }, [cards, searchQuery, selectedType, strandednessFilter, gramFilter, vaccineFilter, onlyBookmarked, bookmarkedIds]);

  const toggleCompare = (id: string) => {
    if (compareIds.includes(id)) {
      setCompareIds(compareIds.filter((x) => x !== id));
    } else {
      if (compareIds.length >= 3) {
        setCompareIds([...compareIds.slice(1), id]);
      } else {
        setCompareIds([...compareIds, id]);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              id="library-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by scientific name, disease, ssRNA/dsDNA, buzzword (e.g. raspberry jam, negri)..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* View mode buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 self-end md:self-auto">
            <button
              id="view-cards-btn"
              type="button"
              onClick={() => setViewLayout('cards')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewLayout === 'cards' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Full Cards
            </button>
            <button
              id="view-compact-btn"
              type="button"
              onClick={() => setViewLayout('compact')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewLayout === 'compact' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" /> Quick List
            </button>
            <button
              id="view-compare-btn"
              type="button"
              onClick={() => setViewLayout('compare')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewLayout === 'compare' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Columns3 className="w-3.5 h-3.5" /> Compare ({compareIds.length})
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="font-bold text-slate-500 uppercase tracking-wide mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filters:
          </span>

          {/* Type dropdown */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-slate-700 font-medium focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Taxa ({cards.length})</option>
            <option value="Bacteria">Bacteria</option>
            <option value="Virus">Viruses</option>
            <option value="Misfolded Protein">Misfolded Protein / Prion</option>
          </select>

          {/* Strandedness / Genome Filter */}
          <select
            value={strandednessFilter}
            onChange={(e) => setStrandednessFilter(e.target.value)}
            className="bg-purple-50/70 border border-purple-300 rounded-lg px-2.5 py-1 text-purple-950 font-medium focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Genome Types</option>
            <option value="Single-stranded">Single-Stranded (ssRNA/DNA)</option>
            <option value="Double-stranded">Double-Stranded (dsDNA/RNA)</option>
            <option value="N/A">N/A (Prions / No Genome)</option>
          </select>

          {/* Gram Staining */}
          <select
            value={gramFilter}
            onChange={(e) => setGramFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-slate-700 font-medium focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Stains</option>
            <option value="gram-pos">Gram-Positive</option>
            <option value="gram-neg">Gram-Negative</option>
          </select>

          {/* Vaccine */}
          <select
            value={vaccineFilter}
            onChange={(e) => setVaccineFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-slate-700 font-medium focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Vaccine Status</option>
            <option value="yes">Vaccine Available (Yes!)</option>
            <option value="no">No Vaccine (NO ☹)</option>
          </select>

          {/* Bookmarks Toggle */}
          <button
            type="button"
            onClick={() => setOnlyBookmarked(!onlyBookmarked)}
            className={`px-3 py-1 rounded-lg border text-xs font-medium flex items-center gap-1 transition-colors ${
              onlyBookmarked
                ? 'bg-amber-100 border-amber-300 text-amber-950 font-bold'
                : 'bg-slate-50 border-slate-300 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" /> Bookmarked ({bookmarkedIds.length})
          </button>

          <span className="text-slate-400 ml-auto font-medium">
            Showing {filteredOrganisms.length} of {cards.length}
          </span>
        </div>
      </div>

      {/* View: Compare Matrix */}
      {viewLayout === 'compare' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Side-by-Side Microbe Comparison</h3>
              <p className="text-xs text-slate-500">
                Select up to 3 microorganisms from the list to compare characteristics directly.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 pb-3 border-b border-slate-200">
            {cards.map((m) => {
              const isSelected = compareIds.includes(m.id);
              return (
                <button
                  key={m.id}
                  onClick={() => toggleCompare(m.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-700 font-bold'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {isSelected ? '✓ ' : '+ '} {m.scientificName}
                </button>
              );
            })}
          </div>

          {compareIds.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              Click organisms above to compare their characteristics.
            </div>
          ) : (
            <div className={`grid grid-cols-1 md:grid-cols-${compareIds.length} gap-4`}>
              {compareIds.map((id) => {
                const card = cards.find((m) => m.id === id);
                if (!card) return null;
                return (
                  <div key={card.id}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-700">{card.disease}</span>
                      <button
                        onClick={() => toggleCompare(card.id)}
                        className="text-xs text-rose-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                    <OrganismCardView
                      card={card}
                      isBookmarked={bookmarkedIds.includes(card.id)}
                      onToggleBookmark={onToggleBookmark}
                      compact
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* View: Compact Table / Quick Reference List */}
      {viewLayout === 'compact' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 divide-y divide-slate-200">
              <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[11px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Microorganism & Disease</th>
                  <th className="px-3 py-3">Type</th>
                  <th className="px-3 py-3">Genome & Strandedness</th>
                  <th className="px-3 py-3">Morphology</th>
                  <th className="px-3 py-3">Transmission</th>
                  <th className="px-3 py-3">Key Virulence</th>
                  <th className="px-3 py-3 text-center">Vaccine?</th>
                  <th className="px-3 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrganisms.map((org) => {
                  const isBookmarked = bookmarkedIds.includes(org.id);
                  return (
                    <tr key={org.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-serif italic font-bold text-slate-900 text-sm">
                          {org.scientificName}
                        </div>
                        <div className="text-slate-500 font-sans font-medium text-xs">
                          {org.disease}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          {org.organismType}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        {org.strandedness !== 'N/A' ? (
                          <div className="space-y-0.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-200 inline-block">
                              {org.strandedness === 'Single-stranded' ? 'ss' : 'ds'} {org.nucleicAcidType}
                            </span>
                            <div className="text-[10px] text-slate-500">
                              {org.strandedness}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-medium">N/A (Prion)</span>
                        )}
                      </td>
                      <td className="px-3 py-3 max-w-[200px]">
                        <div className="flex gap-1 flex-wrap mb-1">
                          {org.morphologyTags.map((t) => (
                            <span key={t} className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-blue-50 text-blue-800 border border-blue-200">
                              {t}
                            </span>
                          ))}
                        </div>
                        <p className="text-[11px] text-slate-600 truncate" title={org.morphologyDescription}>
                          {org.morphologyDescription}
                        </p>
                      </td>
                      <td className="px-3 py-3 text-[11px]">
                        <div><strong className="text-slate-900">Direct:</strong> {org.transmissionDirect.join(', ') || 'None'}</div>
                        <div><strong className="text-slate-900">Indirect:</strong> {org.transmissionIndirect.join(', ') || 'None'}</div>
                      </td>
                      <td className="px-3 py-3 max-w-[220px]">
                        <div className="text-purple-950 font-medium truncate" title={org.virulenceFactors}>
                          ⚡ {org.virulenceFactors}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block ${
                          org.hasVaccine ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {org.hasVaccine ? 'Yes!' : 'NO ☹'}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <div className="flex items-center justify-end">
                          <button
                            onClick={() => onToggleBookmark(org.id)}
                            className={`p-1.5 rounded-lg border text-xs transition-colors ${
                              isBookmarked
                                ? 'bg-amber-100 border-amber-300 text-amber-950'
                                : 'border-slate-200 text-slate-400 hover:text-slate-700'
                            }`}
                            title="Toggle bookmark"
                          >
                            {isBookmarked ? <BookmarkCheck className="w-3.5 h-3.5 fill-amber-950" /> : <Bookmark className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View: Standard Full Card Grid */}
      {viewLayout === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredOrganisms.map((org) => (
            <div key={org.id} className="relative group">
              <OrganismCardView
                card={org}
                isBookmarked={bookmarkedIds.includes(org.id)}
                onToggleBookmark={onToggleBookmark}
              />
            </div>
          ))}
        </div>
      )}

      {/* Zero results */}
      {filteredOrganisms.length === 0 && (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-base font-semibold text-slate-700">No microorganisms match your filter criteria.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedType('all');
              setStrandednessFilter('all');
              setGramFilter('all');
              setVaccineFilter('all');
              setOnlyBookmarked(false);
            }}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};
