export type OrganismType =
  | 'Bacteria'
  | 'Virus'
  | 'Protozoan'
  | 'Helminth'
  | 'Fungi'
  | 'Misfolded Protein';

export type ReservoirType = 'Human' | 'Animal' | 'Zoonosis' | 'Environmental';

export type ID50Type =
  | 'Low ID50'
  | 'High ID50'
  | 'NA/unknown'
  | 'Depends on where the infection is';

export type IncubationType =
  | 'Short'
  | 'Long'
  | 'N/A (Average)'
  | 'Short for food poisoning, longer for wounds';

export type DirectTransmission =
  | 'Touch'
  | 'Blood'
  | 'Lg Droplet'
  | 'Bite'
  | 'Sex';

export type IndirectTransmission =
  | 'Droplet nuclei'
  | 'Fomites'
  | 'Water'
  | 'Food'
  | 'Vector Tick/mosquito';

export type StrandednessType =
  | 'Single-stranded'
  | 'Double-stranded'
  | 'N/A';

export type NucleicAcidType =
  | 'ssRNA'
  | 'dsRNA'
  | 'ssDNA'
  | 'dsDNA'
  | 'dsDNA (Bacterial)'
  | 'None (Protein)'
  | 'N/A';

export type MorphologyTag =
  | 'Gram-pos'
  | 'Gram-neg'
  | 'RNA'
  | 'DNA'
  | 'Single-stranded'
  | 'Double-stranded'
  | 'Naked'
  | 'Enveloped';

export interface MicroorganismCard {
  id: string;
  disease: string;
  scientificName: string;
  organismType: OrganismType;
  reservoir: ReservoirType[];
  id50: ID50Type;
  incubationPeriod: IncubationType;
  transmissionDirect: DirectTransmission[];
  transmissionIndirect: IndirectTransmission[];
  
  // Morphology & Strandedness
  strandedness: StrandednessType;
  nucleicAcidType: NucleicAcidType;
  morphologyTags: MorphologyTag[];
  morphologyDescription: string;

  // Clinical & Pathogenesis
  atRiskPopulations: string;
  signsAndSymptoms: string;
  virulenceFactors: string;
  prevention: string;
  treatment: string;
  hasVaccine: boolean;
  notes?: string;
  highYieldBuzzwords?: string[];
  isCustom?: boolean;
}

export type MicroorganismCardInput = Omit<Partial<MicroorganismCard>, 'id'> & {
  id?: string;
  disease: string;
  scientificName: string;
  organismType: OrganismType;
};

export interface QuizAttempt {
  id: string;
  timestamp: number;
  mode: 'assign-characteristics' | 'identify-organism';
  totalQuestions: number;
  correctAnswers: number;
  scorePercentage: number;
  durationSeconds: number;
  missedOrganismIds: string[];
}

export interface UserStats {
  totalAttempts: number;
  mode1Attempts: number;
  mode2Attempts: number;
  totalCorrect: number;
  totalAnswered: number;
  streakDays: number;
  lastActiveDate: string;
  organismMastery: Record<string, { correct: number; incorrect: number }>;
  recentAttempts: QuizAttempt[];
  bookmarkedIds: string[];
}
