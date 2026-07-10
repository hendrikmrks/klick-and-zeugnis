import { createCipheriv, createDecipheriv, pbkdf2Sync, randomBytes } from "crypto";
import type { PrivacyKeyFilePayload, PrivacyKeyMappings } from "./types";
import { PRIVACY_KEY_FILE_VERSION } from "./types";

const PBKDF2_ITERATIONS = 100_000;
const KEY_LENGTH = 32;
const SALT_LENGTH = 32;
const IV_LENGTH = 12;

type EncryptedKeyFile = {
  v: number;
  s: string;
  i: string;
  t: string;
  c: string;
};

function deriveKey(passphrase: string, salt: Buffer): Buffer {
  return pbkdf2Sync(passphrase, salt, PBKDF2_ITERATIONS, KEY_LENGTH, "sha256");
}

export function createEmptyKeyFilePayload(): PrivacyKeyFilePayload {
  return { version: PRIVACY_KEY_FILE_VERSION, mappings: {} };
}

export function encryptKeyFile(
  mappings: PrivacyKeyMappings,
  passphrase: string
): string {
  const payload: PrivacyKeyFilePayload = {
    version: PRIVACY_KEY_FILE_VERSION,
    mappings,
  };
  const plaintext = JSON.stringify(payload);
  const salt = randomBytes(SALT_LENGTH);
  const iv = randomBytes(IV_LENGTH);
  const key = deriveKey(passphrase, salt);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  const envelope: EncryptedKeyFile = {
    v: PRIVACY_KEY_FILE_VERSION,
    s: salt.toString("base64"),
    i: iv.toString("base64"),
    t: authTag.toString("base64"),
    c: encrypted.toString("base64"),
  };

  return JSON.stringify(envelope, null, 2);
}

export function decryptKeyFile(
  fileContent: string,
  passphrase: string
): PrivacyKeyMappings {
  let envelope: EncryptedKeyFile;
  try {
    envelope = JSON.parse(fileContent.trim()) as EncryptedKeyFile;
  } catch {
    throw new Error("Ungültiges Schlüsseldatei-Format.");
  }

  if (envelope.v !== PRIVACY_KEY_FILE_VERSION) {
    throw new Error("Nicht unterstützte Schlüsseldatei-Version.");
  }

  const salt = Buffer.from(envelope.s, "base64");
  const iv = Buffer.from(envelope.i, "base64");
  const authTag = Buffer.from(envelope.t, "base64");
  const ciphertext = Buffer.from(envelope.c, "base64");
  const key = deriveKey(passphrase, salt);

  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);

  let decrypted: string;
  try {
    decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
  } catch {
    throw new Error("Passphrase falsch oder Schlüsseldatei beschädigt.");
  }

  let payload: PrivacyKeyFilePayload;
  try {
    payload = JSON.parse(decrypted) as PrivacyKeyFilePayload;
  } catch {
    throw new Error("Schlüsseldatei-Inhalt ungültig.");
  }

  if (payload.version !== PRIVACY_KEY_FILE_VERSION || typeof payload.mappings !== "object") {
    throw new Error("Schlüsseldatei-Inhalt ungültig.");
  }

  return payload.mappings;
}

export function mergeKeyMappings(
  base: PrivacyKeyMappings,
  additions: PrivacyKeyMappings
): PrivacyKeyMappings {
  return { ...base, ...additions };
}
