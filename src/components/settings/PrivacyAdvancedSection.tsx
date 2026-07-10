"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Alert from "@/components/layout/Alert";
import { ShieldCheck, Upload, Lock, Clock, Download } from "lucide-react";
import { PRIVACY_ADVANCED_EXPLANATION } from "@/lib/privacy-advanced/explanation";
import { downloadKeyFile } from "@/lib/privacy-advanced/key-file.client";
import { formatKeyExpiry, usePrivacyAdvancedStatus } from "@/lib/hooks/usePrivacyAdvancedStatus";
import type { MeUser } from "@/lib/hooks/useMe";

type Props = {
  user: MeUser;
  onChanged: () => void;
};

export default function PrivacyAdvancedSection({ user, onChanged }: Props) {
  const [passphrase, setPassphrase] = useState("");
  const [confirmPassphrase, setConfirmPassphrase] = useState("");
  const [disablePassphrase, setDisablePassphrase] = useState("");
  const [disableFileContent, setDisableFileContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleEnable = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (passphrase.length < 8) {
      setError("Passphrase muss mindestens 8 Zeichen haben.");
      return;
    }
    if (passphrase !== confirmPassphrase) {
      setError("Passphrasen stimmen nicht überein.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/settings/privacy-advanced/enable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passphrase }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Aktivierung fehlgeschlagen.");
      return;
    }
    downloadKeyFile(data.fileContent, data.filename);
    setMessage(
      "Modus aktiviert. Die Schlüsseldatei wurde heruntergeladen – bewahre sie sicher auf!"
    );
    setPassphrase("");
    setConfirmPassphrase("");
    onChanged();
  };

  const handleDisableWithKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!disableFileContent.trim()) {
      setError("Bitte Schlüsseldatei auswählen.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/settings/privacy-advanced/disable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileContent: disableFileContent,
        passphrase: disablePassphrase,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Deaktivierung fehlgeschlagen.");
      return;
    }
    setMessage(data.message);
    setDisablePassphrase("");
    setDisableFileContent("");
    onChanged();
  };

  const handleDisableWithDelete = async () => {
    if (
      !confirm(
        "Alle Zeugnisse mit Namensverschlüsselung werden unwiderruflich gelöscht. Fortfahren?"
      )
    ) {
      return;
    }
    setError("");
    setMessage("");
    setLoading(true);
    const res = await fetch("/api/settings/privacy-advanced/disable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deleteCertificates: true }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Deaktivierung fehlgeschlagen.");
      return;
    }
    setMessage(data.message);
    onChanged();
  };

  const handleKeyFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const content = await file.text();
    setDisableFileContent(content);
  };

  const enabled = user.privacyAdvancedModeEnabled;

  return (
    <section className="mt-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-slate-900">
          {PRIVACY_ADVANCED_EXPLANATION.title}
        </h2>
        {enabled ? (
          <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
            Aktiv
          </span>
        ) : (
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
            Inaktiv
          </span>
        )}
      </div>

      <p className="mb-4 text-sm text-slate-600">{PRIVACY_ADVANCED_EXPLANATION.summary}</p>

      <ul className="mb-6 list-inside list-disc space-y-1 text-sm text-slate-600">
        {PRIVACY_ADVANCED_EXPLANATION.points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>

      <Alert variant="warning" title="Wichtig">
        {PRIVACY_ADVANCED_EXPLANATION.warning}
      </Alert>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {message && <p className="mt-4 text-sm text-green-600">{message}</p>}

      {!enabled ? (
        <form onSubmit={handleEnable} className="mt-6 max-w-md space-y-4">
          <p className="text-sm text-slate-600">
            Wähle eine Passphrase für deine Schlüsseldatei. Sie wird beim Download verschlüsselt
            gespeichert.
          </p>
          <div className="space-y-2">
            <Label htmlFor="privacyPassphrase">Passphrase für Schlüsseldatei</Label>
            <Input
              id="privacyPassphrase"
              type="password"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              minLength={8}
              required
              placeholder="Mindestens 8 Zeichen"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="privacyPassphraseConfirm">Passphrase bestätigen</Label>
            <Input
              id="privacyPassphraseConfirm"
              type="password"
              value={confirmPassphrase}
              onChange={(e) => setConfirmPassphrase(e.target.value)}
              minLength={8}
              required
            />
          </div>
          <Button type="submit" disabled={loading}>
            <Lock className="mr-2 h-4 w-4" />
            {loading ? "Wird aktiviert…" : "Modus aktivieren & Schlüsseldatei erstellen"}
          </Button>
        </form>
      ) : (
        <div className="mt-6 space-y-6">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-900">Modus deaktivieren</p>
            <p className="mt-1 text-sm text-slate-600">
              Zum Deaktivieren benötigst du deine Schlüsseldatei mit Passphrase, oder du löschst
              alle geschützten Zeugnisse.
            </p>
          </div>

          <form onSubmit={handleDisableWithKey} className="max-w-md space-y-4">
            <div className="space-y-2">
              <Label htmlFor="disableKeyFile">Schlüsseldatei</Label>
              <Input
                id="disableKeyFile"
                type="file"
                accept=".txt,.json"
                onChange={handleKeyFileSelect}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="disablePassphrase">Passphrase</Label>
              <Input
                id="disablePassphrase"
                type="password"
                value={disablePassphrase}
                onChange={(e) => setDisablePassphrase(e.target.value)}
                minLength={8}
                required
              />
            </div>
            <Button type="submit" variant="outline" disabled={loading}>
              {loading ? "Wird deaktiviert…" : "Mit Schlüsseldatei deaktivieren"}
            </Button>
          </form>

          <div className="border-t border-slate-200 pt-4">
            <p className="mb-3 text-sm text-slate-600">
              Alternativ: Alle Zeugnisse mit Namensverschlüsselung löschen und Modus deaktivieren.
            </p>
            <Button
              type="button"
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50"
              onClick={handleDisableWithDelete}
              disabled={loading}
            >
              Geschützte Zeugnisse löschen & Modus deaktivieren
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}

export function PrivacyAdvancedKeyUploadPanel({
  onUploaded,
  compact = false,
  pendingMapping,
}: {
  onUploaded?: () => void;
  compact?: boolean;
  pendingMapping?: { placeholder: string; realName: string } | null;
}) {
  const { status, refetch } = usePrivacyAdvancedStatus();
  const [passphrase, setPassphrase] = useState("");
  const [exportPassphrase, setExportPassphrase] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [error, setError] = useState("");
  const [exportError, setExportError] = useState("");

  if (!status?.enabled) return null;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileContent(await file.text());
    setError("");
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileContent.trim()) {
      setError("Bitte Schlüsseldatei auswählen.");
      return;
    }
    setLoading(true);
    setError("");
    const res = await fetch("/api/privacy-advanced/key", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileContent,
        passphrase,
        pendingMappings: pendingMapping
          ? { [pendingMapping.placeholder]: pendingMapping.realName }
          : undefined,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Upload fehlgeschlagen.");
      return;
    }
    setPassphrase("");
    setFileContent("");
    refetch();
    onUploaded?.();
  };

  if (status.keyLoaded) {
    const handleExport = async (e: React.FormEvent) => {
      e.preventDefault();
      setExportLoading(true);
      setExportError("");
      const res = await fetch("/api/privacy-advanced/key", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passphrase: exportPassphrase }),
      });
      const data = await res.json();
      setExportLoading(false);
      if (!res.ok) {
        setExportError(data.error ?? "Export fehlgeschlagen.");
        return;
      }
      downloadKeyFile(data.fileContent);
      setExportPassphrase("");
    };

    return (
      <Alert variant="success" title="Schlüsseldatei aktiv">
        <span className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          Namen sind entschlüsselt – verbleibend: {formatKeyExpiry(status.keyExpiresAt)}
          {!compact && ` (${status.mappingCount} Zuordnungen)`}
        </span>
        {!compact && (
          <form onSubmit={handleExport} className="mt-3 flex flex-wrap items-end gap-2">
            <Input
              type="password"
              placeholder="Passphrase für Export"
              value={exportPassphrase}
              onChange={(e) => setExportPassphrase(e.target.value)}
              minLength={8}
              required
              className="max-w-xs"
            />
            <Button type="submit" size="sm" variant="outline" disabled={exportLoading}>
              <Download className="mr-2 h-4 w-4" />
              {exportLoading ? "Export…" : "Schlüsseldatei exportieren"}
            </Button>
            {exportError && <p className="w-full text-sm text-red-600">{exportError}</p>}
          </form>
        )}
      </Alert>
    );
  }

  return (
    <Alert variant="info" title="Schlüsseldatei erforderlich">
      <p className="mb-3">
        Lade deine Schlüsseldatei hoch, um die Namen in gespeicherten Zeugnissen lesbar zu machen.
        Die Sitzung läuft nach 3 Stunden ab oder endet beim Abmelden.
        {pendingMapping && (
          <span className="mt-1 block font-medium">
            Es wartet eine neue Zuordnung ({pendingMapping.realName}) auf die Schlüsseldatei.
          </span>
        )}
      </p>
      <form onSubmit={handleUpload} className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <Input type="file" accept=".txt,.json" onChange={handleFileSelect} />
          <Input
            type="password"
            placeholder="Passphrase"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            minLength={8}
            required
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" size="sm" disabled={loading}>
          <Upload className="mr-2 h-4 w-4" />
          {loading ? "Wird geladen…" : "Schlüsseldatei hochladen"}
        </Button>
      </form>
    </Alert>
  );
}
