import { Suspense } from "react";
import WelcomePage from "@/components/welcome/WelcomePage";

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
          Laden…
        </div>
      }
    >
      <WelcomePage />
    </Suspense>
  );
}
