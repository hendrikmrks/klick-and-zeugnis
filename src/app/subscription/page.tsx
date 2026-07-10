"use client";

import { useState, useEffect, useCallback } from "react";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import LoadingState from "@/components/layout/LoadingState";
import CurrentPlan from "@/components/subscription/CurrentPlan";
import PlansGrid from "@/components/subscription/PlansGrid";
import { useRequireAuth } from "@/lib/hooks/useRequireAuth";
import { isDowngrade, isUpgrade } from "@/lib/subscription";
import { Badge } from "@/components/ui/badge";
import Alert from "@/components/layout/Alert";
import SectionCard from "@/components/layout/SectionCard";

type SubRequest = {
  id: string;
  requestedLevel: string;
  status: string;
  adminNote: string | null;
  createdAt: string;
};

export default function SubscriptionPage() {
  const { user, isLoading, isAuthenticated, refetch } = useRequireAuth();
  const [currentPlan, setCurrentPlan] = useState("Free");
  const [requests, setRequests] = useState<SubRequest[]>([]);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadRequests = useCallback(async () => {
    const res = await fetch("/api/subscription/request");
    if (res.ok) {
      const data = await res.json();
      setRequests(data.requests ?? []);
    }
  }, []);

  useEffect(() => {
    if (user?.subscriptionLevel) setCurrentPlan(user.subscriptionLevel);
  }, [user?.subscriptionLevel]);

  useEffect(() => {
    loadRequests();
  }, [user, loadRequests]);

  const pendingRequest = requests.find((r) => r.status === "Pending") ?? null;
  const hasPendingUpgrade = Boolean(pendingRequest);

  const handlePlanAction = async (plan: string) => {
    if (plan === currentPlan) return;

    setError("");
    setMessage("");

    if (isDowngrade(currentPlan, plan)) {
      const confirmed = window.confirm(
        `Möchtest du wirklich auf den ${plan}-Tarif wechseln?\n\n` +
          "Ein erneutes Upgrade ist danach nur über eine Anfrage an die Administratoren möglich."
      );
      if (!confirmed) return;

      setProcessingPlan(plan);
      const res = await fetch("/api/subscription/downgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetLevel: plan }),
      });
      const data = await res.json();
      setProcessingPlan(null);

      if (!res.ok) {
        setError(data.error ?? "Wechsel fehlgeschlagen.");
        return;
      }

      setCurrentPlan(plan);
      setMessage(`Du bist jetzt im ${plan}-Tarif.`);
      await loadRequests();
      refetch();
      return;
    }

    if (isUpgrade(currentPlan, plan)) {
      if (hasPendingUpgrade) {
        setError("Du hast bereits eine offene Upgrade-Anfrage.");
        return;
      }

      setProcessingPlan(plan);
      const res = await fetch("/api/subscription/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestedLevel: plan }),
      });
      const data = await res.json();
      setProcessingPlan(null);

      if (!res.ok) {
        setError(data.error ?? "Anfrage fehlgeschlagen.");
        return;
      }

      setMessage(`Deine Anfrage für den ${plan}-Tarif wurde eingereicht.`);
      await loadRequests();
    }
  };

  if (isLoading || !isAuthenticated || !user) return <LoadingState />;

  return (
    <PageContainer>
      <PageHeader
        title="Abonnement"
        description="In höhere Tarife per Anfrage – in niedrigere Tarife jederzeit direkt wechseln."
      />

      <CurrentPlan plan={currentPlan} pendingRequest={pendingRequest} />

      {hasPendingUpgrade && pendingRequest && (
        <Alert variant="warning" title={`Upgrade auf ${pendingRequest.requestedLevel} wartet auf Freigabe`}>
          Deine Anfrage wird von einem Administrator geprüft. Bis dahin bleibst du im {currentPlan}-Tarif.
        </Alert>
      )}

      {message && <Alert variant="success">{message}</Alert>}
      {error && <Alert variant="error">{error}</Alert>}

      <SectionCard title="Verfügbare Tarife" className="mt-8">
        <PlansGrid
          currentPlan={currentPlan}
          onPlanAction={handlePlanAction}
          processingPlan={processingPlan}
          pendingRequest={pendingRequest}
          hasPendingUpgrade={hasPendingUpgrade}
        />
      </SectionCard>

      {requests.length > 0 && (
        <SectionCard title="Anfragen-Historie" className="mt-10">
          <ul className="space-y-3">
            {requests.map((req) => (
              <li key={req.id} className="rounded-xl border border-slate-100 p-4 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{req.requestedLevel}</span>
                  <Badge
                    className={
                      req.status === "Pending"
                        ? "bg-amber-100 text-amber-800 hover:bg-amber-100"
                        : req.status === "Approved"
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-100"
                    }
                  >
                    {req.status === "Pending"
                      ? "Wartend"
                      : req.status === "Approved"
                        ? "Genehmigt"
                        : "Abgelehnt"}
                  </Badge>
                  <span className="text-slate-500">
                    {new Date(req.createdAt).toLocaleDateString("de-DE")}
                  </span>
                </div>
                {req.adminNote && (
                  <p className="mt-2 text-slate-600">Antwort: {req.adminNote}</p>
                )}
              </li>
            ))}
          </ul>
        </SectionCard>
      )}
    </PageContainer>
  );
}
