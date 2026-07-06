import LegalPage from "@/components/layout/LegalPage";
import Link from "next/link";

export default function DatenschutzPage() {
  return (
    <LegalPage title="Datenschutzerklärung">
      <p className="text-sm text-amber-700 rounded-lg bg-amber-50 p-3">
        Hinweis: Dies ist eine Muster-Datenschutzerklärung. Bitte vor Produktivbetrieb rechtlich prüfen und anpassen.
      </p>

      <h2 className="text-xl font-semibold text-slate-900">1. Verantwortlicher</h2>
      <p>
        Klick & Zeugnis, Musterstraße 1, 12345 Musterstadt, E-Mail: datenschutz@klick-and-zeugnis.de
      </p>

      <h2 className="text-xl font-semibold text-slate-900">2. Erhebung und Speicherung personenbezogener Daten</h2>
      <p>
        Bei der Registrierung und Nutzung unseres Dienstes verarbeiten wir insbesondere: Name, E-Mail-Adresse,
        Geburtsdatum, Passwort (verschlüsselt), Abonnementstatus, gespeicherte Zeugnistexte sowie Nutzungsdaten
        zur Bereitstellung des Dienstes.
      </p>

      <h2 className="text-xl font-semibold text-slate-900">3. Zweck der Verarbeitung</h2>
      <ul className="list-disc pl-6 space-y-1">
        <li>Bereitstellung und Betrieb der Plattform zur Zeugniserstellung</li>
        <li>Authentifizierung und Kontoverwaltung (inkl. optionaler Zwei-Faktor-Authentifizierung)</li>
        <li>Abwicklung von Abonnement-Anfragen</li>
        <li>Qualitätssicherung bei gemeldeten Zeugnistexten</li>
      </ul>

      <h2 className="text-xl font-semibold text-slate-900">4. Rechtsgrundlagen</h2>
      <p>
        Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) sowie
        Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse am sicheren Betrieb).
      </p>

      <h2 className="text-xl font-semibold text-slate-900">5. Speicherdauer</h2>
      <p>
        Personenbezogene Daten werden gelöscht, sobald sie für die Zwecke nicht mehr erforderlich sind.
        Du kannst dein Konto jederzeit in den Einstellungen löschen.
      </p>

      <h2 className="text-xl font-semibold text-slate-900">6. Deine Rechte</h2>
      <p>
        Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung,
        Datenübertragbarkeit und Widerspruch. Kontaktiere uns unter datenschutz@klick-and-zeugnis.de.
      </p>

      <h2 className="text-xl font-semibold text-slate-900">7. Weitere Informationen</h2>
      <p>
        Details zu Nutzungsbedingungen findest du in unseren{" "}
        <Link href="/agb" className="text-blue-600 hover:underline">AGB</Link>.
      </p>
    </LegalPage>
  );
}
