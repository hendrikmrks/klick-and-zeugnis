"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CertificateReportDetails } from "@/lib/certificate-report-details";
import { ChevronDown, ChevronUp, Download } from "lucide-react";

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
  details?: CertificateReportDetails;
};

function statusBadge(status: string) {
  const map: Record<string, string> = {
    Pending: "bg-amber-100 text-amber-800",
    Reviewed: "bg-green-100 text-green-800",
  };
  return (
    <Badge className={cn("hover:bg-inherit", map[status] ?? "bg-slate-100 text-slate-700")}>
      {status === "Pending" ? "Offen" : "Bearbeitet"}
    </Badge>
  );
}

function formatDateTime(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("de-DE");
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</h4>
      <div className="rounded-lg border border-slate-100 bg-white p-3 text-sm text-slate-700">
        {children}
      </div>
    </div>
  );
}

function PromptBlock({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-md bg-slate-50 p-2 text-xs leading-relaxed text-slate-700">
        {value}
      </pre>
    </div>
  );
}

type Props = {
  report: CertReport;
  feedbackDraft: string;
  onFeedbackChange: (value: string) => void;
  onFeedbackSubmit: () => void;
};

export default function AdminReportCard({
  report: rep,
  feedbackDraft,
  onFeedbackChange,
  onFeedbackSubmit,
}: Props) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const details = rep.details;
  const input = details?.userInput;
  const prompts = details?.prompts;
  const generation = details?.generation;

  const handleDownload = () => {
    window.location.href = `/api/admin/certificate-reports/${rep.id}/export`;
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-900">
            {rep.user.firstName} {rep.user.lastName} ({rep.user.email})
          </p>
          <p className="text-xs text-slate-400">
            Gemeldet am {formatDateTime(rep.createdAt)}
          </p>
          {rep.studentName && (
            <p className="text-sm text-slate-500">Schüler/in: {rep.studentName}</p>
          )}
          {rep.reason && (
            <p className="mt-2 text-sm">
              <span className="font-medium">Grund:</span> {rep.reason}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {statusBadge(rep.status)}
          <Button type="button" variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-3.5 w-3.5 shrink-0" />
            JSON
          </Button>
        </div>
      </div>

      <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm leading-relaxed text-slate-700">
        {rep.text}
      </p>

      <div className="mt-4 border-t border-slate-100 pt-4">
        <button
          type="button"
          className="flex w-full items-center justify-between gap-2 text-left text-sm font-medium text-slate-700 hover:text-slate-900"
          onClick={() => setDetailsOpen((open) => !open)}
        >
          <span>Generierungsdetails</span>
          {detailsOpen ? (
            <ChevronUp className="h-4 w-4 shrink-0 text-slate-400" />
          ) : (
            <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
          )}
        </button>

        {detailsOpen && (
          <div className="mt-3 space-y-4">
            {!details ? (
              <p className="text-sm text-slate-500">Keine Zusatzdetails verfügbar.</p>
            ) : (
              <>
                {input && (
                  <DetailSection title="Nutzer-Eingaben">
                    <dl className="grid gap-2 sm:grid-cols-2">
                      <div>
                        <dt className="text-xs text-slate-500">Name</dt>
                        <dd>{input.name ?? "—"}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-slate-500">Geschlecht</dt>
                        <dd>{input.gender ?? "—"}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-slate-500">Klasse / Stufe</dt>
                        <dd>{input.grade ?? "—"}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-slate-500">Stil-Preset</dt>
                        <dd>{input.style ?? "—"}</dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-xs text-slate-500">Sozialverhalten</dt>
                        <dd>{input.socialSkills.length > 0 ? input.socialSkills.join(", ") : "—"}</dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-xs text-slate-500">Rollen</dt>
                        <dd>{input.roles.length > 0 ? input.roles.join(", ") : "—"}</dd>
                      </div>
                    </dl>
                  </DetailSection>
                )}

                {(prompts?.system || prompts?.user) && (
                  <DetailSection title="Prompts">
                    <div className="space-y-3">
                      <PromptBlock label="System-Prompt" value={prompts.system} />
                      <PromptBlock label="User-Prompt" value={prompts.user} />
                    </div>
                  </DetailSection>
                )}

                {generation && (
                  <DetailSection title="Generierung">
                    <dl className="grid gap-2 sm:grid-cols-2">
                      <div>
                        <dt className="text-xs text-slate-500">Generiert am</dt>
                        <dd>{formatDateTime(generation.generatedAt)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-slate-500">Client-IP</dt>
                        <dd>{generation.clientIp ?? "—"}</dd>
                      </div>
                      {generation.openAiModel && (
                        <div>
                          <dt className="text-xs text-slate-500">OpenAI-Modell</dt>
                          <dd>{generation.openAiModel}</dd>
                        </div>
                      )}
                      {generation.openAiTotalTokens != null && (
                        <div>
                          <dt className="text-xs text-slate-500">Tokens</dt>
                          <dd>
                            {generation.openAiPromptTokens ?? 0} Prompt /{" "}
                            {generation.openAiCompletionTokens ?? 0} Completion (
                            {generation.openAiTotalTokens} gesamt)
                          </dd>
                        </div>
                      )}
                      {generation.openAiCostUsd != null && (
                        <div>
                          <dt className="text-xs text-slate-500">Kosten (USD)</dt>
                          <dd>{generation.openAiCostUsd.toFixed(6)}</dd>
                        </div>
                      )}
                      {generation.generatedCertificateId && (
                        <div className="sm:col-span-2">
                          <dt className="text-xs text-slate-500">Generierungs-ID</dt>
                          <dd className="break-all font-mono text-xs">
                            {generation.generatedCertificateId}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </DetailSection>
                )}

                {!input && !prompts?.system && !prompts?.user && !generation && (
                  <p className="text-sm text-slate-500">
                    Für diese Meldung sind keine Generierungsdetails gespeichert (z. B. älteres
                    Zeugnis vor dem Update).
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {rep.status === "Pending" ? (
        <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
          <textarea
            placeholder="Feedback an den Nutzer …"
            className="w-full rounded-lg border border-slate-200 p-2 text-sm"
            value={feedbackDraft}
            onChange={(e) => onFeedbackChange(e.target.value)}
          />
          <Button size="sm" onClick={onFeedbackSubmit}>
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
  );
}
