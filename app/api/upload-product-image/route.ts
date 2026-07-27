import { NextResponse, type NextRequest } from "next/server";
import { deleteImage, listImageIds, putImage, read } from "@/lib/db";
import {
  EXT_BY_MIME,
  MAX_UPLOAD_BYTES,
  UPLOAD_LIMIT,
  imageIdFromUrl,
  imageUrl,
  isUploadedImage,
} from "@/lib/productImages";
import { isAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";

// An image uploaded but not yet attached to a saved product looks orphaned, so
// give the admin time to finish the form before collecting it.
const ORPHAN_GRACE_MS = 60 * 60 * 1000;

/** Upload ids are `p_<millis>_<random>`. */
function uploadedAt(id: string): number {
  const millis = Number(id.split("_")[1]);
  return Number.isFinite(millis) ? millis : 0;
}

// The quota counts images the catalog actually uses, not every blob ever
// stored — otherwise images left behind by deleted products would silently
// use up slots the admin can see are free.
async function inUseImages(): Promise<{ count: number; ids: Set<string> }> {
  const products = await read("products");
  const ids = new Set<string>();
  let count = 0;
  for (const p of products) {
    if (!isUploadedImage(p.img)) continue;
    count++;
    const id = imageIdFromUrl(p.img);
    if (id) ids.add(id);
  }
  return { count, ids };
}

async function collectOrphans(referenced: Set<string>): Promise<void> {
  const cutoff = Date.now() - ORPHAN_GRACE_MS;
  for (const id of await listImageIds()) {
    if (!referenced.has(id) && uploadedAt(id) < cutoff) {
      await deleteImage(id);
    }
  }
}

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

  if (!EXT_BY_MIME[file.type]) {
    return NextResponse.json({ error: "Unsupported image type" }, { status: 415 });
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "Image must be under 2 MB" }, { status: 413 });
  }

  // A replacement swaps out the product's previous upload, so it shouldn't be
  // charged against the quota — and the old image is dropped once the new one
  // is safely stored. Images from the legacy public/ era are replaceable too,
  // even though there's no stored blob to delete.
  const replaces = String(form.get("replaces") ?? "");
  const isReplacement = isUploadedImage(replaces);
  const replacesId = imageIdFromUrl(replaces);

  try {
    const inUse = await inUseImages();
    if (!isReplacement && inUse.count >= UPLOAD_LIMIT) {
      return NextResponse.json(
        { error: `Upload limit reached (${UPLOAD_LIMIT} images).` },
        { status: 409 },
      );
    }

    const id = `p_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const data = Buffer.from(await file.arrayBuffer()).toString("base64");
    await putImage(id, { mime: file.type, data });
    if (replacesId) await deleteImage(replacesId);

    // Best-effort cleanup; the upload itself has already succeeded.
    await collectOrphans(inUse.ids).catch((err) =>
      console.error("[upload-product-image] orphan cleanup failed", err),
    );

    return NextResponse.json({ url: imageUrl(id) });
  } catch (err) {
    console.error("[upload-product-image] storage failed", err);
    return NextResponse.json(
      { error: "Could not save the image to storage. Check the database configuration." },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    return NextResponse.json({ count: (await inUseImages()).count, limit: UPLOAD_LIMIT });
  } catch {
    return NextResponse.json({ error: "Storage unavailable" }, { status: 500 });
  }
}
