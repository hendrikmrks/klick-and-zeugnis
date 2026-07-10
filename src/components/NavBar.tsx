"use client";

import Link from "next/link";
import UserMenu from "./UserMenu";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { GraduationCap, Menu, Shield, X } from "lucide-react";
import { useState, useMemo } from "react";

const baseNavLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/reports", label: "Zeugnisse" },
  { href: "/analytics", label: "Analysen" },
  { href: "/subscription", label: "Abo" },
];

export default function NavBar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = useMemo(() => {
    if (session?.user?.role === "Admin") {
      return [...baseNavLinks, { href: "/admin", label: "Admin" }];
    }
    return baseNavLinks;
  }, [session?.user?.role]);

  if (!session) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <nav className="mx-auto flex max-w-[90rem] items-center gap-3 px-4 py-3 md:px-8">
        <Link
          href="/dashboard"
          className="flex min-w-0 shrink items-center gap-2 text-slate-900"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <GraduationCap className="h-4 w-4" />
          </span>
          <span className="truncate text-base font-bold tracking-tight sm:text-lg">
            Klick & Zeugnis
          </span>
        </Link>

        <ul className="ml-2 hidden min-w-0 flex-1 items-center gap-1 lg:flex">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
          <UserMenu />
          <button
            type="button"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menü"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="border-t border-slate-100 bg-white px-4 py-3 lg:hidden">
          <ul className="space-y-1">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium",
                      active ? "bg-blue-50 text-blue-700" : "text-slate-600"
                    )}
                  >
                    {link.href === "/admin" && <Shield className="h-4 w-4" />}
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </header>
  );
}
