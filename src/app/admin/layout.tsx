import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminNav } from "./AdminNav";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/login?callbackUrl=/admin");

  return (
    <div className="bg-sand/40">
      <div className="container-page grid gap-8 py-8 lg:grid-cols-[220px_1fr]">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <p className="mb-3 px-3 text-xs font-semibold tracking-[0.2em] text-ink/40 uppercase">Admin</p>
          <AdminNav />
          <Link href="/" className="mt-6 hidden px-3 text-sm text-ink/50 hover:text-ink lg:block">← View store</Link>
        </aside>
        <section className="min-w-0 pb-12">{children}</section>
      </div>
    </div>
  );
}
