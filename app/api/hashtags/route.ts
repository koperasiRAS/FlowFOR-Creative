/**
 * FlowFOR Creative — API Route: /api/hashtags
 * © 2026 Rangga Danu Arta. All Rights Reserved.
 * Built for #JuaraVibeCoding competition by Google.
 *
 * Generates optimized hashtags per platform using Gemini AI.
 * Returns 20+ hashtags grouped by platform with explanations.
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
const HASHTAG_SYSTEM_PROMPT = `Kamu adalah Social Media Strategist profesional yang spesialis dalam hashtag optimization untuk konten Indonesia.

TUGAS UTAMA:
Buatkan daftar hashtag yang SUPER RELEVAN dan VIRAL POTENTIAL untuk produk/konten yang diberikan.

ATURAN:
1. Respond dengan HANYA JSON object mentah. TANPA markdown fences. TANPA backticks.
2. Hashtag harus dalam bahasa Inggris (global reach) dan Bahasa Indonesia (lokal).
3. Campur 70% hashtags populer + 30% niche-specific untuk optimal reach.
4. Setiap hashtag harus RELEVAN dengan produk/niche — jangan spam hashtag random.
5. WAJIB includes explanation untuk setiap platform.

OUTPUT JSON:
{
  "platforms": {
    "Instagram": {
      "hashtags": [
        "string (hashtag dengan #, contoh: #NamaHashtag)"
      ],
      "count": number,
      "strategy": "string (1 kalimat kenapa hashtag ini work untuk Instagram)"
    },
    "TikTok": {
      "hashtags": ["string"],
      "count": number,
      "strategy": "string"
    },
    "YouTube": {
      "hashtags": ["string"],
      "count": number,
      "strategy": "string"
    },
    "WhatsApp": {
      "hashtags": ["string"],
      "count": number,
      "strategy": "string"
    }
  },
  "allTags": ["string (gabungan semua hashtag unik, untuk copy paste di bio/link)"],
  "totalCount": number,
  "viralityScore": number (0-100, berapa besar potensi viral dari hashtag set ini),
  "tips": ["string (tips penggunaan hashtag untuk maximize reach)"]
}`;

// ==============================================
// POST /api/hashtags
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
    let body: {
      productName: string;
      description: string;
      contentType: string;
      targetAudience?: string;
      platforms?: string[];
    };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const { productName, description, contentType, targetAudience, platforms } = body;

    if (!productName || !description) {
      return NextResponse.json(
        { error: "productName dan description wajib diisi." },
        { status: 400 }
      );
    }

    if (productName.length > 200 || description.length > 1000) {
      return NextResponse.json(
        { error: "Input terlalu panjang." },
        { status: 400 }
      );
    }

    // Sanitize
    const DANGEROUS = /[<>{}\\]+/g;
    const safe = (s: string) => s.replace(DANGEROUS, "").trim();
    const safeName = safe(productName);
    const safeDesc = safe(description);

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: HASHTAG_SYSTEM_PROMPT,
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      ],
      generationConfig: { responseMimeType: "application/json" },
    });

    const selectedPlatforms = (platforms && platforms.length > 0)
      ? platforms.join(", ")
      : "Instagram, TikTok";

    const userPrompt = `Buatkan hashtag strategy untuk produk berikut:

PRODUCT: ${safeName}
DESCRIPTION: ${safeDesc}
CONTENT TYPE: ${contentType}
TARGET AUDIENCE: ${targetAudience || "Umum"}
PLATFORM: ${selectedPlatforms}

WAJIB generate untuk SEMUA platform: Instagram, TikTok, YouTube, WhatsApp.
Masing-masing platform minimal 15 hashtag.
Total semua hashtag harus ada di field "allTags".

PENTING: Semua hashtag harus sangat relevan dengan produk dan niche. Jangan asal pilih hashtag populer yang tidak nyambung.`;

    // Call Gemini
    let result;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60_000);
    try {
      result = await model.generateContent(userPrompt, { signal: controller.signal });
    } catch (genErr: unknown) {
      clearTimeout(timeoutId);
      if (genErr instanceof Error && genErr.name === "AbortError") {
        return NextResponse.json({ error: "Request timeout. Coba lagi." }, { status: 504 });
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
        console.error("[Hashtags] Parse error:", cleanText.slice(0, 200));
      }
      return NextResponse.json({ error: "Gagal memproses hashtag. Coba lagi." }, { status: 500 });
    }

    return NextResponse.json(parsed, { status: 200 });

  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.error("[Hashtags] Error:", err);
    }
    const rawMessage = err instanceof Error ? err.message : "Unknown error";

    if (rawMessage.includes("429") || rawMessage.toLowerCase().includes("quota")) {
      return NextResponse.json({ error: "Batas penggunaan AI tercapai. Tunggu sebentar." }, { status: 429 });
    }
    if (rawMessage.includes("503") || rawMessage.includes("high demand")) {
      return NextResponse.json({ error: "Server AI sedang penuh. Tunggu beberapa detik dan coba lagi." }, { status: 503 });
    }

    return NextResponse.json(
      { error: "Terjadi kesalahan. Silakan coba lagi." },
      { status: 500 }
    );
  }
}