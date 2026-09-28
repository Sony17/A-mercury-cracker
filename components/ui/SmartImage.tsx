"use client";

import NextImage, { type ImageProps } from "next/image";
import { useState } from "react";
import { IMAGE_FALLBACK, isOptimizableImage, toDirectImageUrl } from "@/lib/productImages";

/**
 * next/image, but tolerant of the arbitrary image URLs admins paste in.
 *
 * Any host that isn't in next.config's remotePatterns makes next/image throw
 * ("Invalid src prop ... hostname is not configured"), which takes the whole
 * page down. Since we can't know up front where a shop owner will link an
 * image from, those srcs are rendered straight from the source instead of
 * through /_next/image. Uploads and known hosts still get optimized.
 *
 * Cloud-drive share links are rewritten to the URL that serves the actual
 * image, so products saved with one before that conversion existed still show.
 *
 * A src that fails anyway — a supplier blocking hotlinks, a Drive file that was
 * never shared publicly — falls back to a placeholder instead of the browser's
 * broken-image glyph. The product is still listed and still sells; only the
 * photo is missing. `onError` needs a function prop, hence the client boundary.
 */
export default function SmartImage({ src, unoptimized, onError, alt, ...rest }: ImageProps) {
  const direct = typeof src === "string" ? toDirectImageUrl(src) : src;
  // Keyed by the src that failed, so a card reused for another product as the
  // grid filters gets a fresh attempt rather than inheriting the failure.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const shown = typeof direct === "string" && direct === failedSrc ? IMAGE_FALLBACK : direct;

  return (
    <NextImage
      src={shown}
      alt={alt}
      unoptimized={unoptimized ?? !isOptimizableImage(shown)}
      onError={(e) => {
        if (typeof direct === "string") setFailedSrc(direct);
        onError?.(e);
      }}
      {...rest}
    />
  );
}
