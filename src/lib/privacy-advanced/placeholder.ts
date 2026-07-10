import { randomBytes } from "crypto";
import { PRIVACY_PLACEHOLDER_PREFIX } from "./types";

export function generatePrivacyPlaceholder(): string {
  return `${PRIVACY_PLACEHOLDER_PREFIX}${randomBytes(8).toString("hex")}`;
}

export function replaceNameInText(text: string, realName: string, placeholder: string): string {
  if (!realName.trim()) return text;
  return text.split(realName).join(placeholder);
}

export function resolveNameInText(text: string, placeholder: string, realName: string): string {
  if (!placeholder || !realName) return text;
  return text.split(placeholder).join(realName);
}
