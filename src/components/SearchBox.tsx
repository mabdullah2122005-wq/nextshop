"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CloseIcon, SearchIcon } from "./icons";

export function SearchBox() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  return (
    <>
      <button onClick={() => setOpen(true)} className="rounded-full p-2 hover:bg-cream" aria-label="Search">
        <SearchIcon className="h-6 w-6" />
      </button>
      {open && (
        <div className="animate-fade fixed inset-x-0 top-0 z-50 border-b border-ink/8 bg-white shadow-lg">
          <form
            className="container-page flex h-20 items-center gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              const q = inputRef.current?.value.trim();
              setOpen(false);
              router.push(q ? `/products?q=${encodeURIComponent(q)}` : "/products");
            }}
          >
            <SearchIcon className="h-6 w-6 text-ink/40" />
            <input
              ref={inputRef}
              name="q"
              placeholder="Search products…"
              className="flex-1 bg-transparent text-lg outline-none placeholder:text-ink/40"
              onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
            />
            <button type="button" onClick={() => setOpen(false)} className="rounded-full p-2 hover:bg-cream" aria-label="Close search">
              <CloseIcon />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
