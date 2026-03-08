#!/bin/bash
# ============================================================
# NyumbaSync - Safaricom Cloud Backend Deployment
#
# Builds a Docker image locally, pushes it to Docker Hub
# (or Safaricom Container Registry if available), then SSH's
# into the Safaricom Cloud VM and runs the updated container.
#
# Usage:
#   export VM_IP=<your-safaricom-vm-floating-ip>
#   export VM_USER=ubuntu           # default
#   export DOCKER_USER=<dockerhub>  # your Docker Hub username
#   bash deploy/safaricom/deploy-backend.sh
# ============================================================
set -euo pipefail

# ── Configuration ──────────────────────────────────────────
VM_IP="${VM_IP:?Set VM_IP to your Safaricom Cloud floating IP}"
VM_USER="${VM_USER:-ubuntu}"
SSH_KEY="${SSH_KEY:-~/.ssh/id_rsa}"
DOCKER_USER="${DOCKER_USER:?Set DOCKER_USER to your Docker Hub username}"
IMAGE_NAME="${DOCKER_USER}/nyumbasync-backend"
IMAGE_TAG="${IMAGE_TAG:-latest}"
BACKEND_DIR="/opt/nyumbasync/backend"
DEPLOY_PORT="${DEPLOY_PORT:-3001}"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info()  { echo -e "${GREEN}[INFO]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

info "NyumbaSync Backend → Safaricom Cloud"
echo "Target VM: ${VM_USER}@${VM_IP}"
echo "Image:     ${IMAGE_NAME}:${IMAGE_TAG}"
echo "======================================="

# ── Pre-flight checks ──────────────────────────────────────
command -v docker &>/dev/null || error "docker not found"
command -v ssh &>/dev/null    || error "ssh not found"

# ── Build Docker image ─────────────────────────────────────
info "Building Docker image..."
cd "$(git rev-parse --show-toplevel)/nyumbasync_backend"

# Stamp build metadata
BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

docker build \
  --build-arg BUILD_DATE="$BUILD_DATE" \
  --build-arg GIT_COMMIT="$GIT_COMMIT" \
  --tag "${IMAGE_NAME}:${IMAGE_TAG}" \
  --tag "${IMAGE_NAME}:${GIT_COMMIT}" \
  --file Dockerfile \
  .

info "Image built: ${IMAGE_NAME}:${IMAGE_TAG}"

# ── Push to Docker Hub ─────────────────────────────────────
info "Pushing image to Docker Hub..."
docker push "${IMAGE_NAME}:${IMAGE_TAG}"
docker push "${IMAGE_NAME}:${GIT_COMMIT}"
info "Image pushed"

# ── Upload compose file to VM ──────────────────────────────
info "Uploading docker-compose.prod.yml to VM..."
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no \
  "${VM_USER}@${VM_IP}" "mkdir -p ${BACKEND_DIR}"

scp -i "$SSH_KEY" \
  "$(git rev-parse --show-toplevel)/deploy/docker/docker-compose.prod.yml" \
  "${VM_USER}@${VM_IP}:${BACKEND_DIR}/docker-compose.prod.yml"

# ── Deploy on VM ───────────────────────────────────────────
info "Deploying on VM..."
ssh -i "$SSH_KEY" "${VM_USER}@${VM_IP}" bash <<REMOTE
  set -euo pipefail

  export IMAGE_NAME="${IMAGE_NAME}"
  export IMAGE_TAG="${IMAGE_TAG}"
  export DEPLOY_PORT="${DEPLOY_PORT}"

  echo "[VM] Pulling latest image..."
  docker pull "\${IMAGE_NAME}:\${IMAGE_TAG}"

  echo "[VM] Stopping old container..."
  cd "${BACKEND_DIR}"
  docker compose -f docker-compose.prod.yml down --remove-orphans 2>/dev/null || true

  echo "[VM] Starting new container..."
  docker compose -f docker-compose.prod.yml up -d

  echo "[VM] Waiting for health check..."
  sleep 5
  for i in \$(seq 1 12); do
    if curl -sf "http://localhost:${DEPLOY_PORT}/health" >/dev/null; then
      echo "[VM] Health check passed on attempt \$i"
      break
    fi
    echo "[VM] Waiting... (\$i/12)"
    sleep 5
  done

  echo "[VM] Running containers:"
  docker ps --filter "name=nyumbasync"

  echo "[VM] Cleaning up old images..."
  docker image prune -f
REMOTE

# ── Verify from outside ────────────────────────────────────
info "Verifying backend is reachable..."
if curl -sf "http://${VM_IP}:${DEPLOY_PORT}/health" >/dev/null; then
  info "Backend health check passed!"
else
  warn "Health check did not pass — check VM logs:"
  echo "  ssh -i ${SSH_KEY} ${VM_USER}@${VM_IP} docker logs nyumbasync-backend"
fi

info "Deployment complete!"
echo ""
echo "Useful commands:"
echo "  Logs:    ssh ${VM_USER}@${VM_IP} 'docker logs -f nyumbasync-backend'"
echo "  Shell:   ssh ${VM_USER}@${VM_IP} 'docker exec -it nyumbasync-backend sh'"
echo "  Restart: ssh ${VM_USER}@${VM_IP} 'docker compose -f ${BACKEND_DIR}/docker-compose.prod.yml restart'"
