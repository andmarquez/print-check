# Print Check

Premium AI-powered STL Analyzer and 3D Printing Pre-Flight Checker.

**Live site:** [https://andsiosa.github.io/print-check/](https://andsiosa.github.io/print-check/)

## Quick Start

```bash
cd ~/Projects/print-check
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and upload an `.stl` file, or try the built-in demo pyramid.

## Features

- **Real geometry analysis** — volume, dimensions, overhangs, non-manifold edges, floating islands, thin features
- **Interactive 3D viewer** — React Three Fiber with cinematic scan animation
- **Print Health Report** — 9 issue categories with severity and fixes
- **AI Print Advisor** — OpenAI-powered recommendations (optional API key in Settings)
- **Recommended print settings** — layer height, supports, orientation, and more
- **Cost calculator** — dynamic estimates from your filament and printer profile
- **Saved analyses** — IndexedDB storage with 3D preview thumbnails
- **PDF export** — report with 3D preview screenshot

## Assets

Static assets live in the repo under `public/assets/`:

- `public/assets/brand/logo.svg` — app logo
- `public/assets/sample-models/demo-pyramid.stl` — demo model

## Tech Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4 + Framer Motion
- React Three Fiber + Three.js
- jsPDF for PDF reports
- IndexedDB for saved analyses

## Architecture

| Component | Purpose |
|-----------|---------|
| `STLUploader` | File upload & drag-and-drop |
| `ModelViewer` | Interactive 3D STL viewer |
| `ScanAnimation` | Cinematic scan HUD overlay |
| `AnalysisDashboard` | Core print metrics |
| `PrintHealthReport` | Issue detection cards |
| `AIPrintAdvisor` | LLM + rule-based recommendations |
| `PrintSettingsPanel` | Slicer setting suggestions |
| `OrientationComparison` | Current vs recommended orientation |
| `CostCalculator` | Dynamic cost estimation |
| `ExportReportButton` | PDF + text report export |
| `SettingsPanel` | API key & default preferences |
| `SavedAnalysesPanel` | Browse saved analyses |

### Analysis Engine

`src/services/stlAnalysisEngine.ts` implements the `AnalysisEngine` interface:

1. `geometryAnalyzer.ts` — parses STL mesh, computes real geometry stats
2. `analysisRecommendations.ts` — derives issues, settings, metrics from stats
3. `aiAdvisorService.ts` — optional OpenAI recommendations

## AI Setup

1. Open **Settings** in the app
2. Paste your [OpenAI API key](https://platform.openai.com/api-keys)
3. Re-analyze a model — the AI Print Advisor will use live LLM responses

Keys are stored in `localStorage` only and never sent anywhere except OpenAI.

## Deploy to GitHub Pages

```bash
# One-time setup (requires gh auth login)
chmod +x scripts/setup-github.sh
./scripts/setup-github.sh
```

Pushes to `main` auto-deploy via `.github/workflows/deploy.yml`.

## License

MIT
