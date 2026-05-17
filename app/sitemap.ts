import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { CATEGORIES, BRANDS } from "@/lib/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticUrls: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE_URL}/products`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/b2b`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/account`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const categoryUrls: MetadataRoute.Sitemap = CATEGORIES.filter(
    (c) => c !== "All"
  ).map((cat) => ({
    url: `${SITE_URL}/products?cat=${encodeURIComponent(cat)}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const brandUrls: MetadataRoute.Sitemap = BRANDS.map((brand) => ({
    url: `${SITE_URL}/products?brand=${encodeURIComponent(brand)}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticUrls, ...categoryUrls, ...brandUrls];
}
