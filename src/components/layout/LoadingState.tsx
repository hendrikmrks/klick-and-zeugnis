export default function LoadingState({ label = "Wird geladen…" }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 animate-fade-in">
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 rounded-full border-4 border-slate-200" />
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
      <p className="text-sm font-medium text-slate-600">{label}</p>
    </div>
  );
}
