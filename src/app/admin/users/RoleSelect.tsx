"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function RoleSelect({ id, role }: { id: string; role: string }) {
  const router = useRouter();
  const [value, setValue] = useState(role);

  async function change(next: string) {
    if (!confirm(`Change this user's role to ${next}?`)) return;
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: next }),
    });
    if (!res.ok) {
      alert((await res.json()).error ?? "Could not update role");
      return;
    }
    setValue(next);
    router.refresh();
  }

  return (
    <select value={value} onChange={(e) => change(e.target.value)} className="input w-32 py-1" aria-label="User role">
      <option value="CUSTOMER">CUSTOMER</option>
      <option value="ADMIN">ADMIN</option>
    </select>
  );
}
