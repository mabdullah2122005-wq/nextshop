import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SignOutButton } from "@/components/SignOutButton";
import { AccountNav } from "./AccountNav";

export default async function AccountLayout({ children }: LayoutProps<"/account">) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/account");

  return (
    <div className="container-page py-8 sm:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="eyebrow">My account</p>
          <h1 className="heading mt-2 text-4xl sm:text-5xl">Hi, {session.user.name?.split(" ")[0] ?? "there"}</h1>
          <p className="mt-2 truncate text-ink/60">{session.user.email}</p>
        </div>
        <SignOutButton className="btn-outline" />
      </div>
      <div className="mt-8 sm:mt-10"><AccountNav /></div>
      <div className="mt-8">{children}</div>
    </div>
  );
}
