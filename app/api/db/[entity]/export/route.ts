import { NextResponse, type NextRequest } from "next/server";
import { isEntity, read } from "@/lib/db";
import { objectToCSV, toCSV } from "@/lib/csv";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/db/[entity]/export">,
) {
  const { entity } = await ctx.params;
  if (!isEntity(entity)) {
    return NextResponse.json({ error: "Unknown entity" }, { status: 404 });
  }
  const data = await read(entity);
  const csv = Array.isArray(data)
    ? toCSV(data as unknown as Array<Record<string, unknown>>)
    : objectToCSV(data as unknown as Record<string, unknown>);

  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${entity}-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
