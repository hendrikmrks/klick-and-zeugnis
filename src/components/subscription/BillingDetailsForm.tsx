"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { BillingDetails } from "@/lib/billing";

type Props = {
  defaultEmail?: string | null;
  planName: string;
  loading?: boolean;
  onSubmit: (details: BillingDetails) => void;
  onCancel: () => void;
};

export default function BillingDetailsForm({
  defaultEmail,
  planName,
  loading,
  onSubmit,
  onCancel,
}: Props) {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    onSubmit({
      billingEmail: String(formData.get("billingEmail") ?? "").trim(),
      billingName: String(formData.get("billingName") ?? "").trim(),
      billingStreet: String(formData.get("billingStreet") ?? "").trim(),
      billingZip: String(formData.get("billingZip") ?? "").trim(),
      billingCity: String(formData.get("billingCity") ?? "").trim(),
      billingCountry: String(formData.get("billingCountry") ?? "Deutschland").trim() || "Deutschland",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <h2 className="text-xl font-bold text-slate-900">Tarif {planName} anfragen</h2>
        <p className="mt-2 text-sm text-slate-600">
          Für kostenpflichtige Tarife benötigen wir deine Rechnungsdaten und eine E-Mail-Adresse
          für Angebot und Rechnung. Du erhältst ein individuelles Angebot per E-Mail und kannst
          es durch Zahlung annehmen.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="billingEmail">E-Mail für Angebot &amp; Rechnung</Label>
            <Input
              id="billingEmail"
              name="billingEmail"
              type="email"
              defaultValue={defaultEmail ?? ""}
              autoComplete="email"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="billingName">Rechnungsempfänger</Label>
            <Input
              id="billingName"
              name="billingName"
              placeholder="Max Mustermann oder Schule Musterstadt"
              autoComplete="name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="billingStreet">Straße und Hausnummer</Label>
            <Input
              id="billingStreet"
              name="billingStreet"
              autoComplete="street-address"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="billingZip">Postleitzahl</Label>
              <Input
                id="billingZip"
                name="billingZip"
                autoComplete="postal-code"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="billingCity">Ort</Label>
              <Input
                id="billingCity"
                name="billingCity"
                autoComplete="address-level2"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="billingCountry">Land</Label>
            <Input
              id="billingCountry"
              name="billingCountry"
              defaultValue="Deutschland"
              autoComplete="country-name"
              required
            />
          </div>

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Anfrage wird gesendet…" : "Anfrage absenden"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
