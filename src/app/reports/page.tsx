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
import Alert from "@/components/layout/Alert";
import SectionCard from "@/components/layout/SectionCard";
import { PrivacyAdvancedKeyUploadPanel } from "@/components/settings/PrivacyAdvancedSection";
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
        <Button asChild size="sm">
          <Link href="/dashboard">
            <Plus className="h-4 w-4" />
            Neues Zeugnis
          </Link>
        </Button>
      </PageHeader>

      {user.privacyAdvancedModeEnabled && (
        <div className="mb-4">
          <PrivacyAdvancedKeyUploadPanel onUploaded={() => setReloadSignal((s) => s + 1)} />
        </div>
      )}

      {classOrganizationEnabled ? (
        <div className="mb-4 flex flex-wrap gap-2">
          {filterOptions.map((opt) => (
            <Button
              key={opt.label}
              type="button"
              size="sm"
              variant={classFilter === opt.value ? "default" : "secondary"}
              className="rounded-full"
              onClick={() => setClassFilter(opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      ) : (
        <Alert variant="info" className="mb-4">
          Ab Premium kannst du Zeugnisse Klassen zuordnen und danach sortieren.{" "}
          <Link href="/subscription" className="font-medium underline">
            Tarif anfragen
          </Link>
        </Alert>
      )}

      <SectionCard>
        <SavedCertificatesTable
          reloadSignal={reloadSignal}
          classFilter={classFilter}
          classOrganizationEnabled={classOrganizationEnabled}
          onDataChange={() => setReloadSignal((s) => s + 1)}
        />
      </SectionCard>

      {userReports.length > 0 && (
        <SectionCard title="Deine Meldungen & Feedback" className="mt-8">
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
        </SectionCard>
      )}
    </PageContainer>
  );
}
