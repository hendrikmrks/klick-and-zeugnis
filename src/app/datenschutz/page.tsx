import LegalPage from "@/components/layout/LegalPage";
import Link from "next/link";

export default function DatenschutzPage() {
  return (
    <LegalPage title="Datenschutzerklärung">
      <p className="text-sm text-slate-500">
        Stand: Juli 2026
      </p>

      <h2 className="text-xl font-semibold text-slate-900">1. Verantwortlicher</h2>
      <p>
        Verantwortlicher im Sinne der Datenschutz-Grundverordnung (DSGVO) und anderer
        datenschutzrechtlicher Bestimmungen ist:
      </p>
      <p>
        Hendrik Beier<br />
        Schützenstraße 18<br />
        12165 Berlin<br />
        Deutschland
      </p>
      <p>
        E-Mail:{" "}
        <a href="mailto:kontakt@klick-and-zeugnis.de" className="text-blue-600 hover:underline">
          kontakt@klick-and-zeugnis.de
        </a>
        <br />
        Telefon: +49 (0) 123 456789
      </p>
      <p>
        Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: DE357943599
      </p>

      <h2 className="text-xl font-semibold text-slate-900">2. Überblick über die Datenverarbeitung</h2>
      <p>
        „Klick &amp; Zeugnis“ ist eine webbasierte Plattform zur KI-gestützten Erstellung,
        Bearbeitung und Speicherung von Schulzeugnistexten. Wir verarbeiten personenbezogene
        Daten, soweit dies für den Betrieb der Plattform, die Vertragsdurchführung, die
        Abwicklung kostenpflichtiger Tarife sowie die Sicherheit des Dienstes erforderlich ist.
      </p>
      <p>
        Eine Nutzung der Plattform ist grundsätzlich nur nach Registrierung möglich. Mit der
        Registrierung wirst du automatisch dem kostenlosen Free-Tarif zugeordnet.
      </p>

      <h2 className="text-xl font-semibold text-slate-900">3. Kategorien verarbeiteter Daten</h2>

      <h3 className="text-lg font-medium text-slate-900">3.1 Stammdaten des Nutzerkontos</h3>
      <ul className="list-disc pl-6 space-y-1">
        <li>Vor- und Nachname</li>
        <li>E-Mail-Adresse</li>
        <li>Geburtsdatum</li>
        <li>Passwort (ausschließlich in gehashter Form gespeichert)</li>
        <li>Abonnementstatus, Tarif und ggf. Ablaufdatum</li>
        <li>Benutzerrolle (z. B. Nutzer oder Administrator)</li>
        <li>Zeitpunkte der Registrierung und letzten Aktualisierung</li>
      </ul>

      <h3 className="text-lg font-medium text-slate-900">3.2 Authentifizierungs- und Sitzungsdaten</h3>
      <ul className="list-disc pl-6 space-y-1">
        <li>Sitzungstoken und Anmeldeinformationen (NextAuth)</li>
        <li>Bei aktivierter Zwei-Faktor-Authentifizierung (2FA): TOTP-Geheimnis (verschlüsselt gespeichert)</li>
        <li>Technische Protokolldaten im Rahmen der Anmeldung (z. B. Zeitpunkt, Erfolg/Misserfolg)</li>
      </ul>

      <h3 className="text-lg font-medium text-slate-900">3.3 Inhalts- und Nutzungsdaten</h3>
      <ul className="list-disc pl-6 space-y-1">
        <li>Eingaben zur Zeugniserstellung (z. B. Name, Geschlecht, Klassenstufe, Sozialverhalten, Rollen)</li>
        <li>Generierte und gespeicherte Zeugnistexte</li>
        <li>Metadaten zu Zeugnissen (z. B. Wortanzahl, Klasse, Schuljahr, Erstellungszeitpunkt)</li>
        <li>Nutzungsstatistiken (z. B. Anzahl generierter oder gespeicherter Zeugnisse im Monat)</li>
        <li>Meldungen zu unangemessenen oder fehlerhaften Zeugnistexten</li>
      </ul>

      <h3 className="text-lg font-medium text-slate-900">3.4 Abonnement- und Rechnungsdaten</h3>
      <p>
        Bei der Anfrage eines kostenpflichtigen Tarifs erheben wir zusätzlich:
      </p>
      <ul className="list-disc pl-6 space-y-1">
        <li>E-Mail-Adresse für Rechnungs- und Angebotskommunikation</li>
        <li>Rechnungsempfänger (Name oder Firma)</li>
        <li>Rechnungsadresse (Straße, Postleitzahl, Ort, Land)</li>
        <li>Gewünschter Tarif, Status der Anfrage und optionale Nachricht</li>
        <li>Informationen zur Angebots-, Zahlungs- und Freischaltungsabwicklung</li>
      </ul>
      <p>
        Zahlungsabwicklungen erfolgen derzeit außerhalb der Plattform (z. B. per Überweisung).
        Wir speichern keine Kreditkartendaten auf unseren Servern.
      </p>

      <h3 className="text-lg font-medium text-slate-900">3.5 Datenschutz Advanced Modus (optional)</h3>
      <p>
        Wenn du den optionalen Datenschutz Advanced Modus aktivierst, werden Schülernamen in
        gespeicherten Zeugnissen durch Zufallsplatzhalter ersetzt. Die Zuordnung der Platzhalter
        zu echten Namen erfolgt ausschließlich in einer von dir lokal verwalteten, verschlüsselten
        Schlüsseldatei. Diese Schlüsseldatei wird nicht dauerhaft auf unseren Servern gespeichert.
        Für die Entschlüsselung im Browser wird die Schlüsseldatei temporär (derzeit bis zu
        3 Stunden pro Sitzung) im Arbeitsspeicher gehalten.
      </p>

      <h3 className="text-lg font-medium text-slate-900">3.6 Technische Zugriffsdaten</h3>
      <p>
        Beim Aufruf der Website können technische Daten verarbeitet werden, insbesondere:
      </p>
      <ul className="list-disc pl-6 space-y-1">
        <li>IP-Adresse</li>
        <li>Datum und Uhrzeit des Zugriffs</li>
        <li>aufgerufene Seite bzw. API-Endpunkte</li>
        <li>Browsertyp und Betriebssystem</li>
        <li>Referrer-URL</li>
      </ul>
      <p>
        Diese Daten werden in Server- und Sicherheitsprotokollen verarbeitet, soweit dies für
        Betrieb, Fehleranalyse und Abwehr von Missbrauch erforderlich ist.
      </p>

      <h2 className="text-xl font-semibold text-slate-900">4. Besonderer Hinweis zu Schülerdaten</h2>
      <p>
        In der Plattform können Daten von Schülerinnen und Schülern verarbeitet werden (z. B.
        Vorname, Geschlecht, Leistungs- und Verhaltensbeschreibungen). Als Lehrkraft bzw.
        registrierte Nutzerin oder registrierter Nutzer bist du in der Regel für diese Daten
        datenschutzrechtlich verantwortlich (Verantwortlicher im Sinne der DSGVO), soweit du
        sie eingibst oder speicherst.
      </p>
      <p>
        Wir stellen dir als Anbieter der Plattform die technische Infrastruktur bereit und
        verarbeiten diese Daten im Rahmen unserer Leistungserbringung für dich (Auftragsverarbeitung
        im Sinne von Art. 28 DSGVO). Du bist verpflichtet, die erforderlichen Rechtsgrundlagen
        für die Verarbeitung der Schülerdaten sicherzustellen und nur die Daten einzugeben, deren
        Verarbeitung zulässig ist.
      </p>
      <p>
        Wir empfehlen, den Datenschutz Advanced Modus zu nutzen, wenn du Zeugnisse dauerhaft
        auf der Plattform speichern möchtest.
      </p>

      <h2 className="text-xl font-semibold text-slate-900">5. Zwecke und Rechtsgrundlagen der Verarbeitung</h2>

      <h3 className="text-lg font-medium text-slate-900">5.1 Bereitstellung des Nutzerkontos und des Dienstes</h3>
      <p>
        <strong>Zweck:</strong> Registrierung, Anmeldung, Bereitstellung der Zeugnisfunktionen,
        Speicherung von Zeugnissen, Tarifverwaltung, interne Nutzungsstatistiken.
        <br />
        <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung bzw.
        vorvertragliche Maßnahmen).
      </p>

      <h3 className="text-lg font-medium text-slate-900">5.2 Abwicklung kostenpflichtiger Tarife</h3>
      <p>
        <strong>Zweck:</strong> Bearbeitung von Tarifanfragen, Erstellung und Versand von Angeboten
        und Rechnungen, Freischaltung des gebuchten Tarifs, Kommunikation hierzu.
        <br />
        <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO; ggf. Art. 6 Abs. 1 lit. c
        DSGVO (steuer- und handelsrechtliche Aufbewahrungspflichten).
      </p>

      <h3 className="text-lg font-medium text-slate-900">5.3 Sicherheit, Missbrauchsprävention und Qualitätssicherung</h3>
      <p>
        <strong>Zweck:</strong> Schutz der Plattform, Prüfung gemeldeter Zeugnistexte,
        Fehleranalyse, Gewährleistung der Systemintegrität.
        <br />
        <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an
        einem sicheren und zuverlässigen Betrieb).
      </p>

      <h3 className="text-lg font-medium text-slate-900">5.4 Optionale Zwei-Faktor-Authentifizierung</h3>
      <p>
        <strong>Zweck:</strong> Erhöhung der Kontosicherheit.
        <br />
        <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO und Art. 6 Abs. 1 lit. f DSGVO.
      </p>

      <h3 className="text-lg font-medium text-slate-900">5.5 Datenschutz Advanced Modus</h3>
      <p>
        <strong>Zweck:</strong> Schutz von Schülernamen durch clientseitige Verschlüsselung und
        Platzhalter auf dem Server.
        <br />
        <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO und Art. 6 Abs. 1 lit. f DSGVO.
      </p>

      <h2 className="text-xl font-semibold text-slate-900">6. KI-gestützte Texterstellung (OpenAI)</h2>
      <p>
        Zur Generierung von Zeugnistexten können die von dir eingegebenen Angaben (z. B. Name,
        Geschlecht, Klassenstufe, Sozialverhalten, Rollen) an die OpenAI, L.L.C., 3180 18th Street,
        San Francisco, CA 94110, USA, übermittelt und dort verarbeitet werden.
      </p>
      <p>
        Die Übermittlung erfolgt ausschließlich zum Zweck der Texterstellung im Rahmen deiner
        Nutzung des Dienstes. Ohne hinterlegten OpenAI-API-Schlüssel werden stattdessen
        lokale Mock-Texte erzeugt; in diesem Fall findet keine Übermittlung an OpenAI statt.
      </p>
      <p>
        <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO.
        <br />
        <strong>Hinweis zu Drittlandübermittlungen:</strong> Bei Nutzung von OpenAI kann eine
        Übermittlung in die USA erfolgen. OpenAI stellt geeignete Garantien bereit (u. a. Standardvertragsklauseln).
        Weitere Informationen findest du in der Datenschutzerklärung von OpenAI:{" "}
        <a
          href="https://openai.com/policies/privacy-policy"
          className="text-blue-600 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          https://openai.com/policies/privacy-policy
        </a>
      </p>

      <h2 className="text-xl font-semibold text-slate-900">7. Hosting und technische Infrastruktur</h2>
      <p>
        Die Plattform wird auf einem eigenen Server in Deutschland betrieben. Die Datenbank
        (MongoDB) läuft in derselben Serverumgebung und ist nicht öffentlich aus dem Internet
        erreichbar. TLS-Verschlüsselung wird über Traefik mit Let&apos;s Encrypt bereitgestellt.
      </p>
      <p>
        <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b und lit. f DSGVO.
      </p>

      <h2 className="text-xl font-semibold text-slate-900">8. Cookies und lokale Speicherung</h2>
      <p>
        Wir setzen technisch notwendige Cookies bzw. vergleichbare Technologien ein, die für
        die Anmeldung, Sitzungsverwaltung und den sicheren Betrieb der Plattform erforderlich
        sind (insbesondere NextAuth-Sitzungscookies).
      </p>
      <p>
        <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (bereitgestellter Dienst)
        sowie § 25 Abs. 2 Nr. 2 TDDDG (technisch erforderlich).
      </p>
      <p>
        Wir setzen derzeit keine Analyse-, Marketing- oder Tracking-Cookies ein, die einer
        Einwilligung bedürfen würden.
      </p>

      <h2 className="text-xl font-semibold text-slate-900">9. Empfänger und Weitergabe von Daten</h2>
      <p>Eine Weitergabe personenbezogener Daten erfolgt nur, soweit dies erforderlich ist:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>an OpenAI zur KI-Texterstellung (siehe Abschnitt 6)</li>
        <li>an IT-Dienstleister im Rahmen des Hostings, soweit diese als Auftragsverarbeiter tätig werden</li>
        <li>an Behörden, soweit wir gesetzlich dazu verpflichtet sind</li>
      </ul>
      <p>
        Eine Weitergabe zu Werbezwecken oder ein Verkauf personenbezogener Daten findet nicht statt.
      </p>

      <h2 className="text-xl font-semibold text-slate-900">10. Speicherdauer</h2>
      <ul className="list-disc pl-6 space-y-1">
        <li>
          <strong>Nutzerkonto:</strong> bis zur Löschung durch dich in den Einstellungen oder
          bis zur Löschung durch uns nach Beendigung des Nutzungsverhältnisses.
        </li>
        <li>
          <strong>Zeugnisdaten:</strong> bis zur Löschung durch dich oder mit dem Nutzerkonto.
        </li>
        <li>
          <strong>Abonnement- und Rechnungsdaten:</strong> für die Dauer der Vertragsbeziehung
          sowie darüber hinaus gemäß gesetzlichen Aufbewahrungsfristen (regelmäßig 6 bis 10 Jahre
          nach handels- und steuerrechtlichen Vorgaben).
        </li>
        <li>
          <strong>Sitzungs- und Protokolldaten:</strong> nur so lange, wie für Sicherheit und
          Fehleranalyse erforderlich; in der Regel maximal wenige Wochen, sofern keine
          Sicherheitsvorfälle vorliegen.
        </li>
        <li>
          <strong>Schlüsseldatei-Sitzung (Datenschutz Advanced Modus):</strong> maximal 3 Stunden
          oder bis zur Abmeldung.
        </li>
      </ul>

      <h2 className="text-xl font-semibold text-slate-900">11. Deine Rechte</h2>
      <p>Dir stehen gegenüber dem Verantwortlichen folgende Rechte zu:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>Auskunft (Art. 15 DSGVO)</li>
        <li>Berichtigung (Art. 16 DSGVO)</li>
        <li>Löschung (Art. 17 DSGVO)</li>
        <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
        <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
        <li>Widerspruch gegen Verarbeitung auf Basis berechtigter Interessen (Art. 21 DSGVO)</li>
        <li>Widerruf erteilter Einwilligungen mit Wirkung für die Zukunft (Art. 7 Abs. 3 DSGVO)</li>
      </ul>
      <p>
        Zur Ausübung deiner Rechte genügt eine Nachricht an{" "}
        <a href="mailto:kontakt@klick-and-zeugnis.de" className="text-blue-600 hover:underline">
          kontakt@klick-and-zeugnis.de
        </a>
        . Bitte gib an, welches Recht du ausüben möchtest und stelle deine Identität nachvollziehbar dar.
      </p>
      <p>
        Du hast zudem das Recht, dich bei einer Datenschutz-Aufsichtsbehörde zu beschweren.
        Zuständig ist insbesondere die Berliner Beauftragte für Datenschutz und Informationsfreiheit.
      </p>

      <h2 className="text-xl font-semibold text-slate-900">12. Pflicht zur Bereitstellung von Daten</h2>
      <p>
        Die Bereitstellung von Registrierungsdaten ist für die Nutzung der Plattform erforderlich.
        Ohne diese Daten kann kein Nutzerkonto angelegt werden. Rechnungsdaten sind für die
        Anfrage und Abwicklung kostenpflichtiger Tarife erforderlich.
      </p>

      <h2 className="text-xl font-semibold text-slate-900">13. Datensicherheit</h2>
      <p>
        Wir treffen angemessene technische und organisatorische Maßnahmen, um personenbezogene
        Daten vor Verlust, Missbrauch und unbefugtem Zugriff zu schützen. Dazu gehören
        insbesondere TLS-Verschlüsselung, Passwort-Hashing, Zugriffsbeschränkungen,
        rollenbasierte Administration sowie – optional – Zwei-Faktor-Authentifizierung und
        der Datenschutz Advanced Modus.
      </p>

      <h2 className="text-xl font-semibold text-slate-900">14. Änderungen dieser Datenschutzerklärung</h2>
      <p>
        Wir behalten uns vor, diese Datenschutzerklärung anzupassen, wenn sich Rechtslage,
        Funktionsumfang oder Datenverarbeitung ändern. Die jeweils aktuelle Fassung ist unter{" "}
        <Link href="/datenschutz" className="text-blue-600 hover:underline">
          klick-and-zeugnis.de/datenschutz
        </Link>{" "}
        abrufbar.
      </p>

      <h2 className="text-xl font-semibold text-slate-900">15. Weitere Informationen</h2>
      <p>
        Details zu Nutzungsbedingungen, Tarifen und Erstattungen findest du in unseren{" "}
        <Link href="/agb" className="text-blue-600 hover:underline">AGB</Link>{" "}
        sowie im{" "}
        <Link href="/impressum" className="text-blue-600 hover:underline">Impressum</Link>
        {" "}und in der{" "}
        <Link href="/widerruf" className="text-blue-600 hover:underline">Widerrufsbelehrung</Link>.
      </p>
    </LegalPage>
  );
}
