"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MoreHorizontal } from "lucide-react";

export interface MenuItem {
  label: string;
  onClick: () => void;
  danger?: boolean;
  separator?: boolean;
  icon?: React.ReactNode;
  submenu?: MenuItem[];
}

interface DropdownMenuProps {
  items: MenuItem[];
}

export default function DropdownMenu({ items }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const [submenuIdx, setSubmenuIdx] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSubmenuIdx(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleItemClick = useCallback(
    (item: MenuItem) => {
      if (item.submenu) return; // submenu items handle their own clicks
      item.onClick();
      setOpen(false);
      setSubmenuIdx(null);
    },
    []
  );

  return (
    <div ref={ref} className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
          setSubmenuIdx(null);
        }}
        className="p-1 text-muted hover:text-text transition-colors cursor-pointer rounded hover:bg-surface-hover"
      >
        <MoreHorizontal size={16} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 bg-surface border border-border rounded-md shadow-lg py-1 z-50 min-w-[160px]">
          {items.map((item, i) => (
            <div key={i}>
              {item.separator && (
                <div className="border-t border-border my-1" />
              )}
              <div
                className="relative"
                onMouseEnter={() =>
                  item.submenu ? setSubmenuIdx(i) : setSubmenuIdx(null)
                }
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleItemClick(item);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs cursor-pointer transition-colors flex items-center gap-2 ${
                    item.danger
                      ? "text-negative hover:bg-negative/10"
                      : "text-text hover:bg-surface-hover"
                  }`}
                >
                  {item.icon}
                  <span className="flex-1">{item.label}</span>
                  {item.submenu && (
                    <span className="text-muted text-[10px]">&#9656;</span>
                  )}
                </button>

                {/* Submenu */}
                {item.submenu && submenuIdx === i && (
                  <div className="absolute left-full top-0 ml-0.5 bg-surface border border-border rounded-md shadow-lg py-1 z-50 min-w-[140px]">
                    {item.submenu.map((sub, j) => (
                      <div key={j}>
                        {sub.separator && (
                          <div className="border-t border-border my-1" />
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            sub.onClick();
                            setOpen(false);
                            setSubmenuIdx(null);
                          }}
                          className={`w-full text-left px-3 py-1.5 text-xs cursor-pointer transition-colors flex items-center gap-2 ${
                            sub.danger
                              ? "text-negative hover:bg-negative/10"
                              : "text-text hover:bg-surface-hover"
                          }`}
                        >
                          {sub.icon}
                          {sub.label}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
