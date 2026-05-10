/**
 * FlowFOR Creative — Smart Launch Command Center
 * Built for #JuaraVibeCoding by Google using Claude Code and Gemini Pro
 * Unauthorized copying or redistribution is prohibited.
 */

import { jsPDF } from "jspdf";

export interface PDFData {
  productName: string;
  contentType: string;
  targetAudience: string;
  landingPage: string;
  caption: string;
  broadcast: string;
  todoList: string[];
  storyboard: { shot: string; visual: string; audio: string }[];
  vibeScore?: { vibeScore: number; label: string; reasons: string[]; quickFix?: string };
  contentCalendar?: {
    day: number;
    date: string;
    platform: string;
    type: string;
    topic: string;
    caption_hint: string;
  }[];
  shootScript?: {
    format: string;
    duration: string;
    scenes: {
      scene: string;
      action: string;
      dialogue: string;
      camera: string;
    }[];
    tips: string[];
  };
  nicheRecommendation?: string;
  generatedAt?: string;
}

function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, "").replace(/&[a-z]+;/gi, (m) => {
    const map: Record<string, string> = {
      "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'", "&nbsp;": " ",
    };
    return map[m] ?? m;
  });
}

function scoreColor(score: number): string {
  if (score >= 70) return "#22c55e";
  if (score >= 50) return "#eab308";
  return "#ef4444";
}

function scoreLabel(score: number): string {
  if (score >= 70) return "🟢 Tinggi";
  if (score >= 50) return "🟡 Sedang";
  return "🔴 Perlu Perbaiki";
}

function addWrappedText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const lines = doc.splitTextToSize(text, maxWidth);
  lines.forEach((line: string) => {
    doc.text(line, x, y);
    y += lineHeight;
  });
  return y;
}

export async function generateCampaignPDF(data: PDFData): Promise<Blob> {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentW = pageW - margin * 2;

  const purple = "#7c3aed";
  const darkPurple = "#4c1d95";
  const gray = "#6b7280";
  const darkGray = "#374151";

  const dateStr = data.generatedAt
    ? new Date(data.generatedAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

  // ─── PAGE 1: COVER ───
  // Header band
  doc.setFillColor(124, 58, 237);
  doc.rect(0, 0, pageW, 30, "F");

  // Brand name
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("FlowFOR Creative", margin, 12);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("AI-Powered Smart Launch Command Center", margin, 19);
  doc.setFontSize(8);
  doc.text("#JuaraVibeCoding", margin + 75, 19);

  // Header gradient bottom line
  doc.setFillColor(76, 29, 149);
  doc.rect(0, 28, pageW, 2, "F");

  let y = 40;

  // Product name
  doc.setTextColor(darkGray);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  const productLines = doc.splitTextToSize(data.productName || "Campaign", contentW);
  doc.text(productLines[0], margin, y);
  y += 8 + productLines.length * 6;

  // Content type badge
  doc.setFillColor(239, 231, 254);
  doc.setDrawColor(0, 0, 0);
  doc.roundedRect(margin, y, 35, 7, 1, 1, "F");
  doc.setTextColor(purple);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text(data.contentType || "Produk Digital", margin + 3, y + 4.5);

  // Target audience
  doc.setTextColor(gray);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  y += 10;
  doc.text(`Target Audiens: ${data.targetAudience || "Umum"}`, margin, y);

  // Date
  y += 5;
  doc.text(`Generated: ${dateStr}`, margin, y);

  // Divider
  y += 5;
  doc.setDrawColor(209, 163, 255);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageW - margin, y);

  // Vibe Score section — only render if data exists
  if (data.vibeScore) {
    y += 8;
    const score = data.vibeScore.vibeScore;
    const label = data.vibeScore.label;
    const scoreColorHex = scoreColor(score);

    doc.setFillColor(249, 240, 255);
    doc.roundedRect(margin, y, 60, 32, 3, 3, "F");

    doc.setTextColor(scoreColorHex);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.text(String(score), margin + 10, y + 16);
    doc.setFontSize(10);
    doc.text("/100", margin + 26, y + 16);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(purple);
    doc.text(label, margin + 10, y + 22);

    doc.setTextColor(gray);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    if (data.vibeScore.reasons[0]) {
      const rLines = doc.splitTextToSize(`• ${data.vibeScore.reasons[0]}`, 45);
      doc.text(rLines[0], margin + 10, y + 27);
    }
    y += 38;
  } else {
    y += 8;
  }

  // Content preview cards
  const cards = [
    { icon: "📝", title: "Sales Page", preview: stripHtml(data.landingPage).split("\n").slice(0, 2).join(" ") },
    { icon: "📱", title: "Caption", preview: data.caption.split("\n")[0] || "" },
    { icon: "💬", title: "Broadcast", preview: data.broadcast.slice(0, 80) + (data.broadcast.length > 80 ? "..." : "") },
    { icon: "✅", title: "To-Do List", preview: `${data.todoList.length} action items` },
    { icon: "🎬", title: "Storyboard", preview: `${data.storyboard.length} shots` },
    { icon: "🎯", title: "Content Calendar", preview: `${data.contentCalendar?.length ?? 0} posting days` },
  ];

  const cardStartX = margin + 65;
  const cardW = (contentW - 65) / 3 - 3;
  const cardH = 15;
  let cx = cardStartX;
  let cy = y;

  cards.forEach((card, i) => {
    if (i > 0 && i % 3 === 0) {
      cx = cardStartX;
      cy += cardH + 3;
    }

    doc.setFillColor(250, 245, 255);
    doc.roundedRect(cx, cy, cardW, cardH, 2, 2, "F");

    doc.setTextColor(purple);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.text(`${card.icon} ${card.title}`, cx + 2, cy + 5);

    doc.setTextColor(gray);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(5.5);
    const previewLines = doc.splitTextToSize(card.preview, cardW - 4);
    doc.text(previewLines.slice(0, 2), cx + 2, cy + 9);

    cx += cardW + 3;
  });

  // Footer cover
  const footerY = pageH - 12;
  doc.setDrawColor(209, 163, 255);
  doc.line(margin, footerY, pageW - margin, footerY);
  doc.setTextColor(gray);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text(
    "Generated by FlowFOR Creative powered by Google Gemini AI, Claude Code & Gemini Pro. All content should be reviewed before publishing.",
    margin,
    footerY + 5
  );
  doc.setTextColor(purple);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text("flow-for-creative.vercel.app", pageW - margin, footerY + 5, { align: "right" });

  // ─── Helper: new page with header ───
  const addPageHeader = (title: string, icon: string) => {
    doc.addPage("landscape");
    doc.setFillColor(124, 58, 237);
    doc.rect(0, 0, pageW, 12, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(`${icon} ${title}`, margin, 8);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text(data.productName || "Campaign", margin, 8 + 3.5);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.text(dateStr, pageW - margin, 8 + 3.5, { align: "right" });
  };

  // ─── PAGE 2: SALES PAGE ───
  addPageHeader("Sales Page Copy", "📝");

  let py = 22;
  doc.setTextColor(darkGray);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("📋 Sales Page — Format: Hook + 5 Bullet Points + CTA", margin, py);
  py += 6;

  const salesText = stripHtml(data.landingPage);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor("#374151");

  // Detect and format bullet points
  const bulletPattern = /^[•\-\*]\s(.+)$/gm;
  const hasBullets = bulletPattern.test(salesText);
  bulletPattern.lastIndex = 0;

  if (hasBullets) {
    const parts = salesText.split(/^[•\-\*]\s/gm).filter(Boolean);
    let lastY = py;
    parts.forEach((part, i) => {
      const trimmed = part.trim();
      if (trimmed) {
        if (i === 0 && !trimmed.startsWith("•") && !trimmed.startsWith("-")) {
          // Hook paragraph
          doc.setFont("helvetica", "bold");
          lastY = addWrappedText(doc, trimmed, margin, lastY, contentW, 5);
          doc.setFont("helvetica", "normal");
        } else {
          // Bullet item
          doc.setFillColor(239, 231, 254);
          doc.circle(margin + 1.5, lastY - 1.5, 1, "F");
          doc.setTextColor(purple);
          lastY = addWrappedText(doc, trimmed, margin + 5, lastY, contentW - 5, 5);
          doc.setTextColor("#374151");
        }
      }
    });
    py = lastY + 5;
  } else {
    py = addWrappedText(doc, salesText, margin, py, contentW, 5);
  }

  // Content type note
  py += 5;
  doc.setFillColor(254, 243, 199);
  doc.roundedRect(margin, py, contentW, 8, 1, 1, "F");
  doc.setTextColor("#92400e");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text(
    `💡 Tips: Copy paste sales page di atas ke landing page, WhatsApp Catalog, atau website kamu.`,
    margin + 2,
    py + 5
  );

  // ─── PAGE 3: CAPTION + BROADCAST ───
  addPageHeader("Social Caption & Broadcast Message", "📱");

  py = 22;

  // Caption card
  doc.setFillColor(239, 246, 255);
  doc.roundedRect(margin, py - 3, contentW, 45, 2, 2, "F");
  doc.setTextColor(purple);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("📱 Instagram / TikTok Caption", margin + 3, py + 2);
  doc.setTextColor(darkGray);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  py = addWrappedText(doc, data.caption || "", margin + 3, py + 7, contentW - 6, 4.5);
  py += 5;

  // Broadcast card
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(margin, py - 3, contentW, 40, 2, 2, "F");
  doc.setTextColor("#166534");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("💬 WhatsApp / Telegram Broadcast", margin + 3, py + 2);
  doc.setTextColor(darkGray);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  py = addWrappedText(doc, data.broadcast || "", margin + 3, py + 7, contentW - 6, 4.5);

  // Caption tips
  py += 5;
  doc.setFillColor(254, 243, 199);
  doc.roundedRect(margin, py, contentW, 8, 1, 1, "F");
  doc.setTextColor("#92400e");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text("💡 Tips: Gunakan template caption di atas untuk Reels/TikTok. Mulai dengan HOOK yang kuat!", margin + 2, py + 5);

  // ─── PAGE 4: TO-DO LIST + STORYBOARD ───
  addPageHeader("Launch To-Do List & Visual Storyboard", "✅");

  py = 22;

  // To-do list (left column)
  const colW = contentW / 2 - 5;
  doc.setTextColor(purple);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("✅ Launch To-Do List", margin, py);
  py += 5;

  doc.setFillColor(240, 253, 244);
  doc.roundedRect(margin, py, colW, 60, 2, 2, "F");
  doc.setTextColor(darkGray);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);

  data.todoList.forEach((item, i) => {
    const lines = doc.splitTextToSize(`${i + 1}. ${item}`, colW - 6);
    doc.text(lines[0], margin + 3, py + 5 + i * 6.5);
  });

  // Storyboard (right column)
  doc.setTextColor(purple);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("🎬 Visual Storyboard", margin + colW + 10, py - 5);

  const sbColX = margin + colW + 10;
  const sbColW = colW;

  // Storyboard header row
  doc.setFillColor(254, 226, 226);
  doc.rect(sbColX, py, sbColW, 7, "F");
  doc.setTextColor("#991b1b");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6);
  doc.text("SHOT", sbColX + 2, py + 5);
  doc.text("VISUAL", sbColX + 20, py + 5);
  doc.text("AUDIO", sbColX + 90, py + 5);

  // Storyboard rows
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor(darkGray);

  data.storyboard.forEach((shot, i) => {
    const rowY = py + 7 + i * 8;
    if (i % 2 === 0) {
      doc.setFillColor(255, 255, 255);
    } else {
      doc.setFillColor(254, 243, 246);
    }
    doc.rect(sbColX, rowY, sbColW, 8, "F");

    doc.setTextColor(purple);
    doc.setFont("helvetica", "bold");
    doc.text(shot.shot || `Shot ${i + 1}`, sbColX + 2, rowY + 5);

    doc.setTextColor(darkGray);
    doc.setFont("helvetica", "normal");

    const visualLines = doc.splitTextToSize(shot.visual, 67);
    doc.text(visualLines[0], sbColX + 20, rowY + 5);

    const audioLines = doc.splitTextToSize(shot.audio, 55);
    doc.text(audioLines[0], sbColX + 90, rowY + 5);
  });

  // ─── PAGE 6: CONTENT CALENDAR ───
  if (data.contentCalendar && data.contentCalendar.length > 0) {
    addPageHeader("Content Calendar", "📅");

    py = 22;

    // Calendar header row
    doc.setFillColor(237, 242, 255);
    doc.rect(margin, py, contentW, 8, "F");
    doc.setTextColor(purple);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.text("DATE", margin + 2, py + 5);
    doc.text("PLATFORM", margin + 30, py + 5);
    doc.text("TYPE", margin + 55, py + 5);
    doc.text("TOPIC / HOOK", margin + 75, py + 5);
    doc.text("CAPTION HINT", margin + 125, py + 5);

    py += 8;
    data.contentCalendar.forEach((entry, i) => {
      const rowH = 10;
      if (i % 2 === 0) {
        doc.setFillColor(255, 255, 255);
      } else {
        doc.setFillColor(249, 250, 251);
      }
      doc.rect(margin, py, contentW, rowH, "F");
      doc.setTextColor(darkGray);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);

      doc.text(entry.date || String(entry.day), margin + 2, py + 5);
      doc.text(entry.platform, margin + 30, py + 5);
      doc.text(entry.type, margin + 55, py + 5);

      const topicLines = doc.splitTextToSize(entry.topic, 48);
      doc.text(topicLines[0], margin + 75, py + 5);

      const hintLines = doc.splitTextToSize(entry.caption_hint, 55);
      doc.text(hintLines[0], margin + 125, py + 5);

      py += rowH;
    });
  }

  // ─── PAGE 7: SHOOT SCRIPT ───
  if (data.shootScript) {
    addPageHeader("Shoot Script", "🎬");

    py = 22;
    doc.setTextColor(purple);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(
      `Format: ${data.shootScript.format}  |  Duration: ${data.shootScript.duration}`,
      margin, py
    );
    py += 7;

    // Scene header
    doc.setFillColor(221, 245, 249);
    doc.rect(margin, py, contentW, 8, "F");
    doc.setTextColor("#155e75");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6);
    doc.text("SCENE", margin + 2, py + 5);
    doc.text("ACTION", margin + 28, py + 5);
    doc.text("DIALOGUE", margin + 82, py + 5);
    doc.text("CAMERA", margin + 140, py + 5);

    py += 8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(darkGray);

    data.shootScript.scenes.forEach((scene, i) => {
      const rowH = 11;
      if (i % 2 === 0) {
        doc.setFillColor(255, 255, 255);
      } else {
        doc.setFillColor(240, 253, 253);
      }
      doc.rect(margin, py, contentW, rowH, "F");

      doc.setTextColor(purple);
      doc.setFont("helvetica", "bold");
      doc.text(scene.scene, margin + 2, py + 5);

      doc.setTextColor(darkGray);
      doc.setFont("helvetica", "normal");
      const actionLines = doc.splitTextToSize(scene.action, 52);
      doc.text(actionLines[0], margin + 28, py + 5);

      const dialogueLines = doc.splitTextToSize(scene.dialogue, 55);
      doc.text(dialogueLines[0], margin + 82, py + 5);

      doc.text(scene.camera, margin + 140, py + 5);

      py += rowH;
    });

    // Production tips
    if (data.shootScript.tips && data.shootScript.tips.length > 0) {
      py += 5;
      doc.setFillColor(255, 251, 235);
      doc.roundedRect(margin, py, contentW, 8 + data.shootScript.tips.length * 5, 1, 1, "F");
      doc.setTextColor("#92400e");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.text("💡 Production Tips:", margin + 3, py + 5);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      data.shootScript.tips.forEach((tip, i) => {
        doc.text(`${i + 1}. ${tip}`, margin + 3, py + 10 + i * 5);
      });
    }
  }

  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 2; i <= pageCount; i++) {
    doc.setPage(i);
    const footerYPos = pageH - 8;
    doc.setDrawColor(209, 163, 255);
    doc.setLineWidth(0.2);
    doc.line(margin, footerYPos, pageW - margin, footerYPos);
    doc.setTextColor(gray);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.text(
      "Generated by FlowFOR Creative powered by Google Gemini AI, Claude Code & Gemini Pro",
      margin,
      footerYPos + 4
    );
    doc.setTextColor(purple);
    doc.setFont("helvetica", "bold");
    doc.text(
      `${i - 1} / ${pageCount - 1}`,
      pageW - margin,
      footerYPos + 4,
      { align: "right" }
    );
  }

  return doc.output("blob");
}