import type { PrivacyKeyMappings } from "./types";
import { resolveNameInText } from "./placeholder";

type CertificateLike = {
  name: string;
  text: string;
  isPrivacyProtected: boolean;
};

export function resolveCertificate<T extends CertificateLike>(
  cert: T,
  mappings: PrivacyKeyMappings
): T {
  if (!cert.isPrivacyProtected) return cert;
  const realName = mappings[cert.name];
  if (!realName) return cert;
  return {
    ...cert,
    name: realName,
    text: resolveNameInText(cert.text, cert.name, realName),
  };
}

export function resolveCertificates<T extends CertificateLike>(
  certs: T[],
  mappings: PrivacyKeyMappings
): T[] {
  return certs.map((cert) => resolveCertificate(cert, mappings));
}
