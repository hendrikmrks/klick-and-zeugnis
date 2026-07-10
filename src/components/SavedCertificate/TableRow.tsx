"use client";

import { useState } from "react";
import type { CertificateRecord } from "@/types/app";
import ActionButton from "./ActionButton";
import ReportCertificateButton from "@/components/certificate/ReportCertificateButton";
import { downloadCertificatePdf } from "@/lib/export-certificate-pdf";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";

function formatDate(isoDate: string) {
  const d = new Date(isoDate);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
}

function CertificateActions({
  cert,
  onDelete,
}: {
  cert: CertificateRecord;
  onDelete: () => void;
}) {
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(cert.text);
  };

  const handlePdfExport = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await downloadCertificatePdf({
        studentName: cert.name,
        text: cert.text,
        grade: cert.grade,
        schoolYear: cert.schoolYear,
        className: cert.className,
        gender: cert.gender,
        createdAt: cert.createdAt,
      });
    } catch {
      alert("PDF-Export fehlgeschlagen.");
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Möchtest du das Zeugnis von ${cert.name} wirklich löschen?`)) {
      onDelete();
    }
  };

  return (
    <div className="flex flex-wrap gap-1.5" onClick={(e) => e.stopPropagation()}>
      <ActionButton label="Kopieren" onClick={handleCopy} variant="ghost" />
      <ActionButton label="PDF" onClick={handlePdfExport} variant="ghost" />
      <ReportCertificateButton
        text={cert.text}
        studentName={cert.name}
        certificateId={cert.id}
        compact
      />
      <ActionButton label="Löschen" onClick={handleDelete} variant="danger" />
    </div>
  );
}

function ClassNameCell({
  cert,
  onClassUpdated,
}: {
  cert: CertificateRecord;
  onClassUpdated?: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(cert.className ?? "");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const save = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setSaving(true);
    setSaveError(null);
    const res = await fetch(`/api/certificate/${cert.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ className: value }),
    });
    setSaving(false);
    if (res.ok) {
      setEditing(false);
      onClassUpdated?.();
    } else {
      const data = await res.json().catch(() => ({}));
      setSaveError(typeof data.error === "string" ? data.error : "Speichern fehlgeschlagen.");
    }
  };

  if (editing) {
    return (
      <div className="flex flex-col gap-1" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-1">
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="h-8 w-24 text-xs"
            placeholder="5a"
          />
          <ActionButton label={saving ? "…" : "OK"} onClick={save} variant="ghost" />
        </div>
        {saveError && <span className="text-xs text-red-600">{saveError}</span>}
      </div>
    );
  }

  return (
    <button
      type="button"
      className="rounded px-1 text-left text-slate-600 hover:bg-slate-100 hover:text-blue-700"
      onClick={(e) => {
        e.stopPropagation();
        setEditing(true);
      }}
      title="Klasse bearbeiten"
    >
      {cert.className ?? "–"}
    </button>
  );
}

type Props = {
  cert: CertificateRecord;
  classOrganizationEnabled?: boolean;
  onClassUpdated?: () => void;
};

export default function TableRow({ cert, classOrganizationEnabled, onClassUpdated }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [visible, setVisible] = useState(true);

  const colCount = classOrganizationEnabled ? 8 : 7;

  if (!visible) return null;

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/certificate?id=${cert.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Fehler beim Löschen");
      setVisible(false);
    } catch {
      alert("Fehler beim Löschen des Zeugnisses");
    }
  };

  return (
    <>
      <tr
        className="hidden border-b border-slate-100 transition-colors hover:bg-slate-50/80 md:table-row cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <td className="max-w-[160px] truncate py-3 px-3 font-medium">{cert.name}</td>
        {classOrganizationEnabled && (
          <td className="whitespace-nowrap py-3 px-3">
            <ClassNameCell cert={cert} onClassUpdated={onClassUpdated} />
          </td>
        )}
        <td className="whitespace-nowrap py-3 px-3 text-slate-600">{cert.gender}</td>
        <td className="whitespace-nowrap py-3 px-3 text-slate-600">{cert.schoolYear ?? "–"}</td>
        <td className="whitespace-nowrap py-3 px-3 text-slate-600">{cert.grade ?? "–"}</td>
        <td className="whitespace-nowrap py-3 px-3 text-slate-500">{formatDate(cert.createdAt)}</td>
        <td className="whitespace-nowrap py-3 px-3 text-slate-600">{cert.wordCount}</td>
        <td className="py-3 px-3 align-top">
          <CertificateActions cert={cert} onDelete={handleDelete} />
        </td>
      </tr>
      {expanded && (
        <tr className="hidden md:table-row">
          <td colSpan={colCount} className="border-b border-slate-100 bg-slate-50 px-4 py-4 text-sm leading-relaxed text-slate-700">
            {cert.text}
          </td>
        </tr>
      )}

      <tr className="md:hidden">
        <td colSpan={colCount} className="p-0">
          <div className="mb-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <button
              type="button"
              className="flex w-full items-start justify-between gap-2 text-left"
              onClick={() => setExpanded(!expanded)}
            >
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-900">{cert.name}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {classOrganizationEnabled && cert.className && (
                    <span className="font-medium text-blue-700">{cert.className} · </span>
                  )}
                  {cert.schoolYear ?? "–"} · Stufe {cert.grade ?? "–"} · {cert.wordCount} Wörter
                </p>
              </div>
              {expanded ? (
                <ChevronUp className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              ) : (
                <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              )}
            </button>
            {expanded && (
              <p className="mt-3 border-t border-slate-100 pt-3 text-sm leading-relaxed text-slate-700">
                {cert.text}
              </p>
            )}
            <div className="mt-3 border-t border-slate-100 pt-3">
              <CertificateActions cert={cert} onDelete={handleDelete} />
            </div>
          </div>
        </td>
      </tr>
    </>
  );
}
