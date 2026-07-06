"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

type Props = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export default function ClassNameSelector({ value, onChange, disabled }: Props) {
  const [classes, setClasses] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/certificate/classes")
      .then((r) => (r.ok ? r.json() : { classes: [] }))
      .then((d) => setClasses(d.classes ?? []));
  }, []);

  return (
    <div className="space-y-2">
      <Label htmlFor="className">Klasse</Label>
      <Input
        id="className"
        list="class-name-options"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="z. B. 5a, 10b"
        disabled={disabled}
      />
      <datalist id="class-name-options">
        {classes.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
      <p className="text-xs text-slate-500">
        Ordne das Zeugnis einer Klasse zu. Bestehende Klassen kannst du auswählen oder eine neue eingeben.
      </p>
    </div>
  );
}

export function ClassOrganizationUpsell() {
  return (
    <p className="text-xs text-slate-500">
      Ab Premium kannst du Zeugnisse nach Klassen ordnen.{" "}
      <Link href="/subscription" className="font-medium text-blue-600 hover:underline">
        Tarif anfragen
      </Link>
    </p>
  );
}
