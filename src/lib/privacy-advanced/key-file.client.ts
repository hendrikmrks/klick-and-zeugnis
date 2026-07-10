"use client";

import type { PrivacyKeyFilePayload, PrivacyKeyMappings } from "./types";
import { PRIVACY_KEY_FILE_VERSION } from "./types";

const PBKDF2_ITERATIONS = 100_000;

type EncryptedKeyFile = {
  v: number;
  s: string;
  i: string;
  t: string;
  c: string;
};

async function deriveKey(passphrase: string, salt: BufferSource): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export async function encryptKeyFileClient(
  mappings: PrivacyKeyMappings,
  passphrase: string
): Promise<string> {
  const payload: PrivacyKeyFilePayload = {
    version: PRIVACY_KEY_FILE_VERSION,
    mappings,
  };
  const plaintext = JSON.stringify(payload);
  const salt = crypto.getRandomValues(new Uint8Array(32));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);
  const enc = new TextEncoder();
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(plaintext)
  );

  const encryptedBytes = new Uint8Array(encrypted);
  const ciphertext = encryptedBytes.slice(0, encryptedBytes.length - 16);
  const authTag = encryptedBytes.slice(encryptedBytes.length - 16);

  const envelope: EncryptedKeyFile = {
    v: PRIVACY_KEY_FILE_VERSION,
    s: bufferToBase64(salt.buffer),
    i: bufferToBase64(iv.buffer),
    t: bufferToBase64(authTag.buffer),
    c: bufferToBase64(ciphertext.buffer),
  };

  return JSON.stringify(envelope, null, 2);
}

export async function decryptKeyFileClient(
  fileContent: string,
  passphrase: string
): Promise<PrivacyKeyMappings> {
  let envelope: EncryptedKeyFile;
  try {
    envelope = JSON.parse(fileContent.trim()) as EncryptedKeyFile;
  } catch {
    throw new Error("Ungültiges Schlüsseldatei-Format.");
  }

  if (envelope.v !== PRIVACY_KEY_FILE_VERSION) {
    throw new Error("Nicht unterstützte Schlüsseldatei-Version.");
  }

  const salt = base64ToBuffer(envelope.s);
  const iv = base64ToBuffer(envelope.i);
  const authTag = base64ToBuffer(envelope.t);
  const ciphertext = base64ToBuffer(envelope.c);
  const combined = new Uint8Array(ciphertext.length + authTag.length);
  combined.set(ciphertext);
  combined.set(authTag, ciphertext.length);

  const key = await deriveKey(passphrase, salt);
  let decrypted: ArrayBuffer;
  try {
    decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, combined);
  } catch {
    throw new Error("Passphrase falsch oder Schlüsseldatei beschädigt.");
  }

  const payload = JSON.parse(new TextDecoder().decode(decrypted)) as PrivacyKeyFilePayload;
  if (payload.version !== PRIVACY_KEY_FILE_VERSION || typeof payload.mappings !== "object") {
    throw new Error("Schlüsseldatei-Inhalt ungültig.");
  }
  return payload.mappings;
}

export function downloadKeyFile(content: string, filename = "klick-zeugnis-schlüssel.txt") {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function mergeKeyMappingsClient(
  base: PrivacyKeyMappings,
  additions: PrivacyKeyMappings
): PrivacyKeyMappings {
  return { ...base, ...additions };
}
