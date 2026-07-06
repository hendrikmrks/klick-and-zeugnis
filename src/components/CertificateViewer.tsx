import { Button } from "@/components/ui/button";
import { Copy, RotateCcw, Save } from "lucide-react";
import ReportCertificateButton from "@/components/certificate/ReportCertificateButton";
import ClassNameSelector, { ClassOrganizationUpsell } from "@/components/certificate/ClassNameSelector";

type Props = {
  content: string;
  placeholder?: string;
  onClear: () => void;
  onSave: () => void;
  canSave?: boolean;
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
  canSave,
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
    <div className="flex min-h-[360px] flex-col gap-4">
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

      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onClear} className="h-9 w-full gap-1.5 px-2 text-xs sm:text-sm">
            <RotateCcw className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Zurücksetzen</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopy}
            disabled={isEmpty}
            className="h-9 w-full gap-1.5 px-2 text-xs sm:text-sm"
          >
            <Copy className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Kopieren</span>
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onSave}
            disabled={!canSave}
            className="h-9 w-full gap-1.5 bg-blue-600 px-2 text-xs hover:bg-blue-700 sm:text-sm"
          >
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
