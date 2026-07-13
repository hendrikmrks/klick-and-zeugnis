import { Suspense } from "react";
import LoadingState from "@/components/layout/LoadingState";
import HilfePage from "./HilfePageContent";

export default function Page() {
  return (
    <Suspense fallback={<LoadingState label="Hilfe wird geladen…" />}>
      <HilfePage />
    </Suspense>
  );
}
