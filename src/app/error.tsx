"use client";

import Link from "next/link";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="container-page flex flex-col items-center py-28 text-center">
      <p className="eyebrow">Something went wrong</p>
      <h1 className="heading mt-3 text-4xl">We hit a snag</h1>
      <p className="mt-3 max-w-md text-ink/60">Please try again. If the problem continues, contact us and we’ll sort it out.</p>
      <div className="mt-8 flex gap-3">
        <button onClick={reset} className="btn">Try again</button>
        <Link href="/" className="btn-outline">Go home</Link>
      </div>
    </div>
  );
}
