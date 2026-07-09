import { useState } from 'react';

export type GenerateCertificateParams = {
  name: string;
  gender: string;
  grade: string;
  socialSkills: string[];
  roles: string[];
};

export type GenerateCertificateResult = {
  text: string;
  generatedId: string;
};

export function useGenerateCertificate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [certificate, setCertificate] = useState<string | null>(null);
  const [generatedId, setGeneratedId] = useState<string | null>(null);

  const generateCertificate = async (params: GenerateCertificateParams) => {
    setLoading(true);
    setError(null);
    setGeneratedId(null);

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
      const id = typeof data.generatedId === "string" ? data.generatedId : null;
      setCertificate(cert);
      setGeneratedId(id);
      if (!cert || !id) {
        throw new Error('Ungültige Antwort vom Server');
      }
      return { text: cert, generatedId: id } satisfies GenerateCertificateResult;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unbekannter Fehler';
      setError(message);
      setCertificate(null);
      setGeneratedId(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearCertificate = () => {
    setCertificate(null);
    setGeneratedId(null);
    setError(null);
  };

  return {
    generateCertificate,
    certificate,
    generatedId,
    loading,
    error,
    setError,
    clearCertificate,
  };
}
