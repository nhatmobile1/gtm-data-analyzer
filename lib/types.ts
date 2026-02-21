export interface DetectedColumns {
  id: string | null;
  contactId: string | null;
  channel: string | null;
  campaign: string | null;
  meetingBooked: string | null;
  oppId: string | null;
  pipeline: string | null;
  closedWon: string | null;
  oppStage: string | null;
  interactionStatus: string | null;
  dimensions: string[];
}

export interface FunnelRow {
  name: string;
  touches: number;
  meetings: number;
  opps: number;
  pipeline: number;
  closedWon: number;
  wonCount: number;
  closedLost: number;
  mtgRate: number;
  mtgToOpp: number;
  pipelinePerTouch: number;
  pipelinePerMeeting: number;
  winRate: number;
  avgDeal: number;
  pipelineShare: number;
  touchShare: number;
}

export interface DropOffBreakdown {
  label: string;
  data: Record<string, number>;
  total: number;
}

export interface DropOffResult {
  attended: number;
  noMeeting: number;
  breakdowns: DropOffBreakdown[];
}

export interface VarianceResult {
  ratio: number;
  signal: "strong" | "moderate" | "low";
}

export interface Totals {
  touches: number;
  meetings: number;
  opps: number;
  pipeline: number;
  closedWon: number;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export type CsvRow = Record<string, string>;

// ── Dashboard & Folder types ──

export interface DashboardEntry {
  id: string;
  name: string;
  fileName: string;
  date: string;
  updatedAt: string;
  rowCount: number;
  csvText: string;
  folderId: string | null;
}

export interface DashboardFolder {
  id: string;
  name: string;
  createdAt: string;
}

export interface DashboardStore {
  version: 2;
  dashboards: DashboardEntry[];
  folders: DashboardFolder[];
}
