"use client";

import { useState } from "react";

import { ProductCover } from "@/components/product-cover";
import type { GalleryImage, Product } from "@/lib/types";

export function ProductGallery({ product, images }: { product: Product; images: GalleryImage[] }) {
  const [active, setActive] = useState(0);
  const current = images[active];

  return (
    <div className="space-y-3">
      <div className="aspect-square overflow-hidden border border-line bg-panel">
        {current ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={current.src} alt={current.alt || product.name} className="h-full w-full object-cover" />
        ) : (
          <ProductCover product={product} className="h-full" />
        )}
      </div>
      {images.length > 1 ? (
        <ul className="grid grid-cols-5 gap-2">
          {images.map((image, index) => (
            <li key={image.src}>
              <button
                type="button"
                onClick={() => setActive(index)}
                className={`aspect-square overflow-hidden border ${index === active ? "border-ink" : "border-line"}`}
                aria-label={`تصویر ${index + 1}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.src} alt="" className="h-full w-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
