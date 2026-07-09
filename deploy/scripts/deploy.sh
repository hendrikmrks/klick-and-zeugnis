#!/usr/bin/env bash
set -euo pipefail

ENVIRONMENT="${1:?Umgebung erforderlich: test oder prod}"
IMAGE_TAG="${2:?Image-Tag erforderlich}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
ENV_DIR="${DEPLOY_ROOT}/${ENVIRONMENT}"

if [[ ! -d "${ENV_DIR}" ]]; then
  echo "Umgebungsverzeichnis nicht gefunden: ${ENV_DIR}"
  exit 1
fi

if [[ ! -f "${ENV_DIR}/.env" ]]; then
  echo "Fehlende ${ENV_DIR}/.env – bitte aus .env.example anlegen."
  exit 1
fi

cd "${ENV_DIR}"

export IMAGE_TAG
export COMPOSE_PROJECT_NAME="klick-${ENVIRONMENT}"

if [[ -n "${GHCR_TOKEN:-}" && -n "${GHCR_USERNAME:-}" ]]; then
  echo "${GHCR_TOKEN}" | docker login ghcr.io -u "${GHCR_USERNAME}" --password-stdin
fi

echo "==> Pull Images (${IMAGE_TAG})"
docker compose pull

echo "==> Datenbank-Migrationen"
docker compose --profile init run --rm db-init

echo "==> Services starten"
docker compose up -d --remove-orphans

docker image prune -f

echo "==> Deploy abgeschlossen: ${ENVIRONMENT} (${IMAGE_TAG})"
docker compose ps
