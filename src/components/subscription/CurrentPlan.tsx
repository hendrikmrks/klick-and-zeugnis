import { Crown, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Props = {
  plan: string;
  pendingRequest?: {
    requestedLevel: string;
    status: string;
  } | null;
};

const planDescriptions: Record<string, string> = {
  Free: "Ideal zum Ausprobieren mit begrenztem Kontingent.",
  Pro: "Für Einzelpersonen mit regelmäßigem Zeugnisbedarf.",
  Premium: "Für Lehrkräfte mit vielen Klassen und Schülern.",
  Vip: "Unbegrenzte Nutzung und früher Zugang zu neuen Features.",
};

export default function CurrentPlan({ plan, pendingRequest }: Props) {
  const isWaiting = pendingRequest?.status === "Pending";

  return (
    <div className="flex items-start gap-4 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
        <Crown className="h-6 w-6" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium text-blue-700">Aktueller Tarif</p>
          {isWaiting && (
            <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
              <Clock className="mr-1 h-3 w-3" />
              Upgrade auf {pendingRequest.requestedLevel} wartend
            </Badge>
          )}
        </div>
        <p className="text-2xl font-bold text-slate-900">{plan}</p>
        <p className="mt-1 text-sm text-slate-600">{planDescriptions[plan] ?? ""}</p>
      </div>
    </div>
  );
}
