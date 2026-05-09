/**
 * FlowFOR Creative — API Route: /api/analyze-image
 * © 2026 Rangga Danu Arta. All Rights Reserved.
 * Built for #JuaraVibeCoding competition by Google.
 *
 * Analyzes uploaded product images and generates campaign content:
 * caption suggestions, visual theme, hook ideas, and content strategy.
 */

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { env } from "@/lib/env";

// ==============================================
// RATE LIMITER
// ==============================================
const rateLimiter = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW = 60_000;

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
// SYSTEM PROMPT
// ==============================================
const IMAGE_ANALYSIS_SYSTEM_PROMPT = `Kamu adalah Visual Content Strategist spesialis untuk kreator konten Indonesia. Kamu menganalisa gambar/foto produk dan memberikan insights untuk campaign digital.

TUGAS UTAMA:
Beri insights actionable berdasarkan gambar yang diupload — tema visual, ide hook/caption, suggest strategy, dan niche identification.

ATURAN:
1. Respond dengan HANYA JSON object mentah. TANPA markdown fences. TANPA backticks.
2. Semua hasil dalam Bahasa Indonesia (kecuali yang ditandai).
3. Insights harus SPECIFIC dan bisa langsung di-action.
4. Jangan_GENERATE competitor accounts yang tidak realistis — hanya hasil analisa dari gambar.

OUTPUT JSON:
{
  "visualTheme": "string (tema visual utama dari gambar: warna dominan, gaya desain, mood)",
  "contentCategory": "string (kategori konten yang cocok: Edukasi/Entertainment/Promosi/Lifestyle)",
  "suggestedNiche": "string (niche yang cocok berdasarkan visual produk)",
  "hookIdeas": ["string (ide hook ke-1 — strong opening untuk caption/reel)", "string (ide hook ke-2)", "string (ide hook ke-3)"],
  "captionSuggestion": "string (suggesti caption lengkap: hook + body + CTA — min 2 paragraph, max 4 paragraph, dalam Bahasa Indonesia natural)",
  "hashtagSuggestions": ["string ( hashtag ke-1)", "string ( hashtag ke-2)", "string ( hashtag ke-3)", "string ( hashtag ke-4)", "string ( hashtag ke-5)", "string ( hashtag ke-6)", "string ( hashtag ke-7)", "string ( hashtag ke-8)"],
  "platformRecommendation": "string (platform mana yang paling cocok: Instagram Reels/TikTok/YouTube Shorts/WhatsApp Status — beserta alasannya)",
  "colorPalette": ["string (warna ke-1)", "string (warna ke-2)", "string (warna ke-3)"],
  "visualStrength": "string (kekuatan visual utama — apa yang sudah bagus dari gambar ini)",
  "visualImprovement": "string (1 improve yang bisa langsung dilakukan untuk memperkuat visual ini)",
  "campaignAngle": "string (sudut pandang campaign yang cocok: Pain Point/Social Proof/Urgency/Aspirational — beserta alasannya)"
}`;

// ==============================================
// POST /api/analyze-image
// ==============================================
export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Terlalu banyak request. Tunggu sebentar lalu coba lagi." },
        { status: 429 }
      );
    }

    const apiKey = env.GEMINI_API_KEY;

    // Parse body
    let body: { imageData: string; productContext?: string; contentType?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const { imageData, productContext, contentType } = body;

    if (!imageData || !imageData.startsWith("data:image/")) {
      return NextResponse.json(
        { error: "Gambar tidak valid. Pastikan format adalah JPEG, PNG, atau WebP." },
        { status: 400 }
      );
    }

    // Extract base64 + mime type
    const mimeMatch = imageData.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!mimeMatch) {
      return NextResponse.json({ error: "Format gambar tidak didukung." }, { status: 400 });
    }
    const [, mimeType, base64Data] = mimeMatch;
    const imageBuffer = Buffer.from(base64Data, "base64");

    // Initialize Gemini with vision
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: IMAGE_ANALYSIS_SYSTEM_PROMPT,
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      ],
      generationConfig: { responseMimeType: "application/json" },
    });

    const userPrompt = `Analisa gambar produk berikut dan berikan insights campaign:

${productContext ? `KONTEKS PRODUK: ${productContext}\n` : ""}${contentType ? `CONTENT TYPE: ${contentType}\n` : ""}
TUGAS:
1. Identifikasi tema visual (warna, gaya, mood)
2. Suggesti niche yang cocok
3. Buat 3 ide hook yang kuat untuk opening caption/reel
4. Tulis suggesti caption lengkap (hook + body + CTA, 2-4 paragraph, Bahasa Indonesia natural)
5. Rekomendasikan 8 hashtag yang relevan
6. Tentukan platform paling cocok beserta alasannya
7. Identifikasi warna dominan
8. Analisa kekuatan & improvement visual
9. Tentukan campaign angle yang paling efektif

Jawab HANYA dengan JSON object yang sudah ditentukan sistemprompt.`;

    let result;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90_000);
    try {
      result = await model.generateContent([
        {
          inlineData: {
            mimeType,
            data: base64Data,
          },
        },
        { text: userPrompt },
      ], { signal: controller.signal });
    } catch (genErr: unknown) {
      clearTimeout(timeoutId);
      if (genErr instanceof Error && genErr.name === "AbortError") {
        return NextResponse.json({ error: "Request timeout. Gambar terlalu besar atau koneksi lambat." }, { status: 504 });
      }
      throw genErr;
    }
    clearTimeout(timeoutId);

    const rawText = result.response.text().trim();
    let cleanText = rawText;
    if (cleanText.startsWith("```json")) cleanText = cleanText.replace(/^```json\s*/, "").replace(/\s*```$/, "").trim();
    else if (cleanText.startsWith("```")) cleanText = cleanText.replace(/^```\s*/, "").replace(/\s*```$/, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(cleanText);
    } catch {
      if (process.env.NODE_ENV === "development") {
        console.error("[AnalyzeImage] Parse error:", cleanText.slice(0, 200));
      }
      return NextResponse.json({ error: "Gagal menganalisa gambar. Coba gambar lain." }, { status: 500 });
    }

    return NextResponse.json(parsed, { status: 200 });

  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.error("[AnalyzeImage] Error:", err);
    }
    const rawMessage = err instanceof Error ? err.message : "Unknown error";

    if (rawMessage.includes("429") || rawMessage.toLowerCase().includes("quota")) {
      return NextResponse.json({ error: "Batas penggunaan AI tercapai. Tunggu sebentar." }, { status: 429 });
    }
    if (rawMessage.includes("503") || rawMessage.includes("high demand")) {
      return NextResponse.json({ error: "Server AI sedang penuh. Tunggu beberapa detik dan coba lagi." }, { status: 503 });
    }

    return NextResponse.json(
      { error: "Terjadi kesalahan analisa gambar. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
