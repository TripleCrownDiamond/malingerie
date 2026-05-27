"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type ProductMediaGalleryProps = {
  name: string;
  images: string[];
};

export function ProductMediaGallery({ name, images }: ProductMediaGalleryProps) {
  const media = useMemo(() => images.filter(Boolean), [images]);
  const [activeIndex, setActiveIndex] = useState(0);

  if (media.length === 0) {
    return null;
  }

  const safeIndex = activeIndex >= media.length ? 0 : activeIndex;
  const activeImage = media[safeIndex];

  return (
    <div className="space-y-4">
      <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-[var(--line)] bg-white">
        <Image
          key={activeImage}
          src={activeImage}
          alt={name}
          fill
          className="object-cover"
          sizes="(min-width: 1024px) 50vw, 100vw"
          priority
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {media.map((asset, index) => {
          const isActive = index === safeIndex;

          return (
            <button
              key={`${asset}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Afficher image ${index + 1} de ${name}`}
              aria-pressed={isActive}
              className={`relative aspect-[4/5] overflow-hidden rounded-2xl border bg-white transition ${
                isActive
                  ? "border-[var(--accent)] shadow-[0_8px_22px_rgba(230,46,116,0.24)]"
                  : "border-[var(--line)] hover:border-[var(--accent)]"
              }`}
            >
              <Image src={asset} alt={`${name} visuel ${index + 1}`} fill className="object-cover" sizes="25vw" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
