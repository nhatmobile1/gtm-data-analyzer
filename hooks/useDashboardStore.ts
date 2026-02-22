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
  const [notifications, setNotifications] = useState<string[]>([]);
  // Ref mirrors state for synchronous reads (avoids stale closures)
  const storeRef = useRef<DashboardStore>(emptyStore());
  // Tracks whether server is available for persistence
  const serverSyncRef = useRef(false);

  // Hydrate: try server first, fall back to localStorage
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const [dashRes, folderRes] = await Promise.all([
          fetch("/api/dashboards"),
          fetch("/api/folders"),
        ]);

        if (!cancelled && dashRes.ok && folderRes.ok) {
          const serverDashboards: DashboardEntry[] = await dashRes.json();
          const serverFolders: DashboardFolder[] = await folderRes.json();
          const loaded: DashboardStore = {
            version: 2,
            dashboards: serverDashboards,
            folders: serverFolders,
          };
          storeRef.current = loaded;
          setStore(loaded);
          saveToStorage(loaded);
          serverSyncRef.current = true;
          return;
        }
      } catch {
        // Server unavailable — fall through to localStorage
      }

      // Fallback to localStorage
      if (!cancelled) {
        const loaded = loadFromStorage();
        storeRef.current = loaded;
        setStore(loaded);
      }
    }

    init();
    return () => { cancelled = true; };
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

  // ── Server sync helpers (fire-and-forget) ──

  const serverPost = useCallback(
    (url: string, body: unknown) => {
      if (!serverSyncRef.current) return;
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).catch(() => {});
    },
    []
  );

  const serverPut = useCallback(
    (url: string, body: unknown) => {
      if (!serverSyncRef.current) return;
      fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).catch(() => {});
    },
    []
  );

  const serverDelete = useCallback(
    (url: string) => {
      if (!serverSyncRef.current) return;
      fetch(url, { method: "DELETE" }).catch(() => {});
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
        // Update existing on server
        serverPut(`/api/dashboards/${existing.id}`, { csvText, rowCount });
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
        // Create new on server (send client-generated ID)
        serverPost("/api/dashboards", {
          id: entry.id,
          name: entry.name,
          fileName: entry.fileName,
          csvText,
          columns: {},
          rowCount,
          folderId: null,
        });
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
        if (prev.dashboards.length >= MAX_DASHBOARDS) {
          setNotifications(n => [...n, "Maximum dashboard limit reached. Oldest dashboard was replaced."]);
        }
        return {
          ...prev,
          dashboards: [entry, ...prev.dashboards].slice(0, MAX_DASHBOARDS),
        };
      });

      return entry;
    },
    [update, serverPost, serverPut]
  );

  const removeDashboard = useCallback(
    (id: string) => {
      serverDelete(`/api/dashboards/${id}`);
      update((prev) => ({
        ...prev,
        dashboards: prev.dashboards.filter((d) => d.id !== id),
      }));
    },
    [update, serverDelete]
  );

  const renameDashboard = useCallback(
    (id: string, newName: string) => {
      serverPut(`/api/dashboards/${id}`, { name: newName });
      update((prev) => ({
        ...prev,
        dashboards: prev.dashboards.map((d) =>
          d.id === id
            ? { ...d, name: newName, updatedAt: new Date().toISOString() }
            : d
        ),
      }));
    },
    [update, serverPut]
  );

  const moveDashboard = useCallback(
    (id: string, folderId: string | null) => {
      serverPut(`/api/dashboards/${id}`, { folderId });
      update((prev) => ({
        ...prev,
        dashboards: prev.dashboards.map((d) =>
          d.id === id
            ? { ...d, folderId, updatedAt: new Date().toISOString() }
            : d
        ),
      }));
    },
    [update, serverPut]
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
      serverPost("/api/folders", { id: folder.id, name: folder.name });
      update((prev) => ({
        ...prev,
        folders: [...prev.folders, folder],
      }));
      return folder;
    },
    [update, serverPost]
  );

  const renameFolder = useCallback(
    (id: string, newName: string) => {
      serverPut(`/api/folders/${id}`, { name: newName });
      update((prev) => ({
        ...prev,
        folders: prev.folders.map((f) =>
          f.id === id ? { ...f, name: newName } : f
        ),
      }));
    },
    [update, serverPut]
  );

  const removeFolder = useCallback(
    (id: string) => {
      serverDelete(`/api/folders/${id}`);
      update((prev) => ({
        ...prev,
        folders: prev.folders.filter((f) => f.id !== id),
        dashboards: prev.dashboards.map((d) =>
          d.folderId === id ? { ...d, folderId: null } : d
        ),
      }));
    },
    [update, serverDelete]
  );

  const clearNotification = useCallback((index: number) => {
    setNotifications(n => n.filter((_, i) => i !== index));
  }, []);

  // ── Bulk ──

  const clearAll = useCallback(() => {
    // Delete all from server
    if (serverSyncRef.current) {
      const current = storeRef.current;
      for (const d of current.dashboards) {
        fetch(`/api/dashboards/${d.id}`, { method: "DELETE" }).catch(() => {});
      }
      for (const f of current.folders) {
        fetch(`/api/folders/${f.id}`, { method: "DELETE" }).catch(() => {});
      }
    }
    const next = emptyStore();
    storeRef.current = next;
    setStore(next);
    saveToStorage(next);
  }, []);

  // ── Server migration ──

  const migrateToServer = useCallback(async () => {
    const current = storeRef.current;
    if (current.dashboards.length === 0 && current.folders.length === 0) return false;

    try {
      // Upload folders first (send client IDs to preserve relationships)
      for (const folder of current.folders) {
        await fetch("/api/folders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: folder.id, name: folder.name }),
        });
      }

      // Upload dashboards
      for (const dashboard of current.dashboards) {
        await fetch("/api/dashboards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: dashboard.id,
            name: dashboard.name,
            fileName: dashboard.fileName,
            csvText: dashboard.csvText,
            columns: {},
            rowCount: dashboard.rowCount,
            folderId: dashboard.folderId,
          }),
        });
      }

      serverSyncRef.current = true;
      return true;
    } catch {
      return false;
    }
  }, []);

  // ── Import ──

  const importData = useCallback(
    (data: { dashboards: DashboardEntry[]; folders: DashboardFolder[] }) => {
      // Sync new items to server
      if (serverSyncRef.current) {
        const existingIds = new Set(storeRef.current.dashboards.map((d) => d.id));
        const existingFolderIds = new Set(storeRef.current.folders.map((f) => f.id));

        for (const f of data.folders) {
          if (!existingFolderIds.has(f.id)) {
            fetch("/api/folders", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id: f.id, name: f.name }),
            }).catch(() => {});
          }
        }

        for (const d of data.dashboards) {
          if (!existingIds.has(d.id)) {
            fetch("/api/dashboards", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: d.id,
                name: d.name,
                fileName: d.fileName,
                csvText: d.csvText,
                columns: {},
                rowCount: d.rowCount,
                folderId: d.folderId,
              }),
            }).catch(() => {});
          }
        }
      }

      update((prev) => {
        const existingIds = new Set(prev.dashboards.map((d) => d.id));
        const newDashboards = data.dashboards.filter((d) => !existingIds.has(d.id));
        const existingFolderIds = new Set(prev.folders.map((f) => f.id));
        const newFolders = data.folders.filter((f) => !existingFolderIds.has(f.id));

        return {
          ...prev,
          dashboards: [...newDashboards, ...prev.dashboards].slice(0, MAX_DASHBOARDS),
          folders: [...prev.folders, ...newFolders],
        };
      });
    },
    [update]
  );

  return {
    dashboards: store.dashboards,
    folders: store.folders,
    notifications,
    saveDashboard,
    removeDashboard,
    renameDashboard,
    moveDashboard,
    getDashboard,
    createFolder,
    renameFolder,
    removeFolder,
    clearAll,
    clearNotification,
    migrateToServer,
    importData,
  };
}
