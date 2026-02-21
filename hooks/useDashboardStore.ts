"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type {
  DashboardEntry,
  DashboardFolder,
  DashboardStore,
} from "@/lib/types";

import { MAX_DASHBOARDS } from "@/lib/constants";

const STORAGE_KEY = "gtm-dashboard-store";
const OLD_STORAGE_KEY = "gtm-recent-files";
const MIGRATION_LOCK_KEY = "gtm-migration-lock";

// ── V1 type for migration ──
interface RecentFileV1 {
  id: string;
  name: string;
  date: string;
  rowCount: number;
  csvText: string;
}

function emptyStore(): DashboardStore {
  return { version: 2, dashboards: [], folders: [] };
}

function migrateFromV1(oldFiles: RecentFileV1[]): DashboardStore {
  return {
    version: 2,
    dashboards: oldFiles.map((f) => ({
      id: f.id,
      name: f.name.replace(/\.csv$/i, ""),
      fileName: f.name,
      date: f.date,
      updatedAt: f.date,
      rowCount: f.rowCount,
      csvText: f.csvText,
      folderId: null,
    })),
    folders: [],
  };
}

function loadFromStorage(): DashboardStore {
  if (typeof window === "undefined") return emptyStore();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.version === 2) return parsed;
    }
  } catch {
    /* corrupt data */
  }

  // Try migrating from v1 with lock to prevent multi-tab race
  try {
    const lock = localStorage.getItem(MIGRATION_LOCK_KEY);
    if (lock) {
      // Another tab is migrating — wait and re-read
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.version === 2) return parsed;
      }
      return emptyStore();
    }

    const oldRaw = localStorage.getItem(OLD_STORAGE_KEY);
    if (oldRaw) {
      // Set lock before migrating
      localStorage.setItem(MIGRATION_LOCK_KEY, Date.now().toString());
      try {
        const oldFiles: RecentFileV1[] = JSON.parse(oldRaw);
        if (Array.isArray(oldFiles)) {
          const migrated = migrateFromV1(oldFiles);
          saveToStorage(migrated);
          localStorage.removeItem(OLD_STORAGE_KEY);
          return migrated;
        }
      } finally {
        localStorage.removeItem(MIGRATION_LOCK_KEY);
      }
    }
  } catch {
    localStorage.removeItem(MIGRATION_LOCK_KEY);
  }

  return emptyStore();
}

function saveToStorage(store: DashboardStore): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    return true;
  } catch {
    // Quota exceeded — drop oldest dashboard and retry
    if (store.dashboards.length > 1) {
      const sorted = [...store.dashboards].sort(
        (a, b) =>
          new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
      );
      return saveToStorage({
        ...store,
        dashboards: sorted.slice(1),
      });
    }
    console.warn("Failed to save dashboard store: localStorage quota exceeded");
    return false;
  }
}

export function useDashboardStore() {
  const [store, setStore] = useState<DashboardStore>(emptyStore);
  // Ref mirrors state for synchronous reads (avoids stale closures)
  const storeRef = useRef<DashboardStore>(emptyStore());

  useEffect(() => {
    const loaded = loadFromStorage();
    storeRef.current = loaded;
    setStore(loaded);
  }, []);

  const update = useCallback(
    (updater: (prev: DashboardStore) => DashboardStore) => {
      setStore((prev) => {
        const next = updater(prev);
        storeRef.current = next;
        saveToStorage(next);
        return next;
      });
    },
    []
  );

  // ── Dashboard CRUD ──

  const saveDashboard = useCallback(
    (fileName: string, csvText: string, rowCount: number): DashboardEntry => {
      const now = new Date().toISOString();
      const prev = storeRef.current;

      // Build entry synchronously from ref (not from async state)
      const existing = prev.dashboards.find((d) => d.fileName === fileName);
      let entry: DashboardEntry;

      if (existing) {
        entry = { ...existing, csvText, rowCount, updatedAt: now };
      } else {
        entry = {
          id: crypto.randomUUID(),
          name: fileName.replace(/\.csv$/i, ""),
          fileName,
          date: now,
          updatedAt: now,
          rowCount,
          csvText,
          folderId: null,
        };
      }

      update((prev) => {
        if (prev.dashboards.find((d) => d.fileName === fileName)) {
          return {
            ...prev,
            dashboards: prev.dashboards.map((d) =>
              d.fileName === fileName
                ? { ...entry, csvText, rowCount, updatedAt: now }
                : d
            ),
          };
        }
        return {
          ...prev,
          dashboards: [entry, ...prev.dashboards].slice(0, MAX_DASHBOARDS),
        };
      });

      return entry;
    },
    [update]
  );

  const removeDashboard = useCallback(
    (id: string) => {
      update((prev) => ({
        ...prev,
        dashboards: prev.dashboards.filter((d) => d.id !== id),
      }));
    },
    [update]
  );

  const renameDashboard = useCallback(
    (id: string, newName: string) => {
      update((prev) => ({
        ...prev,
        dashboards: prev.dashboards.map((d) =>
          d.id === id
            ? { ...d, name: newName, updatedAt: new Date().toISOString() }
            : d
        ),
      }));
    },
    [update]
  );

  const moveDashboard = useCallback(
    (id: string, folderId: string | null) => {
      update((prev) => ({
        ...prev,
        dashboards: prev.dashboards.map((d) =>
          d.id === id
            ? { ...d, folderId, updatedAt: new Date().toISOString() }
            : d
        ),
      }));
    },
    [update]
  );

  const getDashboard = useCallback(
    (id: string): DashboardEntry | undefined => {
      // Read from ref for synchronous, always-fresh access
      return storeRef.current.dashboards.find((d) => d.id === id);
    },
    []
  );

  // ── Folder CRUD ──

  const createFolder = useCallback(
    (name: string): DashboardFolder => {
      const folder: DashboardFolder = {
        id: crypto.randomUUID(),
        name,
        createdAt: new Date().toISOString(),
      };
      update((prev) => ({
        ...prev,
        folders: [...prev.folders, folder],
      }));
      return folder;
    },
    [update]
  );

  const renameFolder = useCallback(
    (id: string, newName: string) => {
      update((prev) => ({
        ...prev,
        folders: prev.folders.map((f) =>
          f.id === id ? { ...f, name: newName } : f
        ),
      }));
    },
    [update]
  );

  const removeFolder = useCallback(
    (id: string) => {
      update((prev) => ({
        ...prev,
        folders: prev.folders.filter((f) => f.id !== id),
        dashboards: prev.dashboards.map((d) =>
          d.folderId === id ? { ...d, folderId: null } : d
        ),
      }));
    },
    [update]
  );

  // ── Bulk ──

  const clearAll = useCallback(() => {
    const next = emptyStore();
    storeRef.current = next;
    setStore(next);
    saveToStorage(next);
  }, []);

  return {
    dashboards: store.dashboards,
    folders: store.folders,
    saveDashboard,
    removeDashboard,
    renameDashboard,
    moveDashboard,
    getDashboard,
    createFolder,
    renameFolder,
    removeFolder,
    clearAll,
  };
}
