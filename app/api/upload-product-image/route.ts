import { NextResponse, type NextRequest } from "next/server";
import { writeFile, readdir } from "node:fs/promises";
import path from "node:path";
import { isAdmin } from "@/lib/session";

const MAX_BYTES = 2 * 1024 * 1024;
const UPLOAD_LIMIT = 20;
const UPLOAD_DIR = path.join(process.cwd(), "public", "images", "product");
const PUBLIC_PREFIX = "/images/product";

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const form = await request.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const ext = EXT_BY_MIME[file.type];
  if (!ext) {
    return NextResponse.json({ error: "Unsupported image type" }, { status: 415 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image must be under 2 MB" }, { status: 413 });
  }

  const existing = await readdir(UPLOAD_DIR).catch(() => [] as string[]);
  if (existing.length >= UPLOAD_LIMIT) {
    return NextResponse.json(
      { error: `Upload limit reached (${UPLOAD_LIMIT} images).` },
      { status: 409 },
    );
  }

  const name = `p_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, name), buffer);

  return NextResponse.json({ url: `${PUBLIC_PREFIX}/${name}` });
}

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const existing = await readdir(UPLOAD_DIR).catch(() => [] as string[]);
  return NextResponse.json({ count: existing.length, limit: UPLOAD_LIMIT });
}
