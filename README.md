# 🚀 FlowFOR Creative — Smart Launch Command Center

> AI-powered Smart Launch Command Center for digital creators and UMKM Indonesia.
> Built for the **#JuaraVibeCoding** competition by Google, utilizing **Claude Code** and **Gemini Pro** for development.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwindcss)
![Gemini AI](https://img.shields.io/badge/AI-Gemini%202.5%20Flash-EA4335?style=flat-square&logo=google)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## ✨ Features — Complete Launch Kit Generator

FlowFOR Creative generates a **full digital product launch system** powered by Google Gemini 2.5 Flash — in under 30 seconds.

| Feature | Description |
|---------|-------------|
| 📝 **Sales Page Copy** | Persuasive landing page with hook + 5 bullet points + CTA |
| 📱 **Social Caption** | Hook + body + CTA + 3-5 hashtags for Reels/TikTok |
| 💬 **Broadcast Message** | Soft-selling WA/Telegram message for community |
| ✅ **Launch To-Do List** | 8+ actionable items (pre-launch → post-launch) |
| 🎬 **Visual Storyboard** | 8-shot video plan with visual & audio cues |
| 📄 **Shoot Script** | Scene-by-scene production guide with dialogue + camera |
| 📅 **Content Calendar** | Monthly strategy grid with platform/day/type per post |
| 🗺️ **Campaign Roadmap** | Visual 3-phase timeline: Pre-Launch → Launch Day → Post-Launch |
| 🔥 **Vibe Score** | 0-100 viral potential rating with AI breakdown |
| 🧠 **AI Score Breakdown** | 5-component analysis: Hook Power, Emotional Trigger, CTA Urgency, Copy Clarity, Engagement |
| 📊 **Vibe Score History Chart** | Line chart tracking your campaign score trends |
| 🆚 **Campaign Comparison** | Side-by-side comparison of 2 campaigns |
| ✨ **AI Regeneration** | Per-section "Perbaiki" and "A/B Variants" buttons |
| #️⃣ **Hashtag Generator** | 20+ optimized hashtags per platform (IG, TT, YT, WA) with virality score |
| 🎯 **Niche Competitor Brief** | Strategic competitor analysis + content patterns + action plan |

### 🔄 AI Regeneration (Premium)

Every generated section has two intelligent regeneration options:

- **✨ Perbaiki** — Improve the current version with stronger hooks and better CTA
- **🧪 A/B Variants** — Generate 3 alternative versions (Improved + Variant A + Variant B) with a picker modal

---

## 🎨 UI Design

- **Glassmorphism** aesthetic with frosted glass cards and backdrop blur
- **Responsive mobile-first** layout (stacked on mobile, 2-column on desktop)
- **Shimmer skeleton** loading animations with dynamic loading texts
- **Decorative blobs** background with blue/purple/indigo color palette
- **Plus Jakarta Sans** typography from Google Fonts
- **Dark/Light mode** toggle with persistent settings
- **Dark mode** detection via `prefers-color-scheme`

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v3.4 |
| AI Engine | Google Gemini 2.5 Flash |
| PDF Export | jsPDF (A4 landscape, 7-page branded report) |
| ZIP Export | JSZip + FileSaver |
| Charts | Chart.js + react-chartjs-2 |
| Icons | Lucide React |
| Deployment | Docker (Cloud Run) + Vercel |

---

## ⚙️ Getting Started

### Prerequisites

- Node.js 18+
- Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey) (free tier available)

### Installation

```bash
# Clone the repository
git clone https://github.com/koperasiRAS/FlowFOR-Creative.git
cd FlowFOR-Creative

# Install dependencies
npm install

# Create .env.local with your Gemini API key
cp .env.example .env.local
# Then edit .env.local and fill in your GEMINI_API_KEY

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📂 Project Structure

```
flowfor-creative/
├── app/
│   ├── api/
│   │   ├── generate/route.ts      ← Main launch kit generator
│   │   ├── regenerate/route.ts   ← AI content regeneration
│   │   ├── hashtags/route.ts     ← Hashtag optimizer
│   │   └── niche-brief/route.ts  ← Niche competitor analyzer
│   ├── components/
│   │   ├── GeneratorDashboard.tsx ← Main UI + all output cards
│   │   ├── CampaignRoadmap.tsx   ← Visual 3-phase timeline
│   │   ├── ContentCalendar.tsx   ← Monthly strategy grid
│   │   ├── VibeChart.tsx         ← Score history line chart
│   │   ├── CampaignCompare.tsx   ← 2-campaign comparison
│   │   ├── ScoreBreakdown.tsx    ← 5-component AI analysis
│   │   ├── HashtagGenerator.tsx   ← Platform hashtag optimizer
│   │   ├── NicheBriefAnalyzer.tsx← Competitor brief analyzer
│   │   ├── HistoryPanel.tsx      ← Project campaign history
│   │   └── ...
│   ├── lib/
│   │   ├── prompts.ts            ← Gemini AI system prompts
│   │   ├── env.ts                ← Environment variable validation
│   │   ├── pdfExporter.ts        ← Branded 7-page PDF export
│   │   └── zipExporter.ts        ← Full campaign ZIP export
│   ├── globals.css               ← Glassmorphism + shimmer styles
│   ├── layout.tsx                ← Root layout with Google Font
│   └── page.tsx                  ← App entry point
├── lib/                          ← Shared utilities
├── Dockerfile                   ← Cloud Run multi-stage build
├── .env.example                 ← Environment variable template
└── next.config.mjs
```

---

## 🔑 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | ✅ Yes | Google Gemini API key from AI Studio |

Copy `.env.example` to `.env.local` and fill in your key.

---

## 🌊 Deployment

### Google Cloud Run (Recommended)

```bash
# Build with Docker
docker build -t gcr.io/PROJECT_ID/flowfor-creative .

# Deploy to Cloud Run
gcloud run deploy flowfor-creative \
  --image gcr.io/PROJECT_ID/flowfor-creative \
  --platform managed \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --port 3000 \
  --set-env-vars "GEMINI_API_KEY=your_key"
```

### Vercel

```bash
npx vercel --prod
```

Set `GEMINI_API_KEY` in **Vercel Dashboard → Project Settings → Environment Variables**.

---

## 🎯 For #JuaraVibeCoding

Built with these core principles:

| Principle | Implementation |
|-----------|----------------|
| **Speed** | From idea to complete launch kit in under 30 seconds |
| **Quality** | Professional copy & strategy, not generic AI output |
| **Design** | Glassmorphism UI with shimmer animations |
| **Completeness** | End-to-end — form → AI → copy → export → history |
| **Intelligence** | Vibe Score + AI breakdown for real content feedback |
| **Regeneration** | Interactive AI-powered content improvement |
| **Strategy** | Hashtag optimizer + niche competitor brief |
| **Export** | Branded PDF report + ZIP for real-world utility |
| **Deployability** | Cloud Run + Vercel ready, one-command deployment |

---

## 🛡️ Security

- All API keys use `process.env` — never hardcoded
- Environment validation on startup (lib/env.ts)
- Input sanitization + length limits on all API routes
- Rate limiting (10-15 req/min per IP) on all endpoints
- Safe error responses (no stack traces exposed)
- `.env` files excluded from git tracking
- Content Security Policy ready for production

---

## 📄 License

MIT License — free to use, modify, and ship!

> **Important:** The AI prompt engineering, business logic, and creative
> strategy implemented in this project represent original creative work
> developed for the **#JuaraVibeCoding** competition by Google.
> While the MIT license permits personal use and modification, the core
> prompt design and campaign strategy algorithms are intellectual property
> of **Rangga Danu Arta** and should not be reproduced for competing
> products or competitions without attribution.

---

> Built with 💜 for the **#JuaraVibeCoding** competition using **Claude Code** & **Gemini Pro**