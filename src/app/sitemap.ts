import type { MetadataRoute } from "next";

import { site } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const page = (path: string) => `${site.url.replace(/\/$/, "")}${path === "/" ? "/" : `${path}/`}`;

  return [
    { url: page("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: page("/shop"), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: page("/blog"), lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: page("/about"), lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: page("/contact"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];
}
