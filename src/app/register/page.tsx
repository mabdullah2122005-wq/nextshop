import { RegisterForm } from "./RegisterForm";

export const metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <div className="container-page flex justify-center py-16">
      <div className="card w-full max-w-sm p-6">
        <h1 className="text-2xl font-semibold">Create account</h1>
        <RegisterForm />
      </div>
    </div>
  );
}
