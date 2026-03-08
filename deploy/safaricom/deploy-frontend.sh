#!/bin/bash
# ============================================================
# NyumbaSync - Safaricom Cloud Frontend Deployment
#
# Builds the React desktop app and uploads static files to
# Safaricom Cloud Object Storage (S3-compatible endpoint).
# Nginx on the VM then serves them, OR you can point your
# Safaricom Cloud CDN/DNS directly at the bucket.
#
# Usage:
#   export SAF_OS_ENDPOINT=https://object-store.safaricom.cloud
#   export SAF_OS_ACCESS_KEY=<your-access-key>
#   export SAF_OS_SECRET_KEY=<your-secret-key>
#   export SAF_OS_BUCKET=nyumbasync-frontend
#   bash deploy/safaricom/deploy-frontend.sh
#
# Alternatively, if uploading via Nginx on the VM:
#   export DEPLOY_METHOD=nginx
#   export VM_IP=<floating-ip>
# ============================================================
set -euo pipefail

# ── Configuration ──────────────────────────────────────────
DEPLOY_METHOD="${DEPLOY_METHOD:-object-storage}"   # object-storage | nginx
FRONTEND_DIR="$(git rev-parse --show-toplevel)/nyumbasync-desktop"
BUILD_DIR="${FRONTEND_DIR}/build"
REACT_APP_API_URL="${REACT_APP_API_URL:-https://api.nyumbasync.co.ke/api/v1}"

# Object Storage (S3-compatible Safaricom Cloud)
SAF_OS_ENDPOINT="${SAF_OS_ENDPOINT:-}"
SAF_OS_ACCESS_KEY="${SAF_OS_ACCESS_KEY:-}"
SAF_OS_SECRET_KEY="${SAF_OS_SECRET_KEY:-}"
SAF_OS_BUCKET="${SAF_OS_BUCKET:-nyumbasync-frontend}"
SAF_OS_REGION="${SAF_OS_REGION:-af-south-1}"

# Nginx / VM fallback
VM_IP="${VM_IP:-}"
VM_USER="${VM_USER:-ubuntu}"
SSH_KEY="${SSH_KEY:-~/.ssh/id_rsa}"
NGINX_WEBROOT="/opt/nyumbasync/frontend"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info()  { echo -e "${GREEN}[INFO]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

info "NyumbaSync Frontend → Safaricom Cloud ($DEPLOY_METHOD)"
echo "======================================================="

# ── Build React app ────────────────────────────────────────
info "Building React app..."
cd "$FRONTEND_DIR"

# Install deps if node_modules missing
[ ! -d node_modules ] && npm install

# Inject production API URL
REACT_APP_API_URL="$REACT_APP_API_URL" npm run build

info "Build complete: ${BUILD_DIR}"
ls -lh "$BUILD_DIR"

# ── Deploy: Object Storage ─────────────────────────────────
if [ "$DEPLOY_METHOD" = "object-storage" ]; then
  [ -z "$SAF_OS_ENDPOINT" ]   && error "Set SAF_OS_ENDPOINT"
  [ -z "$SAF_OS_ACCESS_KEY" ] && error "Set SAF_OS_ACCESS_KEY"
  [ -z "$SAF_OS_SECRET_KEY" ] && error "Set SAF_OS_SECRET_KEY"

  command -v aws &>/dev/null || error "AWS CLI not found (needed for S3-compatible upload). Install: pip install awscli"

  info "Uploading to Safaricom Object Storage bucket: ${SAF_OS_BUCKET}..."

  # Configure AWS CLI to use Safaricom's S3-compatible endpoint
  export AWS_ACCESS_KEY_ID="$SAF_OS_ACCESS_KEY"
  export AWS_SECRET_ACCESS_KEY="$SAF_OS_SECRET_KEY"
  export AWS_DEFAULT_REGION="$SAF_OS_REGION"

  # Sync build output — cache-busted assets get long TTL, HTML no-cache
  aws s3 sync "$BUILD_DIR/" "s3://${SAF_OS_BUCKET}/" \
    --endpoint-url "$SAF_OS_ENDPOINT" \
    --delete \
    --exclude "*.html" \
    --cache-control "public, max-age=31536000, immutable"

  aws s3 sync "$BUILD_DIR/" "s3://${SAF_OS_BUCKET}/" \
    --endpoint-url "$SAF_OS_ENDPOINT" \
    --exclude "*" \
    --include "*.html" \
    --cache-control "no-cache, no-store, must-revalidate"

  info "Files uploaded to object storage"

  # Enable static website hosting (if the bucket supports it)
  aws s3 website "s3://${SAF_OS_BUCKET}" \
    --endpoint-url "$SAF_OS_ENDPOINT" \
    --index-document index.html \
    --error-document index.html \
    2>/dev/null && info "Static website hosting enabled" || warn "Could not set website config (may already be set via portal)"

  echo ""
  info "Frontend available at: ${SAF_OS_ENDPOINT}/${SAF_OS_BUCKET}/index.html"
  echo "Point your DNS CNAME to the bucket endpoint from the Safaricom Cloud portal."

# ── Deploy: Nginx on VM ────────────────────────────────────
elif [ "$DEPLOY_METHOD" = "nginx" ]; then
  [ -z "$VM_IP" ] && error "Set VM_IP to your Safaricom VM floating IP"

  info "Uploading build to VM ${VM_USER}@${VM_IP}:${NGINX_WEBROOT}..."

  ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no \
    "${VM_USER}@${VM_IP}" "sudo mkdir -p ${NGINX_WEBROOT} && sudo chown ${VM_USER}:${VM_USER} ${NGINX_WEBROOT}"

  # Sync build files
  rsync -avz --delete \
    -e "ssh -i ${SSH_KEY} -o StrictHostKeyChecking=no" \
    "${BUILD_DIR}/" \
    "${VM_USER}@${VM_IP}:${NGINX_WEBROOT}/"

  # Upload nginx config and reload
  scp -i "$SSH_KEY" \
    "$(git rev-parse --show-toplevel)/deploy/safaricom/nginx.conf" \
    "${VM_USER}@${VM_IP}:/tmp/nyumbasync-nginx.conf"

  ssh -i "$SSH_KEY" "${VM_USER}@${VM_IP}" bash <<REMOTE
    sudo cp /tmp/nyumbasync-nginx.conf /etc/nginx/sites-available/nyumbasync
    sudo ln -sf /etc/nginx/sites-available/nyumbasync /etc/nginx/sites-enabled/nyumbasync
    sudo rm -f /etc/nginx/sites-enabled/default
    sudo nginx -t && sudo systemctl reload nginx
    echo "Nginx reloaded"
REMOTE

  info "Frontend deployed via Nginx"
  echo "Visit: http://${VM_IP}"
  echo "Then run: sudo certbot --nginx -d app.nyumbasync.co.ke  (on the VM)"

else
  error "Unknown DEPLOY_METHOD: ${DEPLOY_METHOD}. Use 'object-storage' or 'nginx'"
fi

info "Frontend deployment complete!"
