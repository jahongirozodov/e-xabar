#!/usr/bin/env bash
# e-Xabar — BIR MARTALIK server infratuzilmasi (Ubuntu 22.04/24.04).
# Node 20 + PostgreSQL 16 + Redis + Nginx + Certbot + PM2.
# Ishlatish:  sudo bash scripts/server-setup.sh
set -euo pipefail

DB_NAME="${DB_NAME:-exabar}"
DB_USER="${DB_USER:-exabar}"
DB_PASS="${DB_PASS:-$(openssl rand -hex 16)}"
DOMAIN="${DOMAIN:-}"

echo "==> APT yangilash"
apt update && apt upgrade -y
apt install -y curl git build-essential ufw ca-certificates gnupg

echo "==> Node.js 20 LTS"
if ! command -v node >/dev/null || [[ "$(node -v)" != v20* ]]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt install -y nodejs
fi
node -v

echo "==> PostgreSQL 16"
apt install -y postgresql postgresql-contrib
systemctl enable --now postgresql
sudo -u postgres psql <<SQL
DO \$\$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname='${DB_USER}') THEN
    CREATE ROLE ${DB_USER} LOGIN PASSWORD '${DB_PASS}';
  END IF;
END \$\$;
SELECT 'CREATE DATABASE ${DB_NAME} OWNER ${DB_USER}'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname='${DB_NAME}')\gexec
GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
SQL

echo "==> Redis"
apt install -y redis-server
systemctl enable --now redis-server
redis-cli ping

echo "==> Nginx + Certbot"
apt install -y nginx
apt install -y certbot python3-certbot-nginx
systemctl enable --now nginx

echo "==> PM2"
npm install -g pm2

echo "==> Firewall (UFW)"
ufw allow OpenSSH
ufw allow 'Nginx Full'
yes | ufw enable || true

echo ""
echo "================ TAYYOR ================"
echo "DATABASE_URL=\"postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}?schema=public\""
echo "Yuqoridagi qatorni loyiha .env fayliga yozing."
[ -n "$DOMAIN" ] && echo "Keyin: certbot --nginx -d ${DOMAIN}"
echo "Keyingi qadam: bash scripts/deploy.sh"
