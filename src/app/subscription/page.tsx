"use client";

import { useState, useEffect, useCallback } from "react";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import LoadingState from "@/components/layout/LoadingState";
import CurrentPlan from "@/components/subscription/CurrentPlan";
import PlansGrid from "@/components/subscription/PlansGrid";
import { useMe } from "@/lib/hooks/useMe";
import { isDowngrade, isUpgrade } from "@/lib/subscription";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

type SubRequest = {
  id: string;
  requestedLevel: string;
  status: string;
  adminNote: string | null;
  createdAt: string;
};

export default function SubscriptionPage() {
  const { user, isLoading, isError, refetch } = useMe();
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

  if (isLoading) return <LoadingState />;
  if (isError || !user) return <p className="p-8 text-center text-slate-600">Nicht eingeloggt</p>;

  return (
    <PageContainer>
      <PageHeader
        title="Abonnement"
        description="In höhere Tarife per Anfrage – in niedrigere Tarife jederzeit direkt wechseln."
      />

      <CurrentPlan plan={currentPlan} pendingRequest={pendingRequest} />

      {hasPendingUpgrade && pendingRequest && (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <p className="font-medium text-amber-900">
              Upgrade auf {pendingRequest.requestedLevel} wartet auf Freigabe
            </p>
            <p className="mt-1 text-sm text-amber-800">
              Deine Anfrage wird von einem Administrator geprüft. Bis dahin bleibst du im {currentPlan}-Tarif.
            </p>
          </div>
        </div>
      )}

      {message && (
        <p className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">{message}</p>
      )}
      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Verfügbare Tarife</h2>
        <PlansGrid
          currentPlan={currentPlan}
          onPlanAction={handlePlanAction}
          processingPlan={processingPlan}
          pendingRequest={pendingRequest}
          hasPendingUpgrade={hasPendingUpgrade}
        />
      </div>

      {requests.length > 0 && (
        <section className="mt-10 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Anfragen-Historie</h2>
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
        </section>
      )}
    </PageContainer>
  );
}
