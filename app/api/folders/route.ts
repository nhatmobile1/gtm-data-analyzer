import { getDb } from "@/db";
import { folders } from "@/db/schema";

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return Response.json({ error: "Database not configured" }, { status: 503 });
  }
  const db = getDb();
  const rows = await db.select().from(folders);
  return Response.json(rows);
}

export async function POST(req: Request) {
  if (!process.env.DATABASE_URL) {
    return Response.json({ error: "Database not configured" }, { status: 503 });
  }
  const db = getDb();
  const body = await req.json();
  const { name } = body;

  if (!name) {
    return Response.json({ error: "Name is required" }, { status: 400 });
  }

  const [row] = await db.insert(folders).values({ name }).returning();
  return Response.json(row, { status: 201 });
}
