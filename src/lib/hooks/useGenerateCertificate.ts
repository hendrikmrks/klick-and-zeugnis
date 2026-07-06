import { useState } from 'react';

export type GenerateCertificateParams = {
  name: string;
  gender: string;
  grade: string;
  socialSkills: string[];
  roles: string[];
};

export function useGenerateCertificate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [certificate, setCertificate] = useState<string | null>(null);

  const generateCertificate = async (params: GenerateCertificateParams) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/certificate/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (res.status === 403) {
        setError('LIMIT_REACHED');
        setLoading(false);
        return null;
      }
      if (!res.ok) {
        throw new Error(`Fehler: ${res.status}`);
      }

      const data = await res.json();
      const cert = typeof data.text === "string" ? data.text : "";
      setCertificate(cert);
      return cert; // Rückgabe für direkten Zugriff
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unbekannter Fehler';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    generateCertificate,
    certificate,
    loading,
    error,
    setError, // Exportiere setError
  };
}
