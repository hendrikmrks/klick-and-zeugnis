import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api-auth";
import { createTotpSecret, getTotpQrDataUrl } from "@/lib/totp";

export async function POST() {
  const result = await requireUser();
  if ("error" in result) return result.error;

  const { user } = result;

  if (user.totpEnabled) {
    return NextResponse.json({ error: "Zwei-Faktor-Authentifizierung ist bereits aktiv." }, { status: 400 });
  }

  if (!user.email) {
    return NextResponse.json({ error: "E-Mail-Adresse fehlt." }, { status: 400 });
  }

  const secret = createTotpSecret();
  const qrDataUrl = await getTotpQrDataUrl(secret, user.email);

  return NextResponse.json({ secret, qrDataUrl });
}
