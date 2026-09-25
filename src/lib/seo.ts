import type { Metadata } from "next";

import { site } from "@/lib/site";

const shareImage = {
  url: "/images/night-ride.jpg",
  width: 1200,
  height: 675,
  alt: "موتوتک، تجهیزات خودرو و موتورسیکلت",
};

export function pageMeta({
  title,
  description,
  path,
  image = shareImage.url,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      locale: "fa_IR",
      type: "website",
      siteName: site.nameFa,
      images: [{ url: image, width: shareImage.width, height: shareImage.height, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export const categoryImages: Record<string, string> = {
  dashcam: "/images/dashcam-road.jpg",
  "helmet-gear": "/images/helmet-ride.jpg",
  "bluetooth-intercom": "/images/helmet-intercom.jpg",
  "camera-intercom": "/images/helmet-camera.jpg",
};

export function categoryImage(slug: string) {
  return categoryImages[slug] ?? "/images/night-ride.jpg";
}
