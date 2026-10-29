import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { newsletterSchema } from "@/lib/validators";
import { zodError } from "@/lib/api";

// POST /api/newsletter — subscribe an email (idempotent).
export async function POST(req: Request) {
  const parsed = newsletterSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return zodError(parsed.error);
  await prisma.newsletterSubscriber.upsert({ where: { email: parsed.data.email }, update: {}, create: parsed.data });
  return NextResponse.json({ subscribed: true });
}
