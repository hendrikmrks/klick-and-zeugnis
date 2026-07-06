import { cn } from "@/lib/utils";

type Props = {
  label: string;
  onClick: (e: React.MouseEvent) => void;
  variant?: "primary" | "danger" | "ghost";
};

export default function ActionButton({ label, onClick, variant = "primary" }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
        variant === "primary" && "bg-blue-600 text-white hover:bg-blue-700",
        variant === "danger" && "bg-red-600 text-white hover:bg-red-700",
        variant === "ghost" && "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
      )}
    >
      {label}
    </button>
  );
}
