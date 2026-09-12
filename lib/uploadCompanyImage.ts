"use client";

import { EXT_BY_MIME, MAX_UPLOAD_BYTES } from "./productImages";

/**
 * Store an admin-picked image for the company document and return the URL to
 * save on it.
 *
 * Brand logos and category tiles were previously read with FileReader and
 * saved as `data:` URIs. Every one of them landed inside the
 * single `company` document, which is rewritten in full on each save — a few
 * logos in, the PUT body outgrew the 4.5 MB request limit and saving anything
 * on the settings screens started failing with "Failed to save company".
 * Uploading to the shared image store keeps the document to short URLs.
 */
export async function uploadCompanyImage(
  file: File,
  replaces?: string,
): Promise<{ url: string } | { error: string }> {
  if (!EXT_BY_MIME[file.type]) {
    return { error: "Use a JPG, PNG, WebP, GIF or AVIF image" };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { error: "Image must be under 2 MB" };
  }

  const body = new FormData();
  body.append("file", file, file.name);
  body.append("scope", "company");
  if (replaces) body.append("replaces", replaces);

  try {
    const res = await fetch("/api/upload-product-image", { method: "POST", body });
    const data = (await res.json().catch(() => null)) as
      | { url?: string; error?: string }
      | null;
    if (!res.ok || !data?.url) {
      return { error: data?.error ?? `Upload failed (${res.status})` };
    }
    return { url: data.url };
  } catch {
    return { error: "Upload failed — could not reach the server" };
  }
}
