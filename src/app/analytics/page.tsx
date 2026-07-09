"use client";

import { useEffect, useState } from "react";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import LoadingState from "@/components/layout/LoadingState";
import UsageProgress from "@/components/usage/UsageProgress";
import { useRequireAuth } from "@/lib/hooks/useRequireAuth";
import type { UsageData } from "@/types/app";
import Link from "next/link";
import { BarChart3, FileText, Sparkles, Type } from "lucide-react";
import { Button } from "@/components/ui/button";

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  accent = "blue",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint?: string;
  accent?: "blue" | "violet" | "emerald" | "amber";
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    violet: "bg-violet-50 text-violet-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <div className={`mb-4 inline-flex rounded-xl p-3 ${colors[accent]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
      {hint && <p className="mt-2 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

function formatLimit(val: number) {
  return val === Number.MAX_SAFE_INTEGER ? "∞" : String(val);
}

export default function AnalyticsPage() {
  const { user, isLoading, isAuthenticated } = useRequireAuth();
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loadingUsage, setLoadingUsage] = useState(true);
  const [usageError, setUsageError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    fetch("/api/usage")
      .then(async (res) => {
        if (!res.ok) throw new Error(`Fehler: ${res.status}`);
        return res.json() as Promise<UsageData>;
      })
      .then((data) => setUsage(data))
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : "Statistiken konnten nicht geladen werden.";
        setUsageError(message);
      })
      .finally(() => setLoadingUsage(false));
  }, [isAuthenticated]);

  if (isLoading || !isAuthenticated || !user) return <LoadingState label="Statistiken werden geladen…" />;
  if (loadingUsage) return <LoadingState label="Statistiken werden geladen…" />;
  if (usageError) {
    return (
      <PageContainer>
        <p className="p-8 text-center text-red-600">{usageError}</p>
      </PageContainer>
    );
  }
  if (!usage) return <p className="p-8 text-center text-slate-600">Keine Daten verfügbar</p>;

  const planLabel = usage.subscriptionLevel ?? user.subscriptionLevel ?? "Free";

  return (
    <PageContainer>
      <PageHeader
        title="Analysen"
        description={`Überblick über deine Nutzung im ${planLabel}-Tarif.`}
      >
        <Button variant="outline" asChild>
          <Link href="/subscription">Tarif upgraden</Link>
        </Button>
      </PageHeader>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Sparkles}
          label="Generiert diesen Monat"
          value={`${usage.monthGenerated} / ${formatLimit(usage.monthLimit)}`}
          hint="Zeugnisse per KI erstellt"
          accent="blue"
        />
        <StatCard
          icon={FileText}
          label="Gespeichert"
          value={`${usage.totalSaved} / ${formatLimit(usage.saveLimit)}`}
          hint="Dauerhaft gespeicherte Zeugnisse"
          accent="violet"
        />
        <StatCard
          icon={Type}
          label="Wörter gesamt"
          value={usage.totalWords.toLocaleString("de-DE")}
          hint="In allen generierten Texten"
          accent="emerald"
        />
        <StatCard
          icon={BarChart3}
          label="Ø Wörter pro Zeugnis"
          value={usage.avgWords.toLocaleString("de-DE")}
          hint={`${usage.totalGenerated} Zeugnisse insgesamt`}
          accent="amber"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Monatslimit Generierung</h2>
          <p className="mt-1 text-sm text-slate-500">Verbrauch deines aktuellen Abos</p>
          <div className="mt-6">
            <UsageProgress
              label="Generiert"
              value={usage.monthGenerated}
              max={usage.monthLimit}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Speicherlimit</h2>
          <p className="mt-1 text-sm text-slate-500">Gespeicherte Zeugnisse in deinem Tarif</p>
          <div className="mt-6">
            <UsageProgress
              label="Gespeichert"
              value={usage.totalSaved}
              max={usage.saveLimit}
            />
          </div>
        </section>
      </div>
    </PageContainer>
  );
}
