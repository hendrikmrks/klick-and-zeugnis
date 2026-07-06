import LegalPage from "@/components/layout/LegalPage";
import Link from "next/link";

export default function AgbPage() {
  return (
    <LegalPage title="Allgemeine Geschäftsbedingungen (AGB)">
      <p className="text-sm text-amber-700 rounded-lg bg-amber-50 p-3">
        Hinweis: Dies sind Muster-AGB. Bitte vor Produktivbetrieb rechtlich prüfen und anpassen.
      </p>

      <h2 className="text-xl font-semibold text-slate-900">§ 1 Geltungsbereich</h2>
      <p>
        Diese AGB gelten für die Nutzung der Plattform „Klick & Zeugnis“ zur KI-gestützten Erstellung von
        Schulzeugnistexten. Mit der Registrierung akzeptierst du diese Bedingungen.
      </p>

      <h2 className="text-xl font-semibold text-slate-900">§ 2 Leistungsbeschreibung</h2>
      <p>
        Der Anbieter stellt eine webbasierte Anwendung bereit, mit der registrierte Nutzer Zeugnistexte
        generieren, bearbeiten und speichern können. Die Nutzung erfolgt nach dem jeweils gebuchten Tarif.
      </p>

      <h2 className="text-xl font-semibold text-slate-900">§ 3 Registrierung und Konto</h2>
      <p>
        Für die Nutzung ist ein Benutzerkonto erforderlich. Du bist verpflichtet, wahrheitsgemäße Angaben zu
        machen und dein Passwort geheim zu halten. Du kannst dein Konto jederzeit in den Einstellungen löschen.
      </p>

      <h2 className="text-xl font-semibold text-slate-900">§ 4 Abonnements</h2>
      <p>
        Kostenpflichtige Tarife werden auf Anfrage durch Administratoren freigeschaltet. Es besteht kein Anspruch
        auf Genehmigung eines gewünschten Tarifs. Administratoren können Tarife jederzeit anpassen oder zurückstufen.
      </p>

      <h2 className="text-xl font-semibold text-slate-900">§ 5 Nutzung der KI-Inhalte</h2>
      <p>
        Generierte Texte dienen als Vorschläge. Die Verantwortung für die in Zeugnissen verwendeten Formulierungen
        liegt bei der nutzenden Lehrkraft. Unangemessene oder fehlerhafte Texte können über die Meldefunktion
        gemeldet werden.
      </p>

      <h2 className="text-xl font-semibold text-slate-900">§ 6 Haftung</h2>
      <p>
        Der Anbieter haftet unbeschränkt bei Vorsatz und grober Fahrlässigkeit. Bei leichter Fahrlässigkeit
        haftet der Anbieter nur bei Verletzung wesentlicher Vertragspflichten, begrenzt auf den vorhersehbaren Schaden.
      </p>

      <h2 className="text-xl font-semibold text-slate-900">§ 7 Datenschutz</h2>
      <p>
        Informationen zur Datenverarbeitung findest du in unserer{" "}
        <Link href="/datenschutz" className="text-blue-600 hover:underline">Datenschutzerklärung</Link>.
      </p>

      <h2 className="text-xl font-semibold text-slate-900">§ 8 Schlussbestimmungen</h2>
      <p>
        Es gilt deutsches Recht. Sollten einzelne Bestimmungen unwirksam sein, bleibt die Wirksamkeit der übrigen
        Bestimmungen unberührt.
      </p>
    </LegalPage>
  );
}
