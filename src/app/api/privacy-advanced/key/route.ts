import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api-auth";
import { decryptKeyFile, encryptKeyFile, mergeKeyMappings } from "@/lib/privacy-advanced/key-file.server";
import { clearKeySession, getKeySession, setKeySession } from "@/lib/privacy-advanced/key-session";

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

  const { fileContent, passphrase, pendingMappings } = body as Record<string, unknown>;

  if (typeof fileContent !== "string" || !fileContent.trim()) {
    return NextResponse.json({ error: "Schlüsseldatei fehlt." }, { status: 400 });
  }
  if (typeof passphrase !== "string" || passphrase.length < 8) {
    return NextResponse.json(
      { error: "Passphrase muss mindestens 8 Zeichen haben." },
      { status: 400 }
    );
  }

  let mappings;
  try {
    mappings = decryptKeyFile(fileContent, passphrase);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Entschlüsselung fehlgeschlagen.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (pendingMappings && typeof pendingMappings === "object" && !Array.isArray(pendingMappings)) {
    mappings = mergeKeyMappings(mappings, pendingMappings as Record<string, string>);
  }

  const session = setKeySession(user.id, mappings);

  return NextResponse.json({
    message: "Schlüsseldatei geladen. Namen sind für 3 Stunden entschlüsselt.",
    keyExpiresAt: session.expiresAt,
    mappingCount: Object.keys(session.mappings).length,
  });
}

export async function DELETE() {
  const result = await requireUser();
  if ("error" in result) return result.error;

  clearKeySession(result.user.id);
  return NextResponse.json({ message: "Schlüsseldatei-Sitzung beendet." });
}

export async function PUT(req: Request) {
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

  const { passphrase, newMapping } = body as Record<string, unknown>;

  if (typeof passphrase !== "string" || passphrase.length < 8) {
    return NextResponse.json(
      { error: "Passphrase muss mindestens 8 Zeichen haben." },
      { status: 400 }
    );
  }

  const session = getKeySession(user.id);
  let mappings = session?.mappings ?? {};

  if (newMapping && typeof newMapping === "object" && !Array.isArray(newMapping)) {
    const entry = newMapping as { placeholder?: string; realName?: string };
    if (entry.placeholder && entry.realName) {
      mappings = mergeKeyMappings(mappings, { [entry.placeholder]: entry.realName });
      if (session) {
        setKeySession(user.id, mappings);
      }
    }
  }

  const fileContent = encryptKeyFile(mappings, passphrase);

  return NextResponse.json({ fileContent, mappingCount: Object.keys(mappings).length });
}
