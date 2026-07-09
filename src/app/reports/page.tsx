"use client";

import { useEffect, useState } from "react";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import LoadingState from "@/components/layout/LoadingState";
import SavedCertificatesTable from "@/components/SavedCertificate/SavedCertificatesTable";
import { useRequireAuth } from "@/lib/hooks/useRequireAuth";
import { hasClassOrganization } from "@/lib/subscription";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

type UserReport = {
  id: string;
  studentName: string | null;
  text: string;
  reason: string | null;
  status: string;
  adminFeedback: string | null;
  reviewedAt: string | null;
  createdAt: string;
};

export default function ReportsPage() {
  const { user, isLoading, isAuthenticated } = useRequireAuth();
  const [userReports, setUserReports] = useState<UserReport[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [classFilter, setClassFilter] = useState<string | null>(null);
  const [reloadSignal, setReloadSignal] = useState(0);

  const classOrganizationEnabled = user ? hasClassOrganization(user.subscriptionLevel) : false;

  useEffect(() => {
    if (!isAuthenticated) return;
    fetch("/api/certificate/report")
      .then((r) => (r.ok ? r.json() : { reports: [] }))
      .then((d) => setUserReports(d.reports ?? []));
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !classOrganizationEnabled) return;
    fetch("/api/certificate/classes")
      .then((r) => (r.ok ? r.json() : { classes: [] }))
      .then((d) => setClasses(d.classes ?? []));
  }, [isAuthenticated, classOrganizationEnabled, reloadSignal]);

  if (isLoading || !isAuthenticated || !user) return <LoadingState label="Zeugnisse werden geladen…" />;

  const filterOptions: { value: string | null; label: string }[] = [
    { value: null, label: "Alle Klassen" },
    ...classes.map((c) => ({ value: c, label: c })),
    { value: "__none__", label: "Ohne Klasse" },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Gespeicherte Zeugnisse"
        description={
          classOrganizationEnabled
            ? "Zeugnisse nach Klassen geordnet – filtern, bearbeiten oder melden."
            : "Alle deine gespeicherten Zeugnistexte an einem Ort – kopieren, melden oder löschen."
        }
      >
        <Button asChild>
          <Link href="/dashboard">
            <Plus className="h-4 w-4" />
            Neues Zeugnis
          </Link>
        </Button>
      </PageHeader>

      {classOrganizationEnabled ? (
        <div className="mb-4 flex flex-wrap gap-2">
          {filterOptions.map((opt) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => setClassFilter(opt.value)}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                classFilter === opt.value
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      ) : (
        <p className="mb-4 rounded-xl border border-blue-100 bg-blue-50/50 px-4 py-3 text-sm text-slate-600">
          Ab Premium kannst du Zeugnisse Klassen zuordnen und danach sortieren.{" "}
          <Link href="/subscription" className="font-medium text-blue-600 hover:underline">
            Tarif anfragen
          </Link>
        </p>
      )}

      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm md:p-6">
        <SavedCertificatesTable
          reloadSignal={reloadSignal}
          classFilter={classFilter}
          classOrganizationEnabled={classOrganizationEnabled}
          onDataChange={() => setReloadSignal((s) => s + 1)}
        />
      </div>

      {userReports.length > 0 && (
        <section className="mt-8 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Deine Meldungen & Feedback</h2>
          <ul className="space-y-4">
            {userReports.map((rep) => (
              <li key={rep.id} className="rounded-xl border border-slate-100 p-4">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  {rep.studentName && <span className="font-medium">{rep.studentName}</span>}
                  <Badge variant="outline">
                    {rep.status === "Pending" ? "In Prüfung" : "Bearbeitet"}
                  </Badge>
                  <span className="text-slate-500">
                    {new Date(rep.createdAt).toLocaleDateString("de-DE")}
                  </span>
                </div>
                {rep.reason && (
                  <p className="mt-2 text-sm text-slate-600">Grund: {rep.reason}</p>
                )}
                {rep.adminFeedback ? (
                  <p className="mt-3 rounded-lg bg-blue-50 p-3 text-sm text-blue-900">
                    <span className="font-medium">Feedback vom Team:</span> {rep.adminFeedback}
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">Noch kein Feedback – wir prüfen deine Meldung.</p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </PageContainer>
  );
}
