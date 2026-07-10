"use client";

import { CERTIFICATE_STYLES, type CertificateStyle } from "@/lib/certificate-style";
import { cn } from "@/lib/utils";

type Props = {
  value: CertificateStyle;
  onChange: (value: CertificateStyle) => void;
  disabled?: boolean;
  compact?: boolean;
};

export default function StylePresetSelector({ value, onChange, disabled, compact }: Props) {
  return (
    <div className="space-y-2">
      {!compact && (
        <p className="text-sm font-medium text-slate-700">Formulierungsstil</p>
      )}
      <div className={cn("grid gap-2", compact ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2")}>
        {CERTIFICATE_STYLES.map((style) => {
          const selected = value === style.id;
          return (
            <button
              key={style.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(style.id)}
              className={cn(
                "rounded-xl border px-3 py-2 text-left transition-colors",
                selected
                  ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/20"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
                disabled && "cursor-not-allowed opacity-60"
              )}
            >
              <span className="block text-sm font-medium text-slate-900">{style.label}</span>
              {!compact && (
                <span className="mt-0.5 block text-xs text-slate-500">{style.hint}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
