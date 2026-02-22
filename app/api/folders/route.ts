import { getDb } from "@/db";
import { folders } from "@/db/schema";

function toClient(row: typeof folders.$inferSelect) {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
  };
}

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return Response.json({ error: "Database not configured" }, { status: 503 });
  }
  const db = getDb();
  const rows = await db.select().from(folders);
  return Response.json(rows.map(toClient));
}

export async function POST(req: Request) {
  if (!process.env.DATABASE_URL) {
    return Response.json({ error: "Database not configured" }, { status: 503 });
  }
  const db = getDb();
  const body = await req.json();
  const { id, name } = body;

  if (!name) {
    return Response.json({ error: "Name is required" }, { status: 400 });
  }

  const [row] = await db.insert(folders).values({
    ...(id ? { id } : {}),
    name,
  }).returning();
  return Response.json(toClient(row), { status: 201 });
}
