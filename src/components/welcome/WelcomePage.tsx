"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { ArrowRight, Clock, GraduationCap, Shield, Sparkles } from "lucide-react";
import AuthPanel, { type AuthMode } from "@/components/welcome/AuthPanel";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Sparkles,
    title: "KI-gestützt",
    text: "Individuelle Formulierungen in Sekunden",
  },
  {
    icon: Shield,
    title: "Datenschutz",
    text: "Deine Zeugnisse bleiben in deinem Konto",
  },
  {
    icon: Clock,
    title: "Zeit sparen",
    text: "Weniger Tipparbeit, mehr Zeit für Schüler",
  },
];

function parseAuthMode(value: string | null): AuthMode {
  return value === "register" ? "register" : "login";
}

export default function WelcomePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const authPanelRef = useRef<HTMLDivElement>(null);
  const [authMode, setAuthMode] = useState<AuthMode>(() =>
    parseAuthMode(searchParams.get("auth"))
  );

  const updateAuthMode = useCallback(
    (mode: AuthMode, scroll = false) => {
      setAuthMode(mode);
      const query = mode === "register" ? "?auth=register" : "?auth=login";
      router.replace(`/${query}`, { scroll: false });

      if (scroll) {
        requestAnimationFrame(() => {
          authPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        });
      }
    },
    [router]
  );

  useEffect(() => {
    setAuthMode(parseAuthMode(searchParams.get("auth")));
  }, [searchParams]);

  const firstName = session?.user?.name?.split(" ")[0];

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-600/25 via-slate-950 to-slate-950" />
      <div className="pointer-events-none absolute -right-32 top-20 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />

      <header className="relative z-10 flex items-center justify-between px-6 py-5 md:px-10">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/30">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold tracking-tight">Klick & Zeugnis</span>
        </div>

        {!session && (
          <div className="flex items-center gap-2 lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:bg-white/10 hover:text-white"
              onClick={() => updateAuthMode("login", true)}
            >
              Anmelden
            </Button>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-500"
              onClick={() => updateAuthMode("register", true)}
            >
              Registrieren
            </Button>
          </div>
        )}

        {session && (
          <Button asChild className="bg-blue-600 hover:bg-blue-500">
            <Link href="/dashboard">
              Zum Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        )}
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col gap-10 px-6 pb-8 pt-2 lg:flex-row lg:items-center lg:gap-16 lg:px-10 lg:pb-12">
        <section className="flex flex-1 flex-col justify-center lg:max-w-xl xl:max-w-2xl">
          <p className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-blue-200 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" />
            Zeugnisse smarter erstellen
          </p>

          <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl xl:text-6xl">
            Schulzeugnisse
            <span className="mt-2 block bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
              in Minuten statt Stunden
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-base text-slate-400 md:text-lg">
            KI-gestützte Zeugnistexte für Lehrkräfte – individuell, schnell und passend zum
            Sozialverhalten deiner Schülerinnen und Schüler.
          </p>

          {!session && (
            <div className="mt-8 hidden flex-wrap gap-3 lg:flex">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-500"
                onClick={() => updateAuthMode("register", true)}
              >
                Kostenlos starten
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 bg-white/5 text-white hover:bg-white/10"
                onClick={() => updateAuthMode("login", true)}
              >
                Anmelden
              </Button>
            </div>
          )}

          <ul className="mt-8 hidden space-y-3 text-sm text-slate-400 lg:block">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              Individuelle KI-Formulierungen
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              Sozialverhalten & Rollen einbeziehen
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              Zeugnisse speichern & verwalten
            </li>
          </ul>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {features.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm lg:bg-white/[0.03]"
              >
                <Icon className="mb-2 h-5 w-5 text-blue-400" />
                <p className="font-semibold text-white">{title}</p>
                <p className="mt-1 text-sm text-slate-400">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section
          ref={authPanelRef}
          id="auth"
          className="flex w-full flex-1 flex-col justify-center lg:max-w-md xl:max-w-lg"
        >
          {session ? (
            <div className="rounded-2xl border border-white/10 bg-white p-8 text-slate-900 shadow-2xl">
              <h2 className="text-2xl font-bold">
                Willkommen{firstName ? `, ${firstName}` : ""}!
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Du bist angemeldet. Weiter geht&apos;s im Dashboard mit deinen Zeugnissen.
              </p>
              <Button asChild className="mt-6 w-full">
                <Link href="/dashboard">
                  Zum Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          ) : (
            <AuthPanel mode={authMode} onModeChange={(mode) => updateAuthMode(mode)} />
          )}
        </section>
      </main>

      <footer className="relative z-10 flex shrink-0 flex-col items-center gap-2 border-t border-white/10 px-6 py-4 text-xs text-slate-500 sm:flex-row sm:justify-between md:px-10">
        <p>© {new Date().getFullYear()} Klick & Zeugnis</p>
        <nav className="flex gap-4">
          <Link href="/impressum" className="hover:text-slate-300">
            Impressum
          </Link>
          <Link href="/datenschutz" className="hover:text-slate-300">
            Datenschutz
          </Link>
          <Link href="/agb" className="hover:text-slate-300">
            AGB
          </Link>
          <Link href="/widerruf" className="hover:text-slate-300">
            Widerruf
          </Link>
        </nav>
      </footer>
    </div>
  );
}
