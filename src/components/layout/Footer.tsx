import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200/80 bg-white">
      <div className="mx-auto flex max-w-[90rem] flex-col items-center justify-between gap-4 px-4 py-6 text-sm text-slate-500 md:flex-row md:px-8">
        <p>© {new Date().getFullYear()} Klick & Zeugnis</p>
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          <Link href="/impressum" className="hover:text-slate-900 hover:underline">
            Impressum
          </Link>
          <Link href="/datenschutz" className="hover:text-slate-900 hover:underline">
            Datenschutz
          </Link>
          <Link href="/agb" className="hover:text-slate-900 hover:underline">
            AGB
          </Link>
        </nav>
      </div>
    </footer>
  );
}
