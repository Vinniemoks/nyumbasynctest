#!/bin/bash
# ============================================================
# NyumbaSync - Safaricom Cloud VM Initial Setup
# Run this ONCE on a freshly provisioned Safaricom Cloud VM
#
# Prerequisites:
#   - Ubuntu 22.04 LTS VM on Safaricom Cloud
#   - SSH access to the VM (ssh ubuntu@<FLOATING_IP>)
#   - Run: bash setup-vm.sh
# ============================================================
set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info()  { echo -e "${GREEN}[INFO]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

info "NyumbaSync - Safaricom Cloud VM Setup"
echo "======================================"

# ── System update ──────────────────────────────────────────
info "Updating system packages..."
sudo apt-get update -qq && sudo apt-get upgrade -y -qq

# ── Docker ─────────────────────────────────────────────────
info "Installing Docker..."
if command -v docker &>/dev/null; then
  warn "Docker already installed: $(docker --version)"
else
  curl -fsSL https://get.docker.com | sudo sh
  sudo usermod -aG docker "$USER"
  info "Docker installed: $(docker --version)"
fi

# ── Docker Compose ─────────────────────────────────────────
info "Installing Docker Compose plugin..."
sudo apt-get install -y docker-compose-plugin
docker compose version

# ── Nginx (reverse proxy / frontend serving) ───────────────
info "Installing Nginx..."
sudo apt-get install -y nginx
sudo systemctl enable nginx

# ── Certbot (Let's Encrypt TLS) ────────────────────────────
info "Installing Certbot..."
sudo apt-get install -y certbot python3-certbot-nginx

# ── Node.js 18 (for health checks / scripts) ───────────────
info "Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version

# ── Firewall ───────────────────────────────────────────────
info "Configuring UFW firewall..."
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'   # ports 80 + 443
sudo ufw allow 3001/tcp       # backend direct (internal only, can restrict later)
sudo ufw --force enable
sudo ufw status

# ── Create app directories ─────────────────────────────────
info "Creating application directories..."
sudo mkdir -p /opt/nyumbasync/{backend,frontend,logs,uploads,ssl}
sudo chown -R "$USER":"$USER" /opt/nyumbasync

# ── systemd service for auto-restart ───────────────────────
info "Creating systemd service for backend..."
sudo tee /etc/systemd/system/nyumbasync-backend.service > /dev/null <<'SERVICE'
[Unit]
Description=NyumbaSync Backend
Requires=docker.service
After=docker.service network-online.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/opt/nyumbasync/backend
ExecStart=/usr/bin/docker compose -f docker-compose.prod.yml up
ExecStop=/usr/bin/docker compose -f docker-compose.prod.yml down
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
SERVICE

sudo systemctl daemon-reload
sudo systemctl enable nyumbasync-backend

# ── Log rotation ───────────────────────────────────────────
info "Configuring log rotation..."
sudo tee /etc/logrotate.d/nyumbasync > /dev/null <<'LOGROTATE'
/opt/nyumbasync/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    create 0640 ubuntu ubuntu
}
LOGROTATE

info "VM setup complete!"
echo ""
echo "Next steps:"
echo "  1. Copy .env file:  scp .env ubuntu@<VM_IP>:/opt/nyumbasync/backend/.env"
echo "  2. Run deploy:      bash deploy/safaricom/deploy-backend.sh"
echo "  3. Issue TLS cert:  sudo certbot --nginx -d api.nyumbasync.co.ke"
