"use client";

import { useState, useRef, useEffect } from "react";
import { BarChart3, X, FolderClosed, FolderMinus, Pencil, Trash2 } from "lucide-react";
import type { DashboardEntry, DashboardFolder } from "@/lib/types";
import DropdownMenu, { type MenuItem } from "@/components/ui/DropdownMenu";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

interface DashboardRowProps {
  dashboard: DashboardEntry;
  folders: DashboardFolder[];
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onRename: (id: string, newName: string) => void;
  onMove: (id: string, folderId: string | null) => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return d.toLocaleDateString();
}

export default function DashboardRow({
  dashboard,
  folders,
  onSelect,
  onRemove,
  onRename,
  onMove,
}: DashboardRowProps) {
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState(dashboard.name);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renaming) inputRef.current?.select();
  }, [renaming]);

  const saveRename = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== dashboard.name) {
      onRename(dashboard.id, trimmed);
    } else {
      setDraft(dashboard.name);
    }
    setRenaming(false);
  };

  const moveSubmenu: MenuItem[] = [
    ...(dashboard.folderId
      ? [
          {
            label: "Remove from folder",
            icon: <FolderMinus size={12} />,
            onClick: () => onMove(dashboard.id, null),
          },
          { label: "", onClick: () => {}, separator: true },
        ]
      : []),
    ...folders
      .filter((f) => f.id !== dashboard.folderId)
      .map((f) => ({
        label: f.name,
        icon: <FolderClosed size={12} />,
        onClick: () => onMove(dashboard.id, f.id),
      })),
  ];

  const menuItems: MenuItem[] = [
    {
      label: "Rename",
      icon: <Pencil size={12} />,
      onClick: () => {
        setDraft(dashboard.name);
        setRenaming(true);
      },
    },
    ...(moveSubmenu.length > 0
      ? [
          {
            label: "Move to folder",
            icon: <FolderClosed size={12} />,
            onClick: () => {},
            submenu: moveSubmenu,
          },
        ]
      : []),
    {
      label: "Delete",
      icon: <Trash2 size={12} />,
      onClick: () => setShowDeleteConfirm(true),
      danger: true,
      separator: true,
    },
  ];

  return (
    <div
      className="group flex items-center gap-3 bg-surface/50 border border-border/50 rounded-lg px-3.5 py-2.5 hover:bg-surface hover:border-border transition-colors cursor-pointer"
      role="button"
      tabIndex={0}
      onClick={() => !renaming && onSelect(dashboard.id)}
      onKeyDown={(e) => { if ((e.key === "Enter" || e.key === " ") && !renaming) { e.preventDefault(); onSelect(dashboard.id); } }}
    >
      <BarChart3 size={16} className="text-muted shrink-0" />
      <div className="flex-1 min-w-0">
        {renaming ? (
          <input
            ref={inputRef}
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={saveRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveRename();
              if (e.key === "Escape") {
                setDraft(dashboard.name);
                setRenaming(false);
              }
            }}
            onClick={(e) => e.stopPropagation()}
            maxLength={60}
            className="text-sm font-medium bg-transparent border-b border-accent outline-none text-text w-full"
          />
        ) : (
          <div className="text-sm font-medium truncate">{dashboard.name}</div>
        )}
        <div className="text-xs text-muted">
          {dashboard.fileName} &middot; {dashboard.rowCount.toLocaleString()} rows &middot;{" "}
          {formatDate(dashboard.updatedAt)}
        </div>
      </div>
      <div
        className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenu items={menuItems} />
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="p-1 text-muted hover:text-negative transition-colors cursor-pointer"
          title="Delete dashboard"
        >
          <X size={14} />
        </button>
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete dashboard?"
        message={`"${dashboard.name}" will be permanently deleted. This cannot be undone.`}
        onConfirm={() => { onRemove(dashboard.id); setShowDeleteConfirm(false); }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
