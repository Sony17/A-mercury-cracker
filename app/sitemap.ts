import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { BRANDS } from "@/lib/data";
import { read } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticUrls: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE_URL}/products`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/b2b`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/account`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const company = await read("company");
  const categoryNames = (company.categories ?? []).map((c) => c.n);

  const categoryUrls: MetadataRoute.Sitemap = categoryNames.map((cat) => ({
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
