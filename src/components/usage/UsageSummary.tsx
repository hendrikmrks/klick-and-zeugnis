import { useEffect, useState } from "react";
import UsageSection from "./UsageSection";
import type { UsageData } from "@/types/app";
import Link from "next/link";

export default function UsageSummary({
  onUsage,
}: {
  onLimit?: (type: "generate" | "save") => void;
  onUsage?: (data: UsageData) => void;
}) {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsage = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/usage");
        if (!res.ok) throw new Error(`Fehler: ${res.status}`);
        const data = await res.json();
        setUsage(data);
        onUsage?.(data);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unbekannter Fehler";
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsage();
  }, [onUsage]);

  const formatLimit = (val: number) =>
    val === Number.MAX_SAFE_INTEGER ? "∞" : val;

  if (loading) return <p className="text-sm text-slate-500">Lade Statistik…</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!usage) return null;

  return (
    <div className="space-y-6">
      <UsageSection
        title="Zeugnisse"
        items={[
          {
            label: "Generiert diesen Monat",
            value: `${usage.monthGenerated} / ${formatLimit(usage.monthLimit)}`,
            progress:
              usage.monthLimit === Number.MAX_SAFE_INTEGER
                ? 0
                : usage.monthGenerated / usage.monthLimit,
          },
          {
            label: "Gespeichert",
            value: `${usage.totalSaved} / ${formatLimit(usage.saveLimit)}`,
          },
        ]}
      />
      <UsageSection
        title="Wörter"
        items={[
          {
            label: "Insgesamt generiert",
            value: usage.totalWords.toLocaleString("de-DE"),
          },
          {
            label: "Ø pro Zeugnis",
            value: usage.avgWords.toLocaleString("de-DE"),
          },
        ]}
      />
      <Link
        href="/analytics"
        className="block text-center text-sm font-medium text-blue-600 hover:underline"
      >
        Detaillierte Analysen →
      </Link>
    </div>
  );
}
