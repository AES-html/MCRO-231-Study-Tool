# MCRO 251 Microbiology Study Hub

An interactive study hub and organism card library for **MCRO 251: Introduction to Medical Microbiology** (Dr. Cramer).

## Features
- **Organism Library**: Search, filter by taxa/genome/Gram-stain, audio pronunciation, and side-by-side comparison.
- **Study Mode 1 (Assign Characteristics)**: Given a pathogen name, identify its genome, strandedness, morphology, transmission vectors, and clinical virulence factors.
- **Study Mode 2 (Identify Microorganism)**: Given clinical clues and characteristics, diagnose the mystery microorganism with multiple choice or free recall.
- **Progress Tracker**: Tracks mastery rates, practice streaks, accuracy metrics, and bookmarked cards.

---

## Deploying to GitHub Pages (Automated via GitHub Actions)

This repository includes a ready-to-use GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically builds and deploys your website every time you push to `main` or `master`.

### One-Time Setup in GitHub
1. Push this repository to GitHub:
   ```bash
   git add .
   git commit -m "Initial commit for MCRO 251 Study Hub"
   git branch -M main
   git remote add origin https://github.com/<YOUR-USERNAME>/<YOUR-REPO-NAME>.git
   git push -u origin main
   ```
2. Go to your repository on GitHub.
3. Click **Settings** (tab at the top of your repository).
4. In the left sidebar, click **Pages** (under "Code and automation").
5. Under **Build and deployment** > **Source**, select **"GitHub Actions"** from the dropdown.
6. The deployment workflow will trigger automatically on every push to `main` or `master` (and can also be triggered manually under the **Actions** tab by clicking "Run workflow").
7. Your site will be live at:
   `https://<YOUR-USERNAME>.github.io/<YOUR-REPO-NAME>/`

---

## Adding or Updating Microorganism Cards

All cards are defined in `src/data/microorganisms.ts`. To add a new card as the semester progresses:

1. Open `src/data/microorganisms.ts`.
2. Add a `defineCard({ ... })` block inside the `MICROORGANISMS` array:
   ```typescript
   defineCard({
     disease: 'Lyme Disease',
     scientificName: 'Borrelia burgdorferi',
     organismType: 'Bacteria',
     strandedness: 'Double-stranded',
     nucleicAcidType: 'dsDNA (Bacterial)',
     morphologyTags: ['Gram-neg', 'Double-stranded', 'dsDNA'],
     morphologyDescription: 'Spirochete bacterium with axial filaments',
     reservoir: ['Animal'],
     id50: 'Low ID50',
     incubationPeriod: 'N/A (Average)',
     transmissionDirect: [],
     transmissionIndirect: ['Vector Tick/mosquito'],
     signsAndSymptoms: 'Erythema migrans (bullseye rash), fatigue, joint pain',
     virulenceFactors: 'Antigenic variation of VlsE surface protein',
     prevention: 'DEET, tick checks, protective clothing',
     treatment: 'Doxycycline',
     hasVaccine: false,
     notes: 'Transmitted by Ixodes scapularis deer ticks.',
     highYieldBuzzwords: ['Bullseye rash', 'Ixodes tick', 'Spirochete', 'Erythema migrans'],
   }),
   ```
3. Commit and push your changes. GitHub Actions will automatically re-build and publish the updated cards!

---

## Local Development

```bash
# Install dependencies
npm install

# Run local development server
npm run dev

# Build for production
npm run build
```
