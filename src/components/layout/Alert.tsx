import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";

type Variant = "success" | "error" | "warning" | "info";

type Props = {
  variant: Variant;
  title?: string;
  children: React.ReactNode;
  className?: string;
};

const config: Record<
  Variant,
  { border: string; icon: React.ComponentType<{ className?: string }>; iconClass: string; bodyClass: string; titleClass: string }
> = {
  success: {
    border: "border-green-200 bg-green-50",
    icon: CheckCircle2,
    iconClass: "text-green-600",
    bodyClass: "text-green-800",
    titleClass: "text-green-900",
  },
  error: {
    border: "border-red-200 bg-red-50",
    icon: XCircle,
    iconClass: "text-red-600",
    bodyClass: "text-red-800",
    titleClass: "text-red-900",
  },
  warning: {
    border: "border-amber-200 bg-amber-50",
    icon: AlertTriangle,
    iconClass: "text-amber-600",
    bodyClass: "text-amber-800",
    titleClass: "text-amber-900",
  },
  info: {
    border: "border-blue-200 bg-blue-50",
    icon: Info,
    iconClass: "text-blue-600",
    bodyClass: "text-blue-800",
    titleClass: "text-blue-900",
  },
};

export default function Alert({ variant, title, children, className }: Props) {
  const { border, icon: Icon, iconClass, bodyClass, titleClass } = config[variant];

  return (
    <div
      className={cn(
        "mb-6 flex items-start gap-3 rounded-xl border p-4 text-sm",
        border,
        bodyClass,
        className
      )}
      role="alert"
    >
      <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", iconClass)} />
      <div className="min-w-0">
        {title && <p className={cn("font-medium", titleClass)}>{title}</p>}
        <div className={cn(title ? "mt-1" : "")}>{children}</div>
      </div>
    </div>
  );
}
