# 🚀 FlowFOR Creative — Smart Launch Command Center

> AI-powered Smart Launch Command Center for digital creators, built for the **#JuaraVibeCoding** competition by Google.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwindcss)
![Gemini AI](https://img.shields.io/badge/AI-Gemini%202.5%20Flash-EA4335?style=flat-square&logo=google)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## ✨ What is FlowFOR Creative?

FlowFOR Creative is an AI-powered web app that generates a complete **digital product launch kit** in seconds — powered by Google Gemini AI. Just fill in your product details and get:

| Output | Description |
|--------|-------------|
| 📝 **Sales Page Copy** | Full persuasive landing page with bullet points and emoji |
| 📱 **Social Caption** | Hook + body + CTA + hashtags for Reels/TikTok |
| 💬 **Broadcast Message** | Soft-selling WA/Telegram message for community |
| ✅ **Launch To-Do List** | 8+ actionable items from pre-launch to post-launch |
| 🎬 **Visual Storyboard** | 8-shot video plan with visual and audio cues |
| 🔥 **Vibe Score** | 0-100 viral potential rating with 3 reasoning points |

---

## 🎨 UI Design

- **Glassmorphism** aesthetic with frosted glass cards and backdrop blur
- **Responsive mobile-first** layout (stacked on mobile, 2-column on desktop)
- **Shimmer skeleton** loading animations
- **Decorative blobs** background with blue/purple/indigo color palette
- **Plus Jakarta Sans** typography from Google Fonts

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS |
| AI Engine | Google Gemini 2.5 Flash |
| PDF Export | jspdf + html2canvas |
| Icons | Lucide React |
| Deployment | Docker (Cloud Run) + Vercel |

---

## ⚙️ Getting Started

### Prerequisites

- Node.js 18+
- Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

### Installation

```bash
# Clone the repository
git clone https://github.com/koperasiRAS/FlowFOR-Creative.git
cd FlowFOR-Creative

# Install dependencies
npm install

# Create .env.local with your Gemini API key
echo "GEMINI_API_KEY=your_api_key_here" > .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start creating launch kits.

---

## 🌊 Deployment

### Google Cloud Run (Recommended)

```bash
# Build and push to Google Container Registry
gcloud builds submit --tag gcr.io/PROJECT_ID/flowfor-creative:latest .

# Deploy to Cloud Run
gcloud run deploy flowfor-creative \
  --image gcr.io/PROJECT_ID/flowfor-creative:latest \
  --platform managed \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --port 3000 \
  --set-env-vars "GEMINI_API_KEY=your_api_key"
```

### Vercel

```bash
# Login and deploy
npx vercel login
npx vercel --prod
```

Set `GEMINI_API_KEY` in **Vercel Dashboard → Project Settings → Environment Variables**.

---

## 📁 Project Structure

```
flowfor-creative/
├── app/
│   ├── api/generate/route.ts   ← Gemini AI API endpoint (POST)
│   ├── globals.css            ← Glassmorphism styles + shimmer
│   ├── layout.tsx            ← Root layout with Google Font
│   └── page.tsx              ← Full UI: form + bento grid output
├── Dockerfile                ← Cloud Run multi-stage build
├── vercel.json              ← Vercel compatibility config
├── .dockerignore
├── .env.local                ← GEMINI_API_KEY (local)
├── next.config.mjs           ← Next.js standalone output
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🔑 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | ✅ Yes | Google Gemini API key from AI Studio |

---

## 🎯 For #JuaraVibeCoding

This project was built with the following principles:

- **Speed**: From idea to complete launch kit in under 30 seconds
- **Quality**: Professional-grade copy and strategy, not generic AI output
- **Design**: Beautiful glassmorphism UI that impresses judges
- **Completeness**: End-to-end — form → AI → copy → export — no dead ends
- **Deployability**: Cloud Run + Vercel ready, one-command deployment

---

## 📄 License

MIT License — feel free to use, modify, and ship!

---

> Built with 💜 for the **#JuaraVibeCoding** competition
