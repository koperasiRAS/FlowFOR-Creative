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
}

export interface GenerateResponse {
  landingPage: string;
  caption: string;
  broadcast: string;
  todoList: string[];
  storyboard: StoryboardItem[];
  vibeScore: VibeScore;
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

INPUT yang kamu terima:
- productName: nama produk/campaign
- targetAudience: siapa target audiens
- description: deskripsi singkat produk
- contentType: jenis konten (Produk Digital / Jasa/Service / Event/Webinar / Affiliate/Review)

ATURAN KRITIS:
1. Respon dengan HANYA JSON object mentah. TANPA markdown fences. TANPA backticks. TANPA penjelasan sebelum atau sesudah JSON.
2. Bahasa: Indonesia casual untuk caption/broadcast, Indonesia formal untuk sales page.
3. Semua teks harus original, persuasive, dan sesuai konteks Indonesia.
4. Vibe Score harus realistis antara 0-100 berdasarkan kualitas konten yang dihasilkan.
5. Storyboard HARUS 8 shot dengan detail visual dan audio yang spesifik.

OUTPUT JSON WAJIB sesuai struktur ini:
{
  "landingPage": "string (full sales copy persuasif dengan bullet points menggunakan emoji)",
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
  }
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
    });

    // 4. Build user prompt
    const userPrompt = `Buatkan launch kit untuk produk berikut:

PRODUCT NAME: ${productName}
TARGET AUDIENCE: ${targetAudience}
DESCRIPTION: ${description}
CONTENT TYPE: ${contentType}

Respond ONLY dengan raw JSON object. Tidak boleh ada markdown fences, tidak ada penjelasan di luar JSON. Langsung JSON object saja.`;

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
    if (!parsed.landingPage || !parsed.caption || !parsed.broadcast || !parsed.todoList || !parsed.storyboard || !parsed.vibeScore) {
      return NextResponse.json(
        { error: "Gemini response is missing required fields.", parsed },
        { status: 500 }
      );
    }

    // 9. Return success
    return NextResponse.json(parsed, { status: 200 });

  } catch (err) {
    console.error("[API] Unexpected error:", err);
    const message = err instanceof Error ? err.message : "Unknown error occurred";
    return NextResponse.json(
      { error: `Server error: ${message}` },
      { status: 500 }
    );
  }
}
