/**
 * FlowFOR Creative — API Route: /api/regenerate
 * © 2026 Rangga Danu Arta. All Rights Reserved.
 * Built for #JuaraVibeCoding competition by Google.
 *
 * Allows per-section regeneration with AI modifiers like
 * "more viral", "shorter", "formal tone", "A/B variant".
 */

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { SYSTEM_PROMPT } from "@/lib/prompts";
import { env } from "@/lib/env";

// ==============================================
// RATE LIMITER
// ==============================================
const rateLimiter = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 15;
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
// SANITIZER
// ==============================================
const DANGEROUS_CHARS = /[<>{}\\]+/g;
const sanitize = (str: string): string => str.replace(DANGEROUS_CHARS, "").trim();

// ==============================================
// REGENERATE SYSTEM PROMPT
// ==============================================
const REGENERATE_SYSTEM_PROMPT = `Kamu adalah Virtual Creative Director profesional yang khusus melayani launch produk digital di Indonesia.
Kamu EXPERT dalam regenerasi konten. Kamu TIDAK membuat launch kit baru — kamu memperbaiki atau membuat variasi dari konten yang sudah ada.

ATURAN KRITIS:
1. Respond dengan HANYA JSON object mentah. TANPA markdown fences. TANPA backticks.
2. Jawab dalam bahasa Indonesia (casual untuk caption/broadcast, formal untuk sales page).
3. Semua teks harus original dan tidak plagiariat.

VARIANT MODE:
Kamu bisa generate dalam 2 mode berbeda. Pilih sesuai request user.

MODE A — "Perbaiki" (improve existing):
Gunakan konten yang ada sebagai referensi. Buat versi yang LEBIH BAIK dengan memperkaya hook, memperkuat emotional trigger, dan memperjelas CTA.

MODE B — "Varian" (a/b split):
Buat 2 versi BERBEDA dari konten yang sama. Setiap versi harus punya angle yang berbeda — beda opening hook, beda structure, atau beda tone. Keduanya tetap berkualitas tinggi.

OUTPUT JSON:
{
  "mode": "string (improved | variant_a | variant_b)",
  "content": "string (konten yang sudah diperbaiki atau variannya)",
  "reason": "string (1 kalimat kenapa versi ini lebih baik/menarik)"
}`;

// ==============================================
// SECTION PROMPTS (what to regenerate)
// ==============================================
const SECTION_CONFIG: Record<string, { prompt: string; example: string }> = {
  caption: {
    prompt: "Regenerasi social media caption. Tambah viral hooks, lebih engaging, CTA yang kuat.",
    example: "Caption Instagram/TikTok dengan hook kuat, body persuasive, 3-5 hashtag di akhir.",
  },
  landingPage: {
    prompt: "Regenerasi sales page copy. Format: 1 hook sentence + 5 bullet points + 1 CTA sentence.",
    example: "Sales copy maksimal 150 kata, bullet points dengan emoji.",
  },
  broadcast: {
    prompt: "Regenerasi WhatsApp/Telegram broadcast message. Tone friendly, soft-selling, tidak pushy.",
    example: "Broadcast message untuk grup WA/Telegram, friendly tone.",
  },
  storyboard: {
    prompt: "Regenerasi visual storyboard. 8 shot, setiap shot harus visual yang menarik dan clear.",
    example: "8 shots dengan format: Shot X — 0:XX-0:XX, visual yang menarik, audio cue.",
  },
};

// ==============================================
// POST /api/regenerate
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

    // Read API key
    const apiKey = env.GEMINI_API_KEY;

    // Parse body
    let body: {
      section: string;
      originalContent: string;
      productName: string;
      contentType: string;
      targetAudience: string;
      mode: "improve" | "variant_a" | "variant_b" | "improve_and_variants";
      modifier?: string;
      language?: string;
    };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const { section, originalContent, productName, contentType, targetAudience, mode, modifier, language } = body;

    // Validate
    if (!section || !originalContent || !productName || !mode) {
      return NextResponse.json(
        { error: "Missing required fields: section, originalContent, productName, mode." },
        { status: 400 }
      );
    }

    const validSections = ["caption", "landingPage", "broadcast", "storyboard"];
    if (!validSections.includes(section)) {
      return NextResponse.json({ error: "Invalid section." }, { status: 400 });
    }

    const validModes = ["improve", "variant_a", "variant_b", "improve_and_variants"];
    if (!validModes.includes(mode)) {
      return NextResponse.json({ error: "Invalid mode." }, { status: 400 });
    }

    if (originalContent.length > 5000) {
      return NextResponse.json({ error: "Content terlalu panjang untuk diregenerasi." }, { status: 400 });
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: REGENERATE_SYSTEM_PROMPT,
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      ],
      generationConfig: { responseMimeType: "application/json" },
    });

    // Build regenerate prompt
    const sectionInfo = SECTION_CONFIG[section];
    const modifierText = modifier ? `MODIFIER: "${modifier}"` : "";
    const modeLabel = mode === "improve" ? "MODE A — Perbaiki" : mode.includes("variant") ? "MODE B — Varian" : "MODE A + B";

    const userPrompt = `${modeLabel}

KONTEN ASLI (${section}):
${originalContent}

SECTION: ${section.toUpperCase()}
FORMAT YANG DIBUTUHKAN: ${sectionInfo.example}

PRODUCT: ${productName}
TARGET AUDIENCE: ${targetAudience}
CONTENT TYPE: ${contentType}
BAHASA: ${language || "id"}

${modifierText}

${mode === "improve" ? "Gunakan MODE A — Perbaiki konten asli. Buat versi yang LEBIH BAIK." : ""}
${mode === "variant_a" ? "Gunakan MODE B — Variant A. Buat versi dengan angle berbeda." : ""}
${mode === "variant_b" ? "Gunakan MODE B — Variant B. Buat versi dengan angle berbeda dari Variant A." : ""}
${mode === "improve_and_variants" ? `Gunakan MODE A + MODE B. Buat 3 versi:
1. Versi yang diperbaiki (mode: "improved")
2. Variant A — angle berbeda (mode: "variant_a")
3. Variant B — angle berbeda lagi (mode: "variant_b")

Respond dengan JSON array of objects:
[
  { "mode": "improved", "content": "...", "reason": "..." },
  { "mode": "variant_a", "content": "...", "reason": "..." },
  { "mode": "variant_b", "content": "...", "reason": "..." }
]` : ""}

Respond ONLY dengan raw JSON object.`;

    // Call Gemini with timeout
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

    // Strip markdown fences
    let cleanText = rawText;
    if (cleanText.startsWith("```json")) cleanText = cleanText.replace(/^```json\s*/, "").replace(/\s*```$/, "").trim();
    else if (cleanText.startsWith("```")) cleanText = cleanText.replace(/^```\s*/, "").replace(/\s*```$/, "").trim();

    // Parse
    let parsed;
    try {
      parsed = JSON.parse(cleanText);
    } catch {
      if (process.env.NODE_ENV === "development") {
        console.error("[Regenerate] Parse error:", cleanText.slice(0, 200));
      }
      return NextResponse.json({ error: "Gagal memproses response. Coba lagi." }, { status: 500 });
    }

    return NextResponse.json(parsed, { status: 200 });

  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.error("[Regenerate] Error:", err);
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