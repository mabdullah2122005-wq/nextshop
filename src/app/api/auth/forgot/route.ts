import { NextResponse } from "next/server";
import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { forgotSchema } from "@/lib/validators";
import { zodError } from "@/lib/api";
import { sendPasswordReset } from "@/lib/email";

// POST /api/auth/forgot — email a single-use reset link (valid 1 hour).
// Always responds the same way so it can't be used to discover accounts.
export async function POST(req: Request) {
  const parsed = forgotSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return zodError(parsed.error);

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (user) {
    const token = randomBytes(32).toString("base64url");
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: createHash("sha256").update(token).digest("hex"),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });
    const origin = process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin;
    await sendPasswordReset(user.email, `${origin}/reset?token=${token}`);
  }
  return NextResponse.json({ ok: true });
}
