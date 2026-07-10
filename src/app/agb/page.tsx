import LegalPage from "@/components/layout/LegalPage";
import Link from "next/link";

export default function AgbPage() {
  return (
    <LegalPage title="Allgemeine Geschäftsbedingungen (AGB)">
      <p className="text-sm text-slate-500">
        Stand: Juli 2026
      </p>

      <h2 className="text-xl font-semibold text-slate-900">§ 1 Geltungsbereich und Vertragspartner</h2>
      <p>
        (1) Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für die Nutzung der webbasierten
        Plattform „Klick &amp; Zeugnis“ unter der Domain klick-and-zeugnis.de zur KI-gestützten
        Erstellung, Bearbeitung und Speicherung von Schulzeugnistexten.
      </p>
      <p>
        (2) Vertragspartner ist Hendrik Beier, Schützenstraße 18, 12165 Berlin, Deutschland
        (nachfolgend „Anbieter“). Kontakt:{" "}
        <a href="mailto:kontakt@klick-and-zeugnis.de" className="text-blue-600 hover:underline">
          kontakt@klick-and-zeugnis.de
        </a>
        . Umsatzsteuer-Identifikationsnummer: DE357943599.
      </p>
      <p>
        (3) Verbraucher im Sinne dieser AGB ist jede natürliche Person, die den Dienst zu
        Zwecken nutzt, die überwiegend weder ihrer gewerblichen noch ihrer selbstständigen
        beruflichen Tätigkeit zugerechnet werden können. Unternehmer ist eine natürliche oder
        juristische Person, die den Dienst in Ausübung ihrer gewerblichen oder selbstständigen
        Tätigkeit nutzt.
      </p>
      <p>
        (4) Abweichende Bedingungen des Nutzers finden keine Anwendung, es sei denn, der Anbieter
        stimmt ihrer Geltung ausdrücklich schriftlich zu.
      </p>

      <h2 className="text-xl font-semibold text-slate-900">§ 2 Vertragsgegenstand und Leistungsbeschreibung</h2>
      <p>
        (1) Der Anbieter stellt eine Software-as-a-Service-Lösung bereit, mit der registrierte
        Nutzer Zeugnistexte generieren, bearbeiten, speichern und verwalten können. Der konkrete
        Funktionsumfang richtet sich nach dem jeweils gebuchten Tarif (Free, Pro, Premium, Vip).
      </p>
      <p>
        (2) Die auf der Plattform angezeigten Preise sind unverbindliche Richtwerte. Für
        kostenpflichtige Tarife gilt der im individuellen Angebot des Anbieters genannte Preis.
      </p>
      <p>
        (3) Generierte Texte werden mithilfe von KI-Technologie erstellt und dienen als
        Formulierungsvorschläge. Eine inhaltliche oder rechtliche Prüfung im Einzelfall obliegt
        der nutzenden Lehrkraft.
      </p>
      <p>
        (4) Der Anbieter ist berechtigt, den Dienst weiterzuentwickeln, Funktionen anzupassen
        oder einzelne Bestandteile zu ändern, soweit die vertraglich geschuldete Hauptleistung
        nicht unzumutbar beeinträchtigt wird.
      </p>

      <h2 className="text-xl font-semibold text-slate-900">§ 3 Registrierung, Nutzerkonto und Free-Tarif</h2>
      <p>
        (1) Die Nutzung setzt eine Registrierung voraus. Mit Abschluss der Registrierung und
        Annahme dieser AGB kommt ein Nutzungsvertrag zustande.
      </p>
      <p>
        (2) Jeder neu registrierte Nutzer wird automatisch dem kostenlosen Free-Tarif zugeordnet.
        Für die Registrierung sind wahrheitsgemäße Angaben erforderlich. Der Nutzer ist
        verpflichtet, Zugangsdaten geheim zu halten.
      </p>
      <p>
        (3) Der Anbieter kann den Free-Tarif jederzeit ohne Angabe von Gründen einstellen,
        einschränken oder aus dem Angebot nehmen. Ein Anspruch auf dauerhafte Bereitstellung
        des Free-Tarifs besteht nicht. Betroffene Nutzer werden – soweit technisch und
        wirtschaftlich zumutbar – rechtzeitig informiert.
      </p>
      <p>
        (4) Der Nutzer kann sein Konto jederzeit in den Einstellungen löschen.
      </p>

      <h2 className="text-xl font-semibold text-slate-900">§ 4 Kostenpflichtige Tarife – Anfrage, Angebot und Vertragsschluss</h2>
      <p>
        (1) Kostenpflichtige Tarife (Pro, Premium, Vip) werden nicht automatisch aktiviert,
        sondern auf ausdrückliche Anfrage des Nutzers bereitgestellt.
      </p>
      <p>
        (2) Zur Anfrage eines kostenpflichtigen Tarifs muss der Nutzer mindestens folgende
        Angaben machen:
      </p>
      <ul className="list-disc pl-6 space-y-1">
        <li>gewünschter Tarif</li>
        <li>E-Mail-Adresse für Angebots- und Rechnungskommunikation</li>
        <li>vollständige Rechnungsadresse (Rechnungsempfänger, Straße, Postleitzahl, Ort, Land)</li>
      </ul>
      <p>
        (3) Die Tarifanfrage stellt noch kein verbindliches Angebot des Nutzers dar und begründet
        keinen Anspruch auf Freischaltung des gewünschten Tarifs. Der Anbieter prüft die Anfrage
        und entscheidet nach freiem Ermessen über die Annahme.
      </p>
      <p>
        (4) Nimmt der Anbieter die Anfrage an, unterbreitet er dem Nutzer ein individuelles
        Angebot per E-Mail. Der Vertrag über einen kostenpflichtigen Tarif kommt erst zustande,
        wenn der Nutzer das Angebot durch Zahlung des angegebenen Betrags annimmt.
      </p>
      <p>
        (5) Nach Zahlungseingang erhält der Nutzer eine Rechnung. Die Freischaltung des gebuchten
        Tarifs erfolgt manuell durch den Anbieter und innerhalb von 7 Werktagen nach
        Zahlungseingang, sofern keine berechtigten Gründe für eine Verzögerung vorliegen.
      </p>
      <p>
        (6) Bis zur Freischaltung verbleibt der Nutzer im bisherigen Tarif. Der Leistungszeitraum
        des kostenpflichtigen Tarifs beginnt mit der Freischaltung, sofern im Angebot nicht
        abweichend geregelt.
      </p>

      <h2 className="text-xl font-semibold text-slate-900">§ 5 Laufzeit, Verlängerung und Kündigung durch den Nutzer</h2>
      <p>
        (1) Kostenpflichtige Tarife werden – sofern im Angebot nicht anders ausgewiesen – als
        monatliche Leistungsperiode abgeschlossen.
      </p>
      <p>
        (2) Der Nutzer kann jederzeit in einen niedrigeren Tarif wechseln (Downgrade), soweit
        die Plattform dies technisch vorsieht. Ein Downgrade wird unverzüglich wirksam.
      </p>
      <p>
        (3) Bei einem durch den Nutzer selbst veranlassten Downgrade oder bei einer Kündigung
        durch den Nutzer erfolgt keine Erstattung bereits gezahlter Entgelte für den laufenden
        Abrechnungszeitraum.
      </p>
      <p>
        (4) Ein erneutes Upgrade in einen höheren Tarif ist nach einem Downgrade nur über eine
        neue Tarifanfrage gemäß § 4 möglich.
      </p>

      <h2 className="text-xl font-semibold text-slate-900">§ 6 Änderung, Kündigung und Rückstufung durch den Anbieter</h2>
      <p>
        (1) Der Anbieter ist berechtigt, den gebuchten Tarif eines Nutzers jederzeit ohne
        Kündigungsfrist zu kündigen, zurückzustufen oder den Zugang zum Dienst ganz oder
        teilweise zu sperren, insbesondere bei:
      </p>
      <ul className="list-disc pl-6 space-y-1">
        <li>Verstoß gegen diese AGB oder geltendes Recht</li>
        <li>Missbrauch der Plattform oder der KI-Funktionen</li>
        <li>Zahlungsverzug</li>
        <li>wichtigem betriebswirtschaftlichem oder technischem Grund</li>
      </ul>
      <p>
        (2) Kündigt oder stuft der Anbieter einen kostenpflichtigen Tarif zurück, erhält der
        Nutzer für den nicht genutzten Rest des laufenden Monats eine anteilige Erstattung des
        bereits gezahlten Entgelts.
      </p>
      <p>
        (3) Stuft der Anbieter den Tarif eines Nutzers auf einen niedrigeren Tarif herab
        (Rückstufung), erfolgt eine Erstattung des zu viel gezahlten Betrags innerhalb von
        14 Tagen ab Wirksamwerden der Rückstufung.
      </p>
      <p>
        (4) Der Anbieter informiert den Nutzer über Kündigungen, Rückstufungen oder wesentliche
        Einschränkungen in Textform (z. B. per E-Mail), soweit zumutbar.
      </p>

      <h2 className="text-xl font-semibold text-slate-900">§ 7 Preise, Zahlung und Rechnungen</h2>
      <p>
        (1) Es gelten die im jeweiligen Angebot genannten Preise. Alle Preise verstehen sich,
        sofern nicht anders angegeben, als Bruttopreise inklusive der gesetzlichen Umsatzsteuer.
      </p>
      <p>
        (2) Die Zahlung erfolgt auf die im Angebot genannte Weise (z. B. Überweisung). Der
        Anbieter behält sich vor, andere Zahlungsmethoden anzubieten oder vorzuschreiben.
      </p>
      <p>
        (3) Der Nutzer ist verpflichtet, bei der Anfrage korrekte Rechnungsdaten anzugeben und
        Änderungen unverzüglich mitzuteilen.
      </p>
      <p>
        (4) Rechnungen werden in elektronischer Form (E-Mail oder Download) bereitgestellt.
      </p>

      <h2 className="text-xl font-semibold text-slate-900">§ 8 Widerrufsrecht für Verbraucher</h2>
      <p>
        (1) Verbrauchern steht grundsätzlich ein gesetzliches Widerrufsrecht zu.
      </p>
      <p>
        (2) Bei Verträgen über digitale Dienste, die nicht auf einem körperlichen Datenträger
        geliefert werden, erlischt das Widerrufsrecht, wenn der Anbieter mit der Ausführung
        des Vertrags begonnen hat, nachdem der Verbraucher
      </p>
      <ul className="list-disc pl-6 space-y-1">
        <li>ausdrücklich zugestimmt hat, dass der Anbieter vor Ablauf der Widerrufsfrist mit der Ausführung beginnt, und</li>
        <li>seine Kenntnis davon bestätigt hat, dass er durch diese Zustimmung mit Beginn der Ausführung sein Widerrufsrecht verliert.</li>
      </ul>
      <p>
        (3) Der Anbieter wird Verbraucher im Angebots- bzw. Bestellprozess entsprechend
        belehren, soweit dies gesetzlich erforderlich ist. Die Widerrufsbelehrung ist unter{" "}
        <Link href="/widerruf" className="text-blue-600 hover:underline">
          klick-and-zeugnis.de/widerruf
        </Link>{" "}
        abrufbar.
      </p>

      <h2 className="text-xl font-semibold text-slate-900">§ 9 Pflichten des Nutzers</h2>
      <p>
        (1) Der Nutzer ist verantwortlich für alle Inhalte, die er eingibt, generiert, speichert
        oder exportiert. Er stellt sicher, dass die Verarbeitung von Schülerdaten auf der Plattform
        datenschutzrechtlich zulässig ist.
      </p>
      <p>
        (2) Untersagt sind insbesondere:
      </p>
      <ul className="list-disc pl-6 space-y-1">
        <li>rechtswidrige, beleidigende, diskriminierende oder unangemessene Inhalte</li>
        <li>die automatisierte Massennutzung ohne Zustimmung des Anbieters</li>
        <li>Angriffe auf die technische Infrastruktur oder Umgehung von Tarifbeschränkungen</li>
        <li>Weitergabe von Zugangsdaten an Dritte</li>
      </ul>
      <p>
        (3) Der Nutzer kann fehlerhafte oder unangemessene Zeugnistexte über die Meldefunktion
        an den Anbieter melden.
      </p>

      <h2 className="text-xl font-semibold text-slate-900">§ 10 Verfügbarkeit und Support</h2>
      <p>
        (1) Der Anbieter bemüht sich um eine möglichst unterbrechungsfreie Verfügbarkeit der
        Plattform. Ein Anspruch auf eine bestimmte Verfügbarkeit besteht nicht, es sei denn,
        dies wurde im Angebot ausdrücklich vereinbart.
      </p>
      <p>
        (2) Wartungsarbeiten, technische Störungen oder höhere Gewalt können zu vorübergehenden
        Einschränkungen führen.
      </p>
      <p>
        (3) Supportleistungen richten sich nach dem gebuchten Tarif. Der Free-Tarif umfasst
        keinen individuellen Support.
      </p>

      <h2 className="text-xl font-semibold text-slate-900">§ 11 Haftung</h2>
      <p>
        (1) Der Anbieter haftet unbeschränkt bei Vorsatz und grober Fahrlässigkeit sowie bei
        Verletzung von Leben, Körper oder Gesundheit.
      </p>
      <p>
        (2) Bei leicht fahrlässiger Verletzung wesentlicher Vertragspflichten (Kardinalpflichten)
        ist die Haftung auf den vertragstypischen, vorhersehbaren Schaden begrenzt.
      </p>
      <p>
        (3) Im Übrigen ist die Haftung ausgeschlossen. Die Haftung nach dem Produkthaftungsgesetz
        bleibt unberührt.
      </p>
      <p>
        (4) Der Anbieter haftet nicht für die inhaltliche Richtigkeit, rechtliche Zulässigkeit
        oder pädagogische Angemessenheit der generierten Zeugnistexte. Die Verantwortung für
        deren Verwendung in offiziellen Zeugnissen trägt allein die nutzende Lehrkraft.
      </p>

      <h2 className="text-xl font-semibold text-slate-900">§ 12 Datenschutz</h2>
      <p>
        Informationen zur Verarbeitung personenbezogener Daten findest du in unserer{" "}
        <Link href="/datenschutz" className="text-blue-600 hover:underline">
          Datenschutzerklärung
        </Link>
        .
      </p>

      <h2 className="text-xl font-semibold text-slate-900">§ 13 Änderungen der AGB</h2>
      <p>
        (1) Der Anbieter kann diese AGB mit Wirkung für die Zukunft ändern, wenn hierfür ein
        sachlicher Grund besteht (z. B. Gesetzesänderung, neue Funktionen, Anpassung der Tarife).
      </p>
      <p>
        (2) Nutzer werden über Änderungen in Textform informiert. Widerspricht der Nutzer nicht
        innerhalb von 30 Tagen nach Zugang der Mitteilung, gelten die geänderten AGB als
        angenommen. Der Anbieter weist in der Mitteilung auf die Bedeutung der Frist und die
        Rechtsfolgen des Schweigens hin.
      </p>

      <h2 className="text-xl font-semibold text-slate-900">§ 14 Streitbeilegung</h2>
      <p>
        Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{" "}
        <a
          href="https://ec.europa.eu/consumers/odr"
          className="text-blue-600 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          https://ec.europa.eu/consumers/odr
        </a>
        . Der Anbieter ist nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren
        vor einer Verbraucherschlichtungsstelle teilzunehmen.
      </p>

      <h2 className="text-xl font-semibold text-slate-900">§ 15 Schlussbestimmungen</h2>
      <p>
        (1) Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts.
      </p>
      <p>
        (2) Ist der Nutzer Kaufmann, juristische Person des öffentlichen Rechts oder
        öffentlich-rechtliches Sondervermögen, ist ausschließlicher Gerichtsstand Berlin.
      </p>
      <p>
        (3) Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, bleibt die
        Wirksamkeit der übrigen Bestimmungen unberührt.
      </p>
      <p>
        (4) Die jeweils aktuelle Fassung ist unter{" "}
        <Link href="/agb" className="text-blue-600 hover:underline">
          klick-and-zeugnis.de/agb
        </Link>{" "}
        abrufbar.
      </p>
    </LegalPage>
  );
}
