import { NextResponse, type NextRequest } from "next/server";
import { read } from "@/lib/db";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

// A customer's own order history, scoped to their session email so they can
// never read other customers' orders.
export async function GET(req: NextRequest) {
  const session = getSession(req);
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const email = session.email.toLowerCase();
  const orders = await read("orders");
  return NextResponse.json(
    orders.filter((o) => o?.customer?.email?.toLowerCase() === email),
  );
}
