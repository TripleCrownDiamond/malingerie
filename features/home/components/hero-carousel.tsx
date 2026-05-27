"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { heroSlides } from "@/features/home/data/luxury-content";

const SLIDE_DURATION = 6500;

export function HeroCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const max = heroSlides.length;

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % max);
    }, SLIDE_DURATION);

    return () => clearInterval(timer);
  }, [max]);

  const activeSlide = useMemo(() => heroSlides[activeIndex], [activeIndex]);

  return (
    <section className="relative h-[92vh] overflow-hidden">
      <div className="h-full w-full">
        {heroSlides.map((slide, index) => (
          <article
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === activeIndex ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              priority={index === 0}
              loading={index === 0 ? "eager" : "lazy"}
              className="object-cover"
              sizes="100vw"
            />

            <div className="absolute inset-0 bg-black/28" />
            <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(11,9,10,0.86)_0%,rgba(11,9,10,0.72)_30%,rgba(11,9,10,0.42)_54%,rgba(11,9,10,0.12)_74%,rgba(11,9,10,0)_100%)]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/18 to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(239,161,185,0.30)_0%,rgba(239,161,185,0.10)_28%,transparent_62%)]" />

            <div className="pointer-events-none absolute -left-20 top-[14%] h-72 w-72 rounded-full bg-[var(--accent)]/22 blur-3xl" />
            <div className="pointer-events-none absolute -right-16 bottom-[12%] h-64 w-64 rounded-full bg-white/16 blur-3xl" />
            <div className="pointer-events-none absolute right-[9%] top-[16%] h-40 w-40 rounded-full border border-white/25" />
            <div className="pointer-events-none absolute right-[13%] top-[21%] h-20 w-20 rounded-full border border-white/20" />

            <div className="absolute inset-0 flex items-center px-6 sm:px-12 lg:px-24">
              <div className="max-w-3xl px-2 text-white sm:px-0">
                <span className="mb-6 block text-xs font-bold uppercase tracking-[0.4em] text-[var(--accent)]">{slide.eyebrow}</span>
                <h1 className="font-display text-5xl leading-[1.02] sm:text-7xl lg:text-8xl">
                  {slide.title}
                  {slide.highlight ? <span className="mt-2 block italic font-normal text-rose-100">{slide.highlight}</span> : null}
                </h1>
                <div className="mt-7 h-px w-24 bg-[linear-gradient(90deg,var(--accent),transparent)]" />
                <Link
                  href={slide.ctaHref}
                  className={`mt-8 inline-block px-10 py-5 text-[11px] font-bold uppercase tracking-[0.3em] transition ${
                    slide.theme === "light"
                      ? "bg-white text-black hover:bg-rose-50"
                      : "bg-[var(--accent)] text-white hover:bg-[var(--accent-strong)]"
                  }`}
                >
                  {slide.ctaLabel}
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-3">
        {heroSlides.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={`h-1 rounded-full transition-all ${index === activeIndex ? "w-14 bg-white" : "w-10 bg-white/45"}`}
            aria-label={`Aller au slide ${index + 1}`}
          />
        ))}
      </div>

      <div className="absolute right-6 top-1/2 z-20 hidden -translate-y-1/2 flex-col gap-2 lg:flex">
        {heroSlides.map((slide, index) => (
          <button
            key={`${slide.id}-dot`}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={`h-2 w-2 rounded-full transition ${index === activeIndex ? "bg-[var(--accent)]" : "bg-white/60"}`}
            aria-label={`Selectionner ${slide.title}`}
          />
        ))}
      </div>

      <div className="absolute bottom-8 left-6 z-20 text-[10px] uppercase tracking-[0.28em] text-white/80 sm:left-12">
        {activeIndex + 1} / {heroSlides.length} - {activeSlide.eyebrow}
      </div>
    </section>
  );
}

