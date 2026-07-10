import LegalPage from "@/components/layout/LegalPage";
import Link from "next/link";

export default function WiderrufPage() {
  return (
    <LegalPage title="Widerrufsbelehrung">
      <p className="text-sm text-slate-500">
        Stand: Juli 2026
      </p>

      <h2 className="text-xl font-semibold text-slate-900">Widerrufsrecht</h2>
      <p>
        Du hast das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen.
      </p>
      <p>
        Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsschlusses.
      </p>
      <p>
        Um dein Widerrufsrecht auszuüben, musst du uns
      </p>
      <p>
        Hendrik Beier<br />
        Schützenstraße 18<br />
        12165 Berlin<br />
        Deutschland
        <br />
        E-Mail:{" "}
        <a href="mailto:kontakt@klick-and-zeugnis.de" className="text-blue-600 hover:underline">
          kontakt@klick-and-zeugnis.de
        </a>
      </p>
      <p>
        mittels einer eindeutigen Erklärung (z. B. ein mit der Post versandter Brief oder eine E-Mail)
        über deinen Entschluss, diesen Vertrag zu widerrufen, informieren. Du kannst dafür das
        beigefügte Muster-Widerrufsformular verwenden, das jedoch nicht vorgeschrieben ist.
      </p>
      <p>
        Zur Wahrung der Widerrufsfrist reicht es aus, dass du die Mitteilung über die Ausübung des
        Widerrufsrechts vor Ablauf der Widerrufsfrist absendest.
      </p>

      <h2 className="text-xl font-semibold text-slate-900">Folgen des Widerrufs</h2>
      <p>
        Wenn du diesen Vertrag widerrufst, haben wir dir alle Zahlungen, die wir von dir erhalten haben,
        einschließlich der Lieferkosten (mit Ausnahme der zusätzlichen Kosten, die sich daraus ergeben,
        dass du eine andere Art der Lieferung als die von uns angebotene, günstigste Standardlieferung
        gewählt hast), unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an
        dem die Mitteilung über deinen Widerruf dieses Vertrags bei uns eingegangen ist. Für diese
        Rückzahlung verwenden wir dasselbe Zahlungsmittel, das du bei der ursprünglichen Transaktion
        eingesetzt hast, es sei denn, mit dir wurde ausdrücklich etwas anderes vereinbart; in keinem
        Fall werden dir wegen dieser Rückzahlung Entgelte berechnet.
      </p>
      <p>
        Hast du verlangt, dass die Dienstleistungen während der Widerrufsfrist beginnen sollen, so hast
        du uns einen angemessenen Betrag zu zahlen, der dem Anteil der bis zu dem Zeitpunkt, zu dem du
        uns von der Ausübung des Widerrufsrechts hinsichtlich dieses Vertrags unterrichtest, bereits
        erbrachten Dienstleistungen im Vergleich zum Gesamtumfang der im Vertrag vorgesehenen
        Dienstleistungen entspricht.
      </p>

      <h2 className="text-xl font-semibold text-slate-900">
        Besonderer Hinweis bei digitalen Dienstleistungen
      </h2>
      <p>
        Das Widerrufsrecht erlischt bei einem Vertrag über die Erbringung von Dienstleistungen in
        digitaler Form, wenn der Anbieter mit der Ausführung des Vertrags begonnen hat, nachdem der
        Verbraucher
      </p>
      <ul className="list-disc pl-6 space-y-1">
        <li>
          ausdrücklich zugestimmt hat, dass der Anbieter mit der Ausführung des Vertrags vor Ablauf
          der Widerrufsfrist beginnt, und
        </li>
        <li>
          seine Kenntnis davon bestätigt hat, dass er durch seine Zustimmung mit Beginn der Ausführung
          des Vertrags sein Widerrufsrecht verliert.
        </li>
      </ul>
      <p>
        Diese Zustimmung holen wir im Rahmen der Annahme eines kostenpflichtigen Tarifs ein, sofern
        die Freischaltung vor Ablauf der Widerrufsfrist erfolgt. Weitere Informationen findest du in
        unseren{" "}
        <Link href="/agb" className="text-blue-600 hover:underline">AGB</Link>.
      </p>

      <h2 className="text-xl font-semibold text-slate-900">Muster-Widerrufsformular</h2>
      <p>
        (Wenn du den Vertrag widerrufen willst, dann fülle bitte dieses Formular aus und sende es
        zurück.)
      </p>
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm leading-relaxed">
        <p>An</p>
        <p className="mt-2">
          Hendrik Beier<br />
          Schützenstraße 18<br />
          12165 Berlin<br />
          E-Mail: kontakt@klick-and-zeugnis.de
        </p>
        <p className="mt-4">
          Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über die
          Erbringung der folgenden Dienstleistung:
        </p>
        <p className="mt-4">— Bestellt am (*)/erhalten am (*)</p>
        <p>— Name des/der Verbraucher(s)</p>
        <p>— Anschrift des/der Verbraucher(s)</p>
        <p>— Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier)</p>
        <p>— Datum</p>
        <p className="mt-4 text-slate-500">(*) Unzutreffendes streichen.</p>
      </div>

      <h2 className="text-xl font-semibold text-slate-900">Weitere Informationen</h2>
      <p>
        <Link href="/impressum" className="text-blue-600 hover:underline">Impressum</Link>
        {" · "}
        <Link href="/agb" className="text-blue-600 hover:underline">AGB</Link>
        {" · "}
        <Link href="/datenschutz" className="text-blue-600 hover:underline">Datenschutz</Link>
      </p>
    </LegalPage>
  );
}
