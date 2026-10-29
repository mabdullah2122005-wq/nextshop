import { AuthShell } from "@/components/AuthShell";
import { RegisterForm } from "./RegisterForm";

export const metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <AuthShell title="Create an account" subtitle="Track orders, save favourites and check out faster.">
      <RegisterForm />
    </AuthShell>
  );
}
