import LegalPage from "@/components/layout/LegalPage";

export default function ImpressumPage() {
  return (
    <LegalPage title="Impressum">
      <p className="text-sm text-amber-700 rounded-lg bg-amber-50 p-3">
        Hinweis: Dies ist ein Muster-Impressum. Bitte vor Produktivbetrieb durch rechtsgültige Angaben ersetzen.
      </p>

      <h2 className="text-xl font-semibold text-slate-900">Angaben gemäß § 5 TMG</h2>
      <p>
        Klick & Zeugnis<br />
        Musterstraße 1<br />
        12345 Musterstadt<br />
        Deutschland
      </p>

      <h2 className="text-xl font-semibold text-slate-900">Kontakt</h2>
      <p>
        E-Mail: kontakt@klick-and-zeugnis.de<br />
        Telefon: +49 (0) 123 456789
      </p>

      <h2 className="text-xl font-semibold text-slate-900">Vertretungsberechtigt</h2>
      <p>Max Mustermann (Geschäftsführer)</p>

      <h2 className="text-xl font-semibold text-slate-900">Umsatzsteuer-ID</h2>
      <p>Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: DE123456789</p>

      <h2 className="text-xl font-semibold text-slate-900">Verantwortlich für den Inhalt (§ 55 Abs. 2 RStV)</h2>
      <p>Max Mustermann, Musterstraße 1, 12345 Musterstadt</p>

      <h2 className="text-xl font-semibold text-slate-900">Streitschlichtung</h2>
      <p>
        Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{" "}
        <a href="https://ec.europa.eu/consumers/odr" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
          https://ec.europa.eu/consumers/odr
        </a>
        . Wir sind nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
      </p>
    </LegalPage>
  );
}
