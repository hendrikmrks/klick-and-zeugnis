import PlanCard from "./PlanCard";
import { isDowngrade, isUpgrade } from "@/lib/subscription";

type Request = {
  id: string;
  requestedLevel: string;
  status: string;
  adminNote: string | null;
  createdAt: string;
};

type Props = {
  currentPlan: string;
  onPlanAction: (plan: string) => void;
  processingPlan: string | null;
  pendingRequest: Request | null;
  hasPendingUpgrade: boolean;
};

const plans = [
  {
    name: "Free",
    price: "0€",
    features: [
      "5 Zeugnisse pro Monat",
      "1 Zeugnis speichern",
      "Kein Support",
      "Werbung kann enthalten sein",
    ],
  },
  {
    name: "Pro",
    price: "3,99€",
    features: [
      "15 Zeugnisse pro Monat",
      "5 Zeugnisse speichern",
      "Werbung kann enthalten sein",
    ],
  },
  {
    name: "Premium",
    price: "9,99€",
    features: [
      "70 Zeugnisse pro Monat",
      "50 Zeugnisse speichern",
      "Zeugnisse nach Klassen ordnen",
      "Keine Werbung",
    ],
    popular: true,
  },
  {
    name: "Vip",
    price: "29,99€",
    features: [
      "Unbegrenzte Zeugnisse pro Monat",
      "Unbegrenzte Zeugnisse speichern",
      "Zeugnisse nach Klassen ordnen",
      "Beta-Features vorab testen",
      "Keine Werbung",
    ],
  },
];

export default function PlansGrid({
  currentPlan,
  onPlanAction,
  processingPlan,
  pendingRequest,
  hasPendingUpgrade,
}: Props) {
  return (
    <div className="grid gap-6 pt-2 sm:grid-cols-2 lg:grid-cols-4">
      {plans.map((plan) => {
        const isCurrent = currentPlan === plan.name;
        const isWaiting =
          pendingRequest?.status === "Pending" && pendingRequest.requestedLevel === plan.name;
        const isUpgradePlan = isUpgrade(currentPlan, plan.name);
        const isDowngradePlan = isDowngrade(currentPlan, plan.name);
        const disabled =
          isCurrent ||
          isWaiting ||
          processingPlan === plan.name ||
          (hasPendingUpgrade && isUpgradePlan && !isWaiting);

        return (
          <PlanCard
            key={plan.name}
            plan={plan}
            isCurrent={isCurrent}
            isWaiting={isWaiting}
            isProcessing={processingPlan === plan.name}
            isUpgrade={isUpgradePlan}
            isDowngrade={isDowngradePlan}
            disabled={disabled}
            onAction={() => onPlanAction(plan.name)}
          />
        );
      })}
    </div>
  );
}

export { plans };
