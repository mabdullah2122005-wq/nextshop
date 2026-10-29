import Link from "next/link";
import { NewsletterForm } from "./NewsletterForm";

export function Footer() {
  const storeName = process.env.NEXT_PUBLIC_STORE_NAME ?? "NextShop";
  const cols = [
    { title: "Shop", links: [["All products", "/products"], ["Apparel", "/products?category=apparel"], ["Accessories", "/products?category=accessories"], ["Home", "/products?category=home"], ["Sale", "/products?sale=1"]] },
    { title: "Account", links: [["Sign in", "/login"], ["Create account", "/register"], ["My orders", "/account"], ["Wishlist", "/account/wishlist"]] },
    { title: "Help", links: [["FAQ", "/faq"], ["Shipping & returns", "/faq#shipping"], ["Contact us", "/faq#contact"]] },
  ];

  return (
    <footer className="mt-24 bg-brand text-white">
      <div className="container-page grid gap-12 py-16 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <p className="heading text-3xl">{storeName}</p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/70">
            Well-made essentials for everyday life. Join our list for new arrivals and members-only offers.
          </p>
          <div className="mt-6"><NewsletterForm dark /></div>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <p className="text-xs font-semibold tracking-[0.2em] text-white/50 uppercase">{c.title}</p>
            <ul className="mt-4 space-y-2.5 text-sm text-white/80">
              {c.links.map(([label, href]) => (
                <li key={href}><Link href={href} className="hover:text-white">{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-white/50 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} {storeName}. All rights reserved.</p>
          <p>Secure payments by Stripe · Visa · Mastercard · Amex · Apple Pay · Google Pay</p>
        </div>
      </div>
    </footer>
  );
}
