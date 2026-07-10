import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { decryptKeyFile } from "@/lib/privacy-advanced/key-file.server";
import { clearKeySession } from "@/lib/privacy-advanced/key-session";

export async function POST(req: Request) {
  const result = await requireUser();
  if ("error" in result) return result.error;

  const { user } = result;
  if (!user.privacyAdvancedModeEnabled) {
    return NextResponse.json(
      { error: "Datenschutz Advanced Modus ist nicht aktiviert." },
      { status: 400 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const { fileContent, passphrase, deleteCertificates } = body as Record<string, unknown>;

  if (deleteCertificates === true) {
    const deleted = await prisma.$transaction(async (tx) => {
      const count = await tx.certificate.deleteMany({
        where: { userId: user.id, isPrivacyProtected: true },
      });
      await tx.user.update({
        where: { id: user.id },
        data: { privacyAdvancedModeEnabled: false },
      });
      return count.count;
    });

    clearKeySession(user.id);

    return NextResponse.json({
      message: `Modus deaktiviert. ${deleted} geschützte Zeugnisse wurden gelöscht.`,
      deletedCount: deleted,
    });
  }

  if (typeof fileContent !== "string" || !fileContent.trim()) {
    return NextResponse.json(
      { error: "Schlüsseldatei zum Deaktivieren erforderlich." },
      { status: 400 }
    );
  }
  if (typeof passphrase !== "string" || passphrase.length < 8) {
    return NextResponse.json(
      { error: "Passphrase muss mindestens 8 Zeichen haben." },
      { status: 400 }
    );
  }

  try {
    decryptKeyFile(fileContent, passphrase);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Entschlüsselung fehlgeschlagen.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { privacyAdvancedModeEnabled: false },
  });

  clearKeySession(user.id);

  return NextResponse.json({
    message: "Datenschutz Advanced Modus deaktiviert. Gespeicherte Zeugnisse behalten ihre Platzhalter.",
  });
}
