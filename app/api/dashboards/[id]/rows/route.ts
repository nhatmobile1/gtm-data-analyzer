import { getDb } from "@/db";
import { dashboardRows } from "@/db/schema";
import { eq } from "drizzle-orm";

const BATCH_SIZE = 500;

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!process.env.DATABASE_URL) {
    return Response.json({ error: "Database not configured" }, { status: 503 });
  }
  const db = getDb();
  const { id } = await params;
  const body = await req.json();
  const rows: Record<string, string>[] = body.rows;

  if (!Array.isArray(rows) || rows.length === 0) {
    return Response.json({ error: "No rows provided" }, { status: 400 });
  }

  // Delete existing rows for this dashboard (re-upload case)
  await db.delete(dashboardRows).where(eq(dashboardRows.dashboardId, id));

  // Insert in batches to avoid exceeding Postgres parameter limits
  let inserted = 0;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE).map((data, idx) => ({
      dashboardId: id,
      rowNum: i + idx + 1,
      data,
    }));
    await db.insert(dashboardRows).values(batch);
    inserted += batch.length;
  }

  return Response.json({ inserted }, { status: 201 });
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!process.env.DATABASE_URL) {
    return Response.json({ error: "Database not configured" }, { status: 503 });
  }
  const db = getDb();
  const { id } = await params;
  const rows = await db.select().from(dashboardRows).where(eq(dashboardRows.dashboardId, id));
  return Response.json(rows);
}
