import { cn } from "@/lib/utils";

type Props = {
  progress?: number;
  label?: string;
  value?: number;
  max?: number;
};

export default function UsageProgress({ progress, label, value, max }: Props) {
  const isUnlimited = max === Number.MAX_SAFE_INTEGER;
  const computedProgress =
    progress ??
    (value !== undefined && max !== undefined && max > 0 && !isUnlimited
      ? value / max
      : 0);
  const percent = Math.min(Math.max(computedProgress, 0), 1) * 100;

  return (
    <div>
      {(label || value !== undefined) && (
        <div className="mb-2 flex items-center justify-between text-sm">
          {label && <span className="font-medium text-slate-700">{label}</span>}
          {value !== undefined && max !== undefined && (
            <span className="text-slate-500">
              {value} / {isUnlimited ? "∞" : max}
            </span>
          )}
        </div>
      )}
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            percent >= 90 ? "bg-amber-500" : "bg-blue-600"
          )}
          style={{ width: isUnlimited ? "0%" : `${percent}%` }}
        />
      </div>
    </div>
  );
}
