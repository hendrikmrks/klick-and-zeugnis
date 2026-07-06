import { generateSecret, generateURI, verifySync } from "otplib";
import QRCode from "qrcode";

const APP_NAME = "Klick & Zeugnis";

export function createTotpSecret(): string {
  return generateSecret();
}

export function verifyTotpCode(secret: string, code: string): boolean {
  try {
    const result = verifySync({
      secret,
      token: code.replace(/\s/g, ""),
      epochTolerance: 1,
    });
    return result.valid;
  } catch {
    return false;
  }
}

export function getTotpUri(secret: string, email: string): string {
  return generateURI({
    issuer: APP_NAME,
    label: email,
    secret,
  });
}

export async function getTotpQrDataUrl(secret: string, email: string): Promise<string> {
  return QRCode.toDataURL(getTotpUri(secret, email));
}
