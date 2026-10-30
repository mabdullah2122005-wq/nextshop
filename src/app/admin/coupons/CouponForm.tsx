"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/ToastProvider";

export function CouponForm() {
  const router = useRouter();
  const toast = useToast();
  const [kind, setKind] = useState<"PERCENT" | "FIXED">("PERCENT");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const value = Number(f.get("value"));
    setSaving(true);
    setError(null);
    const res = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: f.get("code"),
        kind,
        value: kind === "FIXED" ? Math.round(value * 100) : Math.round(value),
        minOrderCents: Math.round(Number(f.get("minOrder") || 0) * 100),
        maxUses: f.get("maxUses") ? Number(f.get("maxUses")) : null,
        expiresAt: f.get("expiresAt") || null,
        active: true,
      }),
    });
    setSaving(false);
    if (!res.ok) return setError((await res.json()).error ?? "Could not create code");
    form.reset();
    toast("Discount code created");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card grid grid-cols-2 gap-4 p-4 sm:p-6 lg:grid-cols-6 lg:items-end">
      <p className="col-span-2 font-semibold lg:col-span-6">Create a code</p>
      <div className="col-span-2 sm:col-span-1">
        <label className="label" htmlFor="code">Code</label>
        <input id="code" name="code" required minLength={3} placeholder="SUMMER20" className="input uppercase" />
      </div>
      <div>
        <label className="label" htmlFor="kind">Type</label>
        <select id="kind" value={kind} onChange={(e) => setKind(e.target.value as "PERCENT" | "FIXED")} className="input">
          <option value="PERCENT">% off</option>
          <option value="FIXED">Amount off</option>
        </select>
      </div>
      <div>
        <label className="label" htmlFor="value">{kind === "PERCENT" ? "Percent" : "Amount"}</label>
        <input id="value" name="value" type="number" required min={kind === "PERCENT" ? 1 : 0.5} max={kind === "PERCENT" ? 100 : undefined} step={kind === "PERCENT" ? 1 : 0.01} className="input" />
      </div>
      <div>
        <label className="label" htmlFor="minOrder">Min. order</label>
        <input id="minOrder" name="minOrder" type="number" min={0} step={0.01} placeholder="0" className="input" />
      </div>
      <div>
        <label className="label" htmlFor="maxUses">Max uses</label>
        <input id="maxUses" name="maxUses" type="number" min={1} placeholder="Unlimited" className="input" />
      </div>
      <div className="col-span-2 sm:col-span-1">
        <label className="label" htmlFor="expiresAt">Expires</label>
        <input id="expiresAt" name="expiresAt" type="date" className="input" />
      </div>
      {error && <p className="col-span-2 rounded-lg bg-red-50 p-2 text-sm text-red-700 lg:col-span-5">{error}</p>}
      <button disabled={saving} className="btn col-span-2 lg:col-span-1 lg:col-start-6">{saving ? "Creating…" : "Create code"}</button>
    </form>
  );
}
