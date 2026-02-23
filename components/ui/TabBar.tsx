"use client";

import { useRef, useEffect, useState } from "react";

export interface Tab {
  id: string;
  label: string;
}

interface TabBarProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

export default function TabBar({ tabs, activeTab, onTabChange }: TabBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [hasOverflow, setHasOverflow] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const checkOverflow = () => {
      setHasOverflow(el.scrollWidth > el.clientWidth);
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, []);

  // Scroll active tab into view on mobile
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const activeEl = el.querySelector(`[data-tab-id="${activeTab}"]`);
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [activeTab]);

  return (
    <div
      ref={wrapperRef}
      className={`tab-scroll-wrapper border-b border-border ${hasOverflow ? "has-overflow" : ""}`}
    >
      <div
        ref={scrollRef}
        className="tab-scroll-container flex gap-0 px-4 sm:px-6 overflow-x-auto"
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            data-tab-id={t.id}
            onClick={() => onTabChange(t.id)}
            className={`px-3 sm:px-[18px] py-[10px] bg-transparent border-none cursor-pointer text-[13px] font-sans transition-colors whitespace-nowrap ${
              activeTab === t.id
                ? "text-text font-semibold border-b-2 border-accent"
                : "text-muted font-normal border-b-2 border-transparent hover:text-text"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
