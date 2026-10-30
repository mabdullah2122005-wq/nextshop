"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/ToastProvider";

const STATUSES = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"];

export function OrderStatusSelect({ id, status, full = false }: { id: string; status: string; full?: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const [value, setValue] = useState(status);
  const [saving, setSaving] = useState(false);

  async function change(next: string) {
    const prev = value;
    setValue(next);
    setSaving(true);
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setSaving(false);
    if (!res.ok) {
      setValue(prev);
      toast("Could not update order status", "error");
      return;
    }
    toast(`Order marked ${next.toLowerCase()}`);
    router.refresh();
  }

  return (
    <label className={`flex items-center gap-2 ${full ? "w-full" : ""}`}>
      <span className={full ? "text-sm text-ink/60" : "sr-only"}>Status</span>
      <select value={value} disabled={saving} onChange={(e) => change(e.target.value)} className={`input py-2 ${full ? "flex-1" : "w-36"}`} aria-label="Order status">
        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
    </label>
  );
}
