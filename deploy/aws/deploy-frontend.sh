#!/bin/bash
# ============================================================
# NyumbaSync - AWS Frontend Deployment (S3 + CloudFront)
#
# Infrastructure:
#   - S3 bucket — stores the React build output
#   - CloudFront — CDN with HTTPS, edge caching
#   - Route 53 (optional) — custom domain DNS
#   - ACM — free TLS certificate
#
# Usage:
#   export AWS_REGION=us-east-1        # ACM certs for CF must be us-east-1
#   export S3_BUCKET=app.nyumbasync.co.ke
#   export CF_DISTRIBUTION_ID=E1234567890  # after first deploy
#   export REACT_APP_API_URL=https://api.nyumbasync.co.ke/api/v1
#   bash deploy/aws/deploy-frontend.sh
# ============================================================
set -euo pipefail

# ── Configuration ──────────────────────────────────────────
AWS_REGION="${AWS_REGION:-af-south-1}"
S3_BUCKET="${S3_BUCKET:-app.nyumbasync.co.ke}"
CF_DISTRIBUTION_ID="${CF_DISTRIBUTION_ID:-}"         # set after first deploy
REACT_APP_API_URL="${REACT_APP_API_URL:-https://api.nyumbasync.co.ke/api/v1}"
FRONTEND_DIR="$(git rev-parse --show-toplevel)/nyumbasync-desktop"
BUILD_DIR="${FRONTEND_DIR}/build"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info()  { echo -e "${GREEN}[INFO]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

info "NyumbaSync Frontend → AWS S3 + CloudFront"
echo "============================================"

# ── Pre-flight ─────────────────────────────────────────────
command -v aws &>/dev/null || error "AWS CLI not found"
aws sts get-caller-identity &>/dev/null || error "AWS credentials not configured"

# ── Create S3 bucket if it doesn't exist ──────────────────
info "Ensuring S3 bucket exists: ${S3_BUCKET}..."
if ! aws s3api head-bucket --bucket "$S3_BUCKET" --region "$AWS_REGION" 2>/dev/null; then
  info "Creating S3 bucket..."
  if [ "$AWS_REGION" = "us-east-1" ]; then
    aws s3api create-bucket --bucket "$S3_BUCKET" --region "$AWS_REGION"
  else
    aws s3api create-bucket --bucket "$S3_BUCKET" --region "$AWS_REGION" \
      --create-bucket-configuration LocationConstraint="$AWS_REGION"
  fi

  # Block all public access (CloudFront uses OAC to access the bucket privately)
  aws s3api put-public-access-block \
    --bucket "$S3_BUCKET" \
    --public-access-block-configuration \
      BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true

  info "Bucket created and public access blocked"
fi

# ── Build React app ────────────────────────────────────────
info "Building React app..."
cd "$FRONTEND_DIR"
[ ! -d node_modules ] && npm install
REACT_APP_API_URL="$REACT_APP_API_URL" \
NODE_ENV=production \
  npm run build
info "Build complete"

# ── Upload to S3 ───────────────────────────────────────────
info "Syncing build to S3..."

# Long-cached hashed assets (JS, CSS, images)
aws s3 sync "${BUILD_DIR}/" "s3://${S3_BUCKET}/" \
  --region "$AWS_REGION" \
  --delete \
  --exclude "*.html" \
  --exclude "service-worker.js" \
  --cache-control "public, max-age=31536000, immutable"

# HTML and service worker — never cache
aws s3 sync "${BUILD_DIR}/" "s3://${S3_BUCKET}/" \
  --region "$AWS_REGION" \
  --exclude "*" \
  --include "*.html" \
  --include "service-worker.js" \
  --cache-control "no-cache, no-store, must-revalidate"

info "S3 upload complete"

# ── Invalidate CloudFront cache ────────────────────────────
if [ -n "$CF_DISTRIBUTION_ID" ]; then
  info "Invalidating CloudFront cache (distribution: ${CF_DISTRIBUTION_ID})..."
  INVALIDATION_ID=$(aws cloudfront create-invalidation \
    --distribution-id "$CF_DISTRIBUTION_ID" \
    --paths "/*" \
    --query 'Invalidation.Id' --output text)

  info "Invalidation created: ${INVALIDATION_ID}"
  info "Waiting for invalidation to complete..."
  aws cloudfront wait invalidation-completed \
    --distribution-id "$CF_DISTRIBUTION_ID" \
    --id "$INVALIDATION_ID"
  info "Cache invalidated"
else
  warn "CF_DISTRIBUTION_ID not set — skipping CloudFront invalidation."
  warn "On first deploy, create a CloudFront distribution pointing to s3://${S3_BUCKET}"
  warn "Then set export CF_DISTRIBUTION_ID=<id> and re-run."
  echo ""
  echo "Quick CloudFront setup:"
  echo "  1. AWS Console → CloudFront → Create Distribution"
  echo "  2. Origin: ${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com"
  echo "  3. Origin Access: Origin Access Control (OAC)"
  echo "  4. Default root object: index.html"
  echo "  5. Custom error page: 404 → /index.html (React Router)"
  echo "  6. Alternative domain: app.nyumbasync.co.ke"
  echo "  7. TLS cert: Request via ACM (us-east-1 region)"
fi

info "Frontend deployment complete!"
echo ""
echo "S3 console: https://s3.console.aws.amazon.com/s3/buckets/${S3_BUCKET}"
[ -n "$CF_DISTRIBUTION_ID" ] && \
  echo "CloudFront:  https://console.aws.amazon.com/cloudfront/v3/home#/distributions/${CF_DISTRIBUTION_ID}"
