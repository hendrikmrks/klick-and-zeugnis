import React from "react";
import { cn } from "@/lib/utils";

type CardProps = {
  children: React.ReactNode;
  title?: string;
  className?: string;
};

export default function Card({ children, title, className }: CardProps) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6",
        className
      )}
    >
      {title && (
        <h2 className="mb-4 shrink-0 text-lg font-semibold text-slate-900">{title}</h2>
      )}
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
