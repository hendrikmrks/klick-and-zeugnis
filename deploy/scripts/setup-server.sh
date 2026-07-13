#!/usr/bin/env bash
set -euo pipefail

# Einmalige Server-Einrichtung für Klick & Zeugnis
# Als root oder mit sudo ausführen.

DEPLOY_ROOT="${DEPLOY_ROOT:-/opt/klick-and-zeugnis}"

echo "==> Installiere Docker (falls nicht vorhanden)"
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "Docker Compose Plugin fehlt. Bitte docker-compose-plugin installieren."
  exit 1
fi

echo "==> Erstelle Verzeichnisstruktur unter ${DEPLOY_ROOT}"
mkdir -p "${DEPLOY_ROOT}/traefik" "${DEPLOY_ROOT}/test" "${DEPLOY_ROOT}/prod" "${DEPLOY_ROOT}/scripts"

echo "==> Erstelle Docker-Netzwerk für Reverse Proxy"
docker network inspect klick-proxy >/dev/null 2>&1 || docker network create klick-proxy

if [[ ! -f "${DEPLOY_ROOT}/traefik/.env" ]]; then
  echo "ACME_EMAIL=kontakt@klick-and-zeugnis.de" > "${DEPLOY_ROOT}/traefik/.env"
  echo "Bitte ${DEPLOY_ROOT}/traefik/.env anpassen (ACME_EMAIL)."
fi

if [[ ! -f "${DEPLOY_ROOT}/test/.env" ]]; then
  echo "WARNUNG: ${DEPLOY_ROOT}/test/.env fehlt – aus deploy/test/.env.example anlegen."
fi

if [[ ! -f "${DEPLOY_ROOT}/prod/.env" ]]; then
  echo "WARNUNG: ${DEPLOY_ROOT}/prod/.env fehlt – aus deploy/prod/.env.example anlegen."
fi

echo "==> Starte Traefik Reverse Proxy"
cd "${DEPLOY_ROOT}/traefik"
docker compose -p klick-proxy-stack up -d

echo ""
echo "Server-Setup abgeschlossen."
echo "Nächste Schritte:"
echo "  1. ${DEPLOY_ROOT}/test/.env und ${DEPLOY_ROOT}/prod/.env anlegen"
echo "  2. GHCR-Zugang: docker login ghcr.io"
echo "  3. Deploy via GitHub Actions auslösen"
