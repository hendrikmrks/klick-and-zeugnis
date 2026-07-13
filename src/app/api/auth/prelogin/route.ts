import { compare } from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json({ error: "E-Mail und Passwort erforderlich." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user?.passwordHash) {
    return NextResponse.json({ error: "Ungültige Anmeldedaten." }, { status: 401 });
  }

  if (user.isBlocked) {
    return NextResponse.json(
      {
        error: "Ihr Konto wurde gesperrt. Bitte wenden Sie sich über die Hilfe-Seite an den Support.",
        code: "ACCOUNT_BLOCKED",
      },
      { status: 403 }
    );
  }

  const valid = await compare(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Ungültige Anmeldedaten." }, { status: 401 });
  }

  return NextResponse.json({ requires2FA: user.totpEnabled });
}
