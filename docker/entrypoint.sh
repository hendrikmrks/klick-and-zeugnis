#!/bin/sh
set -e

if [ -z "$DATABASE_URL" ]; then
  echo "Fehler: DATABASE_URL ist nicht gesetzt."
  exit 1
fi

if [ -z "$NEXTAUTH_SECRET" ]; then
  echo "Fehler: NEXTAUTH_SECRET ist nicht gesetzt."
  exit 1
fi

echo "Warte auf MongoDB …"
node ./docker/wait-for-mongo.mjs

echo "Starte Anwendung auf Port ${PORT:-3000} …"
exec node server.js
