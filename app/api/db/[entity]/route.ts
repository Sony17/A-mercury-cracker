import { NextResponse, type NextRequest } from "next/server";
import { isEntity, isListEntity, read, write, type EntityKey } from "@/lib/db";

export const dynamic = "force-dynamic";

async function resolveEntity(
  ctx: RouteContext<"/api/db/[entity]">,
): Promise<EntityKey | null> {
  const { entity } = await ctx.params;
  return isEntity(entity) ? entity : null;
}

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/db/[entity]">,
) {
  const entity = await resolveEntity(ctx);
  if (!entity) {
    return NextResponse.json({ error: "Unknown entity" }, { status: 404 });
  }
  const data = await read(entity);
  return NextResponse.json(data);
}

export async function PUT(
  req: NextRequest,
  ctx: RouteContext<"/api/db/[entity]">,
) {
  const entity = await resolveEntity(ctx);
  if (!entity) {
    return NextResponse.json({ error: "Unknown entity" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (isListEntity(entity)) {
    if (!Array.isArray(body)) {
      return NextResponse.json(
        { error: "Expected an array" },
        { status: 400 },
      );
    }
    // Type-cast: validation of inner shape is left to the client + TS.
    await write(entity, body as never);
  } else {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Expected an object" },
        { status: 400 },
      );
    }
    await write(entity, body as never);
  }

  return NextResponse.json({ ok: true });
}
