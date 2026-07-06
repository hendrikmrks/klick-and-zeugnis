"use client";

import "./globals.css";
import NavBar from "@/components/NavBar";
import Footer from "@/components/layout/Footer";
import { Inter } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { usePathname } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

const authPaths = ["/auth/login", "/auth/register"];
const legalPaths = ["/impressum", "/datenschutz", "/agb"];
const barePaths = ["/", ...authPaths];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isBarePage = barePaths.some((p) => pathname === p);
  const isLegalPage = legalPaths.some((p) => pathname?.startsWith(p));

  return (
    <html lang="de">
      <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased`}>
        <SessionProvider>
          {isBarePage || isLegalPage ? (
            children
          ) : (
            <div className="flex min-h-screen flex-col">
              <NavBar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          )}
        </SessionProvider>
      </body>
    </html>
  );
}
