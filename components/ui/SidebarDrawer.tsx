"use client";

import { useEffect, useCallback } from "react";
import { X } from "lucide-react";

interface SidebarDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function SidebarDrawer({ open, onClose, title, children }: SidebarDrawerProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        style={{ animation: "fade-in 0.15s ease-out both" }}
      />

      {/* Drawer panel */}
      <div
        className="absolute top-0 right-0 h-full w-full max-w-md bg-base border-l border-border flex flex-col"
        style={{ animation: "slide-in-right 0.2s ease-out both" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <h2 className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-muted hover:text-text transition-colors cursor-pointer p-1 -mr-1"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {children}
        </div>
      </div>
    </div>
  );
}
