import { NextResponse, type NextRequest } from "next/server";
import { putImage, read } from "@/lib/db";
import {
  EXT_BY_MIME,
  MAX_UPLOAD_BYTES,
  SCOPE_PREFIX,
  UPLOAD_LIMIT,
  imageUrl,
  isUploadScope,
  isUploadedImage,
} from "@/lib/productImages";
import { isAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";

// Nothing in this route deletes a stored image.
//
// It used to sweep for "orphans" — blobs no saved product or company document
// pointed at — and delete them on every upload. That read the *server's* copy of
// the catalogue, but product saves are debounced and fire-and-forget, so a save
// still in flight (or one that never landed) made a live photo look unreferenced
// and it was deleted for good. The result was a product row pointing at an id
// that 404s: the broken tile on the storefront. Unused blobs are cheap; a
// customer-facing photo that cannot be recovered is not.

// The quota counts images the catalog actually uses, not every blob ever
// stored — otherwise images left behind by deleted products would silently
// use up slots the admin can see are free. Company images share the store but
// are deliberately not counted here; their editors cap themselves.
async function productImagesInUse(): Promise<number> {
  const products = await read("products");
  return products.filter((p) => isUploadedImage(p.img)).length;
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

  // Brand logos and category tiles used to be inlined as base64 on the company
  // document, which grew it past the request body limit and made every save
  // fail. They go through this route now instead.
  const rawScope = form.get("scope");
  const scope = isUploadScope(rawScope) ? rawScope : "product";

  // A replacement swaps out the caller's previous upload, so it shouldn't be
  // charged against the quota. The old blob is kept rather than deleted — the
  // quota counts photos the catalogue is using, not blobs in the store, so
  // keeping it costs no slot, and it means a mis-click during a re-upload can
  // still be undone by pointing the product back at the old id.
  const replaces = String(form.get("replaces") ?? "");
  const isReplacement = isUploadedImage(replaces);

  try {
    if (scope === "product" && !isReplacement && (await productImagesInUse()) >= UPLOAD_LIMIT) {
      return NextResponse.json(
        { error: `Upload limit reached (${UPLOAD_LIMIT} images).` },
        { status: 409 },
      );
    }

    const id = `${SCOPE_PREFIX[scope]}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const data = Buffer.from(await file.arrayBuffer()).toString("base64");
    await putImage(id, { mime: file.type, data });

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
    return NextResponse.json({ count: await productImagesInUse(), limit: UPLOAD_LIMIT });
  } catch {
    return NextResponse.json({ error: "Storage unavailable" }, { status: 500 });
  }
}
