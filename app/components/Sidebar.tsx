"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  History,
  Settings,
  Sparkles,
  Star,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
} from "lucide-react";
import Image from "next/image";

export type ActivePanel =
  | "dashboard"
  | "history"
  | "settings";

interface SidebarProps {
  activePanel: ActivePanel;
  onPanelChange: (panel: ActivePanel) => void;
}

const NAV_ITEMS: {
  id: ActivePanel;
  icon: React.ElementType;
  label: string;
}[] = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { id: "history", icon: History, label: "Project Campaign" },
  { id: "settings", icon: Settings, label: "Settings" },
];

export default function Sidebar({ activePanel, onPanelChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
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
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-white/90 backdrop-blur-sm border-r border-purple-500/10 transition-all duration-300 ease-in-out relative flex-shrink-0 ${
          collapsed ? "w-16" : "w-60"
        }`}
        style={{ height: "100vh", position: "sticky", top: 0 }}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 z-10 w-6 h-6 rounded-full bg-white border border-black/10
                     flex items-center justify-center shadow-sm hover:bg-purple-50 transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight size={12} className="text-gray-500" />
          ) : (
            <ChevronLeft size={12} className="text-gray-500" />
          )}
        </button>

        {/* Top: Creator Hub (Logo) */}
        <div className={`p-4 border-b border-black/5 dark:border-white/10 ${collapsed ? "flex justify-center" : ""}`}>
          {collapsed ? (
            <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
              <Image src="/logo.png" alt="FlowFOR Creative Logo" width={32} height={32} className="object-contain" />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                <Image src="/logo.png" alt="FlowFOR Creative Logo" width={40} height={40} className="object-contain" />
              </div>
              <div className="flex-1 leading-none overflow-hidden">
                <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">
                  FlowFOR Creative
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Star
                    size={10}
                    className="fill-amber-400 text-amber-400 flex-shrink-0"
                  />
                  <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium truncate">
                    Pro Plan
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* New Campaign Button */}
        <div className={`p-3 border-b border-black/5 ${collapsed ? "flex justify-center" : ""}`}>
          {collapsed ? (
            <button
              className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center
                         shadow-md hover:bg-purple-700 active:scale-95 transition-all duration-200"
              title="New Campaign"
            >
              <Sparkles size={16} />
            </button>
          ) : (
            <button
              className="w-full h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center gap-2
                         shadow-md hover:bg-purple-700 active:scale-95 transition-all duration-200 font-semibold text-sm"
              onClick={() => onPanelChange("dashboard")}
            >
              <Sparkles size={15} />
              New Campaign
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ id, icon: Icon, label }) => {
            const isActive = activePanel === id;
            return (
              <button
                key={id}
                onClick={() => onPanelChange(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? "bg-purple-50 text-purple-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                } ${collapsed ? "justify-center" : ""}`}
                title={collapsed ? label : undefined}
              >
                <Icon
                  size={18}
                  className={`flex-shrink-0 ${
                    isActive ? "text-purple-600" : "text-gray-400 group-hover:text-gray-600"
                  }`}
                />
                {!collapsed && (
                  <span className="text-sm font-medium truncate">{label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions (Theme Toggle) */}
        <div className="p-2 border-t border-black/5 dark:border-white/10 flex justify-center">
          <button
            onClick={toggleTheme}
            className={`flex items-center justify-center p-2 rounded-xl transition-all duration-200 group bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 w-full ${collapsed ? "" : "gap-2"}`}
            title="Toggle Theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
            {!collapsed && <span className="text-sm font-medium">{isDark ? "Light Mode" : "Dark Mode"}</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Tab Bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-black/5 flex items-center justify-around px-2 py-2"
        style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
      >
        {NAV_ITEMS.slice(0, 4).map(({ id, icon: Icon, label }) => {
          const isActive = activePanel === id;
          return (
            <button
              key={id}
              onClick={() => onPanelChange(id)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${
                isActive ? "text-purple-600" : "text-gray-400"
              }`}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium leading-none">{label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
