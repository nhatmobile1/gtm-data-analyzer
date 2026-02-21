"use client";

import { useState, useRef, useEffect } from "react";
import {
  LayoutGrid,
  FolderPlus,
  Trash2,
  ChevronRight,
  FolderClosed,
  FolderOpen,
  Pencil,
} from "lucide-react";
import type { DashboardEntry, DashboardFolder } from "@/lib/types";
import DropdownMenu, { type MenuItem } from "@/components/ui/DropdownMenu";
import DashboardRow from "./DashboardRow";

interface DashboardBrowserProps {
  dashboards: DashboardEntry[];
  folders: DashboardFolder[];
  onDashboardSelect: (id: string) => void;
  onDashboardRemove: (id: string) => void;
  onDashboardRename: (id: string, newName: string) => void;
  onDashboardMove: (id: string, folderId: string | null) => void;
  onFolderCreate: (name: string) => void;
  onFolderRename: (id: string, newName: string) => void;
  onFolderRemove: (id: string) => void;
  onClearAll: () => void;
}

export default function DashboardBrowser({
  dashboards,
  folders,
  onDashboardSelect,
  onDashboardRemove,
  onDashboardRename,
  onDashboardMove,
  onFolderCreate,
  onFolderRename,
  onFolderRemove,
  onClearAll,
}: DashboardBrowserProps) {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(folders.map((f) => f.id)));
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const folderInputRef = useRef<HTMLInputElement>(null);

  // Folder rename state
  const [renamingFolderId, setRenamingFolderId] = useState<string | null>(null);
  const [folderDraft, setFolderDraft] = useState("");
  const folderRenameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (creatingFolder) folderInputRef.current?.focus();
  }, [creatingFolder]);

  useEffect(() => {
    if (renamingFolderId) folderRenameRef.current?.select();
  }, [renamingFolderId]);

  // Auto-expand when new folders are added
  useEffect(() => {
    setExpanded((prev) => {
      const next = new Set(prev);
      folders.forEach((f) => next.add(f.id));
      return next;
    });
  }, [folders]);

  if (dashboards.length === 0 && folders.length === 0) return null;

  const toggleFolder = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCreateFolder = () => {
    const trimmed = newFolderName.trim();
    if (trimmed) {
      onFolderCreate(trimmed);
      setNewFolderName("");
      setCreatingFolder(false);
    }
  };

  const handleSaveFolderRename = (id: string) => {
    const trimmed = folderDraft.trim();
    if (trimmed) {
      onFolderRename(id, trimmed);
    }
    setRenamingFolderId(null);
  };

  const rootDashboards = dashboards
    .filter((d) => d.folderId === null)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const getDashboardsInFolder = (folderId: string) =>
    dashboards
      .filter((d) => d.folderId === folderId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return (
    <div
      className="w-full max-w-lg mt-6"
      style={{ animation: "fade-in-up 0.5s ease-out 0.15s both" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm text-muted">
          <LayoutGrid size={14} />
          <span>Saved Dashboards</span>
          <span className="text-xs opacity-60">({dashboards.length})</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCreatingFolder(true)}
            className="flex items-center gap-1.5 text-xs text-accent hover:text-accent/80 transition-colors cursor-pointer"
          >
            <FolderPlus size={12} />
            New Folder
          </button>
          <button
            onClick={onClearAll}
            className="flex items-center gap-1.5 text-xs text-muted hover:text-negative transition-colors cursor-pointer"
          >
            <Trash2 size={12} />
            Clear all
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        {/* New Folder Input */}
        {creatingFolder && (
          <div className="flex items-center gap-3 bg-surface/30 border border-accent/30 rounded-lg px-3.5 py-2.5">
            <FolderPlus size={16} className="text-accent shrink-0" />
            <input
              ref={folderInputRef}
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onBlur={() => {
                if (!newFolderName.trim()) setCreatingFolder(false);
                else handleCreateFolder();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateFolder();
                if (e.key === "Escape") {
                  setCreatingFolder(false);
                  setNewFolderName("");
                }
              }}
              placeholder="Folder name..."
              maxLength={40}
              className="flex-1 bg-transparent text-sm outline-none text-text placeholder:text-muted"
            />
            <span className="text-[10px] text-muted hidden sm:inline">
              Enter to save
            </span>
          </div>
        )}

        {/* Folders */}
        {folders.map((folder) => {
          const isExpanded = expanded.has(folder.id);
          const folderDashboards = getDashboardsInFolder(folder.id);
          const folderMenuItems: MenuItem[] = [
            {
              label: "Rename",
              icon: <Pencil size={12} />,
              onClick: () => {
                setFolderDraft(folder.name);
                setRenamingFolderId(folder.id);
              },
            },
            {
              label: "Delete folder",
              icon: <Trash2 size={12} />,
              onClick: () => onFolderRemove(folder.id),
              danger: true,
              separator: true,
            },
          ];

          return (
            <div key={folder.id}>
              <div
                className="flex items-center gap-2.5 bg-surface/30 border border-border/30 rounded-lg px-3.5 py-2.5 cursor-pointer hover:bg-surface/50 transition-colors"
                onClick={() => toggleFolder(folder.id)}
              >
                <ChevronRight
                  size={14}
                  className={`text-muted shrink-0 transition-transform duration-200 ${
                    isExpanded ? "rotate-90" : ""
                  }`}
                />
                {isExpanded ? (
                  <FolderOpen size={16} className="text-warning shrink-0" />
                ) : (
                  <FolderClosed size={16} className="text-warning shrink-0" />
                )}
                {renamingFolderId === folder.id ? (
                  <input
                    ref={folderRenameRef}
                    type="text"
                    value={folderDraft}
                    onChange={(e) => setFolderDraft(e.target.value)}
                    onBlur={() => handleSaveFolderRename(folder.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveFolderRename(folder.id);
                      if (e.key === "Escape") setRenamingFolderId(null);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    maxLength={40}
                    className="flex-1 text-sm font-medium bg-transparent border-b border-accent outline-none text-text"
                  />
                ) : (
                  <span className="text-sm font-medium flex-1 truncate">
                    {folder.name}
                  </span>
                )}
                <span className="text-xs text-muted shrink-0">
                  {folderDashboards.length} {folderDashboards.length === 1 ? "item" : "items"}
                </span>
                <div onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu items={folderMenuItems} />
                </div>
              </div>

              {/* Folder contents */}
              {isExpanded && folderDashboards.length > 0 && (
                <div className="ml-6 mt-1 flex flex-col gap-1.5">
                  {folderDashboards.map((d) => (
                    <DashboardRow
                      key={d.id}
                      dashboard={d}
                      folders={folders}
                      onSelect={onDashboardSelect}
                      onRemove={onDashboardRemove}
                      onRename={onDashboardRename}
                      onMove={onDashboardMove}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Root-level (unfiled) dashboards */}
        {rootDashboards.map((d) => (
          <DashboardRow
            key={d.id}
            dashboard={d}
            folders={folders}
            onSelect={onDashboardSelect}
            onRemove={onDashboardRemove}
            onRename={onDashboardRename}
            onMove={onDashboardMove}
          />
        ))}
      </div>
    </div>
  );
}
