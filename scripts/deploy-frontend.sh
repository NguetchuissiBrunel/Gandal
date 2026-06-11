#!/usr/bin/env bash
#
# Déploie le frontend GANDAL sur le serveur (rsync + rebuild Docker).
#
# Usage :
#   ./scripts/deploy-frontend.sh
#
set -euo pipefail

REMOTE="${REMOTE:-root@10.50.30.102}"
REMOTE_DIR="${REMOTE_DIR:-/gandal-dev-frontend}"
SSH_OPTS="-o BatchMode=yes -o ConnectTimeout=15"
COMPOSE_FILE="docker-compose.frontend.yml"

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

echo "==> 1/2  Synchronisation -> $REMOTE:$REMOTE_DIR"
rsync -az --delete \
  --exclude 'node_modules/' --exclude '.next/' --exclude '.git/' \
  --exclude '.claude/' \
  -e "ssh $SSH_OPTS" \
  ./ "$REMOTE:$REMOTE_DIR/"

echo "==> 2/2  Rebuild conteneur frontend"
ssh $SSH_OPTS "$REMOTE" "cd '$REMOTE_DIR' && docker compose -f '$COMPOSE_FILE' up -d --build"

echo "✅  Frontend déployé."
