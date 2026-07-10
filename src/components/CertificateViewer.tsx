import { Button } from "@/components/ui/button";
import StylePresetSelector from "@/components/certificate/StylePresetSelector";
import type { CertificateStyle } from "@/lib/certificate-style";
import { Copy, RefreshCw, RotateCcw, Save } from "lucide-react";
import ReportCertificateButton from "@/components/certificate/ReportCertificateButton";
import ClassNameSelector, { ClassOrganizationUpsell } from "@/components/certificate/ClassNameSelector";

type Props = {
  content: string;
  placeholder?: string;
  onClear: () => void;
  onSave: () => void;
  onRegenerate?: () => void;
  canSave?: boolean;
  canRegenerate?: boolean;
  regenerating?: boolean;
  style?: CertificateStyle;
  onStyleChange?: (style: CertificateStyle) => void;
  studentName?: string;
  canUseClasses?: boolean;
  className?: string;
  onClassNameChange?: (value: string) => void;
};

export default function CertificateViewer({
  content,
  placeholder,
  onClear,
  onSave,
  onRegenerate,
  canSave,
  canRegenerate,
  regenerating,
  style = "default",
  onStyleChange,
  studentName,
  canUseClasses,
  className = "",
  onClassNameChange,
}: Props) {
  const displayText = content || placeholder || "";
  const isEmpty = !content;

  const handleCopy = () => {
    if (!content) return;
    navigator.clipboard.writeText(content);
  };

  return (
    <div className="flex min-h-0 flex-col gap-4">
      <textarea
        readOnly
        value={displayText}
        className={`min-h-[220px] w-full flex-1 resize-none rounded-xl border p-4 text-sm leading-relaxed ${
          isEmpty
            ? "border-dashed border-slate-200 bg-slate-50 text-slate-400 italic"
            : "border-slate-200 bg-white text-slate-800"
        }`}
      />

      {canUseClasses && onClassNameChange ? (
        <ClassNameSelector value={className} onChange={onClassNameChange} />
      ) : (
        !canUseClasses && canSave && <ClassOrganizationUpsell />
      )}

      {!isEmpty && onStyleChange && onRegenerate && (
        <div className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3">
          <StylePresetSelector
            value={style}
            onChange={onStyleChange}
            disabled={regenerating}
            compact
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRegenerate}
            disabled={!canRegenerate || regenerating}
            className="w-full"
          >
            <RefreshCw className={`h-3.5 w-3.5 shrink-0 ${regenerating ? "animate-spin" : ""}`} />
            {regenerating ? "Wird neu generiert…" : "Neu generieren"}
          </Button>
          <p className="text-xs text-slate-500">
            Verbraucht erneut ein Zeugnis aus deinem Monatslimit.
          </p>
        </div>
      )}

      <div className="space-y-2">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <Button type="button" variant="outline" size="sm" onClick={onClear} className="w-full">
            <RotateCcw className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Zurücksetzen</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopy}
            disabled={isEmpty}
            className="w-full"
          >
            <Copy className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Kopieren</span>
          </Button>
          <Button type="button" size="sm" onClick={onSave} disabled={!canSave} className="w-full">
            <Save className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Speichern</span>
          </Button>
        </div>
        {!isEmpty && (
          <ReportCertificateButton text={content} studentName={studentName} />
        )}
      </div>
    </div>
  );
}
