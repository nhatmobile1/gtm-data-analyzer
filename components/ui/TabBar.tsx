"use client";

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
  return (
    <div className="flex gap-0 px-6 border-b border-border">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onTabChange(t.id)}
          className={`px-[18px] py-[10px] bg-transparent border-none cursor-pointer text-[13px] font-sans transition-colors ${
            activeTab === t.id
              ? "text-text font-semibold border-b-2 border-accent"
              : "text-muted font-normal border-b-2 border-transparent hover:text-text"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
