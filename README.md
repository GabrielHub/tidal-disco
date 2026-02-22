# Tidal Discovery

AI-powered music discovery for Tidal. Paste a playlist URL, and the app analyzes your taste with AI, fetches recommendations from Tidal's similar-artist and track-radio APIs, then curates the best picks with explanations.

## How it works

```
Paste Tidal playlist URL
        ↓
Fetch playlist tracks (Python sidecar → tidalapi)
        ↓
Build taste profile (top artists, stats)
        ↓
AI Phase 1: Analyze taste, generate discovery strategy
  → Decides which artists to explore, which tracks to use as seeds
        ↓
Tidal API: Similar artists + track radio (guided by AI strategy)
  → ~80-100 raw candidates
        ↓
AI Phase 2: Curate recommendations
  → 30-50 picks with reasons, grouped by discovery type
        ↓
Display results with filters, confidence scores, Tidal links
```

Each recommendation is tagged as one of:
- **Gap Fill** — fills a gap in your collection
- **Deep Cut** — deep cuts from artists/genres you'd appreciate
- **Emerging** — newer or rising artists matching your taste

## Setup

### Prerequisites

- Node.js 20+
- Python 3.10+
- A [Tidal](https://tidal.com) account (for API access via OAuth)
- An [AI Gateway API key](https://vercel.com/docs/ai-gateway)

### Install

```bash
pnpm install
pip install tidalapi
```

### Configure

```bash
cp .env.example .env
```

Edit `.env` and add your AI Gateway API key:

```
AI_GATEWAY_API_KEY=vck_...
```

Tidal authentication happens automatically via OAuth on first use — follow the link printed in the terminal.

### Run

```bash
pnpm dev
```

Open http://localhost:3000, paste a Tidal playlist URL, and hit "Discover Music".

## Project structure

```
├── python/
│   └── tidal_bridge.py       # Python CLI sidecar (tidalapi)
├── src/
│   ├── routes/
│   │   ├── __root.tsx         # Root layout (nav, head)
│   │   ├── index.tsx          # Home: playlist URL input
│   │   └── recommendations.tsx # Results page
│   ├── server/
│   │   ├── tidal.ts           # Server fns: call Python sidecar
│   │   ├── claude.ts          # Server fns: two-phase AI curation
│   │   └── recommend.ts       # Orchestrates the full pipeline
│   ├── lib/
│   │   ├── types.ts           # Shared TypeScript types
│   │   └── analyzer.ts        # Taste profile builder
│   └── components/
│       ├── PlaylistInput.tsx
│       ├── TasteProfile.tsx
│       ├── RecCard.tsx
│       ├── RecGrid.tsx
│       └── LoadingSteps.tsx
├── vite.config.ts
├── tsconfig.json
└── eslint.config.js
```

## Tech stack

- **TanStack Start** (React 19 + TanStack Router + Vite 7 + Nitro)
- **Python sidecar** using `tidalapi` for Tidal API calls
- **Vercel AI SDK** with Gemini via AI Gateway for taste analysis and curation
- **Tailwind CSS v4** for styling

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server on port 3000 |
| `pnpm build` | Production build |
| `pnpm check` | Run typecheck + lint |
| `pnpm typecheck` | TypeScript type checking |
| `pnpm lint` | ESLint |
