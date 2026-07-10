"use client";

import { getSession, signIn } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type AuthMode = "login" | "register";

type Props = {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
};

export default function AuthPanel({ mode, onModeChange }: Props) {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [totpCode, setTotpCode] = useState("");
  const [loginStep, setLoginStep] = useState<"credentials" | "2fa">("credentials");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setError("");
    if (mode === "register") {
      setLoginStep("credentials");
      setTotpCode("");
    }
  }, [mode]);

  const switchMode = (next: AuthMode) => {
    if (next === mode) return;
    setError("");
    setLoginStep("credentials");
    setTotpCode("");
    onModeChange(next);
  };

  const completeSignIn = async (code?: string) => {
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
      totpCode: code ?? totpCode,
    });
    setLoading(false);

    if (!res?.ok) {
      if (res?.error === "2FA_REQUIRED") {
        setLoginStep("2fa");
        return;
      }
      setError(
        loginStep === "2fa" ? "Ungültiger Bestätigungscode." : "E-Mail oder Passwort ungültig."
      );
      return;
    }

    await getSession();
    window.location.href = "/dashboard";
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (loginStep === "2fa") {
      await completeSignIn();
      return;
    }

    const prelogin = await fetch("/api/auth/prelogin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!prelogin.ok) {
      setLoading(false);
      setError("E-Mail oder Passwort ungültig.");
      return;
    }

    const data = await prelogin.json();
    if (data.requires2FA) {
      setLoginStep("2fa");
      setLoading(false);
      return;
    }

    await completeSignIn();
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!acceptTerms) {
      setError("Bitte akzeptiere die Nutzungsbedingungen.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Die Passwörter stimmen nicht überein.");
      return;
    }
    if (password.length < 8) {
      setError("Das Passwort muss mindestens 8 Zeichen lang sein.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, firstName, lastName, birthDate, password }),
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Registrierung fehlgeschlagen.");
      setLoading(false);
      return;
    }

    const signInResult = await signIn("credentials", {
      email,
      password,
      callbackUrl: "/dashboard",
      redirect: false,
    });

    if (signInResult?.error) {
      setError(
        "Registrierung erfolgreich, aber die automatische Anmeldung ist fehlgeschlagen. Bitte melde dich an."
      );
      switchMode("login");
    } else if (signInResult?.url) {
      window.location.href = signInResult.url;
    }
    setLoading(false);
  };

  const showTabs = loginStep === "credentials";

  return (
    <div className="rounded-2xl border border-white/10 bg-white p-6 shadow-2xl sm:p-8">
      {showTabs && (
        <div
          className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1"
          role="tablist"
          aria-label="Anmeldung oder Registrierung"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === "login"}
            className={cn(
              "rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
              mode === "login"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            )}
            onClick={() => switchMode("login")}
          >
            Anmelden
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "register"}
            className={cn(
              "rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
              mode === "register"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            )}
            onClick={() => switchMode("register")}
          >
            Registrieren
          </button>
        </div>
      )}

      <div className="text-slate-900">
        {mode === "login" ? (
          <>
            <h2 className="text-2xl font-bold">
              {loginStep === "2fa" ? "Zwei-Faktor-Authentifizierung" : "Willkommen zurück"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {loginStep === "2fa"
                ? "Gib den 6-stelligen Code aus deiner Authenticator-App ein."
                : "Melde dich an, um deine Zeugnisse zu verwalten."}
            </p>

            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              {loginStep === "credentials" ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="login-email">E-Mail</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="du@schule.de"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Passwort</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="totpCode">Bestätigungscode</Label>
                  <Input
                    id="totpCode"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="123456"
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    maxLength={6}
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    className="text-sm text-blue-600 hover:underline"
                    onClick={() => {
                      setLoginStep("credentials");
                      setTotpCode("");
                      setError("");
                    }}
                  >
                    Zurück zur Anmeldung
                  </button>
                </div>
              )}

              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-center text-sm text-red-600">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading
                  ? "Anmelden…"
                  : loginStep === "2fa"
                    ? "Code bestätigen"
                    : "Anmelden"}
              </Button>
            </form>

            {showTabs && (
              <p className="mt-5 text-center text-sm text-slate-500">
                Noch kein Konto?{" "}
                <button
                  type="button"
                  className="font-medium text-blue-600 hover:underline"
                  onClick={() => switchMode("register")}
                >
                  Kostenlos registrieren
                </button>
              </p>
            )}
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold">Konto erstellen</h2>
            <p className="mt-1 text-sm text-slate-500">
              In wenigen Schritten startklar – kostenlos und unverbindlich.
            </p>

            <form onSubmit={handleRegister} className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="register-email">E-Mail</Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="du@schule.de"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Vorname</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    autoComplete="given-name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nachname</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    autoComplete="family-name"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthDate">Geburtsdatum</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  autoComplete="bday"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="register-password">Passwort</Label>
                  <Input
                    id="register-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>
              <p className="text-xs text-slate-400">Mindestens 8 Zeichen</p>

              <label className="flex items-start gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300"
                />
                <span>
                  Ich akzeptiere die{" "}
                  <Link
                    href="/agb"
                    className="font-medium text-blue-600 hover:underline"
                    target="_blank"
                  >
                    Nutzungsbedingungen
                  </Link>{" "}
                  und habe die{" "}
                  <Link
                    href="/datenschutz"
                    className="font-medium text-blue-600 hover:underline"
                    target="_blank"
                  >
                    Datenschutzerklärung
                  </Link>{" "}
                  gelesen.
                </span>
              </label>

              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-center text-sm text-red-600">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Konto wird erstellt…" : "Kostenlos registrieren"}
              </Button>
            </form>

            <p className="mt-5 text-center text-sm text-slate-500">
              Bereits registriert?{" "}
              <button
                type="button"
                className="font-medium text-blue-600 hover:underline"
                onClick={() => switchMode("login")}
              >
                Jetzt anmelden
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
