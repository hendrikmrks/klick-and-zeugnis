"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import AuthLayout from "@/components/layout/AuthLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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
      setError("Registrierung erfolgreich, aber die automatische Anmeldung ist fehlgeschlagen. Bitte melde dich manuell an.");
    } else if (signInResult?.url) {
      window.location.href = signInResult.url;
    }
    setLoading(false);
  };

  return (
    <AuthLayout title="Konto erstellen" subtitle="Kostenlos starten – in wenigen Sekunden.">
      <form onSubmit={handleSubmit} className="space-y-4">
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

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="firstName">Vorname</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Nachname</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
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
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Passwort</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
            required
          />
        </div>

        <label className="flex items-start gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="mt-0.5 rounded border-slate-300"
          />
          Ich akzeptiere die{" "}
          <Link href="/agb" className="font-medium text-blue-600 hover:underline" target="_blank">
            Nutzungsbedingungen
          </Link>{" "}
          und habe die{" "}
          <Link href="/datenschutz" className="font-medium text-blue-600 hover:underline" target="_blank">
            Datenschutzerklärung
          </Link>{" "}
          gelesen.
        </label>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-center text-sm text-red-600">{error}</p>
        )}

        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
          {loading ? "Registrieren…" : "Registrieren"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Bereits registriert?{" "}
        <Link href="/auth/login" className="font-medium text-blue-600 hover:underline">
          Anmelden
        </Link>
      </p>
    </AuthLayout>
  );
}
