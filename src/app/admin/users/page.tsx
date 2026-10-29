import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { RoleSelect } from "./RoleSelect";

export const metadata = { title: "Users" };

export default async function AdminUsersPage() {
  const session = await auth();
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, role: true, createdAt: true, _count: { select: { orders: true } } },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Users</h1>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-stone-200 text-left text-stone-500">
            <tr>
              <th className="p-3 font-medium">Name</th>
              <th className="p-3 font-medium">Email</th>
              <th className="p-3 font-medium">Joined</th>
              <th className="p-3 font-medium">Orders</th>
              <th className="p-3 font-medium">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="p-3">{u.name ?? "—"}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3 whitespace-nowrap">{formatDate(u.createdAt)}</td>
                <td className="p-3">{u._count.orders}</td>
                <td className="p-3">
                  {u.id === session?.user?.id ? <span className="text-stone-500">{u.role} (you)</span> : <RoleSelect id={u.id} role={u.role} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
