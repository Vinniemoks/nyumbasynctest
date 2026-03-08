#!/bin/bash
# ============================================================
# NyumbaSync - AWS Parameter Store Secrets Setup
#
# Stores all sensitive environment variables in AWS SSM
# Parameter Store (SecureString). Run this once before
# deploying the ECS stack.
#
# Usage:
#   export AWS_REGION=af-south-1
#   bash deploy/aws/setup-secrets.sh
#
# You will be prompted for each secret value.
# To update a single secret later:
#   aws ssm put-parameter --name /nyumbasync/JWT_SECRET \
#     --value "new-value" --type SecureString --overwrite \
#     --region af-south-1
# ============================================================
set -euo pipefail

AWS_REGION="${AWS_REGION:-af-south-1}"
PREFIX="/nyumbasync"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info() { echo -e "${GREEN}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }

put_secret() {
  local name="$1"
  local description="$2"
  local default_val="${3:-}"

  # Check if already set
  if aws ssm get-parameter --name "${PREFIX}/${name}" \
       --region "$AWS_REGION" &>/dev/null; then
    warn "${name} already exists — skipping (use --overwrite to update)"
    return
  fi

  if [ -n "$default_val" ]; then
    echo -n "${YELLOW}${name}${NC} [${description}] (press enter to use default '${default_val}'): "
  else
    echo -n "${YELLOW}${name}${NC} [${description}]: "
  fi

  read -rs value
  echo ""

  if [ -z "$value" ] && [ -n "$default_val" ]; then
    value="$default_val"
  fi

  if [ -z "$value" ]; then
    warn "Skipped ${name} (empty value)"
    return
  fi

  aws ssm put-parameter \
    --name "${PREFIX}/${name}" \
    --value "$value" \
    --type SecureString \
    --description "NyumbaSync - ${description}" \
    --region "$AWS_REGION" \
    --output text \
    --query 'Version'

  info "Stored ${PREFIX}/${name}"
}

info "NyumbaSync - AWS Parameter Store Setup"
echo "Region: ${AWS_REGION}"
echo "Prefix: ${PREFIX}"
echo "======================================="
echo ""

# ── Required ───────────────────────────────────────────────
info "=== Required Secrets ==="
put_secret "MONGODB_URI"         "MongoDB Atlas connection string (mongodb+srv://...)"
put_secret "JWT_SECRET"          "JWT access token signing secret (min 32 chars)"
put_secret "JWT_REFRESH_SECRET"  "JWT refresh token signing secret (min 32 chars)"
put_secret "SESSION_SECRET"      "Express session secret (min 32 chars)"

# ── M-Pesa ─────────────────────────────────────────────────
echo ""
info "=== M-Pesa (Safaricom Daraja API) ==="
put_secret "MPESA_CONSUMER_KEY"    "Daraja app consumer key"
put_secret "MPESA_CONSUMER_SECRET" "Daraja app consumer secret"
put_secret "MPESA_PASSKEY"         "Daraja STK Push passkey"

# ── Email ──────────────────────────────────────────────────
echo ""
info "=== Email (SendGrid) ==="
put_secret "SENDGRID_API_KEY" "SendGrid API key (SG.xxxxx)"

# ── SMS ────────────────────────────────────────────────────
echo ""
info "=== SMS (Twilio) ==="
put_secret "TWILIO_AUTH_TOKEN" "Twilio auth token"

echo ""
info "All secrets stored in AWS SSM Parameter Store"
echo ""
info "To view stored parameters:"
echo "  aws ssm describe-parameters --filters 'Key=Path,Values=${PREFIX}' --region ${AWS_REGION}"
echo ""
info "To delete all (caution!):"
echo "  aws ssm get-parameters-by-path --path ${PREFIX} --region ${AWS_REGION} --query 'Parameters[].Name' --output text | xargs -I{} aws ssm delete-parameter --name {} --region ${AWS_REGION}"
