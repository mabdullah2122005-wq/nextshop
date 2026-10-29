import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validators";
import { jsonError, zodError } from "@/lib/api";
import { sendWelcome } from "@/lib/email";

// POST /api/register — create a customer account.
export async function POST(req: Request) {
  const parsed = registerSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return zodError(parsed.error);

  const { name, email, password } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return jsonError("An account with this email already exists", 409);

  const user = await prisma.user.create({
    data: { name, email, passwordHash: await bcrypt.hash(password, 12) },
    select: { id: true, email: true, name: true },
  });
  await sendWelcome(user.email, user.name);
  return NextResponse.json(user, { status: 201 });
}
