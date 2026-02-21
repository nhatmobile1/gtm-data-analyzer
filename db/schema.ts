import { pgTable, text, timestamp, jsonb, integer } from "drizzle-orm/pg-core";

export const folders = pgTable("folders", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const dashboards = pgTable("dashboards", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  fileName: text("file_name").notNull(),
  csvText: text("csv_text").notNull(),
  columns: jsonb("columns").notNull(),
  rowCount: integer("row_count").notNull().default(0),
  folderId: text("folder_id").references(() => folders.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const aiConversations = pgTable("ai_conversations", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  dashboardId: text("dashboard_id").references(() => dashboards.id, { onDelete: "cascade" }).notNull(),
  messages: jsonb("messages").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
