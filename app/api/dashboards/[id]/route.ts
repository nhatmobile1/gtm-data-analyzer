import { getDb } from "@/db";
import { dashboards } from "@/db/schema";
import { eq } from "drizzle-orm";

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

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!process.env.DATABASE_URL) {
    return Response.json({ error: "Database not configured" }, { status: 503 });
  }
  const db = getDb();
  const { id } = await params;
  const body = await req.json();

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (body.name !== undefined) updateData.name = body.name;
  if (body.folderId !== undefined) updateData.folderId = body.folderId;
  if (body.columns !== undefined) updateData.columns = body.columns;
  if (body.csvText !== undefined) updateData.csvText = body.csvText;
  if (body.rowCount !== undefined) updateData.rowCount = body.rowCount;

  const [row] = await db.update(dashboards)
    .set(updateData)
    .where(eq(dashboards.id, id))
    .returning();

  if (!row) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(toClient(row));
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!process.env.DATABASE_URL) {
    return Response.json({ error: "Database not configured" }, { status: 503 });
  }
  const db = getDb();
  const { id } = await params;
  const [row] = await db.delete(dashboards).where(eq(dashboards.id, id)).returning();

  if (!row) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ success: true });
}
