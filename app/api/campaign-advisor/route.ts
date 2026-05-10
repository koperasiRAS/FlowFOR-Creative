/**
 * FlowFOR Creative — API Route: /api/campaign-advisor
 * © 2026 Rangga Danu Arta. All Rights Reserved.
 * Built for #JuaraVibeCoding competition by Google.
 *
 * Interactive AI advisor for campaign strategy — answers user questions
 * about their campaign and can suggest improvements to copy/content.
 */

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { withKeyRetry } from "@/lib/env";

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
// SYSTEM PROMPT
// ==============================================
const ADVISOR_SYSTEM_PROMPT = `Kamu adalah Campaign Strategy Advisor untuk kreator konten Indonesia di platform FlowFOR Creative.

PERSONA:
- Expert dalam launch campaign, copywriting, dan content strategy
- Bahasa: Indonesia casual tapi profesional
- Selalu actionable, konkret, dan langsung bisa di-apply
- Kalau ada data campaign dari user, GUNAKAN data tersebut untuk beri saran yang spesifik

ATURAN UTAMA:
1. Jawab dalam Bahasa Indonesia dengan conversational tone
2. Kalau user kirim data campaign, berikan saran BERDASARKAN data tersebut
3. Kalau ada masalah spesifik, berikan SOLUSI spesifik
4. Kalau user minta "perbaiki" atau "apply", berikan output BERUBAH yang langsung bisa dipake
5. Kalau pertanyaan di luar topic campaign (hal politik, illegal, dll), declined dengan sopan

OUTPUT JSON:
{
  "answer": "string (jawaban lengkap dalam Bahasa Indonesia, conversational, actionable, min 50 chars)",
  "suggestedImprovements": {
    "landingPage": "string | null (versi improve sales page, atau null)",
    "caption": "string | null (versi improve caption, atau null)",
    "broadcast": "string | null (versi improve broadcast, atau null)"
  },
  "tipSummary": "string (1 kalimat ringkasan tip paling penting)"
}`;

// ==============================================
// POST /api/campaign-advisor
// ==============================================
export async function POST(req: NextRequest) {
  try {
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Terlalu banyak request. Tunggu sebentar lalu coba lagi." },
        { status: 429 }
      );
    }

    let body: {
      question: string;
      campaignData?: {
        productName?: string;
        contentType?: string;
        landingPage?: string;
        caption?: string;
        broadcast?: string;
        todoList?: string[];
        storyboard?: { shot: string; visual: string; audio: string }[];
      };
      history?: { role: "user" | "model"; text: string }[];
    };

    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }
    const { question, campaignData, history } = body;

    if (!question || question.trim().length < 3) {
      return NextResponse.json({ error: "Pertanyaan terlalu pendek." }, { status: 400 });
    }
    if (question.length > 1000) {
      return NextResponse.json({ error: "Pertanyaan terlalu panjang. Maksimal 1000 karakter." }, { status: 400 });
    }
    const safeQuestion = question.replace(/[<>{}\]]+/g, "").trim();

    // Build conversation context from history (last 6 messages)
    const conversationHistory = (history || []).slice(-6).map((h) => {
      const role = h.role === "user" ? "User" : "Advisor";
      return `${role}: ${h.text}`;
    }).join("\n");

    // Build campaign context
    let campaignContext = "";
    if (campaignData) {
      const cd = campaignData;
      campaignContext = `
DATA CAMPAIGN:
- Produk: ${cd.productName || "—"}
- Content Type: ${cd.contentType || "—"}
${cd.landingPage ? `- Sales Page:\n${cd.landingPage.slice(0, 500)}` : ""}
${cd.caption ? `- Caption:\n${cd.caption.slice(0, 500)}` : ""}
${cd.broadcast ? `- Broadcast:\n${cd.broadcast.slice(0, 500)}` : ""}
${cd.todoList?.length ? `- To-Do List:\n${cd.todoList.map((t, i) => `${i + 1}. ${t}`).join("\n")}` : ""}
${cd.storyboard?.length ? `- Storyboard:\n${cd.storyboard.map((s) => `${s.shot}: ${s.visual}`).join("\n")}` : ""}
`;
    }

    const parsed = await withKeyRetry(async (apiKey) => {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: ADVISOR_SYSTEM_PROMPT,
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        ],
        generationConfig: { responseMimeType: "application/json" },
      });

      const userPrompt = `${conversationHistory ? `RIWAYAT PERCAKAPAN:\n${conversationHistory}\n\n` : ""}${campaignContext}
PERTANYAAN USER:
${safeQuestion}

JAWAB dengan JSON object sesuai sistemprompt.`;

      let result;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60_000);
      try {
        result = await model.generateContent(userPrompt, { signal: controller.signal });
      } catch (genErr: unknown) {
        clearTimeout(timeoutId);
        if (genErr instanceof Error && genErr.name === "AbortError") {
          throw Object.assign(new Error("Request timeout. Coba lagi."), { status: 504 });
        }
        throw genErr;
      }
      clearTimeout(timeoutId);

      const rawText = result.response.text().trim();
      let cleanText = rawText;
      if (cleanText.startsWith("```json")) cleanText = cleanText.replace(/^```json\s*/, "").replace(/\s*```$/, "").trim();
      else if (cleanText.startsWith("```")) cleanText = cleanText.replace(/^```\s*/, "").replace(/\s*```$/, "").trim();

      try {
        return JSON.parse(cleanText);
      } catch {
        if (process.env.NODE_ENV === "development") {
          console.error("[CampaignAdvisor] Parse error:", cleanText.slice(0, 200));
        }
        throw Object.assign(new Error("Gagal memproses jawaban AI. Coba lagi."), { status: 500 });
      }
    });

    return NextResponse.json(parsed, { status: 200 });

  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.error("[CampaignAdvisor] Error:", err);
    }
    const rawMessage = err instanceof Error ? err.message : "Unknown error";
    if (rawMessage.includes("429") || rawMessage.toLowerCase().includes("quota")) {
      return NextResponse.json({ error: "Batas penggunaan AI tercapai. Tunggu sebentar." }, { status: 429 });
    }
    return NextResponse.json(
      { error: "Terjadi kesalahan. Silakan coba lagi." },
      { status: 500 }
    );
  }
}