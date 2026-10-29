import { ResetForm } from "./ResetForm";

export const metadata = { title: "Choose a new password" };

export default async function ResetPage({ searchParams }: PageProps<"/reset">) {
  const { token } = await searchParams;
  return (
    <div className="container-page flex justify-center py-24">
      <div className="w-full max-w-sm">
        <h1 className="heading text-4xl">Choose a new password</h1>
        <ResetForm token={typeof token === "string" ? token : ""} />
      </div>
    </div>
  );
}
