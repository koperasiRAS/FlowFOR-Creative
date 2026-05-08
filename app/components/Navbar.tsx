"use client";

import { useState, useCallback } from "react";
import { Search, Sun, Moon } from "lucide-react";
import Image from "next/image";

interface NavbarProps {
  onSearch?: (query: string) => void;
}

export default function Navbar({ onSearch }: NavbarProps) {
  const [isDark, setIsDark] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleTheme = () => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.remove("dark");
      setIsDark(false);
    } else {
      html.classList.add("dark");
      setIsDark(true);
    }
  };

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    onSearch?.(val);
  }, [onSearch]);

  return (
    <nav className="sticky top-0 z-50 w-full h-14 bg-white/90 dark:bg-gray-900/90 backdrop-blur-[14px] border-b border-purple-500/10 dark:border-white/10 transition-colors duration-300">
      <div className="h-full flex items-center">

        {/* Brand — fixed 240px wide (aligned with sidebar) */}
        <div className="w-60 flex-shrink-0 flex items-center gap-2.5 px-4 border-r border-purple-500/10 dark:border-white/10 h-full">
          <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
            <Image
              src="/logo2.png"
              alt="FlowFOR Creative"
              width={36}
              height={36}
              className="object-contain"
            />
          </div>
          <div className="leading-none min-w-0">
            <span className="text-[14px] font-bold text-gray-800 dark:text-gray-100 tracking-tight block truncate">
              FlowFOR Creative
            </span>
            <span className="text-[10px] font-medium text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/40 px-1.5 py-0.5 rounded-full whitespace-nowrap">
              Powered by Gemini
            </span>
          </div>
        </div>

        {/* Center: Search bar — truly centered */}
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="relative w-full max-w-sm">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search campaigns..."
              className="form-input !rounded-full !py-2 !pl-9 !pr-4 !text-[13px] !w-full dark:!bg-gray-800 dark:!border-white/10 dark:!text-gray-200 dark:placeholder:!text-gray-500"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(""); onSearch?.(""); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 text-sm font-medium"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Right: Theme Toggle */}
        <div className="flex items-center gap-2.5 px-4 flex-shrink-0">
          {/* Sun icon always visible on left, Moon on right - thumb slides */}
          <div className="flex items-center gap-1.5">
            <Sun size={14} className={`flex-shrink-0 transition-colors duration-200 ${isDark ? "text-gray-500" : "text-amber-500"}`} />
            <button
              id="theme-toggle-btn"
              onClick={toggleTheme}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className={`
                relative w-12 h-6 rounded-full border-2 transition-all duration-300 ease-in-out flex-shrink-0
                ${isDark
                  ? "bg-indigo-900 border-indigo-600"
                  : "bg-purple-100 border-purple-200"
                }
              `}
            >
              {/* Sliding Thumb */}
              <span
                className={`
                  absolute top-[2px] w-[18px] h-[18px] rounded-full shadow-md transition-all duration-300 ease-in-out
                  ${isDark
                    ? "translate-x-[24px] bg-indigo-500"
                    : "translate-x-[2px] bg-white"
                  }
                `}
              />
            </button>
            <Moon size={14} className={`flex-shrink-0 transition-colors duration-200 ${isDark ? "text-indigo-400" : "text-gray-400"}`} />
          </div>

          {/* Label */}
          <span className={`hidden sm:block text-[11px] font-semibold transition-colors duration-300 ${isDark ? "text-indigo-400" : "text-purple-600"}`}>
            {isDark ? "Dark" : "Light"}
          </span>
        </div>

      </div>
    </nav>
  );
}
