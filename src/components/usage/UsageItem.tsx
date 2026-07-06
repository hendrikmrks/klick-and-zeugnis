import UsageProgress from "./UsageProgress";

type Props = {
  label: string;
  value: string;
  progress?: number;
};

export default function UsageItem({ label, value, progress }: Props) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-1 text-xl font-bold text-slate-900">{value}</div>
      {progress !== undefined && progress > 0 && (
        <div className="mt-3">
          <UsageProgress progress={progress} />
        </div>
      )}
    </div>
  );
}
