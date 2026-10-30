import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { RoleSelect } from "./RoleSelect";

export const metadata = { title: "Customers" };

export default async function AdminUsersPage() {
  const session = await auth();
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, role: true, createdAt: true, _count: { select: { orders: true } } },
  });
  const role = (u: (typeof users)[number]) =>
    u.id === session?.user?.id ? <span className="text-sm text-ink/50">{u.role} (you)</span> : <RoleSelect id={u.id} role={u.role} />;

  return (
    <div>
      <h1 className="heading text-3xl sm:text-4xl">Customers</h1>
      <p className="mt-1 mb-5 text-ink/60">{users.length} accounts · {users.filter((u) => u.role === "ADMIN").length} admins</p>

      <ul className="space-y-3 lg:hidden">
        {users.map((u) => (
          <li key={u.id} className="card flex items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <p className="font-medium">{u.name ?? "—"}</p>
              <p className="truncate text-sm text-ink/60">{u.email}</p>
              <p className="text-xs text-ink/45">Joined {formatDate(u.createdAt)} · {u._count.orders} orders</p>
            </div>
            <div className="shrink-0">{role(u)}</div>
          </li>
        ))}
      </ul>

      <div className="card hidden overflow-x-auto lg:block">
        <table className="w-full text-sm">
          <thead className="border-b border-ink/8 text-left text-ink/50">
            <tr>
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Email</th>
              <th className="p-4 font-medium">Joined</th>
              <th className="p-4 font-medium">Orders</th>
              <th className="p-4 font-medium">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/5">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="p-4">{u.name ?? "—"}</td>
                <td className="p-4">{u.email}</td>
                <td className="p-4 whitespace-nowrap">{formatDate(u.createdAt)}</td>
                <td className="p-4">{u._count.orders}</td>
                <td className="p-4">{role(u)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
