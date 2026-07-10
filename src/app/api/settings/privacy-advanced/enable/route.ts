import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { createEmptyKeyFilePayload, encryptKeyFile } from "@/lib/privacy-advanced/key-file.server";

export async function POST(req: Request) {
  const result = await requireUser();
  if ("error" in result) return result.error;

  const { user } = result;
  if (user.privacyAdvancedModeEnabled) {
    return NextResponse.json(
      { error: "Datenschutz Advanced Modus ist bereits aktiviert." },
      { status: 400 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const { passphrase } = body as Record<string, unknown>;
  if (typeof passphrase !== "string" || passphrase.length < 8) {
    return NextResponse.json(
      { error: "Passphrase muss mindestens 8 Zeichen haben." },
      { status: 400 }
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { privacyAdvancedModeEnabled: true },
  });

  const fileContent = encryptKeyFile(createEmptyKeyFilePayload().mappings, passphrase);

  return NextResponse.json({
    message: "Datenschutz Advanced Modus aktiviert.",
    fileContent,
    filename: "klick-zeugnis-schlüssel.txt",
  });
}
