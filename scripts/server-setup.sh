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

echo "==> Nginx"
apt install -y nginx
systemctl enable --now nginx

# Reverse-proxy site config. Domen bo'lsa shu nom, bo'lmasa har qanday host/IP (_).
SERVER_NAME="${DOMAIN:-_}"
cat > /etc/nginx/sites-available/exabar <<NGINX
server {
    listen 80;
    server_name ${SERVER_NAME};
    client_max_body_size 20M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
NGINX
ln -sf /etc/nginx/sites-available/exabar /etc/nginx/sites-enabled/exabar
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# Certbot (HTTPS) faqat real domen bo'lsa — local IP'da TLS sertifikat olinmaydi.
if [ -n "$DOMAIN" ]; then
  apt install -y certbot python3-certbot-nginx
fi

echo "==> PM2"
npm install -g pm2

echo "==> Firewall (UFW)"
ufw allow OpenSSH
ufw allow 'Nginx Full'
yes | ufw enable || true

LAN_IP="$(hostname -I | awk '{print $1}')"
echo ""
echo "================ TAYYOR ================"
echo "DATABASE_URL=\"postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}?schema=public\""
echo "Yuqoridagi qatorni loyiha .env fayliga yozing."
echo ""
if [ -n "$DOMAIN" ]; then
  echo ".env.local:  AUTH_URL=\"http://${DOMAIN}\"   AUTH_TRUST_HOST=\"true\""
  echo "HTTPS uchun keyin:  sudo certbot --nginx -d ${DOMAIN}"
else
  echo "Domen yo'q (local VLAN). Kirish manzili:  http://${LAN_IP}"
  echo ".env.local:  AUTH_URL=\"http://${LAN_IP}\"   AUTH_TRUST_HOST=\"true\""
fi
echo ""
echo "Keyingi qadam: bash scripts/deploy.sh"
