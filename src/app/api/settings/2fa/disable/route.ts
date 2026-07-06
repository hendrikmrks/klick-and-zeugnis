import { compare } from "bcryptjs";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { verifyTotpCode } from "@/lib/totp";

export async function POST(req: Request) {
  const result = await requireUser();
  if ("error" in result) return result.error;

  const { user } = result;
  const body = await req.json();
  const { password, code } = body;

  if (!password || !code) {
    return NextResponse.json({ error: "Passwort und Code erforderlich." }, { status: 400 });
  }

  if (!user.totpEnabled || !user.totpSecret) {
    return NextResponse.json({ error: "Zwei-Faktor-Authentifizierung ist nicht aktiv." }, { status: 400 });
  }

  if (!user.passwordHash) {
    return NextResponse.json({ error: "Passwort kann nicht verifiziert werden." }, { status: 400 });
  }

  const validPassword = await compare(password, user.passwordHash);
  if (!validPassword) {
    return NextResponse.json({ error: "Passwort ist falsch." }, { status: 400 });
  }

  if (!verifyTotpCode(user.totpSecret, code)) {
    return NextResponse.json({ error: "Ungültiger Bestätigungscode." }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { totpSecret: null, totpEnabled: false },
  });

  return NextResponse.json({ message: "Zwei-Faktor-Authentifizierung deaktiviert." });
}
