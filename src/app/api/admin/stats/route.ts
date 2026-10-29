import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/api";
import { getStoreStats } from "@/lib/analytics";

// GET /api/admin/stats — dashboard analytics.
export async function GET() {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;
  return NextResponse.json(await getStoreStats());
}
