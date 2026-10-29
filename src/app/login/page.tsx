import { Suspense } from "react";
import { AuthShell } from "@/components/AuthShell";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <AuthShell title="Welcome back" subtitle="Sign in to view orders, your wishlist and faster checkout.">
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
