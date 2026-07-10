export const PRIVACY_ADVANCED_EXPLANATION = {
  title: "Datenschutz Advanced Modus",
  summary:
    "Schützt die Namen deiner Schülerinnen und Schüler: In gespeicherten Zeugnissen werden echte Namen durch Zufallsplatzhalter ersetzt. Nur mit deiner persönlichen Schlüsseldatei kannst du die Namen wieder einsetzen und Zeugnisse zuordnen.",
  points: [
    "Beim Speichern werden Namen durch Zufallsstrings ersetzt – auf dem Server liegen keine Klarnamen.",
    "Deine verschlüsselte Schlüsseldatei enthält die Zuordnung von Platzhaltern zu echten Namen.",
    "Nach dem Login lädst du die Schlüsseldatei hoch, um Namen für 3 Stunden lesbar zu machen.",
    "Beim Abmelden oder nach 3 Stunden wird die Schlüsseldatei-Sitzung gelöscht – erneuter Upload nötig.",
    "Zum Deaktivieren benötigst du die Schlüsseldatei oder alle geschützten Zeugnisse werden gelöscht.",
  ],
  warning:
    "Bewahre die Schlüsseldatei und ihre Passphrase sicher auf. Ohne beides sind die Namen nicht wiederherstellbar.",
};
