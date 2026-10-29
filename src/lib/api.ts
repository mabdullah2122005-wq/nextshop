import { NextResponse } from "next/server";
import type { ZodError } from "zod";
import { auth } from "@/auth";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function zodError(err: ZodError) {
  return jsonError(err.issues[0]?.message ?? "Invalid request", 422);
}

// Returns the admin session, or a 401/403 response to return directly from the handler.
export async function requireAdminApi() {
  const session = await auth();
  if (!session?.user) return { error: jsonError("Unauthorized", 401) } as const;
  if (session.user.role !== "ADMIN") return { error: jsonError("Forbidden", 403) } as const;
  return { session } as const;
}
