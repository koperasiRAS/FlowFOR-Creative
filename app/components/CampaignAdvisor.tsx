"use client";

import { useState, useRef, useCallback } from "react";
import { MessageCircle, Send, Loader2, Check, Lightbulb, RefreshCw } from "lucide-react";
import type { GenerateResult } from "./GeneratorDashboard";

interface AdvisorMessage {
  id: string;
  role: "user" | "model";
  text: string;
}

interface AdvisorProps {
  result: GenerateResult;
  onUpdateResult: (updated: GenerateResult) => void;
}

interface AdvisorResponse {
  answer: string;
  suggestedImprovements: {
    landingPage: string | null;
    caption: string | null;
    broadcast: string | null;
  };
  tipSummary: string;
}

export default function CampaignAdvisor({ result, onUpdateResult }: AdvisorProps) {
  const [messages, setMessages] = useState<AdvisorMessage[]>([
    {
      id: "welcome",
      role: "model",
      text: `Halo! 👋 Saya AI Campaign Advisor kamu. Mau tanya soal launch campaign "${result.productName || "produk kamu"}"? Silakan! Contoh:\n\n• "Rekomendasiin cara improve caption gua"\n• "Gimana bikin CTA yang lebih efektif?"\n• "Bantu bikin sales page yang lebih persuasif"`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<AdvisorResponse["suggestedImprovements"] | null>(null);
  const [applied, setApplied] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userQuestion = input.trim();
    setInput("");
    setIsLoading(true);
    setError(null);
    setSuggestions(null);
    setApplied({});

    // Add user message
    const userMsg: AdvisorMessage = { id: Date.now().toString(), role: "user", text: userQuestion };
    setMessages((prev) => [...prev, userMsg]);
    scrollToBottom();

    try {
      const res = await fetch("/api/campaign-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: userQuestion,
          campaignData: {
            productName: (result as unknown as { productName?: string }).productName,
            contentType: result.contentType,
            landingPage: result.landingPage,
            caption: result.caption,
            broadcast: result.broadcast,
            todoList: result.todoList,
            storyboard: result.storyboard,
          },
          history: messages.map((m) => ({ role: m.role, text: m.text })),
        }),
      });

      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Failed");

      const data: AdvisorResponse = await res.json();

      // Add model response
      const modelMsg: AdvisorMessage = { id: (Date.now() + 1).toString(), role: "model", text: data.answer };
      setMessages((prev) => [...prev, modelMsg]);
      setSuggestions(data.suggestedImprovements);
      scrollToBottom();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal dapat jawaban. Coba lagi.");
      // Remove the user message if request failed
      setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, result]);

  const handleApply = (key: "landingPage" | "caption" | "broadcast") => {
    if (!suggestions || !suggestions[key]) return;

    const updated = { ...result };

    if (key === "landingPage" && suggestions.landingPage) {
      updated.landingPage = suggestions.landingPage;
    } else if (key === "caption" && suggestions.caption) {
      updated.caption = suggestions.caption;
    } else if (key === "broadcast" && suggestions.broadcast) {
      updated.broadcast = suggestions.broadcast;
    }

    onUpdateResult(updated);
    setApplied((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => setApplied((prev) => ({ ...prev, [key]: false })), 2000);
  };

  const hasSuggestions = suggestions && (
    suggestions.landingPage || suggestions.caption || suggestions.broadcast
  );

  return (
    <div className="glass-card p-5 transition-all duration-200">
      {/* Header */}
      <div
        className="flex items-center justify-between mb-4 cursor-pointer pb-3 border-b border-gray-100 dark:border-white/10"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
            <MessageCircle size={16} className="text-blue-500" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm">
              AI Campaign Advisor
            </h3>
            <p className="text-[10px] text-gray-400">Tanya apa saja soal launch campaign kamu</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {expanded && (
            <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-semibold">
              {messages.length - 1} pesan
            </span>
          )}
          <button className="text-[10px] text-gray-400 hover:text-blue-500 transition-colors">
            {expanded ? "▲ Tutup" : "▼ Buka"}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="space-y-4">
          {/* Chat Messages */}
          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1 scrollbar-thin">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-[11px] leading-relaxed ${
                    msg.role === "user"
                      ? "bg-blue-500 text-white rounded-tr-sm"
                      : "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200 rounded-tl-sm"
                  }`}
                >
                  {msg.text.split("\n").map((line, i) => (
                    <p key={i} className={i > 0 ? "mt-1" : ""}>{line}</p>
                  ))}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start gap-2">
                <div className="bg-gray-100 dark:bg-slate-800 px-3 py-2 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}

            {error && (
              <p className="text-[10px] text-red-500 text-center">{error}</p>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Suggestions Panel */}
          {hasSuggestions && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 space-y-2">
              <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5 mb-2">
                <Lightbulb size={11} /> Saran Perbaikan — klik untuk apply
              </p>
              {suggestions.landingPage && (
                <SuggestionItem
                  label="Sales Page"
                  preview={suggestions.landingPage.slice(0, 80) + "..."}
                  applied={applied.landingPage ?? false}
                  onApply={() => handleApply("landingPage")}
                />
              )}
              {suggestions.caption && (
                <SuggestionItem
                  label="Caption"
                  preview={suggestions.caption.slice(0, 80) + "..."}
                  applied={applied.caption ?? false}
                  onApply={() => handleApply("caption")}
                />
              )}
              {suggestions.broadcast && (
                <SuggestionItem
                  label="Broadcast"
                  preview={suggestions.broadcast.slice(0, 80) + "..."}
                  applied={applied.broadcast ?? false}
                  onApply={() => handleApply("broadcast")}
                />
              )}
            </div>
          )}

          {/* Input */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Tanya soal campaign kamu di sini..."
              disabled={isLoading}
              className="flex-1 px-3 py-2.5 rounded-xl border-2 border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100 text-xs placeholder:text-gray-400 focus:outline-none focus:border-blue-400 dark:focus:border-blue-500 transition-all disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="w-10 h-10 rounded-xl bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center disabled:opacity-50 transition-colors flex-shrink-0"
            >
              {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SuggestionItem({
  label,
  preview,
  applied,
  onApply,
}: {
  label: string;
  preview: string;
  applied: boolean;
  onApply: () => void;
}) {
  return (
    <button
      onClick={onApply}
      disabled={applied}
      className={`w-full text-left p-2 rounded-lg border-2 transition-all text-[10px] ${
        applied
          ? "border-green-300 bg-green-50 dark:bg-green-900/20 text-green-700"
          : "border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-900 hover:border-blue-400 dark:hover:border-blue-600 text-gray-700 dark:text-gray-200"
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-bold text-blue-600 dark:text-blue-400">{label}</span>
        <span className="flex items-center gap-1 text-[9px]">
          {applied ? (
            <><Check size={9} className="text-green-500" /> Applied!</>
          ) : (
            <><RefreshCw size={9} /> Apply</>
          )}
        </span>
      </div>
      <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{preview}</p>
    </button>
  );
}