/**
 * FlowFOR Creative — Smart Launch Command Center
 * Built for #JuaraVibeCoding by Google
 * © 2026 Rangga Danu Arta. All rights reserved.
 * Unauthorized copying or redistribution is prohibited.
 */

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { SYSTEM_PROMPT } from "@/lib/prompts";

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

    // 2a. Input validation — max lengths to prevent DoS
    const MAX = { productName: 200, targetAudience: 200, description: 2000, interestHint: 500 };
    if (
      !productName || !targetAudience || !description ||
      productName.length > MAX.productName ||
      targetAudience.length > MAX.targetAudience ||
      description.length > MAX.description ||
      (body.interestHint && body.interestHint.length > MAX.interestHint)
    ) {
      return NextResponse.json(
        { error: "Input terlalu panjang atau ada field yang kosong. Mohon periksa kembali." },
        { status: 400 }
      );
    }

    // 2b. Validate contentType against allowed values
    const VALID_CONTENT_TYPES = [
      "Produk Digital", "Jasa/Service", "Event/Webinar",
      "Affiliate/Review", "Konten Edukasi", "Konten Monetisasi",
      "Podcast/Audio", "Niche Finder",
    ];
    if (contentType && !VALID_CONTENT_TYPES.includes(contentType)) {
      return NextResponse.json(
        { error: "contentType tidak valid." },
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

    // 5. Call Gemini with timeout
    let result;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90_000); // 90s timeout
    try {
      result = await model.generateContent(userPrompt, { signal: controller.signal });
    } catch (genErr: unknown) {
      clearTimeout(timeoutId);
      if (genErr instanceof Error && genErr.name === "AbortError") {
        return NextResponse.json(
          { error: "Request timeout. Gemini AI butuh waktu terlalu lama. Coba lagi dengan deskripsi yang lebih singkat." },
          { status: 504 }
        );
      }
      throw genErr;
    }
    clearTimeout(timeoutId);
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
      if (process.env.NODE_ENV === "development") {
        console.error("[API] JSON parse error:", parseErr);
        console.error("[API] Raw Gemini response:", rawText);
      }
      return NextResponse.json(
        {
          error: "Failed to parse Gemini response. Please try again with different input.",
        },
        { status: 500 }
      );
    }

    // 8. Validate required fields
    if (!parsed.landingPage || !parsed.caption || !parsed.broadcast || !parsed.todoList || !parsed.storyboard || !parsed.vibeScore || !parsed.contentCalendar || !parsed.shootScript) {
      return NextResponse.json(
        { error: "Gemini response is missing required fields." },
        { status: 500 }
      );
    }

    // 9. Return success
    return NextResponse.json(parsed, { status: 200 });

  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.error("[API] Unexpected error:", err);
    }

    // Classify error and assign user-safe codes
    const rawMessage = err instanceof Error ? err.message : "Unknown error occurred";
    let userMessage = "Terjadi kesalahan server. Silakan coba lagi.";
    let errorCode = "INTERNAL_ERROR";

    if (
      rawMessage.includes("503") ||
      rawMessage.includes("Service Unavailable") ||
      rawMessage.includes("high demand")
    ) {
      userMessage = "Server AI sedang penuh (High Demand). Harap tunggu beberapa detik dan coba lagi ya! 🚀";
      errorCode = "AI_SERVER_FULL";
    } else if (rawMessage.includes("429") || rawMessage.toLowerCase().includes("quota")) {
      userMessage = "Batas penggunaan AI tercapai. Tunggu sebentar lalu coba lagi.";
      errorCode = "QUOTA_EXCEEDED";
    } else if (rawMessage.includes("403") || rawMessage.includes("permission") || rawMessage.includes("API key")) {
      userMessage = "Konfigurasi AI tidak valid. Hubungi administrator.";
      errorCode = "INVALID_API_KEY";
    } else if (rawMessage.includes("ECONNREFUSED") || rawMessage.includes("network")) {
      userMessage = "Tidak dapat terhubung ke server AI. Periksa koneksi internet.";
      errorCode = "NETWORK_ERROR";
    } else if (rawMessage.includes("timeout") || rawMessage.includes("DEADLINE")) {
      userMessage = "AI terlalu lama merespons. Coba sederhanakan deskripsi produk.";
      errorCode = "TIMEOUT";
    }

    return NextResponse.json(
      { error: userMessage, code: errorCode },
      { status: 500 }
    );
  }
}
