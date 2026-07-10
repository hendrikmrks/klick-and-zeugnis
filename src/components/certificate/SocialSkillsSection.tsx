"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type SocialSkillsSectionProps = {
  socialSkills: Record<string, number>;
  setSocialSkills: (socialSkills: Record<string, number>) => void;
};

const categories = [
  "Motivation",
  "Anstrengungsbereitschaft",
  "Ausdauer",
  "Konzentrationsfähigkeit",
  "Sorgfalt",
  "Selbstständigkeit",
  "Konfliktfähigkeit",
  "Kompromissbereitschaft",
];

const labels = [
  "in Ansätzen ausgeprägt",
  "vorhanden",
  "gut ausgeprägt",
  "hervorragend ausgeprägt",
];

export default function SocialSkillsSection({
  socialSkills,
  setSocialSkills,
}: SocialSkillsSectionProps) {
  const [expanded, setExpanded] = useState(false);

  const handleChange = (key: string, val: number) => {
    setSocialSkills({ ...socialSkills, [key]: val });
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex h-10 w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 text-left text-sm transition-colors hover:bg-slate-100"
      >
        <span className="font-medium text-slate-900">Sozialverhalten</span>
        <ChevronDown className={cn("h-4 w-4 text-slate-500 transition-transform", expanded && "rotate-180")} />
      </button>

      {expanded && (
        <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
          {categories.map((cat) => {
            const currentValue = socialSkills[cat] ?? 4;
            return (
              <div key={cat}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium text-slate-700">{cat}</span>
                  <span className="text-slate-500">{labels[currentValue - 1]}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={4}
                  step={1}
                  value={currentValue}
                  onChange={(e) => handleChange(cat, parseInt(e.target.value))}
                  className="h-2 w-full cursor-pointer accent-blue-600"
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
