"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import LoadingState from "@/components/layout/LoadingState";
import { useRequireAuth } from "@/lib/hooks/useRequireAuth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, KeyRound, Mail, Shield, Smartphone, Trash2, User } from "lucide-react";
import { signOut } from "next-auth/react";
import PrivacyAdvancedSection from "@/components/settings/PrivacyAdvancedSection";

function formatDate(iso?: string) {
  if (!iso) return "–";
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function SettingsPage() {
  const { user, isLoading, isAuthenticated, refetch } = useRequireAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [twoFaSetup, setTwoFaSetup] = useState<{ secret: string; qrDataUrl: string } | null>(null);
  const [twoFaCode, setTwoFaCode] = useState("");
  const [twoFaLoading, setTwoFaLoading] = useState(false);
  const [twoFaMessage, setTwoFaMessage] = useState("");
  const [twoFaError, setTwoFaError] = useState("");
  const [disablePassword, setDisablePassword] = useState("");
  const [disableCode, setDisableCode] = useState("");

  const [deletePassword, setDeletePassword] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName ?? "");
      setLastName(user.lastName ?? "");
    }
  }, [user]);

  if (isLoading || !isAuthenticated || !user) return <LoadingState />;

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError("");
    const res = await fetch("/api/settings/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName, lastName }),
    });
    if (!res.ok) {
      const data = await res.json();
      setProfileError(data.error ?? "Speichern fehlgeschlagen.");
      return;
    }
    setProfileSaved(true);
    refetch();
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError("");
    setPasswordMessage("");
    const res = await fetch("/api/settings/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
    });
    const data = await res.json();
    setPasswordLoading(false);
    if (!res.ok) {
      setPasswordError(data.error ?? "Passwortänderung fehlgeschlagen.");
      return;
    }
    setPasswordMessage(data.message);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const startTwoFaSetup = async () => {
    setTwoFaLoading(true);
    setTwoFaError("");
    setTwoFaMessage("");
    const res = await fetch("/api/settings/2fa/setup", { method: "POST" });
    const data = await res.json();
    setTwoFaLoading(false);
    if (!res.ok) {
      setTwoFaError(data.error ?? "Setup fehlgeschlagen.");
      return;
    }
    setTwoFaSetup({ secret: data.secret, qrDataUrl: data.qrDataUrl });
    setTwoFaCode("");
  };

  const enableTwoFa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!twoFaSetup) return;
    setTwoFaLoading(true);
    setTwoFaError("");
    setTwoFaMessage("");
    const res = await fetch("/api/settings/2fa/enable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: twoFaSetup.secret, code: twoFaCode }),
    });
    const data = await res.json();
    setTwoFaLoading(false);
    if (!res.ok) {
      setTwoFaError(data.error ?? "Aktivierung fehlgeschlagen.");
      return;
    }
    setTwoFaMessage(data.message);
    setTwoFaSetup(null);
    setTwoFaCode("");
    refetch();
  };

  const disableTwoFa = async (e: React.FormEvent) => {
    e.preventDefault();
    setTwoFaLoading(true);
    setTwoFaError("");
    setTwoFaMessage("");
    const res = await fetch("/api/settings/2fa/disable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: disablePassword, code: disableCode }),
    });
    const data = await res.json();
    setTwoFaLoading(false);
    if (!res.ok) {
      setTwoFaError(data.error ?? "Deaktivierung fehlgeschlagen.");
      return;
    }
    setTwoFaMessage(data.message);
    setDisablePassword("");
    setDisableCode("");
    refetch();
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm("Konto wirklich unwiderruflich löschen? Alle Zeugnisse und Daten werden entfernt.")) {
      return;
    }
    setDeleteLoading(true);
    setDeleteError("");
    const res = await fetch("/api/settings/account", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: deletePassword }),
    });
    const data = await res.json();
    setDeleteLoading(false);
    if (!res.ok) {
      setDeleteError(data.error ?? "Löschen fehlgeschlagen.");
      return;
    }
    await fetch("/api/privacy-advanced/key", { method: "DELETE" }).catch(() => undefined);
    await signOut({ callbackUrl: "/?auth=login" });
  };

  return (
    <PageContainer>
      <PageHeader
        title="Einstellungen"
        description="Verwalte dein Profil, Passwort und die Zwei-Faktor-Authentifizierung."
      />

      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-blue-100 bg-blue-50/50 p-4 sm:flex-row sm:items-center">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
          {(user.firstName?.[0] ?? user.email?.[0] ?? "U").toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-slate-900">
            {user.firstName} {user.lastName}
          </p>
          <p className="truncate text-sm text-slate-500">{user.email}</p>
        </div>
        <Badge className="w-fit shrink-0 bg-blue-100 text-blue-700 hover:bg-blue-100">
          {user.subscriptionLevel}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-slate-900">Profil</h2>
          </div>
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">Vorname</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Max"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nachname</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Mustermann"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  value={user.email ?? ""}
                  disabled
                  className="bg-slate-50 pl-9"
                />
              </div>
              <p className="text-xs text-slate-500">E-Mail-Adresse kann derzeit nicht geändert werden.</p>
            </div>
            <div className="space-y-2">
              <Label>Geburtsdatum</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input value={formatDate(user.birthDate)} disabled className="bg-slate-50 pl-9" />
              </div>
            </div>
            {profileError && <p className="text-sm text-red-600">{profileError}</p>}
            <Button type="submit">
              {profileSaved ? "Gespeichert ✓" : "Änderungen speichern"}
            </Button>
          </form>
        </section>

        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-slate-900">Passwort ändern</h2>
          </div>
          <form className="space-y-4" onSubmit={handlePasswordChange}>
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Aktuelles Passwort</Label>
              <Input
                id="currentPassword"
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Neues Passwort</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Neues Passwort bestätigen</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>
            <p className="text-xs text-slate-500">Mindestens 8 Zeichen.</p>
            {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
            {passwordMessage && <p className="text-sm text-green-600">{passwordMessage}</p>}
            <Button type="submit" variant="outline" disabled={passwordLoading}>
              {passwordLoading ? "Wird geändert…" : "Passwort ändern"}
            </Button>
          </form>
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Smartphone className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-slate-900">Zwei-Faktor-Authentifizierung (2FA)</h2>
          {user.totpEnabled ? (
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Aktiv</Badge>
          ) : (
            <Badge variant="outline">Inaktiv</Badge>
          )}
        </div>
        <p className="mb-6 text-sm text-slate-600">
          Schütze dein Konto mit einem zusätzlichen Code aus einer Authenticator-App (z. B. Google
          Authenticator, Microsoft Authenticator oder Authy).
        </p>

        {twoFaError && <p className="mb-4 text-sm text-red-600">{twoFaError}</p>}
        {twoFaMessage && <p className="mb-4 text-sm text-green-600">{twoFaMessage}</p>}

        {user.totpEnabled ? (
          <form onSubmit={disableTwoFa} className="max-w-md space-y-4">
            <p className="text-sm text-slate-600">
              Zum Deaktivieren benötigst du dein Passwort und einen aktuellen Bestätigungscode.
            </p>
            <div className="space-y-2">
              <Label htmlFor="disablePassword">Passwort</Label>
              <Input
                id="disablePassword"
                type="password"
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="disableCode">Bestätigungscode</Label>
              <Input
                id="disableCode"
                type="text"
                inputMode="numeric"
                placeholder="123456"
                value={disableCode}
                onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                required
              />
            </div>
            <Button type="submit" variant="outline" disabled={twoFaLoading}>
              {twoFaLoading ? "Wird deaktiviert…" : "2FA deaktivieren"}
            </Button>
          </form>
        ) : twoFaSetup ? (
          <form onSubmit={enableTwoFa} className="space-y-4">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              <div className="shrink-0 rounded-xl border border-slate-200 bg-white p-3">
                <Image
                  src={twoFaSetup.qrDataUrl}
                  alt="QR-Code für Authenticator-App"
                  width={180}
                  height={180}
                  unoptimized
                />
              </div>
              <div className="space-y-3">
                <p className="text-sm text-slate-600">
                  1. Scanne den QR-Code mit deiner Authenticator-App.
                </p>
                <p className="text-sm text-slate-600">
                  2. Oder gib diesen Schlüssel manuell ein:
                </p>
                <code className="block break-all rounded-lg bg-slate-100 px-3 py-2 text-sm font-mono">
                  {twoFaSetup.secret}
                </code>
                <p className="text-sm text-slate-600">
                  3. Gib den 6-stelligen Code ein, um die Einrichtung abzuschließen.
                </p>
              </div>
            </div>
            <div className="max-w-xs space-y-2">
              <Label htmlFor="twoFaCode">Bestätigungscode</Label>
              <Input
                id="twoFaCode"
                type="text"
                inputMode="numeric"
                placeholder="123456"
                value={twoFaCode}
                onChange={(e) => setTwoFaCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                required
                autoFocus
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={twoFaLoading}>
                {twoFaLoading ? "Wird aktiviert…" : "2FA aktivieren"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setTwoFaSetup(null);
                  setTwoFaCode("");
                  setTwoFaError("");
                }}
              >
                Abbrechen
              </Button>
            </div>
          </form>
        ) : (
          <Button
            type="button"
            onClick={startTwoFaSetup}
            disabled={twoFaLoading}
          >
            <Shield className="mr-2 h-4 w-4" />
            {twoFaLoading ? "Wird vorbereitet…" : "2FA einrichten"}
          </Button>
        )}
      </section>

      <PrivacyAdvancedSection user={user} onChanged={refetch} />

      <section className="mt-6 rounded-2xl border border-red-200 bg-red-50/30 p-6 shadow-sm">
        <div className="mb-2 flex items-center gap-2">
          <Trash2 className="h-5 w-5 text-red-600" />
          <h2 className="text-lg font-semibold text-slate-900">Konto löschen</h2>
        </div>
        <p className="mb-4 text-sm text-slate-600">
          Dein Konto und alle gespeicherten Zeugnisse werden unwiderruflich gelöscht.
        </p>
        <form onSubmit={handleDeleteAccount} className="max-w-md space-y-4">
          <div className="space-y-2">
            <Label htmlFor="deletePassword">Passwort zur Bestätigung</Label>
            <Input
              id="deletePassword"
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              required
            />
          </div>
          {deleteError && <p className="text-sm text-red-600">{deleteError}</p>}
          <Button type="submit" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50" disabled={deleteLoading}>
            {deleteLoading ? "Wird gelöscht…" : "Konto unwiderruflich löschen"}
          </Button>
        </form>
      </section>
    </PageContainer>
  );
}
