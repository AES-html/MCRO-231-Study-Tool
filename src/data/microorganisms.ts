import { MicroorganismCard, MicroorganismCardInput } from '../types';

/**
 * ============================================================================
 * MCRO 251: INTRODUCTION TO MEDICAL MICROBIOLOGY - DR. CRAMER
 * ============================================================================
 * 
 * QUICK GUIDE: HOW TO ADD OR EDIT CARDS
 * ----------------------------------------------------------------------------
 * To EDIT an existing card:
 *   - Search for the scientific name in this file and adjust any field.
 * 
 * To ADD A NEW CARD:
 *   1. Copy the CARD_TEMPLATE below.
 *   2. Paste it into the MICROORGANISMS list under the appropriate section.
 *   3. Fill in the values. The defineCard() helper will automatically provide
 *      intelligent defaults and generate an ID for you!
 * 
 * CARD_TEMPLATE (Copy & Paste):
 * ----------------------------------------------------------------------------
 * defineCard({
 *   disease: 'Disease Name',
 *   scientificName: 'Scientific Name (e.g. Genus species)',
 *   organismType: 'Virus', // 'Bacteria' | 'Virus' | 'Protozoan' | 'Helminth' | 'Fungi' | 'Misfolded Protein'
 *   strandedness: 'Single-stranded', // 'Single-stranded' | 'Double-stranded' | 'N/A'
 *   nucleicAcidType: 'ssRNA', // 'ssRNA' | 'dsRNA' | 'ssDNA' | 'dsDNA' | 'dsDNA (Bacterial)' | 'None (Protein)' | 'N/A'
 *   morphologyTags: ['RNA', 'Single-stranded', 'Enveloped'],
 *   morphologyDescription: 'Single-stranded RNA (ssRNA), enveloped',
 *   reservoir: ['Human'], // 'Human' | 'Animal' | 'Zoonosis' | 'Environmental'
 *   id50: 'Low ID50', // 'Low ID50' | 'High ID50' | 'NA/unknown' | 'Depends on where the infection is'
 *   incubationPeriod: 'Short', // 'Short' | 'Long' | 'N/A (Average)' | 'Short for food poisoning, longer for wounds'
 *   transmissionDirect: ['Lg Droplet'], // 'Touch' | 'Blood' | 'Lg Droplet' | 'Bite' | 'Sex'
 *   transmissionIndirect: ['Droplet nuclei'], // 'Droplet nuclei' | 'Fomites' | 'Water' | 'Food' | 'Vector Tick/mosquito'
 *   signsAndSymptoms: 'Fever, cough, malaise',
 *   virulenceFactors: 'Primary toxin or attachment factor',
 *   atRiskPopulations: 'Immunocompromised, elderly',
 *   prevention: 'Vaccination, sanitation',
 *   treatment: 'Antivirals, supportive care',
 *   hasVaccine: true,
 *   notes: 'High-yield exam memory hook.',
 *   highYieldBuzzwords: ['Buzzword 1', 'Buzzword 2'],
 * }),
 * ============================================================================
 */

/**
 * Helper function that constructs a valid MicroorganismCard with smart defaults
 * and automatic ID slug generation.
 */
export function defineCard(input: MicroorganismCardInput): MicroorganismCard {
  const autoId = input.id || input.scientificName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  
  // Infer defaults if omitted
  const defaultStrandedness = 
    input.strandedness ?? 
    (input.organismType === 'Bacteria' 
      ? 'Double-stranded' 
      : input.organismType === 'Misfolded Protein' 
      ? 'N/A' 
      : 'Single-stranded');

  const defaultNucleicAcid = 
    input.nucleicAcidType ?? 
    (input.organismType === 'Bacteria' 
      ? 'dsDNA (Bacterial)' 
      : input.organismType === 'Misfolded Protein' 
      ? 'None (Protein)' 
      : 'ssRNA');

  return {
    id: autoId,
    disease: input.disease,
    scientificName: input.scientificName,
    organismType: input.organismType,
    strandedness: defaultStrandedness,
    nucleicAcidType: defaultNucleicAcid,
    reservoir: input.reservoir ?? ['Human'],
    id50: input.id50 ?? 'NA/unknown',
    incubationPeriod: input.incubationPeriod ?? 'N/A (Average)',
    transmissionDirect: input.transmissionDirect ?? [],
    transmissionIndirect: input.transmissionIndirect ?? [],
    morphologyTags: input.morphologyTags ?? [],
    morphologyDescription: input.morphologyDescription ?? '',
    atRiskPopulations: input.atRiskPopulations ?? 'General population',
    signsAndSymptoms: input.signsAndSymptoms ?? '',
    virulenceFactors: input.virulenceFactors ?? '',
    prevention: input.prevention ?? 'Standard precautions and hygiene',
    treatment: input.treatment ?? 'Supportive care',
    hasVaccine: input.hasVaccine ?? false,
    notes: input.notes ?? '',
    highYieldBuzzwords: input.highYieldBuzzwords ?? [],
    isCustom: input.isCustom ?? false,
  };
}

export const MICROORGANISMS: MicroorganismCard[] = [
  /* ========================================================================
   * SECTION 1: VIRUSES (ssRNA, dsDNA, Enveloped & Naked)
   * ======================================================================== */

  defineCard({
    id: 'influenza-virus',
    disease: 'Influenza',
    scientificName: 'Influenza virus, an orthomyxovirus',
    organismType: 'Virus',
    strandedness: 'Single-stranded',
    nucleicAcidType: 'ssRNA',
    reservoir: ['Human'],
    id50: 'NA/unknown',
    incubationPeriod: 'Short',
    transmissionDirect: ['Lg Droplet'],
    transmissionIndirect: ['Droplet nuclei'],
    morphologyTags: ['RNA', 'Single-stranded', 'Enveloped'],
    morphologyDescription: 'Single-stranded RNA (ssRNA), 8 segments, enveloped with hemagglutinin and neuraminidase spikes',
    atRiskPopulations: 'The elderly, and the very young',
    signsAndSymptoms: 'Fever, muscle aches, lack of energy, headache, sore throat, nasal congestion, cough',
    virulenceFactors: 'Hemagglutinin spikes (HA) (allows virus to bind to specific receptors on ciliated epithelial cells in humans), Neuraminidase spikes (NA) (Enzyme which aids in release of new viruses when budding from infected cell membrane), antigenic drift/shift',
    prevention: 'Vaccinations, handwashing, avoiding the sick',
    treatment: 'Antivirals',
    hasVaccine: true,
    notes: 'Segmented genome enables genetic reassortment (antigenic shift) causing pandemics.',
    highYieldBuzzwords: [
      'Hemagglutinin (HA) spikes',
      'Neuraminidase (NA) spikes',
      '8 segmented ssRNA',
      'Antigenic drift & shift',
      'Annual vaccination'
    ]
  }),

  defineCard({
    id: 'hsv-2',
    disease: 'Herpes Simplex',
    scientificName: 'HSV-2',
    organismType: 'Virus',
    strandedness: 'Double-stranded',
    nucleicAcidType: 'dsDNA',
    reservoir: ['Human'],
    id50: 'NA/unknown',
    incubationPeriod: 'N/A (Average)',
    transmissionDirect: ['Sex'],
    transmissionIndirect: [],
    morphologyTags: ['DNA', 'Double-stranded', 'Enveloped'],
    morphologyDescription: 'Double-stranded DNA (dsDNA), enveloped icosahedral capsid',
    atRiskPopulations: 'The sexually active',
    signsAndSymptoms: 'Genital sores',
    virulenceFactors: 'Becomes latent in nerves (sacral ganglia)',
    prevention: 'Safe sex practices',
    treatment: 'Antiviral medications can manage symptoms',
    hasVaccine: false,
    notes: 'Causes painful genital vesicular lesions; latency in sensory nerves.',
    highYieldBuzzwords: [
      'Genital sores',
      'Latent in nerves (sacral)',
      'dsDNA enveloped',
      'Sexually active at risk',
      'No vaccine available'
    ]
  }),

  defineCard({
    id: 'hsv-1',
    disease: 'Herpes Simplex',
    scientificName: 'HSV-1',
    organismType: 'Virus',
    strandedness: 'Double-stranded',
    nucleicAcidType: 'dsDNA',
    reservoir: ['Human'],
    id50: 'NA/unknown',
    incubationPeriod: 'Long',
    transmissionDirect: ['Lg Droplet', 'Sex'],
    transmissionIndirect: [],
    morphologyTags: ['DNA', 'Double-stranded', 'Enveloped'],
    morphologyDescription: 'Double-stranded DNA (dsDNA), enveloped icosahedral capsid',
    atRiskPopulations: 'Sexually active people',
    signsAndSymptoms: 'Cold sores on either mouth or genitalia',
    virulenceFactors: 'Become latent in nerves (trigeminal ganglia)',
    prevention: 'Safe sex practices',
    treatment: 'Certain antivirals can reduce flare ups and prevent spreading',
    hasVaccine: false,
    notes: 'Predominantly orolabial cold sores, but can also cause genital lesions; trigeminal nerve latency.',
    highYieldBuzzwords: [
      'Cold sores on mouth or genitalia',
      'Latent in nerves (trigeminal)',
      'Large droplet & sexual transmission',
      'dsDNA enveloped'
    ]
  }),

  defineCard({
    id: 'human-papillomavirus',
    disease: 'HPV',
    scientificName: 'Human Papillomavirus',
    organismType: 'Virus',
    strandedness: 'Double-stranded',
    nucleicAcidType: 'dsDNA',
    reservoir: ['Human'],
    id50: 'NA/unknown',
    incubationPeriod: 'Long',
    transmissionDirect: ['Lg Droplet', 'Sex'],
    transmissionIndirect: [],
    morphologyTags: ['DNA', 'Double-stranded', 'Naked'],
    morphologyDescription: 'Double-stranded circular DNA (dsDNA), naked capsid; uses DNA Dependent DNA Polymerase to replicate genome, and DDRP to make mRNA',
    atRiskPopulations: 'The sexually active',
    signsAndSymptoms: 'Warts are common, but symptoms vary on the specific strain, can cause cancer',
    virulenceFactors: 'E6 binds p53, E7 binds Rb tumor suppressors',
    prevention: 'Condoms, avoid multiple sexual partners, Gardasil vaccination',
    treatment: 'Removal of warts',
    hasVaccine: true,
    notes: 'Naked dsDNA virus. High-risk types (16, 18) linked to cervical and oropharyngeal carcinoma.',
    highYieldBuzzwords: [
      'Warts & oncogenic potential',
      'dsDNA naked capsid',
      'Uses DDRP to make mRNA',
      'Gardasil vaccine',
      'Long incubation'
    ]
  }),

  defineCard({
    id: 'rhinoviruses',
    disease: 'Common Cold',
    scientificName: 'Rhinoviruses',
    organismType: 'Virus',
    strandedness: 'Single-stranded',
    nucleicAcidType: 'ssRNA',
    reservoir: ['Human'],
    id50: 'Low ID50',
    incubationPeriod: 'Short',
    transmissionDirect: ['Lg Droplet'],
    transmissionIndirect: ['Droplet nuclei', 'Fomites'],
    morphologyTags: ['RNA', 'Single-stranded', 'Naked'],
    morphologyDescription: 'Single-stranded positive-sense RNA (ssRNA), naked icosahedral, very small; very many serotypes',
    atRiskPopulations: 'Immunocompromised, young children',
    signsAndSymptoms: 'Malaise runny nose, sneezing, cough, sore throat, no fever',
    virulenceFactors: 'Antigenic drift',
    prevention: 'Handwashing, keep hands away from face, avoid the sick',
    treatment: 'Control of symptoms',
    hasVaccine: false,
    notes: 'Acid-labile picornavirus, replicates optimally in cooler upper respiratory tract (33°C).',
    highYieldBuzzwords: [
      'Low ID50',
      'Very small ssRNA naked',
      'Runny nose/sneezing with NO fever',
      'Over 100 serotypes',
      'Fomite & droplet nuclei spread'
    ]
  }),

  defineCard({
    id: 'sars-cov-2',
    disease: 'Covid-19',
    scientificName: 'SARS-CoV-2',
    organismType: 'Virus',
    strandedness: 'Single-stranded',
    nucleicAcidType: 'ssRNA',
    reservoir: ['Human'],
    id50: 'Low ID50',
    incubationPeriod: 'N/A (Average)',
    transmissionDirect: ['Lg Droplet'],
    transmissionIndirect: ['Droplet nuclei'],
    morphologyTags: ['RNA', 'Single-stranded', 'Enveloped'],
    morphologyDescription: 'Single-stranded positive-sense RNA (+ssRNA), enveloped with prominent corona spike glycoproteins',
    atRiskPopulations: 'Elderly, infants, immunocompromised',
    signsAndSymptoms: 'Fever, muscle aches, cough, eventual respiratory distress, pneumonia',
    virulenceFactors: 'Spike Proteins',
    prevention: 'Avoiding crowded areas, practicing social distancing, vaccination',
    treatment: 'Supportive care',
    hasVaccine: true,
    notes: 'Coronaviridae family, positive-sense single-stranded RNA with spike glycoprotein binding ACE2 receptor.',
    highYieldBuzzwords: [
      'Low ID50',
      'Spike proteins',
      'Enveloped ssRNA',
      'Respiratory distress & pneumonia',
      'Vaccine available'
    ]
  }),

  defineCard({
    id: 'rabies-virus',
    disease: 'Rabies',
    scientificName: 'Rabies virus',
    organismType: 'Virus',
    strandedness: 'Single-stranded',
    nucleicAcidType: 'ssRNA',
    reservoir: ['Animal', 'Zoonosis'],
    id50: 'Low ID50',
    incubationPeriod: 'Long',
    transmissionDirect: ['Bite'],
    transmissionIndirect: [],
    morphologyTags: ['RNA', 'Single-stranded', 'Enveloped'],
    morphologyDescription: 'Bullet-shaped, enveloped, negative-sense single-stranded RNA (-ssRNA)',
    atRiskPopulations: 'Everyone',
    signsAndSymptoms: 'Fever, head and muscle aches, sore throat, fatigue, nausea, coma, death, spasms',
    virulenceFactors: 'Negri body',
    prevention: 'Avoid infected animals, keep up to date on vaccinations',
    treatment: 'None once symptoms appear (fatal); post-exposure prophylaxis',
    hasVaccine: true,
    notes: 'Bullet-shaped rhabdovirus travels via retrograde axonal transport; characteristic eosinophilic Negri bodies.',
    highYieldBuzzwords: [
      'Bullet shaped',
      'Negri bodies',
      'Animal bite transmission (zoonosis)',
      'Hydrophobia / muscle spasms',
      'Long incubation period'
    ]
  }),

  /* ========================================================================
   * SECTION 2: GRAM-NEGATIVE BACTERIA (Double-stranded Bacterial Genomic DNA)
   * ======================================================================== */

  defineCard({
    id: 'klebsiella-pneumoniae',
    disease: 'Pneumonia',
    scientificName: 'Klebsiella pneumoniae',
    organismType: 'Bacteria',
    strandedness: 'Double-stranded',
    nucleicAcidType: 'dsDNA (Bacterial)',
    reservoir: ['Human', 'Environmental'],
    id50: 'NA/unknown',
    incubationPeriod: 'Short',
    transmissionDirect: ['Touch'],
    transmissionIndirect: ['Fomites', 'Water', 'Food'],
    morphologyTags: ['Gram-neg', 'DNA', 'Double-stranded'],
    morphologyDescription: 'Gram-negative rod, encapsulated, non-motile, opportunistic (double-stranded DNA genome)',
    atRiskPopulations: 'Very old, young, suffer from substance addiction, hospitalized patients',
    signsAndSymptoms: 'cough, chills, fever, shortness of breath, chest pain, cyanosis, and a bloody, jelly-like sputum called raspberry jam sputum',
    virulenceFactors: 'CPS, LPS, fimbrae, iron stealing siderophore, endotoxin',
    prevention: 'Avoid infected animals, keep up to date on vaccinations',
    treatment: 'Antibiotics',
    hasVaccine: false,
    notes: 'Classic cause of aspiration pneumonia in alcoholics; distinctive gelatinous currant/raspberry jam sputum.',
    highYieldBuzzwords: [
      'Raspberry jam sputum',
      'Encapsulated rod',
      'Iron stealing siderophores',
      'Substance addiction / hospitalized',
      'Gram-neg rod'
    ]
  }),

  defineCard({
    id: 'helicobacter-pylori',
    disease: 'Gastritis',
    scientificName: 'Helicobacter pylori',
    organismType: 'Bacteria',
    strandedness: 'Double-stranded',
    nucleicAcidType: 'dsDNA (Bacterial)',
    reservoir: ['Human'],
    id50: 'NA/unknown',
    incubationPeriod: 'N/A (Average)',
    transmissionDirect: ['Lg Droplet'],
    transmissionIndirect: ['Water', 'Food'],
    morphologyTags: ['Gram-neg', 'DNA', 'Double-stranded'],
    morphologyDescription: 'Gram-negative spirillum, microaerophilic, short, curved with sheathed polar flagella',
    atRiskPopulations: 'Older people, and those with diabetes, cancer, lung disease, or chronic substance use',
    signsAndSymptoms: 'Can be asymptomatic, but can cause abdominal pain, nausea, and vomiting',
    virulenceFactors: 'Can grow in the acid of the stomach, produces urease, multiple sheathed polar flagella, endotoxins',
    prevention: 'None proven',
    treatment: 'Combo of antibiotics and a medication that inhibits stomach acid',
    hasVaccine: false,
    notes: 'Urease enzyme neutralizes stomach acid by hydrolyzing urea into ammonia and CO2.',
    highYieldBuzzwords: [
      'Grows in acidic stomach',
      'Urease production',
      'Sheathed polar flagella',
      'Microaerophilic curved rod',
      'Antibiotics + acid inhibitor'
    ]
  }),

  defineCard({
    id: 'rickettsia-rickettsii',
    disease: 'Rocky Mountain Spotted Fever',
    scientificName: 'Rickettsia rickettsii',
    organismType: 'Bacteria',
    strandedness: 'Double-stranded',
    nucleicAcidType: 'dsDNA (Bacterial)',
    reservoir: ['Zoonosis'],
    id50: 'Low ID50',
    incubationPeriod: 'Short',
    transmissionDirect: ['Bite'],
    transmissionIndirect: ['Vector Tick/mosquito'],
    morphologyTags: ['Gram-neg', 'DNA', 'Double-stranded'],
    morphologyDescription: 'Obligate intracellular bacterium, Gram-negative coccobacillus shape (double-stranded DNA genome)',
    atRiskPopulations: 'Hikers, immunocompromised',
    signsAndSymptoms: 'Headache, pain in muscles and joints, fever, rash beginning in extremities',
    virulenceFactors: 'Actin Tail, endotoxins, cysts resistant to stomach acid',
    prevention: 'General tick bite prevention',
    treatment: 'Doxycycline',
    hasVaccine: false,
    notes: 'Obligate intracellular pathogen requiring host ATP; rash spreads centripetally from wrists/ankles to trunk.',
    highYieldBuzzwords: [
      'Rash starting on extremities',
      'Actin tail motility',
      'Tick bite vector',
      'Obligate intracellular coccobacillus',
      'Doxycycline treatment'
    ]
  }),

  defineCard({
    id: 'bordetella-pertussis',
    disease: 'Whooping Cough',
    scientificName: 'Bordetella pertussis',
    organismType: 'Bacteria',
    strandedness: 'Double-stranded',
    nucleicAcidType: 'dsDNA (Bacterial)',
    reservoir: ['Human'],
    id50: 'NA/unknown',
    incubationPeriod: 'Short',
    transmissionDirect: ['Lg Droplet'],
    transmissionIndirect: ['Droplet nuclei'],
    morphologyTags: ['Gram-neg', 'DNA', 'Double-stranded'],
    morphologyDescription: 'Gram-negative very small rod (coccobacillus), strictly aerobic (double-stranded bacterial DNA)',
    atRiskPopulations: 'Infants',
    signsAndSymptoms: 'Catarrhal stage: Runny nose, cough, fever. Paroxysmal stage: spasms of violent coughing',
    virulenceFactors: 'Pertussis AB exotoxin, filamentous hemagglutinin and fimbrae (aid in binding to cell), Adenylate cyclase toxin (membrane damaging toxin), tracheal cytotoxin (part of peptidoglycan of bacteria), endotoxin',
    prevention: 'Wash hands, general prevention, DTaP vaccination',
    treatment: 'Certain antibiotics can be given before coughing spasms',
    hasVaccine: true,
    notes: 'Tracheal cytotoxin destroys ciliated epithelial cells, preventing mucous clearance and provoking violent whoops. Has a cytotoxin created from its peptidoglycan',
    highYieldBuzzwords: [
      'Catarrhal & Paroxysmal stages',
      'Pertussis AB exotoxin',
      'Tracheal cytotoxin',
      'Filamentous hemagglutinin & fimbriae',
      'Strictly aerobic Gram-neg rod'
    ]
  }),

  /* ========================================================================
   * SECTION 3: GRAM-POSITIVE BACTERIA (Double-stranded Bacterial Genomic DNA)
   * ======================================================================== */

  defineCard({
    id: 'corynebacterium-diphtheriae',
    disease: 'Diphtheria',
    scientificName: 'Corynebacterium diphtheriae',
    organismType: 'Bacteria',
    strandedness: 'Double-stranded',
    nucleicAcidType: 'dsDNA (Bacterial)',
    reservoir: ['Human'],
    id50: 'NA/unknown',
    incubationPeriod: 'Short',
    transmissionDirect: ['Lg Droplet'],
    transmissionIndirect: ['Fomites'],
    morphologyTags: ['Gram-pos', 'DNA', 'Double-stranded'],
    morphologyDescription: 'Gram-positive rod, non endospore forming, pleomorphic, non-motile, often stains irregularly (double-stranded DNA)',
    atRiskPopulations: 'Older people, and those with diabetes, cancer, lung disease, or chronic substance use',
    signsAndSymptoms: 'Sore throat, fever, fatigue, malaise (pseudomembrane)',
    virulenceFactors: 'AB Toxin, note lysogenic pathogenesis (lysophage / bacteriophage beta)',
    prevention: 'Toxoid vaccine (DTaP/Tdap)',
    treatment: 'Antitoxin, appropriate antibiotic',
    hasVaccine: true,
    notes: 'Gram-positive pleomorphic rod; AB toxin halts protein synthesis via EF-2 ribosylation; acquired via lysogenic phage.',
    highYieldBuzzwords: [
      'Pleomorphic irregularly staining rod',
      'AB Toxin',
      'Lysogenic pathogenesis (lysophage)',
      'Toxoid vaccine',
      'Antitoxin + antibiotic'
    ]
  }),

  defineCard({
    id: 'clostridium-tetani',
    disease: 'Tetanus',
    scientificName: 'Clostridium tetani',
    organismType: 'Bacteria',
    strandedness: 'Double-stranded',
    nucleicAcidType: 'dsDNA (Bacterial)',
    reservoir: ['Environmental'],
    id50: 'NA/unknown',
    incubationPeriod: 'N/A (Average)',
    transmissionDirect: [],
    transmissionIndirect: ['Vector Tick/mosquito'],
    morphologyTags: ['Gram-pos', 'DNA', 'Double-stranded'],
    morphologyDescription: 'Gram-positive rod (no R naught), anaerobic, terminal round endospores (drumstick/tennis racket morphology)',
    atRiskPopulations: 'Newborns, the unvaccinated, the elderly',
    signsAndSymptoms: 'Restlessness, irritability, difficulty swallowing, muscle pain, spasm in jaw, abdomen, back, or entire body',
    virulenceFactors: 'Endospores that form at the end of the cell, A-B toxin - tetanospasmin',
    prevention: 'Vaccine (Toxoid)',
    treatment: 'Antibiotics and tetanus immune globulin',
    hasVaccine: true,
    notes: 'Tetanospasmin blocks release of inhibitory neurotransmitters (GABA and glycine), causing spastic paralysis.',
    highYieldBuzzwords: [
      'Terminal endospores (drumstick/tennis racket)',
      'A-B toxin tetanospasmin',
      'Lockjaw & body spasms',
      'Environmental reservoir (soil)',
      'Tetanus immune globulin & toxoid vaccine'
    ]
  }),

  defineCard({
    id: 'streptococcus-pneumoniae',
    disease: 'Pneumonia',
    scientificName: 'Streptococcus pneumoniae',
    organismType: 'Bacteria',
    strandedness: 'Double-stranded',
    nucleicAcidType: 'dsDNA (Bacterial)',
    reservoir: ['Human'],
    id50: 'NA/unknown',
    incubationPeriod: 'Short',
    transmissionDirect: ['Lg Droplet'],
    transmissionIndirect: ['Droplet nuclei'],
    morphologyTags: ['Gram-pos', 'DNA', 'Double-stranded'],
    morphologyDescription: 'Gram-positive diplococcus, lancet shaped, alpha-hemolytic, thick polysaccharide capsule',
    atRiskPopulations: 'Older people, and those with diabetes, cancer, lung disease, or chronic substance use',
    signsAndSymptoms: 'fever, chills, shortness of breath, and chest pain',
    virulenceFactors: 'Capsule (glycolax), can produce membrane damaging toxin when they die (pneumolysin), halophile',
    prevention: 'Wash hands, avoid the sick, cover your mouth when you cough, pneumococcal vaccines',
    treatment: 'Penicillin',
    hasVaccine: true,
    notes: 'Lancet-shaped Gram-positive diplococci; thick anti-phagocytic capsule is the primary virulence factor.',
    highYieldBuzzwords: [
      'Lancet-shaped diplococcus',
      'Polysaccharide capsule (glycolax)',
      'Membrane damaging toxin when dying',
      'Penicillin sensitive',
      'Vaccine available'
    ]
  }),

  defineCard({
    id: 'staphylococcus-aureus',
    disease: 'SSSS / pimples / boils / food poisoning',
    scientificName: 'Staphylococcus aureus',
    organismType: 'Bacteria',
    strandedness: 'Double-stranded',
    nucleicAcidType: 'dsDNA (Bacterial)',
    reservoir: ['Human'],
    id50: 'Depends on where the infection is',
    incubationPeriod: 'Short for food poisoning, longer for wounds',
    transmissionDirect: ['Touch', 'Lg Droplet'],
    transmissionIndirect: ['Fomites', 'Food'],
    morphologyTags: ['Gram-pos', 'DNA', 'Double-stranded'],
    morphologyDescription: 'Gram-positive clustered cocci (grape-like), non-motile, non-spore forming',
    atRiskPopulations: 'Immunocompromised, those with exposed medical biofilms, newborns',
    signsAndSymptoms: 'Can cause impetigo, food poisoning, toxic shock syndrome, scalded skin syndrome',
    virulenceFactors: 'Exfoliatin, coagulase, superantigen enterotoxins',
    prevention: 'Wash hands and clean surfaces',
    treatment: 'Antibiotics, rehydration',
    hasVaccine: false,
    notes: 'Coagulase positive, golden pigment; produces exfoliatin (SSSS) and heat-stable enterotoxin (rapid food poisoning).',
    highYieldBuzzwords: [
      'Clustered cocci',
      'Exfoliatin & coagulase',
      'Superantigen enterotoxins',
      'Rapid food poisoning',
      'No vaccine'
    ]
  }),

  /* ========================================================================
   * SECTION 4: ATYPICAL / CELL WALL-LESS BACTERIA
   * ======================================================================== */

  defineCard({
    id: 'mycoplasma-pneumoniae',
    disease: 'Walking pneumonia',
    scientificName: 'Mycoplasma pneumoniae',
    organismType: 'Bacteria',
    strandedness: 'Double-stranded',
    nucleicAcidType: 'dsDNA (Bacterial)',
    reservoir: ['Human'],
    id50: 'Low ID50',
    incubationPeriod: 'Long',
    transmissionDirect: ['Lg Droplet'],
    transmissionIndirect: ['Droplet nuclei'],
    morphologyTags: ['DNA', 'Double-stranded'],
    morphologyDescription: 'No cell wall, no peptidoglycan (pleomorphic, sterols in cell membrane, double-stranded bacterial DNA)',
    atRiskPopulations: 'Those living in close quarters',
    signsAndSymptoms: 'dry cough, fever, fatigue, headache, and muscle aches',
    virulenceFactors: 'REVIEW: Adhesins (P1 adhesin binds oligosaccharides on respiratory epithelium)',
    prevention: 'Avoid infected individuals, general hygiene',
    treatment: 'General rest and recovery/antibiotics (macrolides/tetracyclines, NOT beta-lactams)',
    hasVaccine: false,
    notes: 'Naturally lacks a peptidoglycan cell wall, so beta-lactam antibiotics (penicillins) are completely ineffective!',
    highYieldBuzzwords: [
      'No cell wall / no peptidoglycan',
      'Walking pneumonia',
      'Adhesins (P1)',
      'Close quarters living',
      'Beta-lactam antibiotics ineffective'
    ]
  }),

  /* ========================================================================
   * SECTION 5: INFECTIOUS PROTEINS (PRIONS - NO NUCLEIC ACID)
   * ======================================================================== */

  defineCard({
    id: 'prion',
    disease: 'Prion Disease',
    scientificName: 'Prion',
    organismType: 'Misfolded Protein',
    strandedness: 'N/A',
    nucleicAcidType: 'None (Protein)',
    reservoir: ['Animal', 'Zoonosis'],
    id50: 'NA/unknown',
    incubationPeriod: 'Long',
    transmissionDirect: [],
    transmissionIndirect: ['Food'],
    morphologyTags: [],
    morphologyDescription: 'A normal host protein (PrPC) misfolded into beta-sheet rich PrPSc; contains NO nucleic acid (DNA or RNA)',
    atRiskPopulations: 'General population',
    signsAndSymptoms: 'Behavioral changes, anxiety, insomnia, fatigue, muscle jerks, dementia',
    virulenceFactors: 'Protease resistant',
    prevention: 'Meat testing and autoclaving of contaminated surgical instruments',
    treatment: 'None, fatal',
    hasVaccine: false,
    notes: 'Non-living infectious misfolded protein (PrPSc) resistant to standard heat, radiation, and protease digestion.',
    highYieldBuzzwords: [
      'Protease resistant',
      'Misfolded protein (no DNA/RNA)',
      'Food transmission (contaminated meat)',
      'Behavioral changes & dementia',
      'Fatal / no treatment'
    ]
  })

  defineCard({
    id: 'giardia-lambia',
    disease: 'Giardisis',
    scientificName: 'Giardia Lambia',
    organismType: 'Protozoan',
    strandedness: 'Double-stranded',
    nucleicAcidType: 'dsDNA',
    reservoir: ['Environmental, Animals'],
    id50: 'Low ID50',
    incubationPeriod: 'Short',
    transmissionIndirect: ['Water'],
    morphologyTags: ['DNA', 'Double-stranded'],
    morphologyDescription: 'Small, pear shaped parasite, multiple flagella)',
    atRiskPopulations: 'Those consuming possibly contaminated water in nature',
    signsAndSymptoms: 'diarrhea, nausea, vomiting, bloating',
    virulenceFactors: 'Multiple flagella, cysts resistant to stomach acid)',
    prevention: 'Only drink water you are sure has been purified',
    treatment: 'General rest and recovery/antibiotics',
    hasVaccine: false,
    notes: 'N/A',
    highYieldBuzzwords: [
      'Protozoann',
      'Cysts and Trophozites'
    ]
  })
];

export const CHARACTERISTIC_OPTIONS = {
  organismTypes: [
    'Bacteria',
    'Virus',
    'Protozoan',
    'Helminth',
    'Fungi',
    'Misfolded Protein'
  ] as const,
  strandedness: [
    'Single-stranded',
    'Double-stranded',
    'N/A'
  ] as const,
  nucleicAcidTypes: [
    'ssRNA',
    'dsRNA',
    'ssDNA',
    'dsDNA',
    'dsDNA (Bacterial)',
    'None (Protein)',
    'N/A'
  ] as const,
  reservoirs: [
    'Human',
    'Animal',
    'Zoonosis',
    'Environmental'
  ] as const,
  id50s: [
    'Low ID50',
    'High ID50',
    'NA/unknown',
    'Depends on where the infection is'
  ] as const,
  incubationPeriods: [
    'Short',
    'Long',
    'N/A (Average)',
    'Short for food poisoning, longer for wounds'
  ] as const,
  transmissionDirect: [
    'Touch',
    'Blood',
    'Lg Droplet',
    'Bite',
    'Sex'
  ] as const,
  transmissionIndirect: [
    'Droplet nuclei',
    'Fomites',
    'Water',
    'Food',
    'Vector Tick/mosquito'
  ] as const,
  morphologyTags: [
    'Gram-pos',
    'Gram-neg',
    'RNA',
    'DNA',
    'Single-stranded',
    'Double-stranded',
    'Naked',
    'Enveloped'
  ] as const,
  hasVaccine: [true, false] as const
};
