"use client";

import SectionCard from "@/components/layout/SectionCard";
import { Badge } from "@/components/ui/badge";
import { Coins, Sparkles } from "lucide-react";

type UsageTotals = {
  requests: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costUsd: number;
};

export type OpenAiUsageData = {
  openAiConfigured: boolean;
  model: string;
  pricing: { inputPer1M: number; outputPer1M: number };
  usdToEur: number;
  totals: {
    allTime: UsageTotals;
    thisMonth: UsageTotals;
  };
  mockGenerationsThisMonth: number;
  dailyThisMonth: Array<{
    date: string;
    requests: number;
    totalTokens: number;
    costUsd: number;
  }>;
  recent: Array<{
    id: string;
    userEmail: string | null;
    userName: string | null;
    model: string | null;
    totalTokens: number | null;
    costUsd: number | null;
    createdAt: string;
  }>;
};

function formatTokens(value: number): string {
  return value.toLocaleString("de-DE");
}

function formatUsd(value: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }).format(value);
}

function formatEur(value: number, rate: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }).format(value * rate);
}

function StatTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

type Props = {
  data: OpenAiUsageData | null;
  loading?: boolean;
  error?: string | null;
};

export default function OpenAiUsageSection({ data, loading, error }: Props) {
  if (loading) {
    return (
      <SectionCard title="OpenAI Tokenverbrauch" description="Kosten und Nutzung der KI-Generierung">
        <p className="text-sm text-slate-500">Daten werden geladen…</p>
      </SectionCard>
    );
  }

  if (error) {
    return (
      <SectionCard title="OpenAI Tokenverbrauch" description="Kosten und Nutzung der KI-Generierung">
        <p className="text-sm text-red-600">{error}</p>
      </SectionCard>
    );
  }

  if (!data) return null;

  const { totals, usdToEur, dailyThisMonth } = data;
  const monthAvgTokens =
    totals.thisMonth.requests > 0
      ? Math.round(totals.thisMonth.totalTokens / totals.thisMonth.requests)
      : 0;
  const monthAvgCostUsd =
    totals.thisMonth.requests > 0
      ? totals.thisMonth.costUsd / totals.thisMonth.requests
      : 0;
  const maxDailyTokens = Math.max(...dailyThisMonth.map((day) => day.totalTokens), 1);

  return (
    <SectionCard
      title="OpenAI Tokenverbrauch"
      description="Geschätzte Kosten basierend auf gespeicherten Token-Zahlen pro Generierung."
      className="mt-8"
    >
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <Badge
          className={
            data.openAiConfigured
              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
              : "bg-amber-100 text-amber-800 hover:bg-amber-100"
          }
        >
          {data.openAiConfigured ? "API-Key aktiv" : "Mock-Modus (kein API-Key)"}
        </Badge>
        <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">
          Modell: {data.model}
        </Badge>
        <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">
          ${data.pricing.inputPer1M}/1M Input · ${data.pricing.outputPer1M}/1M Output
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Token diesen Monat"
          value={formatTokens(totals.thisMonth.totalTokens)}
          hint={`${formatTokens(totals.thisMonth.requests)} API-Aufrufe`}
        />
        <StatTile
          label="Kosten diesen Monat"
          value={formatEur(totals.thisMonth.costUsd, usdToEur)}
          hint={`≈ ${formatUsd(totals.thisMonth.costUsd)}`}
        />
        <StatTile
          label="Token gesamt"
          value={formatTokens(totals.allTime.totalTokens)}
          hint={`${formatTokens(totals.allTime.requests)} API-Aufrufe`}
        />
        <StatTile
          label="Kosten gesamt"
          value={formatEur(totals.allTime.costUsd, usdToEur)}
          hint={`≈ ${formatUsd(totals.allTime.costUsd)}`}
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <StatTile
          label="Ø Token pro Zeugnis (Monat)"
          value={formatTokens(monthAvgTokens)}
        />
        <StatTile
          label="Ø Kosten pro Zeugnis (Monat)"
          value={formatEur(monthAvgCostUsd, usdToEur)}
          hint={`≈ ${formatUsd(monthAvgCostUsd)}`}
        />
        <StatTile
          label="Mock-Generierungen (Monat)"
          value={String(data.mockGenerationsThisMonth)}
          hint="Ohne OpenAI-Aufruf"
        />
      </div>

      {dailyThisMonth.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-semibold text-slate-900">Verbrauch im laufenden Monat</h3>
          <ul className="mt-4 space-y-3">
            {dailyThisMonth.map((day) => (
              <li key={day.date}>
                <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                  <span>{new Date(day.date).toLocaleDateString("de-DE")}</span>
                  <span>
                    {formatTokens(day.totalTokens)} Token · {formatEur(day.costUsd, usdToEur)}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-violet-500"
                    style={{ width: `${Math.max((day.totalTokens / maxDailyTokens) * 100, 4)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.recent.length > 0 && (
        <div className="mt-8 overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase text-slate-500">
                <th className="p-3">Zeitpunkt</th>
                <th className="p-3">Nutzer</th>
                <th className="p-3">Token</th>
                <th className="p-3">Kosten</th>
              </tr>
            </thead>
            <tbody>
              {data.recent.map((entry) => (
                <tr key={entry.id} className="border-b border-slate-50">
                  <td className="p-3 text-slate-600">
                    {new Date(entry.createdAt).toLocaleString("de-DE")}
                  </td>
                  <td className="p-3">
                    <p className="font-medium text-slate-900">
                      {entry.userName || entry.userEmail || "Unbekannt"}
                    </p>
                    {entry.userName && entry.userEmail && (
                      <p className="text-xs text-slate-500">{entry.userEmail}</p>
                    )}
                  </td>
                  <td className="p-3">{formatTokens(entry.totalTokens ?? 0)}</td>
                  <td className="p-3">
                    {formatEur(entry.costUsd ?? 0, usdToEur)}
                    <span className="ml-1 text-xs text-slate-400">
                      ({formatUsd(entry.costUsd ?? 0)})
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!data.openAiConfigured && totals.allTime.requests === 0 && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Es ist kein OpenAI API-Key hinterlegt. Generierungen laufen im Mock-Modus – es fallen
            keine API-Kosten an und es werden keine Token protokolliert.
          </p>
        </div>
      )}

      {data.openAiConfigured && totals.allTime.requests === 0 && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          <Coins className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Noch keine OpenAI-Generierungen protokolliert. Token und Kosten erscheinen ab der
            nächsten echten API-Generierung.
          </p>
        </div>
      )}

      <p className="mt-4 text-xs text-slate-400">
        Kosten sind Schätzwerte anhand der OpenAI-Preisliste für {data.model}. EUR-Werte nutzen
        einen Umrechnungskurs von {usdToEur.toLocaleString("de-DE")} (OPENAI_USD_TO_EUR).
      </p>
    </SectionCard>
  );
}
