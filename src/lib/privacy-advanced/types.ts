export type PrivacyKeyMappings = Record<string, string>;

export type PrivacyKeyFilePayload = {
  version: 1;
  mappings: PrivacyKeyMappings;
};

export type PrivacyKeySession = {
  mappings: PrivacyKeyMappings;
  expiresAt: number;
};

export const PRIVACY_KEY_SESSION_TTL_MS = 3 * 60 * 60 * 1000; // 3 hours
export const PRIVACY_PLACEHOLDER_PREFIX = "KAZ_";
export const PRIVACY_KEY_FILE_VERSION = 1;
