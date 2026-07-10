import type { PrivacyKeyMappings, PrivacyKeySession } from "./types";
import { PRIVACY_KEY_SESSION_TTL_MS } from "./types";

const sessions = new Map<string, PrivacyKeySession>();

function cleanupExpired() {
  const now = Date.now();
  for (const [userId, session] of sessions) {
    if (session.expiresAt <= now) {
      sessions.delete(userId);
    }
  }
}

export function setKeySession(userId: string, mappings: PrivacyKeyMappings): PrivacyKeySession {
  cleanupExpired();
  const session: PrivacyKeySession = {
    mappings: { ...mappings },
    expiresAt: Date.now() + PRIVACY_KEY_SESSION_TTL_MS,
  };
  sessions.set(userId, session);
  return session;
}

export function getKeySession(userId: string): PrivacyKeySession | null {
  cleanupExpired();
  const session = sessions.get(userId);
  if (!session) return null;
  if (session.expiresAt <= Date.now()) {
    sessions.delete(userId);
    return null;
  }
  return session;
}

export function addMappingToSession(
  userId: string,
  placeholder: string,
  realName: string
): boolean {
  const session = getKeySession(userId);
  if (!session) return false;
  session.mappings[placeholder] = realName;
  session.expiresAt = Date.now() + PRIVACY_KEY_SESSION_TTL_MS;
  return true;
}

export function clearKeySession(userId: string): void {
  sessions.delete(userId);
}

export function getKeySessionStatus(userId: string): {
  loaded: boolean;
  expiresAt: number | null;
  mappingCount: number;
} {
  const session = getKeySession(userId);
  if (!session) {
    return { loaded: false, expiresAt: null, mappingCount: 0 };
  }
  return {
    loaded: true,
    expiresAt: session.expiresAt,
    mappingCount: Object.keys(session.mappings).length,
  };
}
