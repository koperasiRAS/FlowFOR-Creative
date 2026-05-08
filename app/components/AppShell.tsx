"use client";

import { useState, useCallback } from "react";
import Navbar from "./Navbar";
import SidebarWrapper from "./SidebarWrapper";

/**
 * AppShell — client component that owns the search state
 * and bridges Navbar ↔ SidebarWrapper so search actually works.
 */
export default function AppShell() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q);
  }, []);

  return (
    <>
      <Navbar onSearch={handleSearch} />
      <SidebarWrapper searchQuery={searchQuery} />
    </>
  );
}
