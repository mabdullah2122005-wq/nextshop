import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { FREE_SHIPPING_CENTS } from "@/lib/shipping";
import { CartLink } from "./CartLink";
import { MobileMenu } from "./MobileMenu";
import { SearchBox } from "./SearchBox";
import { HeartIcon, UserIcon } from "./icons";
import { SignOutButton } from "./SignOutButton";

export async function Header() {
  const [session, categories] = await Promise.all([
    auth(),
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { name: true, slug: true } }),
  ]);
  const user = session?.user;
  const storeName = process.env.NEXT_PUBLIC_STORE_NAME ?? "NextShop";
  const links = [
    { href: "/products", label: "Shop all" },
    ...categories.map((c) => ({ href: `/products?category=${c.slug}`, label: c.name })),
    { href: "/products?sale=1", label: "Sale" },
  ];

  return (
    <>
      <div className="bg-brand py-2 text-center text-xs tracking-wide text-white/90">
        {process.env.NEXT_PUBLIC_ANNOUNCEMENT ?? <>Free shipping on orders over {formatPrice(FREE_SHIPPING_CENTS)} · Use code <strong className="text-white">WELCOME10</strong> for 10% off</>}
      </div>
      <header className="sticky top-0 z-40 border-b border-ink/8 bg-white/85 backdrop-blur-md">
        <div className="container-page flex h-16 items-center gap-4 lg:h-20">
          <MobileMenu links={links} signedIn={Boolean(user)} isAdmin={user?.role === "ADMIN"} />
          <Link href="/" className="heading text-2xl text-brand lg:text-[28px]">{storeName}</Link>
          <nav className="ml-8 hidden items-center gap-7 text-sm lg:flex">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className={`transition hover:text-brand ${l.label === "Sale" ? "text-accent" : "text-ink/75"}`}>
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-1">
            <SearchBox />
            {user?.role === "ADMIN" && (
              <Link href="/admin" className="mr-1 hidden rounded-full bg-cream px-3 py-1.5 text-xs font-medium sm:inline">Admin</Link>
            )}
            <Link href={user ? "/account/wishlist" : "/login?callbackUrl=/account/wishlist"} className="hidden rounded-full p-2 hover:bg-cream sm:block" aria-label="Wishlist">
              <HeartIcon className="h-6 w-6" />
            </Link>
            <div className="group relative hidden sm:block">
              <Link href={user ? "/account" : "/login"} className="block rounded-full p-2 hover:bg-cream" aria-label="Account">
                <UserIcon className="h-6 w-6" />
              </Link>
              {user && (
                <div className="invisible absolute right-0 w-52 pt-2 opacity-0 transition group-hover:visible group-hover:opacity-100">
                  <div className="card p-2 text-sm shadow-lg">
                    <p className="truncate px-3 py-2 text-ink/50">{user.email}</p>
                    <Link href="/account" className="block rounded-lg px-3 py-2 hover:bg-cream">My orders</Link>
                    <Link href="/account/wishlist" className="block rounded-lg px-3 py-2 hover:bg-cream">Wishlist</Link>
                    <SignOutButton className="block w-full rounded-lg px-3 py-2 text-left hover:bg-cream" />
                  </div>
                </div>
              )}
            </div>
            <CartLink />
          </div>
        </div>
      </header>
    </>
  );
}
