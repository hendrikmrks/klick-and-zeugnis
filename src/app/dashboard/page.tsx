"use client";

import React, { useState, useCallback } from "react";
import Card from "@/components/Card";
import GenerateCertificate from "@/components/certificate/GenerateCertificate";
import UsageSummary from "@/components/usage/UsageSummary";
import CertificateViewer from "@/components/CertificateViewer";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import LoadingState from "@/components/layout/LoadingState";
import { useRequireAuth } from "@/lib/hooks/useRequireAuth";
import { useGenerateCertificate } from "@/lib/hooks/useGenerateCertificate";
import { useRouter } from "next/navigation";
import type { UsageData } from "@/types/app";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { getCurrentSchoolYear } from "@/lib/schoolYear";
import { hasClassOrganization } from "@/lib/subscription";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useRequireAuth();

  const [name, setName] = useState("Max Mustermann");
  const [gender, setGender] = useState("männlich");
  const [grade, setGrade] = useState("3");
  const [schoolYear, setSchoolYear] = useState(getCurrentSchoolYear);
  const [className, setClassName] = useState("");
  const [socialSkills, setSocialSkills] = useState<Record<string, number>>({
    Motivation: 4,
    Anstrengungsbereitschaft: 4,
    Ausdauer: 4,
    Konzentrationsfähigkeit: 4,
    Sorgfalt: 4,
    Selbstständigkeit: 4,
    Konfliktfähigkeit: 4,
    Kompromissbereitschaft: 4,
  });
  const [roles, setRoles] = useState<Record<string, boolean>>({
    Klassensprecher: false,
    Sportwart: false,
  });
  const {
    generateCertificate,
    certificate,
    generatedId,
    loading,
    error,
    setError,
    clearCertificate,
  } = useGenerateCertificate();
  const [usageKey, setUsageKey] = useState(0);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleUsage = useCallback((data: UsageData) => {
    setUsage(data);
    if (data.monthGenerated >= data.monthLimit && error !== "LIMIT_REACHED" && !loading) {
      setError("LIMIT_REACHED");
    } else if (data.monthGenerated < data.monthLimit && error === "LIMIT_REACHED") {
      setError(null);
    }
  }, [error, loading, setError]);

  if (isLoading || !isAuthenticated || !user) return <LoadingState />;

  const subscriptionLevel = usage?.subscriptionLevel ?? user.subscriptionLevel;
  const canUseClasses = hasClassOrganization(subscriptionLevel);

  const handleClear = () => {
    clearCertificate();
    setSaveError(null);
    setSaveSuccess(false);
  };

  const handleLimit = () => {
    router.push("/subscription");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    setSaveSuccess(false);
    if (usage && usage.monthGenerated >= usage.monthLimit) {
      handleLimit();
      return;
    }
    const selectedSocialSkills = Object.entries(socialSkills).map(([skill, level]) => `${skill}: ${level}`);
    const selectedRoles = Object.entries(roles).filter(([, active]) => active).map(([role]) => role);
    const result = await generateCertificate({
      name, gender, grade,
      socialSkills: selectedSocialSkills,
      roles: selectedRoles,
    });
    if (result) setUsageKey((k) => k + 1);
  };

  const handleSave = async () => {
    setSaveError(null);
    setSaveSuccess(false);
    if (usage && usage.totalSaved >= usage.saveLimit) {
      handleLimit();
      return;
    }
    if (!certificate || !generatedId) {
      setSaveError("Bitte generiere zuerst ein Zeugnis.");
      return;
    }
    try {
      const res = await fetch("/api/certificate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: certificate,
          generatedId,
          name,
          gender,
          grade,
          schoolYear,
          className: canUseClasses ? className : undefined,
          socialSkills: Object.entries(socialSkills).map(([k, v]) => `${k}: ${v}`),
          roles: Object.entries(roles).filter(([, v]) => v).map(([k]) => k),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.error === "string" ? data.error : `Speichern fehlgeschlagen (${res.status})`
        );
      }
      setSaveSuccess(true);
      clearCertificate();
      setUsageKey((k) => k + 1);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Speichern fehlgeschlagen.";
      setSaveError(message);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title={`Hallo, ${user.firstName ?? "Lehrkraft"}!`}
        description="Erstelle individuelle Zeugnistexte für deine Schülerinnen und Schüler."
      >
        <Badge variant="secondary">{subscriptionLevel}-Tarif</Badge>
      </PageHeader>

      {error === "LIMIT_REACHED" && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <p className="font-medium text-amber-900">Monatslimit erreicht</p>
            <p className="mt-1 text-sm text-amber-800">
              Upgrade dein Abo für mehr Zeugnisse.{" "}
              <Link href="/subscription" className="font-medium underline">Tarife ansehen</Link>
            </p>
          </div>
        </div>
      )}

      {saveError && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {saveError}
        </div>
      )}

      {saveSuccess && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          Zeugnis erfolgreich gespeichert.
        </div>
      )}

      <div className="grid items-start gap-6 xl:grid-cols-12">
        <Card title="Zeugnis erstellen" className="xl:col-span-4">
          <GenerateCertificate
            handleSubmit={handleSubmit}
            name={name} setName={setName}
            gender={gender} setGender={setGender}
            grade={grade} setGrade={setGrade}
            schoolYear={schoolYear} setSchoolYear={setSchoolYear}
            roles={roles} setRoles={setRoles}
            socialSkills={socialSkills} setSocialSkills={setSocialSkills}
            loading={loading}
          />
        </Card>

        <Card title="Vorschau" className="xl:col-span-5">
          <CertificateViewer
            content={certificate ?? ""}
            placeholder="Generiere links ein neues Zeugnis – der Text erscheint hier."
            onClear={handleClear}
            onSave={handleSave}
            canSave={Boolean(certificate && generatedId)}
            studentName={name}
            canUseClasses={canUseClasses}
            className={className}
            onClassNameChange={setClassName}
          />
        </Card>

        <Card title="Nutzung" className="xl:col-span-3">
          <UsageSummary key={usageKey} onUsage={handleUsage} />
        </Card>
      </div>
    </PageContainer>
  );
}
