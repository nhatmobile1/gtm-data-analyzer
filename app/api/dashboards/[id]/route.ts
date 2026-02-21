import { getDb } from "@/db";
import { dashboards } from "@/db/schema";
import { eq } from "drizzle-orm";

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

  const [row] = await db.update(dashboards)
    .set(updateData)
    .where(eq(dashboards.id, id))
    .returning();

  if (!row) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(row);
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
