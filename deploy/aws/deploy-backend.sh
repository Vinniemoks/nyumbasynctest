#!/bin/bash
# ============================================================
# NyumbaSync - AWS Backend Deployment (ECS Fargate)
#
# Infrastructure:
#   - ECR (Elastic Container Registry) — stores Docker image
#   - ECS Fargate — runs the container (serverless, no EC2 mgmt)
#   - ALB (Application Load Balancer) — HTTPS termination
#   - Secrets Manager — stores .env secrets
#   - CloudFormation — creates all infra on first run
#
# Usage:
#   export AWS_REGION=af-south-1          # Cape Town (closest to Kenya)
#   export AWS_ACCOUNT_ID=123456789012
#   bash deploy/aws/deploy-backend.sh
# ============================================================
set -euo pipefail

# ── Configuration ──────────────────────────────────────────
AWS_REGION="${AWS_REGION:-af-south-1}"
AWS_ACCOUNT_ID="${AWS_ACCOUNT_ID:?Set AWS_ACCOUNT_ID}"
APP_NAME="nyumbasync-backend"
ECR_REPO="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${APP_NAME}"
ECS_CLUSTER="${ECS_CLUSTER:-nyumbasync-cluster}"
ECS_SERVICE="${ECS_SERVICE:-nyumbasync-backend-service}"
TASK_FAMILY="${TASK_FAMILY:-nyumbasync-backend-task}"
STACK_NAME="${STACK_NAME:-nyumbasync-infra}"
CFN_TEMPLATE="$(git rev-parse --show-toplevel)/deploy/aws/cloudformation/infrastructure.yml"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info()  { echo -e "${GREEN}[INFO]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

info "NyumbaSync Backend → AWS ECS Fargate (${AWS_REGION})"
echo "======================================================="

# ── Pre-flight ─────────────────────────────────────────────
command -v aws    &>/dev/null || error "AWS CLI not found. Install: https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html"
command -v docker &>/dev/null || error "docker not found"

aws sts get-caller-identity --query Account --output text &>/dev/null \
  || error "AWS credentials not configured. Run: aws configure"

# ── Create ECR repo if needed ──────────────────────────────
info "Ensuring ECR repository exists..."
aws ecr describe-repositories --repository-names "$APP_NAME" \
  --region "$AWS_REGION" &>/dev/null \
  || aws ecr create-repository \
      --repository-name "$APP_NAME" \
      --region "$AWS_REGION" \
      --image-scanning-configuration scanOnPush=true \
      --encryption-configuration encryptionType=AES256 \
      --query 'repository.repositoryUri' --output text

info "ECR repo: ${ECR_REPO}"

# ── Build & push Docker image ──────────────────────────────
info "Building Docker image..."
cd "$(git rev-parse --show-toplevel)/nyumbasync_backend"

GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "latest")
IMAGE_TAG="${GIT_COMMIT}"

docker build \
  --build-arg BUILD_DATE="$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  --build-arg GIT_COMMIT="$GIT_COMMIT" \
  --platform linux/amd64 \
  --tag "${ECR_REPO}:${IMAGE_TAG}" \
  --tag "${ECR_REPO}:latest" \
  --file Dockerfile \
  .

info "Authenticating with ECR..."
aws ecr get-login-password --region "$AWS_REGION" \
  | docker login --username AWS --password-stdin "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

info "Pushing image to ECR..."
docker push "${ECR_REPO}:${IMAGE_TAG}"
docker push "${ECR_REPO}:latest"
info "Image pushed: ${ECR_REPO}:${IMAGE_TAG}"

# ── Deploy / update CloudFormation stack ──────────────────
info "Deploying CloudFormation infrastructure stack..."
aws cloudformation deploy \
  --template-file "$CFN_TEMPLATE" \
  --stack-name "$STACK_NAME" \
  --region "$AWS_REGION" \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides \
      AppName="$APP_NAME" \
      ImageUri="${ECR_REPO}:${IMAGE_TAG}" \
      Environment="production" \
  --no-fail-on-empty-changeset

info "CloudFormation stack deployed"

# ── Force new ECS deployment ───────────────────────────────
info "Triggering ECS rolling deployment..."
aws ecs update-service \
  --cluster "$ECS_CLUSTER" \
  --service "$ECS_SERVICE" \
  --force-new-deployment \
  --region "$AWS_REGION" \
  --query 'service.serviceName' --output text

info "Waiting for ECS deployment to stabilize (may take 2-3 min)..."
aws ecs wait services-stable \
  --cluster "$ECS_CLUSTER" \
  --services "$ECS_SERVICE" \
  --region "$AWS_REGION"

info "ECS deployment stable!"

# ── Get ALB endpoint ───────────────────────────────────────
ALB_DNS=$(aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --region "$AWS_REGION" \
  --query 'Stacks[0].Outputs[?OutputKey==`LoadBalancerDNS`].OutputValue' \
  --output text 2>/dev/null || echo "")

if [ -n "$ALB_DNS" ]; then
  info "Backend available at: https://${ALB_DNS}"
  info "Health check: curl https://${ALB_DNS}/health"
fi

info "AWS backend deployment complete!"
echo ""
echo "Useful commands:"
echo "  Logs:    aws logs tail /ecs/${APP_NAME} --follow --region ${AWS_REGION}"
echo "  Status:  aws ecs describe-services --cluster ${ECS_CLUSTER} --services ${ECS_SERVICE} --region ${AWS_REGION}"
echo "  Rollback: aws ecs update-service --cluster ${ECS_CLUSTER} --service ${ECS_SERVICE} --task-definition ${TASK_FAMILY}:<prev-revision> --region ${AWS_REGION}"
