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
| 📱 **Social Caption** | Hook + body + CTA + targeted hashtags for Reels/TikTok |
| 💬 **Broadcast Message** | Soft-selling WA/Telegram message for community |
| ✅ **Launch To-Do List** | 8+ actionable items (pre-launch → post-launch) |
| 🎬 **Visual Storyboard** | Video plan with visual & audio cues |
| 📄 **Shoot Script** | Scene-by-scene production guide aligned with storyboard (dialogue + camera angles) |
| 📅 **Strategy Calendar** | Accurate monthly posting grid synced with real-world dates |
| 👁️ **Vision AI Integration** | Upload an image for smart analysis (Visual Theme, Angle, Palette) used to empower the copywriting |
| 🧠 **AI Advisor** | Chat directly with an AI expert to refine and brainstorm your generated campaign |
| ⬇️ **Export & Share** | Download as ZIP, PDF Report, or Share to LinkedIn |

---

## 🎨 Premium UI & UX

- **Glassmorphism** aesthetic with frosted glass cards, dynamic backdrop blur, and smooth entrance animations.
- **Butter-Smooth Hover Effects** (`hover:-translate-y-1 hover:shadow-xl`) on all result cards for an interactive feel.
- **Responsive Grid Layout** adapting seamlessly from mobile to desktop.
- **Shimmer Skeleton** loading states to keep users engaged while AI generates content.
- **Dark/Light Mode** toggle with persistent settings and system detection.

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v3.4 |
| AI Engine | Google Gemini 2.5 Flash (`@google/generative-ai`) |
| PDF Export | jsPDF (A4 landscape report) |
| ZIP Export | JSZip + FileSaver |
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
│   │   └── generate/route.ts      ← Unified AI generation & Vision AI endpoint
│   ├── components/
│   │   ├── GeneratorDashboard.tsx ← Main UI + all output cards
│   │   ├── ContentCalendar.tsx    ← Strategy grid with accurate date logic
│   │   ├── CampaignAdvisor.tsx    ← Chat interface for refining results
│   │   ├── HistoryPanel.tsx       ← Project campaign history
│   │   └── SidebarWrapper.tsx     ← Responsive navigation
│   ├── lib/
│   │   ├── prompts.ts             ← Strict Gemini AI system prompts
│   │   ├── env.ts                 ← Environment variables & API retry logic
│   │   ├── pdfExporter.ts         ← Branded PDF generation
│   │   └── zipExporter.ts         ← Full campaign ZIP packager
│   ├── globals.css                ← Glassmorphism + smooth scrolling
│   ├── layout.tsx                 ← Root layout with Google Font
│   └── page.tsx                   ← App entry point
├── public/                        ← Static assets (logos)
├── Dockerfile                     ← Cloud Run multi-stage build
├── .env.example                   ← Environment variable template
└── next.config.mjs
```

---

## 🛡️ Security & Reliability

- **API Key Protection**: Secrets remain on the server (`process.env`), never exposed to the client.
- **Auto-Retry & Rate Limiting**: Intelligent retries for API quotas (429) and in-memory rate limiting (10 req/min per IP).
- **Sanitized Inputs**: Regex filtering (`/[<>{}\]]+/g`) to prevent prompt injection and XSS.
- **Strict JSON Parsing**: Robust error handling for AI hallucinations or malformed JSON responses.

---

## 🌊 Deployment

### Vercel (Fastest)

```bash
npx vercel --prod
```
Set `GEMINI_API_KEY` in **Vercel Dashboard → Project Settings → Environment Variables**.

### Google Cloud Run

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