import { getDb } from "@/db";
import { dashboards } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return Response.json({ error: "Database not configured" }, { status: 503 });
  }
  const db = getDb();
  const rows = await db.select().from(dashboards).orderBy(desc(dashboards.updatedAt));
  return Response.json(rows);
}

export async function POST(req: Request) {
  if (!process.env.DATABASE_URL) {
    return Response.json({ error: "Database not configured" }, { status: 503 });
  }
  const db = getDb();
  const body = await req.json();
  const { name, fileName, csvText, columns, rowCount, folderId } = body;

  if (!name || !fileName || !csvText) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const [row] = await db.insert(dashboards).values({
    name,
    fileName,
    csvText,
    columns: columns || {},
    rowCount: rowCount || 0,
    folderId: folderId || null,
  }).returning();

  return Response.json(row, { status: 201 });
}
