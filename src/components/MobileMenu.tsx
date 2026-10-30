"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { CloseIcon, HeartIcon, MenuIcon, UserIcon, ChartIcon } from "./icons";
import { useOverlay } from "./useOverlay";

type Props = { links: { href: string; label: string }[]; signedIn: boolean; isAdmin: boolean; storeName: string };

export function MobileMenu({ links, signedIn, isAdmin, storeName }: Props) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  useOverlay(open, close);

  const account = signedIn
    ? [
        { href: "/account", label: "My orders", icon: UserIcon },
        { href: "/account/wishlist", label: "Wishlist", icon: HeartIcon },
        ...(isAdmin ? [{ href: "/admin", label: "Admin panel", icon: ChartIcon }] : []),
      ]
    : [
        { href: "/login", label: "Sign in", icon: UserIcon },
        { href: "/account/wishlist", label: "Wishlist", icon: HeartIcon },
      ];

  return (
    <>
      <button onClick={() => setOpen(true)} className="-ml-2 grid h-11 w-11 place-items-center rounded-full hover:bg-cream lg:hidden" aria-label="Open menu" aria-expanded={open}>
        <MenuIcon className="h-6 w-6" />
      </button>
      {/* Portalled to <body> so the header's backdrop-blur can't trap the fixed overlay. */}
      {open &&
        createPortal(
          <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
            <button className="animate-fade absolute inset-0 h-full w-full bg-ink/50" onClick={close} aria-label="Close menu" tabIndex={-1} />
            <nav className="animate-drawer-left absolute inset-y-0 left-0 flex h-dvh w-[85%] max-w-sm flex-col bg-white shadow-2xl">
              <div className="flex h-16 shrink-0 items-center justify-between border-b border-ink/8 px-5">
                <span className="heading text-2xl text-brand">{storeName}</span>
                <button onClick={close} className="grid h-11 w-11 place-items-center rounded-full hover:bg-cream" aria-label="Close menu">
                  <CloseIcon />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-2">
                <ul>
                  {links.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        onClick={close}
                        className={`heading flex items-center justify-between border-b border-ink/8 py-4 text-2xl ${l.label === "Sale" ? "text-accent" : ""}`}
                      >
                        {l.label}
                        <span className="text-base text-ink/30" aria-hidden>→</span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <ul className="mt-6 space-y-1">
                  {account.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} onClick={close} className="flex items-center gap-3 rounded-xl px-2 py-3 text-ink/80 hover:bg-cream">
                        <l.icon className="h-5 w-5" /> {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              {!signedIn && (
                <div className="border-t border-ink/8 p-5">
                  <Link href="/register" onClick={close} className="btn w-full">Create an account</Link>
                </div>
              )}
            </nav>
          </div>,
          document.body,
        )}
    </>
  );
}
