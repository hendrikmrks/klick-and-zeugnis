import { CreditCard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function PaymentForm() {
  return (
    <section className="mt-10 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-2">
        <CreditCard className="h-5 w-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-slate-900">Zahlungsdaten</h2>
      </div>
      <p className="mb-6 text-sm text-slate-500">
        Die Zahlungsabwicklung wird in einer zukünftigen Version integriert.
      </p>
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-2">
          <Label>Karteninhaber</Label>
          <Input placeholder="Max Mustermann" disabled />
        </div>
        <div className="space-y-2">
          <Label>Kartennummer</Label>
          <Input placeholder="1234 5678 9012 3456" disabled />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Ablaufdatum</Label>
            <Input placeholder="MM/JJ" disabled />
          </div>
          <div className="space-y-2">
            <Label>CVC</Label>
            <Input placeholder="123" disabled />
          </div>
        </div>
        <Button type="submit" disabled className="bg-blue-600">
          Zahlungsdaten speichern
        </Button>
      </form>
    </section>
  );
}
