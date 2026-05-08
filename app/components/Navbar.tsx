"use client";

import { Zap, Search, Bell, HelpCircle } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full h-14 bg-white/80 backdrop-blur-md border-b border-white/40">
      <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">

        {/* Left: Logo + Brand */}
        <div className="flex items-center gap-2.5">
          {/* Logo icon */}
          <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
            <Zap size={18} className="text-purple-600" fill="#7C3AED" />
          </div>

          {/* Brand text */}
          <div className="leading-none">
            <span className="text-[15px] font-semibold text-gray-800 tracking-tight">
              FlowFOR Creative
            </span>
            {/* Gemini badge */}
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[10px] font-medium text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded-full">
                Powered by Gemini
              </span>
            </div>
          </div>
        </div>

        {/* Center: Search bar (decorative) */}
        <div className="hidden md:flex items-center">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search campaigns..."
              className="w-60 pl-9 pr-4 py-2 text-[13px] rounded-full bg-white/60 border border-white/40
                         placeholder:text-gray-400 text-gray-700
                         focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent
                         transition-all duration-200"
            />
          </div>
        </div>

        {/* Right: Icons + Avatar */}
        <div className="flex items-center gap-3">
          {/* Bell */}
          <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
            <Bell size={18} />
          </button>

          {/* Help */}
          <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
            <HelpCircle size={18} />
          </button>

          {/* Divider */}
          <div className="w-px h-5 bg-gray-200" />

          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600
                          flex items-center justify-center cursor-pointer shadow-sm">
            <span className="text-white text-[13px] font-medium leading-none">R</span>
          </div>
        </div>

      </div>
    </nav>
  );
}
