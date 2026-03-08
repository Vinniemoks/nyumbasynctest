#!/bin/bash
# ============================================================
# NyumbaSync - Master Deployment Script
#
# Usage:
#   bash deploy/deploy.sh [platform] [component]
#
#   platform:  safaricom | aws | all
#   component: backend | frontend | both  (default: both)
#
# Examples:
#   bash deploy/deploy.sh safaricom backend
#   bash deploy/deploy.sh aws frontend
#   bash deploy/deploy.sh all both
# ============================================================
set -euo pipefail

PLATFORM="${1:-}"
COMPONENT="${2:-both}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

info()  { echo -e "${GREEN}[INFO]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }
title() { echo -e "\n${BOLD}${GREEN}$1${NC}\n"; }

print_usage() {
  echo ""
  echo "Usage: bash deploy/deploy.sh [platform] [component]"
  echo ""
  echo "  platform:   safaricom | aws | all"
  echo "  component:  backend | frontend | both  (default: both)"
  echo ""
  echo "Environment variables (set before running):"
  echo ""
  echo "  Safaricom Cloud:"
  echo "    VM_IP            Floating IP of your Safaricom Cloud VM"
  echo "    VM_USER          SSH user (default: ubuntu)"
  echo "    SSH_KEY          Path to SSH private key (default: ~/.ssh/id_rsa)"
  echo "    DOCKER_USER      Your Docker Hub username"
  echo "    DEPLOY_METHOD    object-storage | nginx  (frontend, default: nginx)"
  echo ""
  echo "  AWS:"
  echo "    AWS_REGION       e.g. af-south-1 (Cape Town, closest to Kenya)"
  echo "    AWS_ACCOUNT_ID   Your 12-digit AWS account ID"
  echo "    S3_BUCKET        Frontend S3 bucket name (e.g. app.nyumbasync.co.ke)"
  echo "    CF_DISTRIBUTION_ID  CloudFront distribution ID (after first deploy)"
  echo ""
  echo "  Both platforms:"
  echo "    REACT_APP_API_URL  Backend API URL injected into React build"
  echo ""
}

# ── Validate arguments ─────────────────────────────────────
if [ -z "$PLATFORM" ]; then
  error "No platform specified. $(print_usage)"
fi

case "$PLATFORM" in
  safaricom|aws|all) ;;
  *) error "Unknown platform: ${PLATFORM}. Use safaricom, aws, or all" ;;
esac

case "$COMPONENT" in
  backend|frontend|both) ;;
  *) error "Unknown component: ${COMPONENT}. Use backend, frontend, or both" ;;
esac

title "NyumbaSync Deployment"
echo "  Platform:  ${PLATFORM}"
echo "  Component: ${COMPONENT}"
echo "  Date:      $(date -u +"%Y-%m-%d %H:%M UTC")"
echo "  Commit:    $(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')"

# ── Deploy to Safaricom ────────────────────────────────────
deploy_safaricom() {
  title "Deploying to Safaricom Cloud"

  if [ "$COMPONENT" = "backend" ] || [ "$COMPONENT" = "both" ]; then
    info "Deploying backend to Safaricom Cloud VM..."
    chmod +x "${SCRIPT_DIR}/safaricom/deploy-backend.sh"
    bash "${SCRIPT_DIR}/safaricom/deploy-backend.sh"
  fi

  if [ "$COMPONENT" = "frontend" ] || [ "$COMPONENT" = "both" ]; then
    info "Deploying frontend to Safaricom Cloud..."
    chmod +x "${SCRIPT_DIR}/safaricom/deploy-frontend.sh"
    bash "${SCRIPT_DIR}/safaricom/deploy-frontend.sh"
  fi
}

# ── Deploy to AWS ──────────────────────────────────────────
deploy_aws() {
  title "Deploying to AWS"

  if [ "$COMPONENT" = "backend" ] || [ "$COMPONENT" = "both" ]; then
    info "Deploying backend to AWS ECS Fargate..."
    chmod +x "${SCRIPT_DIR}/aws/deploy-backend.sh"
    bash "${SCRIPT_DIR}/aws/deploy-backend.sh"
  fi

  if [ "$COMPONENT" = "frontend" ] || [ "$COMPONENT" = "both" ]; then
    info "Deploying frontend to AWS S3 + CloudFront..."
    chmod +x "${SCRIPT_DIR}/aws/deploy-frontend.sh"
    bash "${SCRIPT_DIR}/aws/deploy-frontend.sh"
  fi
}

# ── Run ────────────────────────────────────────────────────
case "$PLATFORM" in
  safaricom)
    deploy_safaricom
    ;;
  aws)
    deploy_aws
    ;;
  all)
    # Run both — fail fast if either fails
    deploy_safaricom
    deploy_aws
    ;;
esac

title "Deployment Complete!"
echo "  Backend API:  https://api.nyumbasync.co.ke"
echo "  Frontend App: https://app.nyumbasync.co.ke"
echo ""
