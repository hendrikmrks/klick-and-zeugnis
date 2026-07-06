import { compare } from "bcryptjs";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: Request) {
  const result = await requireUser();
  if ("error" in result) return result.error;

  const body = await req.json();
  const { password } = body;

  if (!password) {
    return NextResponse.json({ error: "Passwort zur Bestätigung erforderlich." }, { status: 400 });
  }

  if (!result.user.passwordHash) {
    return NextResponse.json({ error: "Konto kann nicht gelöscht werden." }, { status: 400 });
  }

  const valid = await compare(password, result.user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Passwort ist falsch." }, { status: 400 });
  }

  await prisma.user.delete({ where: { id: result.user.id } });

  return NextResponse.json({ message: "Konto wurde gelöscht." });
}
