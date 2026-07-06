"use client";

import { useState, useEffect, useCallback } from "react";
import type { CertificateRecord } from "@/types/app";
import TableRow from "./TableRow";
import { FileText } from "lucide-react";

type Props = {
  reloadSignal: number;
  classFilter?: string | null;
  classOrganizationEnabled?: boolean;
  onDataChange?: () => void;
};

function groupByClass(certs: CertificateRecord[]) {
  const groups = new Map<string, CertificateRecord[]>();
  for (const cert of certs) {
    const key = cert.className ?? "__none__";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(cert);
  }

  const keys = [...groups.keys()].sort((a, b) => {
    if (a === "__none__") return 1;
    if (b === "__none__") return -1;
    return a.localeCompare(b, "de");
  });

  return keys.map((key) => ({
    label: key === "__none__" ? "Ohne Klasse" : key,
    items: groups.get(key)!,
  }));
}

export default function SavedCertificatesTable({
  reloadSignal,
  classFilter = null,
  classOrganizationEnabled = false,
  onDataChange,
}: Props) {
  const [certificates, setCertificates] = useState<CertificateRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCertificates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query =
        classFilter !== null && classOrganizationEnabled
          ? `?className=${encodeURIComponent(classFilter)}`
          : "";
      const res = await fetch(`/api/certificate${query}`);
      if (!res.ok) throw new Error(`Fehler: ${res.status}`);
      const data = await res.json();
      setCertificates(data.certificates);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unbekannter Fehler";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [classFilter, classOrganizationEnabled]);

  useEffect(() => {
    fetchCertificates();
  }, [reloadSignal, fetchCertificates]);

  const handleRefresh = useCallback(() => {
    fetchCertificates();
    onDataChange?.();
  }, [fetchCertificates, onDataChange]);

  const renderTable = (items: CertificateRecord[]) => (
    <table className="w-full text-sm">
      <thead className="hidden md:table-header-group">
        <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
          <th className="py-3 px-3">Name</th>
          {classOrganizationEnabled && <th className="py-3 px-3">Klasse</th>}
          <th className="py-3 px-3">Geschlecht</th>
          <th className="py-3 px-3">Schuljahr</th>
          <th className="py-3 px-3">Stufe</th>
          <th className="py-3 px-3">Erstellt</th>
          <th className="py-3 px-3">Wörter</th>
          <th className="py-3 px-3">Aktionen</th>
        </tr>
      </thead>
      <tbody>
        {items.map((cert) => (
          <TableRow
            key={cert.id}
            cert={cert}
            classOrganizationEnabled={classOrganizationEnabled}
            onClassUpdated={handleRefresh}
          />
        ))}
      </tbody>
    </table>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-slate-500">
        Lade gespeicherte Zeugnisse…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
        Fehler: {error}
      </div>
    );
  }

  if (certificates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
          <FileText className="h-7 w-7 text-slate-400" />
        </div>
        <p className="font-medium text-slate-900">Noch keine Zeugnisse gespeichert</p>
        <p className="mt-1 text-sm text-slate-500">
          Generiere ein Zeugnis im Dashboard und speichere es dort.
        </p>
      </div>
    );
  }

  const showGrouped =
    classOrganizationEnabled && classFilter === null;

  if (showGrouped) {
    const groups = groupByClass(certificates);
    return (
      <div className="space-y-8">
        {groups.map((group) => (
          <section key={group.label}>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
              <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-blue-700">{group.label}</span>
              <span className="font-normal normal-case text-slate-400">
                ({group.items.length} {group.items.length === 1 ? "Zeugnis" : "Zeugnisse"})
              </span>
            </h3>
            {renderTable(group.items)}
          </section>
        ))}
      </div>
    );
  }

  return <div>{renderTable(certificates)}</div>;
}
