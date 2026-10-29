"use client";

import { useRouter } from "next/navigation";

export function CouponActions({ id, active }: { id: string; active: boolean }) {
  const router = useRouter();

  async function toggle() {
    await fetch(`/api/admin/coupons/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !active }) });
    router.refresh();
  }
  async function remove() {
    if (!confirm("Delete this discount code?")) return;
    await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="flex justify-end gap-3 text-sm">
      <button onClick={toggle} className="text-brand hover:underline">{active ? "Disable" : "Enable"}</button>
      <button onClick={remove} className="text-red-600 hover:underline">Delete</button>
    </div>
  );
}
