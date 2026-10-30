"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { CloseIcon, SearchIcon } from "./icons";
import { useOverlay } from "./useOverlay";

const suggestions = ["Hoodie", "Candle", "Wallet", "Lamp"];

export function SearchBox() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  useOverlay(open, close);

  const go = (q: string) => {
    close();
    router.push(q ? `/products?q=${encodeURIComponent(q)}` : "/products");
  };

  return (
    <>
      <button onClick={() => setOpen(true)} className="grid h-11 w-11 place-items-center rounded-full hover:bg-cream" aria-label="Search">
        <SearchIcon className="h-6 w-6" />
      </button>
      {open &&
        createPortal(
          <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="Search">
            <button className="animate-fade absolute inset-0 h-full w-full bg-ink/40" onClick={close} aria-label="Close search" tabIndex={-1} />
            <div className="animate-fade relative border-b border-ink/8 bg-white shadow-lg">
              <form
                className="container-page flex h-20 items-center gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  go(String(new FormData(e.currentTarget).get("q") ?? "").trim());
                }}
              >
                <SearchIcon className="h-6 w-6 shrink-0 text-ink/40" />
                <input
                  autoFocus
                  name="q"
                  type="search"
                  enterKeyHint="search"
                  placeholder="Search products…"
                  aria-label="Search products"
                  className="min-w-0 flex-1 bg-transparent text-lg outline-none placeholder:text-ink/40"
                />
                <button type="button" onClick={close} className="grid h-11 w-11 shrink-0 place-items-center rounded-full hover:bg-cream" aria-label="Close search">
                  <CloseIcon />
                </button>
              </form>
              <div className="container-page flex flex-wrap gap-2 pb-5">
                <span className="py-1.5 text-sm text-ink/50">Popular:</span>
                {suggestions.map((s) => (
                  <button key={s} type="button" onClick={() => go(s)} className="rounded-full bg-cream px-4 py-1.5 text-sm hover:bg-sand">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
