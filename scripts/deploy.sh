#!/usr/bin/env bash
# e-Xabar — APP deploy / redeploy.
# Talab: server-setup.sh bajarilgan + .env va .env.local to'ldirilgan.
# Ishlatish:  bash scripts/deploy.sh           (oddiy redeploy)
#             SEED=1 bash scripts/deploy.sh     (birinchi marta — seed bilan)
#             PULL=1 bash scripts/deploy.sh     (git pull bilan)
set -euo pipefail
cd "$(dirname "$0")/.."   # loyiha ildizi

echo "==> Muhit fayllari tekshiruvi"
[ -f .env ]       || { echo "XATO: .env yo'q (DATABASE_URL, REDIS_URL)"; exit 1; }
[ -f .env.local ] || echo "OGOH: .env.local yo'q (AUTH_SECRET, SMTP...) — runtime sozlamalari yetishmasligi mumkin"

if [ "${PULL:-0}" = "1" ]; then
  echo "==> git pull"
  git pull --ff-only
fi

echo "==> Paketlar (legacy-peer-deps .npmrc'da)"
npm install --no-audit --no-fund

echo "==> Prisma generate + DB sxema sinxron (db push)"
npx prisma generate
# Loyiha db push workflow'idan foydalanadi (AGENTS.md). Migratsiyalar manba EMAS.
# db push schema'ni DB'ga to'g'ridan moslaydi (yetishmayotgan unique/constraint qo'shadi).
npx prisma db push

if [ "${SEED:-0}" = "1" ]; then
  echo "==> Seed (faqat foydalanuvchilar)"
  npx prisma db seed
fi

echo "==> Build"
npm run build

echo "==> PM2 (web + worker + scheduler)"
if pm2 describe exabar-web >/dev/null 2>&1; then
  pm2 reload ecosystem.config.js
else
  pm2 start ecosystem.config.js
  pm2 save
  echo "AVTO-START uchun bir marta: pm2 startup systemd  (chiqgan buyruqni sudo bilan bajaring)"
fi

pm2 status
echo ""
echo "================ DEPLOY TAYYOR ================"
echo "Web: http://127.0.0.1:3000  (nginx orqasida)"
echo "Birinchi CVE yig'ish:  npm run ingest all   (yoki to'liq: npm run ingest:full)"
