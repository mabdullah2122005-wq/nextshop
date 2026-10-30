import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatPriceShort } from "@/lib/format";
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
  const freeShip = formatPriceShort(FREE_SHIPPING_CENTS);
  const custom = process.env.NEXT_PUBLIC_ANNOUNCEMENT;

  return (
    <>
      <div className="bg-brand px-4 py-2 text-center text-xs tracking-wide text-white/90">
        {custom ?? (
          <>
            <span className="sm:hidden">Free shipping over {freeShip} · <strong className="text-white">WELCOME10</strong> for 10% off</span>
            <span className="hidden sm:inline">Free shipping on orders over {freeShip} · Use code <strong className="text-white">WELCOME10</strong> for 10% off your first order</span>
          </>
        )}
      </div>
      <header className="sticky top-0 z-40 border-b border-ink/8 bg-white/90 backdrop-blur-md">
        <div className="container-page flex h-16 items-center gap-2 lg:h-20 lg:gap-4">
          <MobileMenu links={links} signedIn={Boolean(user)} isAdmin={user?.role === "ADMIN"} storeName={storeName} />
          <Link href="/" className="heading text-2xl text-brand lg:text-[28px]">{storeName}</Link>
          <nav className="ml-8 hidden items-center gap-7 text-sm lg:flex" aria-label="Main">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className={`py-2 transition hover:text-brand ${l.label === "Sale" ? "text-accent" : "text-ink/75"}`}>
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center">
            <SearchBox />
            {user?.role === "ADMIN" && (
              <Link href="/admin" className="mr-1 hidden rounded-full bg-cream px-3 py-1.5 text-xs font-medium lg:inline">Admin</Link>
            )}
            <Link href={user ? "/account/wishlist" : "/login?callbackUrl=/account/wishlist"} className="hidden h-11 w-11 place-items-center rounded-full hover:bg-cream sm:grid" aria-label="Wishlist">
              <HeartIcon className="h-6 w-6" />
            </Link>
            <div className="group relative hidden sm:block">
              <Link href={user ? "/account" : "/login"} className="grid h-11 w-11 place-items-center rounded-full hover:bg-cream" aria-label="Account">
                <UserIcon className="h-6 w-6" />
              </Link>
              {user && (
                <div className="invisible absolute right-0 w-56 pt-2 opacity-0 transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                  <div className="card p-2 text-sm shadow-lg">
                    <p className="truncate px-3 py-2 text-ink/50">{user.email}</p>
                    <Link href="/account" className="block rounded-lg px-3 py-2 hover:bg-cream">My orders</Link>
                    <Link href="/account/wishlist" className="block rounded-lg px-3 py-2 hover:bg-cream">Wishlist</Link>
                    {user.role === "ADMIN" && <Link href="/admin" className="block rounded-lg px-3 py-2 hover:bg-cream">Admin panel</Link>}
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
