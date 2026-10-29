import { signOut } from "@/auth";

export function SignOutButton({ className }: { className?: string }) {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/" });
      }}
    >
      <button className={className}>Sign out</button>
    </form>
  );
}
