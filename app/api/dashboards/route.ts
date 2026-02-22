import { getDb } from "@/db";
import { dashboards } from "@/db/schema";
import { desc } from "drizzle-orm";

function toClient(row: typeof dashboards.$inferSelect) {
  return {
    id: row.id,
    name: row.name,
    fileName: row.fileName,
    date: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
    updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : String(row.updatedAt),
    rowCount: row.rowCount,
    csvText: row.csvText,
    folderId: row.folderId,
  };
}

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return Response.json({ error: "Database not configured" }, { status: 503 });
  }
  const db = getDb();
  const rows = await db.select().from(dashboards).orderBy(desc(dashboards.updatedAt));
  return Response.json(rows.map(toClient));
}

export async function POST(req: Request) {
  if (!process.env.DATABASE_URL) {
    return Response.json({ error: "Database not configured" }, { status: 503 });
  }
  const db = getDb();
  const body = await req.json();
  const { id, name, fileName, csvText, columns, rowCount, folderId } = body;

  if (!name || !fileName || !csvText) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const [row] = await db.insert(dashboards).values({
    ...(id ? { id } : {}),
    name,
    fileName,
    csvText,
    columns: columns || {},
    rowCount: rowCount || 0,
    folderId: folderId || null,
  }).returning();

  return Response.json(toClient(row), { status: 201 });
}
