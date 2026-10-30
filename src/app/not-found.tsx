import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page py-24 text-center">
      <p className="eyebrow">404</p>
      <h1 className="heading mt-3 text-4xl sm:text-5xl">Page not found</h1>
      <p className="mt-3 text-ink/60">The page you’re looking for doesn’t exist.</p>
      <Link href="/" className="btn mt-6">Back home</Link>
    </div>
  );
}
