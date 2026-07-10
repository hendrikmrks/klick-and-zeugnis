import { cn } from "@/lib/utils";

type Props = {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
};

export default function SectionCard({ title, description, children, className }: Props) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6",
        className
      )}
    >
      {title && <h2 className="text-lg font-semibold text-slate-900">{title}</h2>}
      {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      <div className={cn(title || description ? "mt-5" : "")}>{children}</div>
    </section>
  );
}
