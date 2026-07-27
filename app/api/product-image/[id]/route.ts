import { NextResponse } from "next/server";
import { getImage } from "@/lib/db";
import { isValidImageId } from "@/lib/productImages";

// Public: uploaded product images are shown on the storefront, and next/image
// fetches this route to optimize them.
export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/product-image/[id]">,
) {
  const { id } = await ctx.params;
  if (!isValidImageId(id)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const image = await getImage(id);
  if (!image) {
    return new NextResponse("Not found", { status: 404 });
  }

  const bytes = new Uint8Array(Buffer.from(image.data, "base64"));
  return new NextResponse(bytes, {
    headers: {
      "Content-Type": image.mime,
      "Content-Length": String(bytes.byteLength),
      // Ids are unique per upload and never rewritten, so this is safe to pin.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
