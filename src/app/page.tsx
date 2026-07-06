"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { GraduationCap, Sparkles, Shield, Clock, ArrowRight } from "lucide-react";

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

export default function LandingPage() {
  const { data: session } = useSession();

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/30 via-slate-950 to-slate-950" />
      <div className="pointer-events-none absolute -right-32 top-20 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />

      <header className="relative z-10 flex items-center justify-between px-6 py-5 md:px-10">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/30">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold tracking-tight">Klick & Zeugnis</span>
        </div>
        <div className="flex items-center gap-2">
          {session ? (
            <Button asChild className="bg-blue-600 hover:bg-blue-500">
              <Link href="/dashboard">
                Zum Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" className="text-slate-300 hover:bg-white/10 hover:text-white">
                <Link href="/auth/login">Anmelden</Link>
              </Button>
              <Button asChild className="bg-blue-600 hover:bg-blue-500">
                <Link href="/auth/register">Kostenlos starten</Link>
              </Button>
            </>
          )}
        </div>
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-4 pt-2 text-center md:px-10">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-blue-200 backdrop-blur-sm">
          <Sparkles className="h-3.5 w-3.5" />
          Zeugnisse smarter erstellen
        </p>
        <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight md:text-6xl">
          Schulzeugnisse
          <span className="block bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
            in Minuten statt Stunden
          </span>
        </h1>
        <p className="mt-5 max-w-xl text-base text-slate-400 md:text-lg">
          KI-gestützte Zeugnistexte für Lehrkräfte – individuell, schnell und passend zum
          Sozialverhalten deiner Schülerinnen und Schüler.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="h-12 bg-blue-600 px-8 hover:bg-blue-500">
            <Link href={session ? "/dashboard" : "/auth/register"}>
              {session ? "Dashboard öffnen" : "Jetzt kostenlos starten"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          {!session && (
            <Button asChild size="lg" variant="outline" className="h-12 border-white/20 bg-white/5 text-white hover:bg-white/10">
              <Link href="/auth/login">Anmelden</Link>
            </Button>
          )}
        </div>

        <div className="mt-12 grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
          {features.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left backdrop-blur-sm"
            >
              <Icon className="mb-2 h-5 w-5 text-blue-400" />
              <p className="font-semibold text-white">{title}</p>
              <p className="mt-1 text-sm text-slate-400">{text}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="relative z-10 flex shrink-0 flex-col items-center gap-2 border-t border-white/10 px-6 py-4 text-xs text-slate-500 sm:flex-row sm:justify-between md:px-10">
        <p>© {new Date().getFullYear()} Klick & Zeugnis</p>
        <nav className="flex gap-4">
          <Link href="/impressum" className="hover:text-slate-300">Impressum</Link>
          <Link href="/datenschutz" className="hover:text-slate-300">Datenschutz</Link>
          <Link href="/agb" className="hover:text-slate-300">AGB</Link>
        </nav>
      </footer>
    </div>
  );
}
