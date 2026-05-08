"use client";

import { useState } from "react";
import { Zap, Search, Sun, Moon } from "lucide-react";

export default function Navbar() {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full h-14 bg-white/[0.85] backdrop-blur-[12px] border-b border-purple-500/10">
      <div className="h-full flex items-center">

        {/* Brand — fixed 240px wide (same as expanded sidebar w-60) */}
        <div className="w-60 flex-shrink-0 flex items-center gap-2.5 px-4 border-r border-purple-500/10 h-full">
          <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
            <Zap size={18} className="text-purple-600" fill="#7C3AED" />
          </div>
          <div className="leading-none min-w-0">
            <span className="text-[15px] font-semibold text-gray-800 tracking-tight block truncate">
              FlowFOR Creative
            </span>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[10px] font-medium text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                Powered by Gemini
              </span>
            </div>
          </div>
        </div>

        {/* Center: Search bar */}
        <div className="flex-1 flex items-center px-6">
          <div className="relative w-full max-w-xs">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search campaigns..."
              className="form-input !rounded-full !py-2 !pl-9 !text-[13px] !w-full"
            />
          </div>
        </div>

        {/* Right: Theme Toggle */}
        <div className="flex items-center gap-3 px-4">
          <button
            id="theme-toggle-btn"
            onClick={toggleTheme}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className={`
              relative w-[72px] h-8 rounded-full border-2 transition-all duration-300 ease-in-out flex-shrink-0
              ${isDark
                ? "bg-gray-800 border-gray-600 shadow-inner"
                : "bg-purple-100 border-purple-200 shadow-inner"
              }
            `}
          >
            {/* Track icons */}
            <span className={`absolute left-1.5 top-1/2 -translate-y-1/2 transition-opacity duration-200 ${isDark ? "opacity-100" : "opacity-0"}`}>
              <Moon size={13} className="text-indigo-300" />
            </span>
            <span className={`absolute right-1.5 top-1/2 -translate-y-1/2 transition-opacity duration-200 ${isDark ? "opacity-0" : "opacity-100"}`}>
              <Sun size={13} className="text-amber-500" />
            </span>
            {/* Thumb */}
            <span
              className={`
                absolute top-[3px] w-5 h-5 rounded-full shadow-md transition-all duration-300 ease-in-out flex items-center justify-center
                ${isDark
                  ? "translate-x-[42px] bg-indigo-600"
                  : "translate-x-[3px] bg-white border border-purple-200"
                }
              `}
            >
              {isDark
                ? <Moon size={11} className="text-white" />
                : <Sun size={11} className="text-amber-500" />
              }
            </span>
          </button>

          {/* Mode label */}
          <span className={`hidden sm:block text-[12px] font-medium transition-colors duration-300 ${isDark ? "text-indigo-400" : "text-purple-600"}`}>
            {isDark ? "Dark" : "Light"}
          </span>
        </div>

      </div>
    </nav>
  );
}
