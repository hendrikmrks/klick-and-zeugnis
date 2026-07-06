import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { verifyTotpCode } from "@/lib/totp";

export async function POST(req: Request) {
  const result = await requireUser();
  if ("error" in result) return result.error;

  const { user } = result;
  const body = await req.json();
  const { secret, code } = body;

  if (!secret || !code) {
    return NextResponse.json({ error: "Secret und Code erforderlich." }, { status: 400 });
  }

  if (user.totpEnabled) {
    return NextResponse.json({ error: "Zwei-Faktor-Authentifizierung ist bereits aktiv." }, { status: 400 });
  }

  if (!verifyTotpCode(secret, code)) {
    return NextResponse.json({ error: "Ungültiger Bestätigungscode." }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { totpSecret: secret, totpEnabled: true },
  });

  return NextResponse.json({ message: "Zwei-Faktor-Authentifizierung aktiviert." });
}
