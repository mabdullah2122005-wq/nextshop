import Image from "next/image";

// Split-screen layout for sign-in, register and password pages.
export function AuthShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="container-page grid min-h-[70vh] items-stretch gap-10 py-12 lg:grid-cols-2">
      <div className="relative hidden overflow-hidden rounded-3xl lg:block">
        <Image src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1400&q=80&auto=format&fit=crop" alt="" fill sizes="50vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
        <p className="heading absolute bottom-10 left-10 max-w-sm text-4xl text-white">Well-made essentials for everyday life.</p>
      </div>
      <div className="flex items-center justify-center">
        <div className="w-full max-w-sm">
          <h1 className="heading text-4xl">{title}</h1>
          {subtitle && <p className="mt-2 text-ink/60">{subtitle}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}
