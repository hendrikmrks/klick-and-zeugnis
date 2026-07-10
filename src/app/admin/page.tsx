"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import LoadingState from "@/components/layout/LoadingState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Alert from "@/components/layout/Alert";
import { cn } from "@/lib/utils";
import { SUBSCRIPTION_LEVELS } from "@/lib/subscription";
import {
  ClipboardList,
  FileWarning,
  Shield,
  Users,
} from "lucide-react";
import OpenAiUsageSection, {
  type OpenAiUsageData,
} from "@/components/admin/OpenAiUsageSection";

type Tab = "overview" | "subscriptions" | "users" | "reports";

type Stats = { pendingRequests: number; pendingReports: number; users: number };

type SubRequest = {
  id: string;
  requestedLevel: string;
  message: string | null;
  status: string;
  adminNote: string | null;
  billingEmail: string | null;
  billingName: string | null;
  billingStreet: string | null;
  billingZip: string | null;
  billingCity: string | null;
  billingCountry: string | null;
  createdAt: string;
  user: {
    id: string;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    subscriptionLevel: string;
  };
};

type AdminUser = {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  subscriptionLevel: string;
  role: string;
  createdAt: string;
  _count: { certificates: number };
};

type CertReport = {
  id: string;
  studentName: string | null;
  text: string;
  reason: string | null;
  status: string;
  adminFeedback: string | null;
  createdAt: string;
  user: {
    id: string;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
  };
};

const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "overview", label: "Übersicht", icon: Shield },
  { id: "subscriptions", label: "Abo-Anfragen", icon: ClipboardList },
  { id: "users", label: "Nutzer", icon: Users },
  { id: "reports", label: "Zeugnis-Meldungen", icon: FileWarning },
];

function statusBadge(status: string) {
  const map: Record<string, string> = {
    Pending: "bg-amber-100 text-amber-800",
    Approved: "bg-green-100 text-green-800",
    Rejected: "bg-red-100 text-red-800",
    Reviewed: "bg-green-100 text-green-800",
  };
  return (
    <Badge className={cn("hover:bg-inherit", map[status] ?? "bg-slate-100 text-slate-700")}>
      {status === "Pending" ? "Offen" : status === "Approved" ? "Genehmigt" : status === "Rejected" ? "Abgelehnt" : "Bearbeitet"}
    </Badge>
  );
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<Stats | null>(null);
  const [requests, setRequests] = useState<SubRequest[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [reports, setReports] = useState<CertReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [feedbackDraft, setFeedbackDraft] = useState<Record<string, string>>({});
  const [noteDraft, setNoteDraft] = useState<Record<string, string>>({});
  const [openAiUsage, setOpenAiUsage] = useState<OpenAiUsageData | null>(null);
  const [openAiUsageError, setOpenAiUsageError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [statsRes, reqRes, usersRes, repRes, usageRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/subscription-requests"),
        fetch("/api/admin/users"),
        fetch("/api/admin/certificate-reports"),
        fetch("/api/admin/openai-usage"),
      ]);
      if (!statsRes.ok || !reqRes.ok || !usersRes.ok || !repRes.ok) {
        throw new Error("Admin-Daten konnten nicht geladen werden.");
      }
      setStats(await statsRes.json());
      setRequests((await reqRes.json()).requests);
      setUsers((await usersRes.json()).users);
      setReports((await repRes.json()).reports);

      if (usageRes.ok) {
        setOpenAiUsage(await usageRes.json());
        setOpenAiUsageError(null);
      } else {
        setOpenAiUsage(null);
        setOpenAiUsageError("OpenAI-Nutzungsdaten konnten nicht geladen werden.");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Laden fehlgeschlagen.";
      setLoadError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "loading") return;
    if (session?.user?.role !== "Admin") {
      router.replace("/dashboard");
      return;
    }
    load();
  }, [session, status, router, load]);

  if (status === "loading" || (session?.user?.role !== "Admin" && status === "authenticated")) {
    return <LoadingState label="Admin-Bereich wird geladen…" />;
  }

  if (session?.user?.role !== "Admin") return null;

  const handleRequestAction = async (id: string, action: "approve" | "reject") => {
    await fetch(`/api/admin/subscription-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, adminNote: noteDraft[id] ?? "" }),
    });
    load();
  };

  const handleUserLevel = async (userId: string, subscriptionLevel: string) => {
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscriptionLevel }),
    });
    load();
  };

  const handleReportFeedback = async (id: string) => {
    const adminFeedback = feedbackDraft[id];
    if (!adminFeedback?.trim()) return;
    await fetch(`/api/admin/certificate-reports/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminFeedback }),
    });
    setFeedbackDraft((d) => ({ ...d, [id]: "" }));
    load();
  };

  return (
    <PageContainer>
      <PageHeader
        title="Admin-Bereich"
        description="Abonnements verwalten, Nutzer betreuen und gemeldete Zeugnistexte prüfen."
      />

      {loadError && <Alert variant="error">{loadError}</Alert>}

      <div
        className="mb-6 inline-flex max-w-full flex-wrap gap-1 rounded-xl bg-slate-100 p-1"
        role="tablist"
        aria-label="Admin-Bereiche"
      >
        {tabs.map(({ id, label, icon: Icon }) => (
          <Button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            size="sm"
            variant={tab === id ? "default" : "ghost"}
            className={cn(
              "rounded-lg",
              tab !== id && "text-slate-600 hover:bg-white/80 hover:text-slate-900"
            )}
            onClick={() => setTab(id)}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Button>
        ))}
      </div>

      {loading ? (
        <LoadingState />
      ) : tab === "overview" ? (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Offene Abo-Anfragen</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{stats?.pendingRequests ?? 0}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Offene Zeugnis-Meldungen</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{stats?.pendingReports ?? 0}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Registrierte Nutzer</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{stats?.users ?? 0}</p>
            </div>
          </div>

          <OpenAiUsageSection
            data={openAiUsage}
            error={openAiUsageError}
          />
        </>
      ) : tab === "subscriptions" ? (
        <div className="space-y-4">
          {requests.length === 0 ? (
            <p className="text-slate-500">Keine Abo-Anfragen vorhanden.</p>
          ) : (
            requests.map((req) => (
              <div key={req.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {req.user.firstName} {req.user.lastName}
                    </p>
                    <p className="text-sm text-slate-500">{req.user.email}</p>
                    <p className="mt-2 text-sm">
                      <span className="text-slate-500">Aktuell:</span> {req.user.subscriptionLevel}
                      {" → "}
                      <span className="font-medium text-blue-700">{req.requestedLevel}</span>
                    </p>
                {req.billingEmail && (
                  <p className="mt-2 text-sm text-slate-600">
                    Rechnung an: {req.billingName}, {req.billingStreet},{" "}
                    {req.billingZip} {req.billingCity}, {req.billingCountry ?? "Deutschland"}{" "}
                    ({req.billingEmail})
                  </p>
                )}
                    {req.message && (
                      <p className="mt-2 text-sm text-slate-600">Nachricht: {req.message}</p>
                    )}
                  </div>
                  {statusBadge(req.status)}
                </div>
                {req.status === "Pending" && (
                  <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
                    <textarea
                      placeholder="Optionale Notiz an den Nutzer …"
                      className="w-full rounded-lg border border-slate-200 p-2 text-sm"
                      value={noteDraft[req.id] ?? ""}
                      onChange={(e) => setNoteDraft((d) => ({ ...d, [req.id]: e.target.value }))}
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleRequestAction(req.id, "approve")}
                      >
                        Genehmigen
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600"
                        onClick={() => handleRequestAction(req.id, "reject")}
                      >
                        Ablehnen
                      </Button>
                    </div>
                  </div>
                )}
                {req.adminNote && (
                  <p className="mt-3 text-sm text-slate-500">Admin-Notiz: {req.adminNote}</p>
                )}
              </div>
            ))
          )}
        </div>
      ) : tab === "users" ? (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                <th className="p-3">Nutzer</th>
                <th className="p-3">Tarif</th>
                <th className="p-3">Zeugnisse</th>
                <th className="p-3">Tarif ändern</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-slate-100">
                  <td className="p-3">
                    <p className="font-medium">{u.firstName} {u.lastName}</p>
                    <p className="text-slate-500">{u.email}</p>
                    {u.role === "Admin" && (
                      <Badge className="mt-1 bg-violet-100 text-violet-700 hover:bg-violet-100">Admin</Badge>
                    )}
                  </td>
                  <td className="p-3">{u.subscriptionLevel}</td>
                  <td className="p-3">{u._count.certificates}</td>
                  <td className="p-3">
                    <select
                      className="rounded-lg border border-slate-200 px-2 py-1"
                      value={u.subscriptionLevel}
                      onChange={(e) => handleUserLevel(u.id, e.target.value)}
                    >
                      {SUBSCRIPTION_LEVELS.map((level) => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.length === 0 ? (
            <p className="text-slate-500">Keine Meldungen vorhanden.</p>
          ) : (
            reports.map((rep) => (
              <div key={rep.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {rep.user.firstName} {rep.user.lastName} ({rep.user.email})
                    </p>
                    {rep.studentName && (
                      <p className="text-sm text-slate-500">Schüler/in: {rep.studentName}</p>
                    )}
                    {rep.reason && (
                      <p className="mt-2 text-sm"><span className="font-medium">Grund:</span> {rep.reason}</p>
                    )}
                  </div>
                  {statusBadge(rep.status)}
                </div>
                <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm leading-relaxed text-slate-700">
                  {rep.text}
                </p>
                {rep.status === "Pending" ? (
                  <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                    <textarea
                      placeholder="Feedback an den Nutzer …"
                      className="w-full rounded-lg border border-slate-200 p-2 text-sm"
                      value={feedbackDraft[rep.id] ?? ""}
                      onChange={(e) => setFeedbackDraft((d) => ({ ...d, [rep.id]: e.target.value }))}
                    />
                    <Button size="sm" onClick={() => handleReportFeedback(rep.id)}>
                      Feedback senden
                    </Button>
                  </div>
                ) : (
                  rep.adminFeedback && (
                    <p className="mt-3 rounded-lg bg-blue-50 p-3 text-sm text-blue-900">
                      <span className="font-medium">Feedback an Nutzer:</span> {rep.adminFeedback}
                    </p>
                  )
                )}
              </div>
            ))
          )}
        </div>
      )}
    </PageContainer>
  );
}
