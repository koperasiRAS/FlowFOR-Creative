import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// ==============================================
// TYPES
// ==============================================
interface StoryboardItem {
  shot: string;
  visual: string;
  audio: string;
}

interface VibeScore {
  score: number;
  label: string;
  reasons: string[];
}

export interface GenerateRequestBody {
  productName: string;
  targetAudience: string;
  description: string;
  contentType: string;
  interestHint?: string;
  language?: string;
  copyLength?: string;
  platforms?: string[];
}

export interface GenerateResponse {
  landingPage: string;
  caption: string;
  broadcast: string;
  todoList: string[];
  storyboard: StoryboardItem[];
  vibeScore: VibeScore;
  contentCalendar: ContentCalendarEntry[];
  shootScript: ShootScriptData;
  nicheRecommendation?: string;
}

interface ContentCalendarEntry {
  day: number;
  date: string;
  platform: string;
  type: string;
  topic: string;
  caption_hint: string;
}

interface ShootScriptData {
  format: string;
  duration: string;
  scenes: {
    scene: string;
    action: string;
    dialogue: string;
    camera: string;
  }[];
  tips: string[];
}

// ==============================================
// SYSTEM PROMPT
// ==============================================
const SYSTEM_PROMPT = `Kamu adalah Virtual Creative Director profesional yang khusus melayani launch produk digital di Indonesia.

Kamu expert dalam:
- Copywriting persuasif (sales page, caption, broadcast)
- Strategi launch campaign dari pre-launch sampai post-launch
- Content planning untuk Reels, TikTok, WA/Telegram community
- Viral marketing dan engagement optimization
- Storyboard creation untuk video short-form
- Produksi video dan shoot script creation

INPUT yang kamu terima:
- productName: nama produk/campaign
- targetAudience: siapa target audiens
- description: deskripsi singkat produk
- contentType: jenis konten (Produk Digital / Jasa/Service / Event/Webinar / Affiliate/Review / Konten Edukasi / Konten Monetisasi / Podcast/Audio / Niche Finder)
- interestHint: (opsional) minat/keahlian user — WAJIB digunakan saat contentType = "Niche Finder"

ATURAN KRITIS:
1. Respon dengan HANYA JSON object mentah. TANPA markdown fences. TANPA backticks. TANPA penjelasan sebelum atau sesudah JSON.
2. Bahasa: Indonesia casual untuk caption/broadcast, Indonesia formal untuk sales page.
3. Semua teks harus original, persuasive, dan sesuai konteks Indonesia.
4. Vibe Score harus realistis antara 0-100 berdasarkan kualitas konten yang dihasilkan.
5. Storyboard HARUS 8 shot dengan detail visual dan audio yang spesifik.

ATURAN SPESIFIK PER OUTPUT:

SALES PAGE (landingPage):
- MAXIMUM 150 words. Format WAJIB: 1 hook sentence + 5 bullet points menggunakan emoji + 1 CTA sentence.
- Bullet points only — NO long paragraphs.

CONTENT CALENDAR (contentCalendar):
- Buat strategic content calendar untuk SISA HARI di bulan ini (Mulai dari tanggal hari ini yang diberikan).
- Hanya gunakan PLATFORM yang dipilih oleh user: {platforms}.
- Hanya include posting days (BUKAN setiap hari).
- Distribusikan secara cerdas agar campaign memuncak di akhir bulan.
- Tidak boleh ada duplicate day number.

SHOOT SCRIPT (shootScript):
- Buat practical shooting script berdasarkan contentType.
- Untuk Reels/TikTok: 8-10 scenes, max 60 detik total.
- Untuk YouTube: 5-7 scenes, struktur intro+isi+outro.
- Untuk Podcast: 4-5 segments, tanpa kolom camera.
- SELALU include 2 practical production tips.

NICHE FINDER:
- Jika contentType = "Niche Finder" ATAU interestHint ada nilainya:
  * BERDASARKAN interestHint, rekomendasikan 1 niche terbaik.
  * Jelaskan dalam 1 kalimat kenapa niche itu cocok.
  * Generate semua output lain DENGAN niche tersebut.
  * WAJIB tambahkan field "nicheRecommendation": "string" dengan deskripsi 1 kalimat kenapa niche itu direkomendasikan.

OUTPUT JSON WAJIB sesuai struktur ini:
{
  "landingPage": "string (sales copy persuasif MAXIMUM 150 words. Format WAJIB: 1 hook sentence + 5 bullet points menggunakan emoji + 1 CTA sentence. Bullet points only — NO long paragraphs.)",
  "caption": "string (hook di baris pertama + body + CTA + 3-5 hashtag di akhir baris)",
  "broadcast": "string (soft-selling message untuk grup WA/Telegram, friendly tone)",
  "todoList": [
    "string (action item ke-1, spesifik dan actionable, dari pre-launch ke post-launch)",
    "string (action item ke-2...)",
    "string (action item ke-3...)",
    "string (action item ke-4...)",
    "string (action item ke-5...)",
    "string (action item ke-6...)",
    "string (action item ke-7...)",
    "string (action item ke-8...)"
  ],
  "storyboard": [
    {
      "shot": "string (format: 'Shot X — 0:XX-0:XX')",
      "visual": "string (apa yang dilihat penonton di layar, harus visual yang menarik dan jelas)",
      "audio": "string (narration script atau background music cue)"
    },
    { "shot": "...", "visual": "...", "audio": "..." },
    { "shot": "...", "visual": "...", "audio": "..." },
    { "shot": "...", "visual": "...", "audio": "..." },
    { "shot": "...", "visual": "...", "audio": "..." },
    { "shot": "...", "visual": "...", "audio": "..." },
    { "shot": "...", "visual": "...", "audio": "..." },
    { "shot": "...", "visual": "...", "audio": "..." }
  ],
  "vibeScore": {
    "score": number (0-100, integer, berdasarkan hook strength + emotional trigger + CTA urgency),
    "label": "string (label kreator yang sesuai, misal: 'High Viral Potential', 'Solid Launch Ready', 'Needs More Fire')",
    "reasons": [
      "string (alasan 1, spesifik dan actionable, apa yang sudah bagus dan apa yang perlu diperbaiki)",
      "string (alasan 2...)",
      "string (alasan 3...)"
    ]
  },
  "contentCalendar": [
    {
      "day": number (Tanggal hari tersebut, misal: 15, 16, dst),
      "date": "string (Nama Hari + Tanggal, misal: 'Senin, 15 Mei')",
      "platform": "string (HANYA platform yang dipilih user)",
      "type": "string (Reels / Story / Post / Thread / Broadcast / Shorts)",
      "topic": "string (hook: masalah yang diselesaikan produk, max 20 words)",
      "caption_hint": "string (short hint untuk caption, max 15 words)"
    }
  ],
  "shootScript": {
    "format": "string (format video, misal: 'Reels 60 detik', 'YouTube Long-form', 'Podcast Audio')",
    "duration": "string (durasi, misal: '60 detik', '15 menit')",
    "scenes": [
      {
        "scene": "string (format: 'Scene X (0:XX-0:XX)')",
        "action": "string (apa yang dilakukan di depan kamera, jelas dan spesifik)",
        "dialogue": "string (kata-kata yang diucapkan, max 2 kalimat)",
        "camera": "string (close-up wajah / wide shot / b-roll produk / overhead dll)"
      }
    ],
    "tips": [
      "string (tip produksi 1)",
      "string (tip produksi 2)"
    ]
  },
  "nicheRecommendation": "string (WAJIB HANYA jika contentType='Niche Finder' atau interestHint ada nilainya. Format: 'Niche: [nama]. Penjelasan 1 kalimat kenapa niche ini direkomendasikan untuk user berdasarkan minat mereka.')"
}`;

// ==============================================
// SAFETY SETTINGS
// ==============================================
const safetySettings: { category: HarmCategory; threshold: HarmBlockThreshold }[] = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

// ==============================================
// POST /api/generate
// ==============================================
export async function POST(req: NextRequest) {
  try {
    // 1. Read API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === "") {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured. Please set it in .env.local" },
        { status: 500 }
      );
    }

    // 2. Parse request body
    const body = await req.json() as GenerateRequestBody;
    const { productName, targetAudience, description, contentType } = body;

    if (!productName || !targetAudience || !description) {
      return NextResponse.json(
        { error: "productName, targetAudience, and description are required" },
        { status: 400 }
      );
    }

    // 3. Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_PROMPT,
      safetySettings,
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    // 4. Build user prompt with real-time context
    const today = new Date();
    const currentMonth = today.toLocaleString('id-ID', { month: 'long' });
    const currentDay = today.getDate();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const remainingDays = daysInMonth - currentDay + 1;
    const selectedPlatforms = (body.platforms && body.platforms.length > 0) ? body.platforms.join(", ") : "Instagram, TikTok, WhatsApp, YouTube";

    const userPrompt = `Buatkan launch kit untuk produk berikut:
    
PRODUCT NAME: ${productName}
TARGET AUDIENCE: ${targetAudience}
DESCRIPTION: ${description}
CONTENT TYPE: ${contentType}
BAHASA: ${body.language || 'id'}
PANJANG COPY: ${body.copyLength || 'short'}
PLATFORM TERPILIH: ${selectedPlatforms}
TANGGAL HARI INI: ${currentDay} ${currentMonth}
SISA HARI DI BULAN INI: ${remainingDays} hari

${body.interestHint ? `USER INTEREST/HINT: ${body.interestHint}` : ""}

PENTING:
- Content Calendar HARUS mulai dari tanggal ${currentDay} ${currentMonth} sampai akhir bulan.
- Gunakan HANYA platform: ${selectedPlatforms}.
- Respond ONLY dengan raw JSON object.`;

    // 5. Call Gemini
    const result = await model.generateContent(userPrompt);
    const response = result.response;
    const rawText = response.text();

    if (!rawText || rawText.trim() === "") {
      return NextResponse.json(
        { error: "Gemini returned an empty response. Please try again." },
        { status: 500 }
      );
    }

    // 6. Strip accidental markdown fences
    let cleanText = rawText.trim();
    if (cleanText.startsWith("```json")) {
      cleanText = cleanText.replace(/^```json\s*/, "").replace(/\s*```$/, "").trim();
    } else if (cleanText.startsWith("```")) {
      cleanText = cleanText.replace(/^```\s*/, "").replace(/\s*```$/, "").trim();
    }

    // 7. Parse JSON safely
    let parsed: GenerateResponse;
    try {
      parsed = JSON.parse(cleanText);
    } catch (parseErr) {
      console.error("[API] JSON parse error:", parseErr);
      console.error("[API] Raw Gemini response:", rawText);
      return NextResponse.json(
        {
          error: "Failed to parse Gemini response. Please try again with different input.",
          raw: rawText,
        },
        { status: 500 }
      );
    }

    // 8. Validate required fields
    if (!parsed.landingPage || !parsed.caption || !parsed.broadcast || !parsed.todoList || !parsed.storyboard || !parsed.vibeScore || !parsed.contentCalendar || !parsed.shootScript) {
      return NextResponse.json(
        { error: "Gemini response is missing required fields.", parsed },
        { status: 500 }
      );
    }

    // 9. Return success
    return NextResponse.json(parsed, { status: 200 });

  } catch (err) {
    console.error("[API] Unexpected error:", err);
    let message = err instanceof Error ? err.message : "Unknown error occurred";
    
    // Make 503 errors more user-friendly
    if (message.includes("503") || message.includes("Service Unavailable") || message.includes("high demand")) {
      message = "Server AI sedang penuh (High Demand). Harap tunggu beberapa detik dan coba lagi ya! 🚀";
    }

    return NextResponse.json(
      { error: `Server error: ${message}` },
      { status: 500 }
    );
  }
}
