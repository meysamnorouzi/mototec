"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

import { site } from "@/lib/site";

const DURATION = 7000;
const FADE_MS = 1450;

const slides = [
  {
    src: "/images/night-ride.jpg",
    alt: "موتورسیکلت در جاده ساحلی هنگام غروب",
    label: "مسیر شب",
    line: "تجهیزات هوشمند، اکسسوری و لوازم کاربردی خودرو و موتورسیکلت",
    href: "/shop",
    cta: "مشاهده محصولات",
    position: "object-[20%_center] lg:object-center",
  },
  {
    src: "/images/dashcam-road.jpg",
    alt: "دوربین ثبت وقایع رو به جاده کوهستانی",
    label: "ثبت وقایع",
    line: "دوربین خودرو برای جاده‌های طولانی؛ تصویر روشن، حتی بدون اینترنت",
    href: "/shop/dashcam",
    cta: "دوربین ثبت وقایع",
    position: "object-center",
  },
  {
    src: "/images/helmet-ride.jpg",
    alt: "موتورسوار با کلاه مجهز به اینترکام",
    label: "اینترکام",
    line: "بلوتوث و اینترکام کلاه، برای گفت‌وگو و مسیریابی در حرکت",
    href: "/shop/helmet-bluetooth",
    cta: "تجهیزات کلاه",
    position: "object-[80%_center] lg:object-center",
  },
] as const;

function subscribeReducedMotion(onStoreChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function getReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function HeroSlider() {
  const reduced = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, () => false);
  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState<number | null>(null);
  const [shownIndex, setShownIndex] = useState(index);
  if (shownIndex !== index) {
    setShownIndex(index);
    setLeaving(shownIndex);
  }
  const [paused, setPaused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const elapsedRef = useRef(0);
  const startedRef = useRef<number | null>(null);
  const timerIndexRef = useRef(0);
  const touchRef = useRef<{ x: number; y: number } | null>(null);

  const go = useCallback((next: number) => {
    const normalized = ((next % slides.length) + slides.length) % slides.length;
    setIndex((current) => (normalized === current ? current : normalized));
  }, []);

  useEffect(() => {
    if (leaving == null) return;
    const timeout = window.setTimeout(() => setLeaving(null), FADE_MS + 80);
    return () => window.clearTimeout(timeout);
  }, [leaving]);

  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    if (timerIndexRef.current !== index) {
      elapsedRef.current = 0;
      startedRef.current = null;
      timerIndexRef.current = index;
    }

    if (reduced || paused || hidden) {
      if (startedRef.current != null) {
        elapsedRef.current += performance.now() - startedRef.current;
        startedRef.current = null;
      }
      return;
    }

    const remaining = Math.max(0, DURATION - elapsedRef.current);
    startedRef.current = performance.now();
    const timeout = window.setTimeout(() => {
      elapsedRef.current = 0;
      startedRef.current = null;
      setIndex((current) => (current + 1) % slides.length);
    }, remaining);

    return () => {
      window.clearTimeout(timeout);
      if (startedRef.current != null) {
        elapsedRef.current += performance.now() - startedRef.current;
        startedRef.current = null;
      }
    };
  }, [hidden, index, paused, reduced]);

  const slide = slides[index];

  return (
    <section
      className="relative isolate min-h-[100svh] overflow-hidden bg-ink text-white"
      aria-roledescription="carousel"
      aria-label="معرفی موتوتک"
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          go(index + 1);
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          go(index - 1);
        }
      }}
      onTouchStart={(event) => {
        const touch = event.touches[0];
        if (!touch) return;
        touchRef.current = { x: touch.clientX, y: touch.clientY };
      }}
      onTouchEnd={(event) => {
        const start = touchRef.current;
        touchRef.current = null;
        const touch = event.changedTouches[0];
        if (!start || !touch) return;
        const dx = touch.clientX - start.x;
        const dy = touch.clientY - start.y;
        if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy)) return;
        go(index + (dx < 0 ? 1 : -1));
      }}
    >
      {slides.map((item, itemIndex) => {
        const active = itemIndex === index;
        const outgoing = itemIndex === leaving;
        return (
          <div
            key={item.src}
            className={`hero-slide absolute inset-0 ${active ? "is-active" : outgoing ? "is-leaving" : ""}`}
            aria-hidden={!active}
          >
            <Image
              src={item.src}
              alt={active ? item.alt : ""}
              fill
              sizes="100vw"
              quality={85}
              {...(itemIndex === 0 ? { preload: true } : { loading: "eager" as const })}
              className={`drift object-cover ${item.position}`}
            />
          </div>
        );
      })}

      <div className="pointer-events-none absolute inset-0 z-[3] bg-gradient-to-t from-ink via-ink/50 to-ink/15" />

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-5 pb-28 pt-24 md:pb-16">
        <p className="rise flex items-center gap-3 text-xs tracking-[0.38em] text-white/70">
          <span>{site.nameEn.toUpperCase()}</span>
          <span className="h-px w-6 bg-white/40" aria-hidden />
          <span key={slide.label} className="hero-fade-in tracking-[0.28em]">
            {slide.label}
          </span>
        </p>
        <h1
          className="rise mt-4 max-w-3xl text-4xl font-extrabold leading-[1.2] sm:text-5xl md:text-7xl"
          style={{ animationDelay: "90ms" }}
        >
          {site.headline}
        </h1>
        <p
          key={slide.line}
          className="hero-fade-in mt-5 min-h-16 max-w-xl text-sm leading-8 text-white/80 sm:text-base"
        >
          {slide.line}
        </p>
        <div className="rise mt-8 flex flex-col gap-3 sm:flex-row" style={{ animationDelay: "220ms" }}>
          <Link
            key={slide.href}
            href={slide.href}
            className="hero-fade-in min-w-48 whitespace-nowrap rounded-full bg-white px-6 py-3 text-center text-sm text-ink transition active:scale-95"
          >
            {slide.cta}
          </Link>
          <a
            href={`tel:${site.phoneTel}`}
            className="rounded-full border border-white/40 px-6 py-3 text-center text-sm backdrop-blur-md transition active:bg-white/10"
          >
            مشاوره · {site.phoneDisplay}
          </a>
        </div>

        <div
          className="mt-8 flex flex-wrap items-center gap-2"
          role="group"
          aria-label="اسلایدها"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/10 backdrop-blur-md transition hover:bg-white/20 active:scale-95"
            aria-label="اسلاید قبلی"
            onClick={() => go(index - 1)}
          >
            <Chevron direction="prev" />
          </button>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/10 backdrop-blur-md transition hover:bg-white/20 active:scale-95"
            aria-label="اسلاید بعدی"
            onClick={() => go(index + 1)}
          >
            <Chevron direction="next" />
          </button>
        </div>
      </div>
    </section>
  );
}

function Chevron({ direction }: { direction: "prev" | "next" }) {
  const previous = direction === "prev";
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path
        d={previous ? "M9 6l6 6-6 6" : "M15 6l-6 6 6 6"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
