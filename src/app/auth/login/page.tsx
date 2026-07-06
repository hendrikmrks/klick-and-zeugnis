"use client";

import { signIn, getSession } from "next-auth/react";
import { useState } from "react";
import AuthLayout from "@/components/layout/AuthLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [step, setStep] = useState<"credentials" | "2fa">("credentials");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
        setStep("2fa");
        return;
      }
      setError(step === "2fa" ? "Ungültiger Bestätigungscode." : "E-Mail oder Passwort ungültig.");
      return;
    }

    await getSession();
    window.location.href = "/dashboard";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (step === "2fa") {
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
      setStep("2fa");
      setLoading(false);
      return;
    }

    await completeSignIn();
  };

  return (
    <AuthLayout
      title={step === "2fa" ? "Zwei-Faktor-Authentifizierung" : "Willkommen zurück"}
      subtitle={
        step === "2fa"
          ? "Gib den 6-stelligen Code aus deiner Authenticator-App ein."
          : "Melde dich an, um fortzufahren."
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {step === "credentials" ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="du@schule.de"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Passwort</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                setStep("credentials");
                setTotpCode("");
                setError("");
              }}
            >
              Zurück zur Anmeldung
            </button>
          </div>
        )}

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-center text-sm text-red-600">{error}</p>
        )}

        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
          {loading ? "Anmelden…" : step === "2fa" ? "Code bestätigen" : "Anmelden"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Noch kein Konto?{" "}
        <Link href="/auth/register" className="font-medium text-blue-600 hover:underline">
          Registrieren
        </Link>
      </p>
    </AuthLayout>
  );
}
