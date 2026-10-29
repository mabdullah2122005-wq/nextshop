import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page py-24 text-center">
      <h1 className="text-3xl font-semibold">Page not found</h1>
      <p className="mt-3 text-stone-600">The page you’re looking for doesn’t exist.</p>
      <Link href="/" className="btn mt-6">Back home</Link>
    </div>
  );
}
