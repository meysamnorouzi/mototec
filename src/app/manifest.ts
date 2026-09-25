import type { MetadataRoute } from "next";

import { site } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.nameFa} | ${site.nameEn}`,
    short_name: site.nameFa,
    description: site.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f3f3f1",
    theme_color: "#141414",
    lang: "fa",
    dir: "rtl",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
