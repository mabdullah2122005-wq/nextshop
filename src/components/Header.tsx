import Link from "next/link";
import { auth, signOut } from "@/auth";
import { CartLink } from "./CartLink";

export async function Header() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="text-lg font-semibold tracking-tight text-brand">
          {process.env.NEXT_PUBLIC_STORE_NAME ?? "NextShop"}
        </Link>
        <nav className="flex items-center gap-1 text-sm sm:gap-4">
          <Link href="/products" className="rounded px-2 py-1 hover:text-brand">Shop</Link>
          {user?.role === "ADMIN" && <Link href="/admin" className="rounded px-2 py-1 hover:text-brand">Admin</Link>}
          {user ? (
            <>
              <Link href="/account" className="hidden rounded px-2 py-1 hover:text-brand sm:inline">Account</Link>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button className="rounded px-2 py-1 text-stone-600 hover:text-brand">Sign out</button>
              </form>
            </>
          ) : (
            <Link href="/login" className="rounded px-2 py-1 hover:text-brand">Sign in</Link>
          )}
          <CartLink />
        </nav>
      </div>
    </header>
  );
}
