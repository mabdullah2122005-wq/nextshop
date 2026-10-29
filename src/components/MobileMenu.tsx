"use client";

import Link from "next/link";
import { useState } from "react";
import { CloseIcon, MenuIcon } from "./icons";

type Props = { links: { href: string; label: string }[]; signedIn: boolean; isAdmin: boolean };

export function MobileMenu({ links, signedIn, isAdmin }: Props) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const extra = [
    ...(signedIn
      ? [{ href: "/account", label: "My account" }, { href: "/account/wishlist", label: "Wishlist" }]
      : [{ href: "/login", label: "Sign in" }, { href: "/register", label: "Create account" }]),
    ...(isAdmin ? [{ href: "/admin", label: "Admin panel" }] : []),
  ];

  return (
    <>
      <button onClick={() => setOpen(true)} className="-ml-2 rounded-full p-2 hover:bg-cream lg:hidden" aria-label="Open menu">
        <MenuIcon className="h-6 w-6" />
      </button>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <button className="animate-fade absolute inset-0 bg-ink/40" onClick={close} aria-label="Close menu" />
          <nav className="animate-fade absolute inset-y-0 left-0 flex w-80 max-w-[85%] flex-col bg-white p-6 shadow-2xl">
            <button onClick={close} className="mb-6 self-end rounded-full p-2 hover:bg-cream" aria-label="Close"><CloseIcon /></button>
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={close} className="heading border-b border-ink/8 py-4 text-2xl">{l.label}</Link>
            ))}
            <div className="mt-6 space-y-1 text-ink/70">
              {extra.map((l) => (
                <Link key={l.href} href={l.href} onClick={close} className="block py-2">{l.label}</Link>
              ))}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
