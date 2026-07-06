"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Flag } from "lucide-react";

type Props = {
  text: string;
  studentName?: string;
  certificateId?: string;
  onSuccess?: () => void;
};

export default function ReportCertificateButton({
  text,
  studentName,
  certificateId,
  onSuccess,
}: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/certificate/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, reason, certificateId, studentName }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Meldung fehlgeschlagen.");
      return;
    }
    setSuccess(true);
    onSuccess?.();
    setTimeout(() => {
      setOpen(false);
      setSuccess(false);
      setReason("");
    }, 2000);
  };

  if (!text || text.length < 20) return null;

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-9 w-full gap-1.5 text-xs sm:text-sm"
        onClick={() => setOpen(true)}
      >
        <Flag className="h-3.5 w-3.5 shrink-0" />
        Zeugnistext melden
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">Zeugnistext melden</h3>
            <p className="mt-2 text-sm text-slate-600">
              Beschreibe das Problem. Ein Administrator prüft deine Meldung und gibt dir Feedback.
            </p>

            {success ? (
              <p className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
                Meldung wurde eingereicht. Du erhältst Feedback in deinen gespeicherten Zeugnissen.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="report-reason">Grund der Meldung</Label>
                  <textarea
                    id="report-reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="z. B. unpassende Formulierung, faktischer Fehler, unangemessener Ton …"
                    className="min-h-[100px] w-full rounded-lg border border-slate-200 p-3 text-sm"
                    required
                  />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Abbrechen
                  </Button>
                  <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                    {loading ? "Wird gesendet…" : "Meldung absenden"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
