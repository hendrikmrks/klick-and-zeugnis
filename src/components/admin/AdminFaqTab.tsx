"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Alert from "@/components/layout/Alert";
import { cn } from "@/lib/utils";
import { Pencil, Plus, Trash2 } from "lucide-react";

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
  published: boolean;
};

type Props = {
  items: FaqItem[];
  onReload: () => void;
};

export default function AdminFaqTab({ items, onReload }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [published, setPublished] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setEditingId(null);
    setShowNew(false);
    setQuestion("");
    setAnswer("");
    setSortOrder(0);
    setPublished(true);
    setError(null);
  };

  const startEdit = (item: FaqItem) => {
    setEditingId(item.id);
    setShowNew(false);
    setQuestion(item.question);
    setAnswer(item.answer);
    setSortOrder(item.sortOrder);
    setPublished(item.published);
    setError(null);
  };

  const handleSave = async () => {
    if (!question.trim() || !answer.trim()) {
      setError("Frage und Antwort sind erforderlich.");
      return;
    }

    setSaving(true);
    setError(null);

    const url = editingId ? `/api/admin/faq/${editingId}` : "/api/admin/faq";
    const method = editingId ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, answer, sortOrder, published }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Speichern fehlgeschlagen.");
      return;
    }

    resetForm();
    onReload();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("FAQ-Eintrag wirklich löschen?")) return;

    await fetch(`/api/admin/faq/${id}`, { method: "DELETE" });
    if (editingId === id) resetForm();
    onReload();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">{items.length} FAQ-Einträge</p>
        <Button
          size="sm"
          onClick={() => {
            resetForm();
            setShowNew(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Neuer Eintrag
        </Button>
      </div>

      {(showNew || editingId) && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 font-semibold text-slate-900">
            {editingId ? "FAQ bearbeiten" : "Neuer FAQ-Eintrag"}
          </h3>
          {error && <Alert variant="error">{error}</Alert>}
          <div className="space-y-3">
            <input
              className="w-full rounded-lg border border-slate-200 p-2 text-sm"
              placeholder="Frage"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <textarea
              className="w-full rounded-lg border border-slate-200 p-2 text-sm"
              placeholder="Antwort"
              rows={4}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                Reihenfolge:
                <input
                  type="number"
                  className="w-20 rounded-lg border border-slate-200 px-2 py-1"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                />
                Veröffentlicht
              </label>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? "Speichern…" : "Speichern"}
              </Button>
              <Button size="sm" variant="outline" onClick={resetForm}>
                Abbrechen
              </Button>
            </div>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <p className="text-slate-500">Noch keine FAQ-Einträge vorhanden.</p>
      ) : (
        items.map((item) => (
          <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">{item.question}</p>
                <p className="mt-2 text-sm text-slate-600">{item.answer}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">
                    Reihenfolge: {item.sortOrder}
                  </Badge>
                  <Badge
                    className={cn(
                      item.published
                        ? "bg-green-100 text-green-800 hover:bg-green-100"
                        : "bg-amber-100 text-amber-800 hover:bg-amber-100"
                    )}
                  >
                    {item.published ? "Veröffentlicht" : "Entwurf"}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => startEdit(item)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
