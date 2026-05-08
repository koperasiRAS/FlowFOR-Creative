"use client";

import { useState, useCallback } from "react";
import { Search, Sun, Moon } from "lucide-react";
import Image from "next/image";
import { useSettings } from "./SettingsContext";

interface NavbarProps {
  onSearch?: (query: string) => void;
}

export default function Navbar({ onSearch }: NavbarProps) {
  const { isDark, toggleTheme } = useSettings();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setSearchQuery(val);
      onSearch?.(val);
    },
    [onSearch]
  );

  return (
    <nav
      className="sticky top-0 z-50 w-full h-16 border-b transition-colors duration-300"
      style={{
        background: isDark
          ? "rgba(10, 9, 24, 0.95)"
          : "rgba(255,255,255,0.92)",
        borderColor: isDark
          ? "rgba(139,92,246,0.12)"
          : "rgba(139,92,246,0.15)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      <div className="h-full flex items-center">

        {/* ── LEFT: Brand (flexible width on mobile, fixed 240px on desktop) ── */}
        <div
          className="w-auto md:w-60 flex-shrink-0 flex items-center gap-2 md:gap-3 px-3 md:px-4 h-full border-r-0 md:border-r"
          style={{ borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(139,92,246,0.12)" }}
        >
          {/* Logo Icon Box */}
          <div className="flex-shrink-0 flex items-center justify-center mr-1">
            <Image 
              src={isDark ? "/logo_white.png" : "/logo_new.png"} 
              alt="Logo" 
              width={56} 
              height={56} 
              className="object-contain"
              priority
            />
          </div>

          {/* Brand name — hidden on very small mobile, visible on tablet/desktop */}
          <span
            className="hidden sm:block"
            style={{
              fontWeight: 700,
              fontSize: "17px",
              background: "linear-gradient(135deg, #7C3AED, #4F46E5)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              letterSpacing: "-0.3px",
              lineHeight: 1,
              whiteSpace: "nowrap",
            }}
          >
            FlowFOR Creative
          </span>
        </div>

        {/* ── CENTER: Search bar (truly centered in remaining space) ── */}
        <div className="flex-1 flex items-center justify-center px-2 md:px-6 min-w-0">
          <div className="relative w-full max-w-[380px]">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: isDark ? "#4b5563" : "#9ca3af" }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search campaigns..."
              style={{
                background: isDark ? "rgba(30,27,50,0.8)" : "rgba(245,243,255,0.9)",
                border: "1.5px solid rgba(139,92,246,0.20)",
                color: isDark ? "#e2e8f0" : "#1f2937",
                borderRadius: "99px",
                padding: "8px 36px 8px 36px",
                fontSize: "13px",
                width: "100%",
                outline: "none",
                transition: "all 0.2s",
              }}
              onFocus={(e) => {
                e.target.style.border = "1.5px solid #7c3aed";
                e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.12)";
              }}
              onBlur={(e) => {
                e.target.style.border = "1.5px solid rgba(139,92,246,0.20)";
                e.target.style.boxShadow = "none";
              }}
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(""); onSearch?.(""); }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold leading-none transition-colors"
                style={{ color: isDark ? "#6b7280" : "#9ca3af" }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* ── RIGHT: Theme Toggle ── */}
        <div className="flex items-center gap-2 md:gap-3 pr-3 md:pr-5 flex-shrink-0">
          {/* Sun icon OUTSIDE — hidden on mobile */}
          <Sun
            size={15}
            className="hidden sm:block"
            style={{ color: isDark ? "#374151" : "#f59e0b", flexShrink: 0, transition: "color 0.3s" }}
          />

          {/* Toggle track — thumb only, no icons inside */}
          <button
            id="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to Light" : "Switch to Dark"}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            style={{
              position: "relative",
              width: "44px",
              height: "24px",
              borderRadius: "99px",
              border: `2px solid ${isDark ? "#4f46e5" : "#c4b5fd"}`,
              background: isDark
                ? "linear-gradient(135deg, #312e81 0%, #1e1b4b 100%)"
                : "linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)",
              transition: "all 0.3s ease",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                position: "absolute",
                top: "3px",
                left: isDark ? "22px" : "3px",
                width: "14px",
                height: "14px",
                borderRadius: "50%",
                background: isDark
                  ? "linear-gradient(135deg, #818cf8 0%, #6366f1 100%)"
                  : "linear-gradient(135deg, #ffffff 0%, #f3e8ff 100%)",
                boxShadow: isDark
                  ? "0 1px 4px rgba(79,70,229,0.5)"
                  : "0 1px 4px rgba(124,58,237,0.25)",
                transition: "left 0.3s ease",
                display: "block",
              }}
            />
          </button>

          {/* Moon icon OUTSIDE — hidden on mobile */}
          <Moon
            size={15}
            className="hidden sm:block"
            style={{ color: isDark ? "#818cf8" : "#d1d5db", flexShrink: 0, transition: "color 0.3s" }}
          />

          {/* Label */}
          <span
            className="hidden sm:block text-[11px] font-bold tracking-wide"
            style={{
              color: isDark ? "#818cf8" : "#7c3aed",
              transition: "color 0.3s",
              minWidth: "30px",
            }}
          >
            {isDark ? "Dark" : "Light"}
          </span>
        </div>

      </div>
    </nav>
  );
}
