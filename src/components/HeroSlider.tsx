"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronIcon } from "./icons";

export type Slide = { image: string; eyebrow: string; title: string; text: string; cta: { label: string; href: string } };

export function HeroSlider({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const go = useCallback((i: number) => setIndex((i + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    if (paused || slides.length < 2) return;
    const t = setTimeout(() => go(index + 1), 6000);
    return () => clearTimeout(t);
  }, [index, paused, go, slides.length]);

  return (
    <section
      className="relative h-[72svh] min-h-[460px] overflow-hidden bg-ink text-white sm:h-[78vh] sm:min-h-[520px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1));
        touchX.current = null;
      }}
      aria-roledescription="carousel"
      aria-label="Featured collections"
    >
      {slides.map((s, i) => (
        <div
          key={s.image}
          className={`absolute inset-0 transition-opacity duration-1000 ${i === index ? "opacity-100" : "pointer-events-none opacity-0"}`}
          aria-hidden={i !== index}
          role="group"
          aria-roledescription="slide"
          aria-label={`${i + 1} of ${slides.length}`}
        >
          <Image src={s.image} alt="" fill priority={i === 0} sizes="100vw" className={`object-cover ${i === index ? "animate-ken-burns" : ""}`} />
          {/* Bottom gradient on mobile (text sits low), left gradient on larger screens. */}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/30 to-transparent sm:bg-gradient-to-r sm:from-ink/75 sm:via-ink/35" />
          <div className="container-page relative flex h-full items-end pb-20 sm:items-center sm:pb-0">
            <div className="max-w-xl">
              <p className="text-[11px] font-semibold tracking-[0.25em] text-white/80 uppercase sm:text-xs">{s.eyebrow}</p>
              <h1 className="heading mt-3 text-[42px] leading-[1.05] sm:mt-4 sm:text-6xl lg:text-7xl">{s.title}</h1>
              <p className="mt-3 max-w-md text-base text-white/85 sm:mt-5 sm:text-lg">{s.text}</p>
              <div className="mt-6 flex flex-wrap gap-3 sm:mt-8">
                <Link href={s.cta.href} className="btn-light" tabIndex={i === index ? 0 : -1}>{s.cta.label}</Link>
                <Link href="/products" className="inline-flex items-center rounded-full border border-white/50 px-6 py-3 text-sm font-medium hover:bg-white/10" tabIndex={i === index ? 0 : -1}>
                  Browse all
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {slides.length > 1 && (
        <div className="absolute inset-x-0 bottom-4 sm:bottom-8">
          <div className="container-page flex items-center justify-between">
            <div className="-ml-2 flex">
              {slides.map((s, i) => (
                <button key={s.image} onClick={() => go(i)} aria-label={`Show slide ${i + 1}`} aria-current={i === index} className="grid h-11 place-items-center px-1.5">
                  <span className={`block h-1.5 rounded-full transition-all ${i === index ? "w-10 bg-white" : "w-5 bg-white/40"}`} />
                </button>
              ))}
            </div>
            <div className="hidden gap-2 sm:flex">
              <button onClick={() => go(index - 1)} className="grid h-11 w-11 place-items-center rounded-full border border-white/30 hover:bg-white/10" aria-label="Previous slide"><ChevronIcon dir="left" /></button>
              <button onClick={() => go(index + 1)} className="grid h-11 w-11 place-items-center rounded-full border border-white/30 hover:bg-white/10" aria-label="Next slide"><ChevronIcon /></button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
