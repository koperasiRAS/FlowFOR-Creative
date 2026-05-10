/**
 * FlowFOR Creative — API Route: /api/niche-brief
 * © 2026 Rangga Danu Arta. All Rights Reserved.
 * Built for #JuaraVibeCoding competition by Google.
 *
 * Generates strategic niche competitor brief: top competitor accounts,
 * content patterns that work, and strategic insights for the niche.
 */

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { getRandomGeminiKey } from "@/lib/env";

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
const NICHE_BRIEF_SYSTEM_PROMPT = `Kamu adalah Social Media Intelligence Analyst yang spesialis dalam competitive analysis untuk konten kreator Indonesia.

TUGAS UTAMA:
Beri strategic insights tentang sebuah niche/topik — pattern konten apa yang work, dan apa yang harus dilakukan untuk menang di niche tersebut.

ATURAN:
1. Respond dengan HANYA JSON object mentah. TANPA markdown fences. TANPA backticks.
2. Semua rekomendasi harus SPECIFIK dan ACTIONABLE — bukan generic advice.
3. Content patterns harus dari analisis pattern yang sering muncul di niche tersebut.
4. Insights harus dalam Bahasa Indonesia.

OUTPUT JSON:
{
  "nicheOverview": {
    "name": "string (nama niche yang dianalisa)",
    "size": "string (estimasi ukuran niche: Kecil/Medium/Besar)",
    "competition": "string (tingkat kompetisi: Rendah/Sedang/Tinggi)",
    "monetization": "string (cara monetize di niche ini)",
    "opportunity": "string (kenapa ini niche yang promising)"
  },
  "contentPatterns": [
    {
      "pattern": "string (nama pattern, contoh: Before-After Reveal)",
      "description": "string (penjelasan pattern ini dan kenapa work)",
      "example": "string (contoh konkret bagaimana implementasinya)",
      "virality": "string (tingkat viral: Tinggi/Sedang/Rendah)",
      "frequency": "string (seberapa sering posting pattern ini)"
    }
  ],
  "strategicInsight": {
    "differentiation": "string (bagaimana cara beda dari kompetitor yang sudah ada)",
    "quickWin": "string (hal paling mudah yang bisa dilakukan untuk mulai di niche ini)",
    "commonMistake": "string (mistake yang sering dilakukan orang di niche ini)",
    "secretWeapon": "string (1 hal unik yang JANGAN dilakukan kompetitor lain)"
  },
  "actionPlan": [
    "string (langkah actionable ke-1 yang harus dilakukan SEKARANG)",
    "string (langkah ke-2)",
    "string (langkah ke-3)"
  ],
  "overallScore": 75,
  "entryDifficulty": "string (Easy/Medium/Hard — seberapa sulit masuk niche ini)"
}`;

// ==============================================
// POST /api/niche-brief
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

    const apiKey = getRandomGeminiKey();

    // Parse body
    let body: { niche: string; contentType?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const { niche, contentType } = body;

    if (!niche || niche.trim().length < 2) {
      return NextResponse.json(
        { error: "Niche harus diisi minimal 2 karakter." },
        { status: 400 }
      );
    }

    if (niche.length > 200) {
      return NextResponse.json({ error: "Niche terlalu panjang." }, { status: 400 });
    }

    // Sanitize
    const safeNiche = niche.replace(/[<>{}\\]+/g, "").trim();
    const safeContentType = contentType || "Umum";

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-3.1-flash-lite",
      systemInstruction: NICHE_BRIEF_SYSTEM_PROMPT,
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      ],
      generationConfig: { responseMimeType: "application/json" },
    });

    const userPrompt = `Analisa niche berikut dan berikan competitor brief yang lengkap:

NICHE: ${safeNiche}
CONTENT TYPE: ${safeContentType}

TUGAS:
1. Berikan overview niche (ukuran, kompetisi, cara monetize, opportunity)
2. Identifikasi 5 content patterns yang work di niche ini
3. Berikan strategic insights: differentiation, quick win, common mistake, secret weapon
4. Buat action plan 3 langkah yang harus dilakukan SEKARANG
5. Beri overall score (0-100) dan entry difficulty

PENTING:
- content patterns harus spesifik dan bisa langsung di-copy
- action plan harus very actionable — hal yang bisa dilakukan dalam 1-2 hari
- Semua dalam Bahasa Indonesia`;

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
    if (cleanText.startsWith("```json")) {
      cleanText = cleanText.replace(/^```json\s*/, "").replace(/\s*```$/, "").trim();
    } else if (cleanText.startsWith("```")) {
      cleanText = cleanText.replace(/^```\s*/, "").replace(/\s*```$/, "").trim();
    }

    let parsed;
    try {
      parsed = JSON.parse(cleanText);
    } catch {
      if (process.env.NODE_ENV === "development") {
        console.error("[NicheBrief] Parse error:", cleanText.slice(0, 200));
      }
      return NextResponse.json({ error: "Gagal memproses niche brief. Coba lagi." }, { status: 500 });
    }

    return NextResponse.json(parsed, { status: 200 });

  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.error("[NicheBrief] Error:", err);
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