"use client";

import React, { useState, useCallback } from "react";
import Card from "@/components/Card";
import GenerateCertificate from "@/components/certificate/GenerateCertificate";
import UsageSummary from "@/components/usage/UsageSummary";
import CertificateViewer from "@/components/CertificateViewer";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import LoadingState from "@/components/layout/LoadingState";
import { useMe } from "@/lib/hooks/useMe";
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
  const { user, isLoading, isError } = useMe();

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
  const { generateCertificate, certificate, loading, error, setError } = useGenerateCertificate();
  const [usageKey, setUsageKey] = useState(0);
  const [usage, setUsage] = useState<UsageData | null>(null);

  const handleUsage = useCallback((data: UsageData) => {
    setUsage(data);
    if (data.monthGenerated >= data.monthLimit && error !== "LIMIT_REACHED" && !loading) {
      setError("LIMIT_REACHED");
    } else if (data.monthGenerated < data.monthLimit && error === "LIMIT_REACHED") {
      setError(null);
    }
  }, [error, loading, setError]);

  if (isLoading) return <LoadingState />;
  if (isError || !user) return <p className="p-8 text-center text-slate-600">Nicht eingeloggt</p>;

  const handleClear = () => window.location.reload();

  const handleLimit = () => {
    router.push("/subscription");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    if (result && typeof result === "string") setUsageKey((k) => k + 1);
  };

  const canUseClasses = hasClassOrganization(user.subscriptionLevel);

  const handleSave = async () => {
    if (usage && usage.monthSaved >= usage.saveLimit) {
      handleLimit();
      return;
    }
    if (!certificate) return;
    try {
      const res = await fetch("/api/certificate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: certificate, name, gender, grade, schoolYear,
          className: canUseClasses ? className : undefined,
          socialSkills: Object.entries(socialSkills).map(([k, v]) => `${k}: ${v}`),
          roles: Object.entries(roles).filter(([, v]) => v).map(([k]) => k),
        }),
      });
      if (!res.ok) throw new Error(`Fehler: ${res.status}`);
      setUsageKey((k) => k + 1);
    } catch (err: unknown) {
      console.error(err);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title={`Hallo, ${user.firstName ?? "Lehrkraft"}!`}
        description="Erstelle individuelle Zeugnistexte für deine Schülerinnen und Schüler."
      >
        <Badge variant="secondary">{user.subscriptionLevel}-Tarif</Badge>
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
            canSave={Boolean(certificate)}
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
