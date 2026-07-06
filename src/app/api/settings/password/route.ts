import { compare, hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const result = await requireUser();
  if ("error" in result) return result.error;

  const { user } = result;
  const body = await req.json();
  const { currentPassword, newPassword, confirmPassword } = body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return NextResponse.json({ error: "Bitte alle Felder ausfüllen." }, { status: 400 });
  }

  if (newPassword !== confirmPassword) {
    return NextResponse.json({ error: "Die neuen Passwörter stimmen nicht überein." }, { status: 400 });
  }

  if (newPassword.length < 8) {
    return NextResponse.json({ error: "Das neue Passwort muss mindestens 8 Zeichen lang sein." }, { status: 400 });
  }

  if (!user.passwordHash) {
    return NextResponse.json({ error: "Passwort kann für dieses Konto nicht geändert werden." }, { status: 400 });
  }

  const valid = await compare(currentPassword, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Aktuelles Passwort ist falsch." }, { status: 400 });
  }

  const passwordHash = await hash(newPassword, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  return NextResponse.json({ message: "Passwort erfolgreich geändert." });
}
