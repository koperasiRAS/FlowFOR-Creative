/**
 * FlowFOR Creative — Smart Launch Command Center
 * Built for #JuaraVibeCoding by Google
 * © 2026 Rangga Danu Arta. All rights reserved.
 * Unauthorized copying or redistribution is prohibited.
 */

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { SYSTEM_PROMPT, IMAGE_ANALYSIS_SYSTEM_PROMPT } from "@/lib/prompts";
import { env } from "@/lib/env";

// ==============================================
// RATE LIMITER — In-memory, 10 req/min/IP
// ==============================================
const rateLimiter = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW = 60_000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimiter.get(ip);
  if (entry && now < entry.resetAt) {
    if (entry.count >= RATE_LIMIT) return false;
    entry.count++;
  } else {
    rateLimiter.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
  }
  return true;
}

// ==============================================
// INPUT SANITIZER — Strip dangerous characters
// ==============================================
const DANGEROUS_CHARS = /[<>{}\\]+/g;
const sanitize = (str: string): string => str.replace(DANGEROUS_CHARS, "").trim();

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
  imageData?: string; // base64 data URL, optional
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
  imageAnalysis?: ImageAnalysis;
}

interface ImageAnalysis {
  visualTheme: string;
  contentCategory: string;
  suggestedNiche: string;
  platformRecommendation: string;
  colorPalette: string[];
  visualStrength: string;
  visualImprovement: string;
  campaignAngle: string;
  visualSuggestion: string;
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
    // 1. Rate limiting — get client IP
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Terlalu banyak request. Tunggu sebentar lalu coba lagi." },
        { status: 429 }
      );
    }

    // 2. Read API key (validated at startup via lib/env.ts)
    const apiKey = env.GEMINI_API_KEY;

    // 3. Parse request body
    let body: GenerateRequestBody;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }
    const { productName, targetAudience, description, contentType, imageData } = body;

    // 3a. Input validation — required fields
    if (!productName || !targetAudience || !description || !contentType) {
      return NextResponse.json(
        { error: "Field wajib hilang: productName, targetAudience, description, contentType." },
        { status: 400 }
      );
    }

    // 3b. Input length validation (anti DoS)
    const MAX = { productName: 200, targetAudience: 200, description: 2000, interestHint: 500 };
    if (
      productName.length > MAX.productName ||
      targetAudience.length > MAX.targetAudience ||
      description.length > MAX.description ||
      (body.interestHint && body.interestHint.length > MAX.interestHint) ||
      (body.imageData && body.imageData.length > 8 * 1024 * 1024) // max 8MB base64
    ) {
      return NextResponse.json(
        { error: "Input terlalu panjang. Mohon periksa kembali." },
        { status: 400 }
      );
    }

    // 3c. Validate contentType against allowed values
    const VALID_CONTENT_TYPES = [
      "Produk Digital", "Jasa/Service", "Event/Webinar",
      "Affiliate/Review", "Konten Edukasi", "Konten Monetisasi",
      "Podcast/Audio", "Niche Finder",
    ];
    if (!VALID_CONTENT_TYPES.includes(contentType)) {
      return NextResponse.json({ error: "contentType tidak valid." }, { status: 400 });
    }

    // 3d. Sanitize all string inputs (anti injection)
    const safeProductName = sanitize(productName);
    const safeDescription = sanitize(description);
    const safeAudience = sanitize(targetAudience);
    const safeInterestHint = body.interestHint ? sanitize(body.interestHint) : undefined;

    // 3. Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);

    // 4. Build user prompt with sanitized, real-time context
    const today = new Date();
    const currentMonth = today.toLocaleString('id-ID', { month: 'long' });
    const currentDay = today.getDate();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const remainingDays = daysInMonth - currentDay + 1;
    const selectedPlatforms = (body.platforms && body.platforms.length > 0) ? body.platforms.join(", ") : "Instagram, TikTok, WhatsApp, YouTube";

    // ---- Image Analysis (if imageData provided) ----
    let imageAnalysis: GenerateResponse["imageAnalysis"] = undefined;

    if (imageData && imageData.startsWith("data:image/")) {
      const mimeMatch = imageData.match(/^data:(image\/\w+);base64,(.+)$/);
      if (mimeMatch) {
        const [, mimeType, base64Data] = mimeMatch;

        const visionModel = genAI.getGenerativeModel({
          model: "gemini-2.5-flash",
          systemInstruction: IMAGE_ANALYSIS_SYSTEM_PROMPT,
          safetySettings,
          generationConfig: { responseMimeType: "application/json" },
        });

        const analysisPrompt = `Analisa gambar produk berikut untuk campaign launch:

PRODUCT CONTEXT: ${safeProductName}
DESCRIPTION: ${safeDescription}
CONTENT TYPE: ${contentType}

Jawab HANYA dengan JSON object sesuai format sistemprompt.`;

        let analysisResult;
        const ac = new AbortController();
        const analysisTimeout = setTimeout(() => ac.abort(), 60_000);
        try {
          analysisResult = await visionModel.generateContent([
            { inlineData: { mimeType, data: base64Data } },
            { text: analysisPrompt },
          ], { signal: ac.signal });
        } catch (analysisErr: unknown) {
          clearTimeout(analysisTimeout);
          if (analysisErr instanceof Error && analysisErr.name !== "AbortError") {
            if (process.env.NODE_ENV === "development") console.error("[API] Image analysis failed:", analysisErr);
          }
        }
        clearTimeout(analysisTimeout);

        if (analysisResult) {
          const rawAnalysis = analysisResult.response.text().trim().replace(/^```json\s*/, "").replace(/\s*```$/, "").trim();
          try {
            const parsedAnalysis = JSON.parse(rawAnalysis);
            imageAnalysis = {
              visualTheme: parsedAnalysis.visualTheme ?? "",
              contentCategory: parsedAnalysis.contentCategory ?? "",
              suggestedNiche: parsedAnalysis.suggestedNiche ?? "",
              platformRecommendation: parsedAnalysis.platformRecommendation ?? "",
              colorPalette: parsedAnalysis.colorPalette ?? [],
              visualStrength: parsedAnalysis.visualStrength ?? "",
              visualImprovement: parsedAnalysis.visualImprovement ?? "",
              campaignAngle: parsedAnalysis.campaignAngle ?? "",
              visualSuggestion: parsedAnalysis.captionSuggestion ?? parsedAnalysis.visualSuggestion ?? "",
            };
          } catch {
            if (process.env.NODE_ENV === "development") console.error("[API] Image analysis parse failed:", rawAnalysis.slice(0, 200));
          }
        }
      }
    }

    // ---- Main Gemini call ----
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_PROMPT,
      safetySettings,
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    let extraContext = "";
    if (imageAnalysis) {
      extraContext = `
VISUAL ANALYSIS (dari gambar yang diupload user):
- Tema Visual: ${imageAnalysis.visualTheme}
- Kategori Konten: ${imageAnalysis.contentCategory}
- Sudut Campaign: ${imageAnalysis.campaignAngle}
- Warna Dominan: ${imageAnalysis.colorPalette.join(", ")}
- Kekuatan Visual: ${imageAnalysis.visualStrength}
- Improvement Visual: ${imageAnalysis.visualImprovement}
- Suggesti Sudut Copywriting: ${imageAnalysis.visualSuggestion}
${imageAnalysis.suggestedNiche ? `- Niche yang Cocok: ${imageAnalysis.suggestedNiche}` : ""}
${imageAnalysis.platformRecommendation ? `- Platform Rekomendasi: ${imageAnalysis.platformRecommendation}` : ""}

GUNAKAN insights visual ini untuk MENINGKATKAN kualitas landingPage, caption, broadcast, dan storyboard.`;
    }

    const userPrompt = `Buatkan launch kit untuk produk berikut:

PRODUCT NAME: ${safeProductName}
TARGET AUDIENCE: ${safeAudience}
DESCRIPTION: ${safeDescription}
CONTENT TYPE: ${contentType}
BAHASA: ${body.language || 'id'}
PANJANG COPY: ${body.copyLength || 'short'}
PLATFORM TERPILIH: ${selectedPlatforms}
TANGGAL HARI INI: ${currentDay} ${currentMonth}
SISA HARI DI BULAN INI: ${remainingDays} hari
${safeInterestHint ? `\nUSER INTEREST/HINT: ${safeInterestHint}` : ""}${extraContext}

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

    // 9. Attach image analysis if present
    if (imageAnalysis) {
      parsed.imageAnalysis = imageAnalysis;
    }

    // 10. Return success
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
