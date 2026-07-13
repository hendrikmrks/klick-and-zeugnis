#!/usr/bin/env bash
set -euo pipefail

DEPLOY_ROOT="${DEPLOY_ROOT:-/opt/klick-and-zeugnis}"
TRAEFIK_DIR="${DEPLOY_ROOT}/traefik"

if [[ ! -f "${TRAEFIK_DIR}/.env" ]]; then
  if [[ -f "${TRAEFIK_DIR}/.env.example" ]]; then
    cp "${TRAEFIK_DIR}/.env.example" "${TRAEFIK_DIR}/.env"
  else
    echo "ACME_EMAIL=kontakt@klick-and-zeugnis.de" > "${TRAEFIK_DIR}/.env"
  fi
  echo "Erstellt: ${TRAEFIK_DIR}/.env"
fi

if ! docker network inspect klick-proxy >/dev/null 2>&1; then
  docker network create klick-proxy
fi

cd "${TRAEFIK_DIR}"
docker compose -p klick-proxy-stack pull
docker compose -p klick-proxy-stack up -d

echo "Traefik gestartet. ACME_EMAIL=$(grep ACME_EMAIL .env | cut -d= -f2-)"
