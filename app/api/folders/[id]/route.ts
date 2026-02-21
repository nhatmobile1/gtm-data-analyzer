import { getDb } from "@/db";
import { folders, dashboards } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!process.env.DATABASE_URL) {
    return Response.json({ error: "Database not configured" }, { status: 503 });
  }
  const db = getDb();
  const { id } = await params;
  const body = await req.json();

  if (!body.name) {
    return Response.json({ error: "Name is required" }, { status: 400 });
  }

  const [row] = await db.update(folders)
    .set({ name: body.name })
    .where(eq(folders.id, id))
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

  // Unlink dashboards from this folder first
  await db.update(dashboards)
    .set({ folderId: null })
    .where(eq(dashboards.folderId, id));

  const [row] = await db.delete(folders).where(eq(folders.id, id)).returning();
  if (!row) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ success: true });
}
