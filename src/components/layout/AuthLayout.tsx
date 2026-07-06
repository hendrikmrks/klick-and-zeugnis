import Link from "next/link";
import { GraduationCap } from "lucide-react";

type Props = {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
};

export default function AuthLayout({ children, title, subtitle }: Props) {
  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-600/25 via-slate-950 to-slate-950" />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="hidden min-h-0 flex-1 flex-col justify-center px-10 xl:px-16 lg:flex">
          <Link href="/" className="mb-10 inline-flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/30">
              <GraduationCap className="h-5 w-5" />
            </span>
            <span className="text-xl font-bold tracking-tight">Klick & Zeugnis</span>
          </Link>
          <h1 className="text-4xl font-bold leading-tight xl:text-5xl">
            Willkommen zurück
            <span className="mt-2 block text-lg font-normal text-slate-400">
              Melde dich an und erstelle Zeugnisse in Minuten.
            </span>
          </h1>
          <ul className="mt-8 space-y-3 text-sm text-slate-400">
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
        </div>

        <div className="flex min-h-0 flex-1 flex-col justify-center px-4 py-6 sm:px-8 lg:max-w-md lg:px-10 xl:max-w-lg">
          <div className="mb-6 flex items-center gap-2 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
              <GraduationCap className="h-4 w-4" />
            </span>
            <span className="font-bold">Klick & Zeugnis</span>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white p-6 shadow-2xl sm:p-8">
            <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
            <div className="mt-6 text-slate-900">{children}</div>
          </div>
        </div>
      </div>

      <footer className="relative z-10 flex shrink-0 items-center justify-between border-t border-white/10 px-6 py-3 text-xs text-slate-500 sm:px-10">
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
