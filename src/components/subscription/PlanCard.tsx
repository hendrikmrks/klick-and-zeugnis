import { Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Plan = {
  name: string;
  price: string;
  features: string[];
  popular?: boolean;
};

type Props = {
  plan: Plan;
  isCurrent: boolean;
  isWaiting?: boolean;
  isProcessing?: boolean;
  isUpgrade?: boolean;
  isDowngrade?: boolean;
  disabled?: boolean;
  onAction: () => void;
};

export default function PlanCard({
  plan,
  isCurrent,
  isWaiting,
  isProcessing,
  isUpgrade,
  isDowngrade,
  disabled,
  onAction,
}: Props) {
  const buttonLabel = isCurrent
    ? "Aktueller Tarif"
    : isWaiting
      ? "Wartend"
      : isProcessing
        ? "Wird verarbeitet…"
        : isDowngrade
          ? "Tarif wechseln"
          : isUpgrade
            ? "Upgrade anfragen"
            : "Auswählen";

  return (
    <div
      className={cn(
        "relative mt-3 flex flex-col rounded-2xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md",
        isCurrent && "border-blue-500 ring-2 ring-blue-500/20",
        isWaiting && "border-amber-400 ring-2 ring-amber-400/20",
        !isCurrent && !isWaiting && "border-slate-200/80",
        plan.popular && !isCurrent && !isWaiting && "border-violet-300"
      )}
    >
      {isWaiting && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white hover:bg-amber-500">
          <Clock className="mr-1 h-3 w-3" />
          Wartend
        </Badge>
      )}
      {plan.popular && !isCurrent && !isWaiting && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-violet-600 px-3 py-0.5 text-xs font-semibold text-white">
          Beliebt
        </span>
      )}

      <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
      <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
        {plan.price}
        <span className="text-base font-normal text-slate-500"> / Monat</span>
      </p>

      <ul className="mt-6 flex-1 space-y-3">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-slate-600">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
            {feature}
          </li>
        ))}
      </ul>

      <Button
        onClick={onAction}
        disabled={disabled}
        className={cn(
          "mt-6 w-full",
          isWaiting && "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-50",
          !isCurrent && !isWaiting && !disabled && isDowngrade && "border-slate-300",
          !isCurrent && !isWaiting && !disabled && isUpgrade && "bg-blue-600 hover:bg-blue-700"
        )}
        variant={isCurrent || isWaiting || isDowngrade ? "outline" : "default"}
      >
        {buttonLabel}
      </Button>
    </div>
  );
}
