import PageContainer from "@/components/layout/PageContainer";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { GraduationCap } from "lucide-react";

type Props = {
  title: string;
  children: React.ReactNode;
};

export default function LegalPage({ title, children }: Props) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto flex max-w-[90rem] items-center gap-2 px-4 py-4 md:px-8">
          <Link href="/" className="flex items-center gap-2 text-slate-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
              <GraduationCap className="h-4 w-4" />
            </span>
            <span className="font-bold">Klick & Zeugnis</span>
          </Link>
        </div>
      </header>
      <main className="flex-1">
        <PageContainer size="narrow">
          <h1 className="mb-8 text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
          <div className="prose prose-slate max-w-none space-y-4 text-slate-700">{children}</div>
        </PageContainer>
      </main>
      <Footer />
    </div>
  );
}
