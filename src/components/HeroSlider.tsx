"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ChevronIcon } from "./icons";

export type Slide = { image: string; eyebrow: string; title: string; text: string; cta: { label: string; href: string } };

export function HeroSlider({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const go = useCallback((i: number) => setIndex((i + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    if (paused || slides.length < 2) return;
    const t = setTimeout(() => go(index + 1), 6000);
    return () => clearTimeout(t);
  }, [index, paused, go, slides.length]);

  return (
    <section
      className="relative h-[78vh] min-h-[520px] overflow-hidden bg-ink text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      {slides.map((s, i) => (
        <div
          key={s.image}
          className={`absolute inset-0 transition-opacity duration-1000 ${i === index ? "opacity-100" : "pointer-events-none opacity-0"}`}
          aria-hidden={i !== index}
        >
          <Image src={s.image} alt="" fill priority={i === 0} sizes="100vw" className={`object-cover ${i === index ? "animate-ken-burns" : ""}`} />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/75 via-ink/35 to-transparent" />
          <div className="container-page relative flex h-full items-center">
            <div className="max-w-xl">
              <p className="text-xs font-semibold tracking-[0.25em] text-white/80 uppercase">{s.eyebrow}</p>
              <h1 className="heading mt-4 text-5xl leading-[1.05] sm:text-6xl lg:text-7xl">{s.title}</h1>
              <p className="mt-5 max-w-md text-lg text-white/80">{s.text}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={s.cta.href} className="btn-light" tabIndex={i === index ? 0 : -1}>{s.cta.label}</Link>
                <Link href="/products" className="inline-flex items-center rounded-full border border-white/40 px-6 py-3 text-sm font-medium hover:bg-white/10" tabIndex={i === index ? 0 : -1}>
                  Browse all
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {slides.length > 1 && (
        <div className="absolute inset-x-0 bottom-8">
          <div className="container-page flex items-center justify-between">
            <div className="flex gap-2">
              {slides.map((s, i) => (
                <button
                  key={s.image}
                  onClick={() => go(i)}
                  aria-label={`Show slide ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${i === index ? "w-10 bg-white" : "w-5 bg-white/40 hover:bg-white/70"}`}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => go(index - 1)} className="grid h-11 w-11 place-items-center rounded-full border border-white/30 hover:bg-white/10" aria-label="Previous slide"><ChevronIcon dir="left" /></button>
              <button onClick={() => go(index + 1)} className="grid h-11 w-11 place-items-center rounded-full border border-white/30 hover:bg-white/10" aria-label="Next slide"><ChevronIcon /></button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
