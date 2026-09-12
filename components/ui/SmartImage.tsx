import NextImage, { type ImageProps } from "next/image";
import { isOptimizableImage, toDirectImageUrl } from "@/lib/productImages";

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
 */
export default function SmartImage({ src, unoptimized, ...rest }: ImageProps) {
  const direct = typeof src === "string" ? toDirectImageUrl(src) : src;
  return <NextImage src={direct} unoptimized={unoptimized ?? !isOptimizableImage(direct)} {...rest} />;
}
