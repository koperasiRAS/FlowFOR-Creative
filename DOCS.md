# FlowFOR Creative — Technical Documentation
> Internal documentation: blueprint, QA report, and full technical specification.
> Last updated: 2026-05-08 (commit `af025dc`)

---

# 1. Application Specification

## 1.1 Project Overview

| Field | Value |
|-------|-------|
| **Project Name** | FlowFOR Creative |
| **Type** | AI-Powered Smart Launch Command Center / SaaS Web Application |
| **Target Market** | Indonesian content creators, digital product sellers, UMKM, affiliate marketers |
| **Core Value** | One-click generation of complete launch kits powered by Google Gemini AI |
| **Live URL** | https://flow-for-creative.vercel.app |
| **GitHub** | https://github.com/koperasiRAS/FlowFOR-Creative |
| **Competition** | #JuaraVibeCoding by Google |

---

## 1.2 Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js | 14.2.5 |
| Language | TypeScript | 5.5.3 |
| Styling | Tailwind CSS | 3.4.6 |
| Icons | lucide-react | 0.400.0 |
| AI Engine | @google/generative-ai | 0.21.0 |
| PDF Generation | jspdf | 2.5.1 |
| Screenshot | html2canvas | 1.4.1 |
| Build Tool | PostCSS + Autoprefixer | 8.4.39 / 10.4.19 |
| Linter | ESLint | 8.57.0 |
| Runtime | Node.js / Vercel | — |

**Font:** Plus Jakarta Sans (Google Fonts, weights 400/500/600/700)
**CSS:** Tailwind CSS utilities + Custom CSS in `app/globals.css`

---

## 1.3 Core Features (20 Features)

| # | Feature | Component | Status |
|---|---------|-----------|--------|
| 1 | Campaign Generation Form (productName, targetAudience, description, contentType, language, copyLength, platforms, interestHint) | `GeneratorDashboard.tsx` | ✅ |
| 2 | AI-Powered Launch Kit Generation (POST /api/generate → Gemini 2.5 Flash) | `GeneratorDashboard.tsx` + `app/api/generate/route.ts` | ✅ |
| 3 | Sales Page Copy (hook + 5 bullets + CTA, max 150 words, collapsible) | `SalesPageCard` (inline) | ✅ |
| 4 | Social Caption (hook + body + CTA + 3-5 hashtags) | `BentoCard` (inline) | ✅ |
| 5 | Broadcast Message (WhatsApp/Telegram soft-selling) | `BentoCard` (inline) | ✅ |
| 6 | To-Do Launch List (8 items, checkboxes, empty state) | `ToDoListCard` (inline) | ✅ |
| 7 | Visual Storyboard (8-shot table, downloadable .doc) | `StoryboardCard` (inline) | ✅ |
| 8 | Shoot Script (scene table + 2 tips, downloadable .doc) | `ShootScriptCard` (inline) | ✅ |
| 9 | Vibe Score (0-100 ring, label, 3 reasons, dark-mode aware) | `VibeScoreCard` (inline) | ✅ |
| 10 | Content Calendar (42-cell grid, day detail, platform badges) | `ContentCalendar.tsx` | ✅ |
| 11 | Mobile Preview (phone-frame modal, ARIA + keyboard nav) | `MobilePreviewModal` (inline) | ✅ |
| 12 | LinkedIn Share | `GeneratorDashboard.tsx` | ✅ |
| 13 | Copy-to-Clipboard (per-card, toast confirmation) | `handleCopy()` | ✅ |
| 14 | History Panel (localStorage, search, load, delete + confirmation) | `HistoryPanel.tsx` + `SidebarWrapper.tsx` | ✅ |
| 15 | Settings Panel (backup, restore, clear all + confirmation) | `SettingsPanel.tsx` | ✅ |
| 16 | Dark/Light Mode (persisted, no FOUC) | `Navbar.tsx` + `SettingsContext.tsx` + `layout.tsx` | ✅ |
| 17 | Sidebar Navigation (desktop sticky, mobile bottom tab) | `Sidebar.tsx` | ✅ |
| 18 | Navbar Search (auto-switch to history panel) | `Navbar.tsx` + `AppShell.tsx` + `SidebarWrapper.tsx` | ✅ |
| 19 | Loading States (progress bar, skeleton shimmer, animated text) | `GeneratorDashboard.tsx` | ✅ |
| 20 | Error Handling (Indonesian error toasts, ARIA live) | `ErrorToast` + `handleSubmit()` | ✅ |

---

## 1.4 8 Content Types Supported

Defined in `GeneratorDashboard.tsx` as `CONTENT_TYPES`:

| Value | Label |
|-------|-------|
| `Produk Digital` | Produk Digital |
| `Jasa/Service` | Jasa/Service |
| `Event/Webinar` | Event/Webinar |
| `Affiliate/Review` | Affiliate/Review |
| `Konten Edukasi` | Konten Edukasi |
| `Konten Monetisasi` | Konten Monetisasi |
| `Podcast/Audio` | Podcast/Audio |
| `Niche Finder` | Niche Finder |

> "Niche Finder" reveals an additional `interestHint` textarea and adds `nicheRecommendation` to the response.

---

## 1.5 User Flow

```
[1] Open app → empty form + empty state
[2] Fill form: productName*, description*, targetAudience, contentType, language, copyLength, platforms, interestHint (Niche Finder only)
[3] Click "Generate Launch Kit" → POST /api/generate
    → Loading: top progress bar + animated text cycling every 2.5s
    → Success: staggered bento grid animations
    → Error: Indonesian error toast (aria-live assertive)
[4] Interact: copy, expand, download .doc, mobile preview, LinkedIn share, check to-dos
[5] Campaign auto-saved to localStorage (max 30 items, key: flowfor_history)
[6] History panel: search/filter, load past campaign, delete with confirmation modal
[7] Settings: download backup JSON, restore from backup, clear all data
```

---

## 1.6 Data Models

### GenerateRequestBody (API Input)
```typescript
interface GenerateRequestBody {
  productName: string;        // Required, max 200 chars
  targetAudience: string;     // Required, max 200 chars (comma-joined tags)
  description: string;        // Required, max 2000 chars
  contentType: string;        // Required, one of 8 valid values
  interestHint?: string;      // Optional, max 500 chars (for Niche Finder)
  language?: string;          // Optional, "id" (default) or "en"
  copyLength?: string;        // Optional, "short" | "medium" | "long" (default "short")
  platforms?: string[];       // Optional, defaults to ["Instagram", "TikTok"]
}
```

### GenerateResponse (API Output)
```typescript
interface GenerateResponse {
  landingPage: string;               // Sales copy, max 150 words
  caption: string;                   // Social caption: hook + body + CTA + hashtags
  broadcast: string;                  // WA/Telegram soft-selling message
  todoList: string[];               // 8 actionable launch items
  storyboard: StoryboardItem[];       // Exactly 8 shots
  vibeScore: VibeScoreData;          // 0-100 score + label + 3 reasons
  contentCalendar: ContentCalendarEntry[]; // Posting schedule for remaining days
  shootScript: ShootScriptData;       // Video production script
  nicheRecommendation?: string;        // Only if contentType="Niche Finder" or interestHint set
}

interface StoryboardItem {
  shot: string;     // Format: "Shot X — 0:XX-0:XX"
  visual: string;   // What viewer sees
  audio: string;    // Narration or music cue
}

interface VibeScoreData {
  score: number;     // 0-100 integer
  label: string;      // e.g. "High Viral Potential"
  reasons: string[];  // 3 actionable reasons
}

interface ContentCalendarEntry {
  day: number;          // Date number (1-31)
  date: string;         // e.g. "Senin, 15 Mei"
  platform: string;      // One of selected platforms
  type: string;         // "Reels" | "Story" | "Post" | "Thread" | "Broadcast" | "Shorts"
  topic: string;        // Hook/problem statement, max 20 words
  caption_hint: string; // Caption hint, max 15 words
}

interface ShootScriptData {
  format: string;   // e.g. "Reels 60 detik"
  duration: string;  // e.g. "60 detik"
  scenes: {
    scene: string;    // Format: "Scene X (0:XX-0:XX)"
    action: string;   // What is done in front of camera
    dialogue: string; // Words spoken, max 2 sentences
    camera: string;   // Camera instruction
  }[];
  tips: string[];    // Exactly 2 production tips
}
```

### HistoryItem (localStorage: `flowfor_history`)
```typescript
interface HistoryItem {
  id: string;             // Date.now().toString()
  productName: string;
  targetAudience: string;
  contentType: string;
  result: GenerateResponse;
  createdAt: string;      // new Date().toISOString()
}
```

### AppSettings (localStorage: `flowfor_settings`)
```typescript
interface AppSettings {
  language: string;       // "id" | "en" (default "id")
  copyLength: string;     // "short" | "medium" | "long" (default "short")
  platforms: string[];     // default ["Instagram", "TikTok"]
}
```

### FormData (Component State — not persisted)
```typescript
interface FormData {
  productName: string;
  description: string;
  contentType: string;
  interestHint?: string;
}
```

---

# 2. Technical Blueprint

## 2.1 System Architecture

```
BROWSER
│
├── Navbar (search input + theme toggle)
│
├── SidebarWrapper
│   ├── Sidebar (desktop sticky / mobile bottom tabs)
│   └── Panel Router (activePanel: "dashboard" | "history" | "settings")
│       ├── "dashboard" → GeneratorDashboard
│       │   ├── Form state + handleSubmit()
│       │   ├── ErrorToast + success toast
│       │   ├── Sub-components: SalesPageCard, BentoCard (caption+broadcast),
│       │   │   ToDoListCard, StoryboardCard, ShootScriptCard,
│       │   │   VibeScoreCard, MobilePreviewModal, TagInput
│       │   └── ContentCalendar.tsx
│       ├── "history" → HistoryPanel (delete confirmation modal)
│       └── "settings" → SettingsPanel (backup/restore/clear)
│
└── SettingsContext (theme + app settings, persisted to localStorage)

GeneratorDashboard
  POST /api/generate
         │
         ▼
    Vercel Serverless Function (app/api/generate/route.ts)
         │
         ├── Input validation (max lengths, contentType enum)
         ├── AbortController timeout (90s)
         └── Gemini 2.5 Flash (systemInstruction: Indonesian creative director)
```

## 2.2 API Endpoint: `POST /api/generate`

| Aspect | Detail |
|--------|--------|
| URL | `/api/generate` |
| Method | `POST` |
| Content-Type | `application/json` |
| Timeout | 90 seconds (AbortController) |
| Model | `gemini-2.5-flash` |
| Response MIME | `application/json` (via `generationConfig.responseMimeType`) |
| Auth | None (public endpoint — see Security section) |

### Request Body
See `GenerateRequestBody` in section 1.6.

### Success Response: `200 OK`
```json
{
  "landingPage": "...",
  "caption": "...",
  "broadcast": "...",
  "todoList": ["..."],
  "storyboard": [{ "shot": "...", "visual": "...", "audio": "..." }],
  "vibeScore": { "score": 0, "label": "...", "reasons": ["..."] },
  "contentCalendar": [{ "day": 1, "date": "...", "platform": "...", "type": "...", "topic": "...", "caption_hint": "..." }],
  "shootScript": { "format": "...", "duration": "...", "scenes": [...], "tips": ["..."] },
  "nicheRecommendation": "..."
}
```

### Error Responses

| HTTP | Condition | Indonesian Message |
|------|-----------|-------------------|
| `400` | Missing required fields OR field exceeds max length | "Input terlalu panjang atau ada field yang kosong. Mohon periksa kembali." |
| `400` | `contentType` not in allowed list | "contentType tidak valid." |
| `500` | `GEMINI_API_KEY` not set | "GEMINI_API_KEY is not configured. Please set it in .env.local" |
| `500` | Gemini returns empty response | "Gemini returned an empty response. Please try again." |
| `500` | JSON parse failure | "Failed to parse Gemini response. Please try again with different input." (includes `raw` field) |
| `500` | Missing required fields in response | "Gemini response is missing required fields." |
| `500` | Any other error (includes 503 high demand mapped to friendly message) | "Server AI sedang penuh (High Demand). Harap tunggu beberapa detik dan coba lagi ya! 🚀" |
| `504` | Request timeout (> 90s) | "Request timeout. Gemini AI butuh waktu terlalu lama. Coba lagi dengan deskripsi yang lebih singkat." |

### Server-Side Input Validation
```typescript
const MAX = {
  productName: 200,
  targetAudience: 200,
  description: 2000,
  interestHint: 500,
};
const VALID_CONTENT_TYPES = [
  "Produk Digital", "Jasa/Service", "Event/Webinar",
  "Affiliate/Review", "Konten Edukasi", "Konten Monetisasi",
  "Podcast/Audio", "Niche Finder",
];
```

### Safety Settings
```typescript
{ category: HARM_CATEGORY_HARASSMENT, threshold: BLOCK_MEDIUM_AND_ABOVE }
{ category: HARM_CATEGORY_HATE_SPEECH, threshold: BLOCK_MEDIUM_AND_ABOVE }
{ category: HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: BLOCK_MEDIUM_AND_ABOVE }
{ category: HARM_CATEGORY_DANGEROUS_CONTENT, threshold: BLOCK_MEDIUM_AND_ABOVE }
```

## 2.3 Component Hierarchy

```
RootLayout (app/layout.tsx)
│   ├── <head>: inline dark-mode script (prevents FOUC) + Google Fonts
│   └── SettingsProvider (app/components/SettingsContext.tsx)
│       └── AppShell (app/components/AppShell.tsx)
│           ├── Navbar (app/components/Navbar.tsx)
│           │   ├── Logo (Next/Image)
│           │   ├── Search input (aria-label="Cari campaign")
│           │   └── Theme toggle (aria-label="Switch to Light/Dark")
│           └── SidebarWrapper (app/components/SidebarWrapper.tsx)
│               ├── Sidebar (app/components/Sidebar.tsx)
│               │   ├── New Campaign button
│               │   └── Nav items: Dashboard, Project Campaign, Settings
│               └── Panel Router (activePanel state)
│                   ├── "dashboard" → GeneratorDashboard
│                   │   ├── MobilePreviewModal (role="dialog", aria-modal, ESC key)
│                   │   ├── ErrorToast (role="alert", aria-live="assertive")
│                   │   ├── TagInput
│                   │   ├── SalesPageCard
│                   │   ├── BentoCard × 2 (Caption, Broadcast)
│                   │   ├── ToDoListCard (with empty state)
│                   │   ├── StoryboardCard
│                   │   ├── ShootScriptCard
│                   │   ├── VibeScoreCard (dark-mode ring bg)
│                   │   └── ContentCalendar (ContentCalendar.tsx)
│                   ├── "history" → HistoryPanel
│                   │   └── Delete confirmation modal
│                   └── "settings" → SettingsPanel
│                       ├── Backup section
│                       ├── Restore section
│                       └── Clear All section
```

## 2.4 State Management

| State | Location | Persistence | Max |
|-------|----------|-------------|-----|
| Theme (`isDark`) | `SettingsContext` | `flowfor_theme` | `"dark"` / `"light"` |
| App settings | `SettingsContext` | `flowfor_settings` | JSON |
| History items | `SidebarWrapper` (`useHistory`) | `flowfor_history` | 30 items |
| Active panel | `SidebarWrapper` | memory | — |
| Selected campaign | `SidebarWrapper` | memory | — |
| Generator form | `GeneratorDashboard` | memory | — |
| Generation result | `GeneratorDashboard` | memory → saved to history on success | — |
| Loading / toast | `GeneratorDashboard` | memory | — |

## 2.5 LocalStorage Keys

| Key | Default | Type |
|-----|---------|------|
| `flowfor_history` | `[]` | `HistoryItem[]` |
| `flowfor_settings` | `{ language:"id", copyLength:"short", platforms:["Instagram","TikTok"] }` | `AppSettings` |
| `flowfor_theme` | none (light fallback) | `"dark"` \| `"light"` |

## 2.6 Styling System

### Tailwind Classes + Custom CSS

| Pattern | Selector | Purpose |
|---------|----------|---------|
| Glass card | `.glass-card` | `backdrop-filter: blur(12px)`, white/dark backgrounds, border, shadow |
| Form input | `.form-input` | Purple-tinted border, focus glow, hover states |
| Gradient button | `.btn-gradient` | Purple-to-indigo gradient, hover lift + shadow |
| Generate glow | `.btn-generate-glow` | Pulsing box-shadow animation (2s infinite) |
| Skeleton | `.skeleton` | Shimmer loading placeholder (1.5s infinite) |
| Progress bar | `.progress-bar-track` / `.progress-bar-fill` | Indeterminate animation (1.6s) |
| Toast | `.toast-in` | Bounce-in animation (0.25s) |
| Ring pulse | `.ring-glow` | Pulsing ring on Vibe Score (2s infinite) |
| Staggered entrances | `.animate-enter-1` through `.animate-enter-7` | slideUpFadeFast with staggered delays |
| Custom scrollbar | `::-webkit-scrollbar` | Thin (6px), dark mode variant via `html.dark` |
| Blob backgrounds | `.bg-blob-1/2/3` | Fixed radial gradient decorative elements |
| Focus ring | `:focus-visible` | Global purple outline for keyboard navigation |

### Color Palette

**Light mode:**
- Primary: `#7c3aed` / `#8b5cf6`
- Background: linear-gradient (lavender → indigo)
- Glass: `rgba(255,255,255,0.85)` with `blur(12px)`

**Dark mode (`html.dark`):**
- Primary: `#6366f1` / `#818cf8`
- Background: linear-gradient (`#0f0e1a` → `#0d1117`)
- Glass: `rgba(22,27,46,0.80)`

## 2.7 Environment Variables

| Variable | Required | Used In |
|----------|---------|---------|
| `GEMINI_API_KEY` | **Yes** | `app/api/generate/route.ts` (server-side only, never exposed to client) |

---

# 3. QA Report

## 3.1 Test Cases by Content Type

| Content Type | Test Focus | Critical Checks |
|-------------|-----------|----------------|
| Produk Digital | Full kit | All 8 output fields present, `nicheRecommendation` absent |
| Jasa/Service | Service copy | Caption + broadcast suitable for service offering |
| Event/Webinar | Event details | Sales page highlights event, shoot script for event promo |
| Affiliate/Review | Soft-sell + affiliate CTA | Broadcast has soft-selling tone |
| Konten Edukasi | Educational milestones | Todo list includes educational milestones |
| Konten Monetisasi | Revenue strategy | Caption + broadcast focused on monetization |
| Podcast/Audio | No camera column | Shoot script has no camera field, format = "Podcast Audio" |
| Niche Finder | `interestHint` → `nicheRecommendation` | Field present in response |

## 3.2 Happy Path Test Cases

| ID | Scenario | Steps | Expected Result |
|----|----------|-------|----------------|
| HP-01 | Full generation | Fill all fields → Generate | All cards populate, campaign saved to history |
| HP-02 | Load from history | Click "Muat" on a history item | Form + all cards repopulated |
| HP-03 | Delete with confirmation | Click trash → confirm | Item removed, localStorage updated |
| HP-04 | Copy card | Hover card → copy icon → click | Toast appears, clipboard has text |
| HP-05 | Dark mode toggle | Click toggle → reload | Theme persists |
| HP-06 | Sidebar collapse | Click chevron (desktop) | Icon-only sidebar |
| HP-07 | Navbar search | Type in search bar | Auto-switch to history, filtered results |
| HP-08 | Mobile preview | Click preview | Phone-frame modal opens, ESC closes it |
| HP-09 | Download storyboard | Click "Download .doc" | Browser downloads file |
| HP-10 | Backup JSON | Click Download Backup | Valid JSON file downloads |
| HP-11 | Restore backup | Upload valid JSON | Page reloads, data restored |
| HP-12 | To-do checkboxes | Click checkboxes | Strikethrough, reset on new campaign |
| HP-13 | Calendar day expand | Click day cell | Detail card shows topic + caption hint |

## 3.3 Edge Cases & Error Scenarios

| ID | Scenario | Trigger | Expected |
|----|----------|---------|---------|
| EC-01 | API key missing | No `GEMINI_API_KEY` env | 500 with clear message |
| EC-02 | Quota exceeded | Gemini 429 | Error toast: "Batas penggunaan AI tercapai..." |
| EC-03 | Server busy | Gemini 503 | Error toast: "Server AI sedang penuh..." |
| EC-04 | Network failure | Disconnect mid-request | Error toast: "Koneksi internet bermasalah..." |
| EC-05 | Timeout > 90s | Slow Gemini response | 504 error toast |
| EC-06 | Malformed JSON | Gemini returns bad JSON | 500 + raw text in response |
| EC-07 | productName > 200 chars | Long input | 400 validation error |
| EC-08 | Invalid contentType | Arbitrary string | 400 validation error |
| EC-09 | localStorage full | Exceed browser quota | Console error logged, no crash |
| EC-10 | Corrupted history JSON | Manual localStorage corruption | Graceful fallback to empty array |
| EC-11 | Empty history | Fresh user | Empty state with calendar icon |
| EC-12 | Search no results | Nonsense query | "Tidak ada campaign yang cocok" message |
| EC-13 | Double-click generate | Rapid double-click | Button disabled during loading |
| EC-14 | Delete during loading | Delete while generating | Deletion succeeds, loading continues |
| EC-15 | Load + new campaign | Muat → New Campaign | Form resets cleanly |
| EC-16 | Missing required output | Gemini omits `landingPage` | 500 with missing fields error |

## 3.4 Accessibility Checklist

| Item | Status | Implementation |
|------|--------|---------------|
| ARIA labels on interactive elements | ✅ | `aria-label="Switch to Light"` on toggle, `aria-label="Cari campaign"` on search |
| ARIA role on modal | ✅ | `role="dialog"`, `aria-modal="true"`, `aria-labelledby="mobile-preview-title"` |
| ARIA live regions | ✅ | Error toast: `role="alert" aria-live="assertive"`; success toast: `role="status" aria-live="polite"` |
| Keyboard navigation | ✅ | Logical tab order through form fields |
| Focus visible ring | ✅ | `:focus-visible { outline: 2px solid #7c3aed; outline-offset: 2px; }` in globals.css |
| Color contrast | ✅ | All text meets WCAG AA |
| Alt text on images | ✅ | `alt="Logo"` on logo images |
| Form label associations | ✅ | All inputs have `<label htmlFor="...">` + matching `id` |
| Disabled button state | ✅ | `disabled` attribute + opacity + `cursor: not-allowed` |
| Dark mode FOUC prevention | ✅ | Inline `<script>` in `<head>` applies `html.dark` before React mounts |

## 3.5 Responsive Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile (default) | 0–767px | Single column, bottom tab bar, full-width form |
| Tablet (md:) | 768px+ | Sidebar sticky, 38%/62% two-column grid |
| Desktop (lg:) | 1024px+ | Cards with `lg:col-span-2`, sidebar collapsible |
| Wide | 1280px+ | `max-w-7xl` container |

**iOS zoom prevention:** `.form-input { font-size: 16px }` in mobile media query.

## 3.6 Browser Compatibility

| Browser | Support |
|---------|---------|
| Chrome 115+ | Full |
| Firefox 120+ | Full |
| Safari 17+ | Full |
| Edge 120+ | Full |
| Mobile Safari (iOS) | Full |
| Chrome Android | Full |

---

# 4. File Reference

| File | Purpose |
|------|---------|
| `app/components/GeneratorDashboard.tsx` | Main dashboard: form, results, all sub-components |
| `app/api/generate/route.ts` | API endpoint: input validation, Gemini call, timeout |
| `app/components/SettingsContext.tsx` | Theme + settings state, localStorage persistence |
| `app/components/SidebarWrapper.tsx` | Panel router, history management (`useHistory` hook) |
| `app/components/Sidebar.tsx` | Navigation sidebar (desktop) + bottom tabs (mobile) |
| `app/components/HistoryPanel.tsx` | Campaign history list, search filter, delete confirmation |
| `app/components/SettingsPanel.tsx` | Backup/restore/clear data UI |
| `app/components/ContentCalendar.tsx` | Monthly calendar grid with day detail |
| `app/components/Navbar.tsx` | Top navbar: logo, search, theme toggle |
| `app/components/AppShell.tsx` | Shell: navbar + sidebar wrapper composition |
| `app/globals.css` | Custom CSS: glassmorphism, dark mode, animations, scrollbar |
| `app/layout.tsx` | Root layout: dark mode inline script, Google Fonts, metadata |
| `app/page.tsx` | Root page: renders AppShell |
| `DOCS.md` | This file |

---

# 5. Audit Fix Summary (commit `af025dc`)

All 18 issues resolved:

| # | Severity | Issue | File | Fix |
|---|---------|-------|------|-----|
| 1 | 🔴 CRITICAL | `ErrorToast` not defined (build fail) | `GeneratorDashboard.tsx` | Added function definition |
| 2 | 🔴 CRITICAL | `CONTENT_TYPES` not defined (build fail) | `GeneratorDashboard.tsx` | Added constant array |
| 3 | 🟠 HIGH | Dark mode FOUC | `layout.tsx` | Inline `<script>` in `<head>` |
| 4 | 🟠 HIGH | Missing `?.` on `todoList.map()` | `GeneratorDashboard.tsx` | Added optional chaining |
| 5 | 🟠 HIGH | Missing `?.` on `script.scenes.map()` | `GeneratorDashboard.tsx` | Added optional chaining |
| 6 | 🟠 HIGH | Empty `catch {}` blocks | `SidebarWrapper.tsx`, `SettingsContext.tsx` | Added `console.error` |
| 7 | 🟠 HIGH | No input validation (DoS risk) | `api/generate/route.ts` | Added MAX limits + contentType enum |
| 8 | 🟠 HIGH | No request timeout | `api/generate/route.ts` | AbortController 90s timeout |
| 9 | 🟡 MEDIUM | Modal missing ARIA + keyboard | `GeneratorDashboard.tsx` | `role="dialog"`, ESC handler |
| 10 | 🟡 MEDIUM | Vibe score ring dark mode | `GeneratorDashboard.tsx` | `isDark` ternary for bg color |
| 11 | 🟡 MEDIUM | Empty todo state missing | `GeneratorDashboard.tsx` | Empty check + message |
| 12 | 🟡 MEDIUM | Search missing `aria-label` | `Navbar.tsx` | `aria-label="Cari campaign"` |
| 13 | 🟡 MEDIUM | Missing `:focus-visible` | `globals.css` | Global focus ring CSS |
| 14 | 🟡 MEDIUM | Calendar contrast low | `ContentCalendar.tsx` | `text-gray-500 dark:text-gray-400` |
| 15 | 🟢 LOW | Magic number `30` hardcoded | `SidebarWrapper.tsx` | `MAX_HISTORY` constant |
| 16 | 🟢 LOW | Form labels not associated | `GeneratorDashboard.tsx` | `htmlFor` + `id` |
| 17 | 🟢 LOW | Toast not screen-reader announced | `GeneratorDashboard.tsx` | `role="status" aria-live` |
| 18 | 🟢 LOW | Delete without confirmation | `HistoryPanel.tsx` | Confirmation modal |
| 19 | 🟢 LOW | Clear All no loading state | `SettingsPanel.tsx` | Clearing status message |
