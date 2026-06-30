# OGOH MAI — Ubuntu serverga deploy qo'llanmasi

Ubuntu 22.04 / 24.04 LTS uchun. Stack: **Next.js 16 + Prisma 6 + PostgreSQL 16 + Redis 7 + BullMQ workerlar**.

> Eslatma: Windows'dagi Redis 3.0/5.0 muammosi Ubuntu'da YO'Q — Redis 7 BullMQ bilan to'g'ridan ishlaydi.

Arxitektura (3 jarayon):
- **Web** — Next.js (`npm run start`, port 3001)
- **Worker** — skan/verify/ingest ishlovchisi (`npm run worker`)
- **Scheduler** — takroriy joblar: skan yak 02:00, verify kunlik 03:00, ingest kunlik 01:00 (`npm run scheduler`)

---

## 0. Tayyorgarlik

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git build-essential ufw
```

Foydalanuvchi (root'da ishlatmang):
```bash
sudo adduser ogoh-mai
sudo usermod -aG sudo ogoh-mai
su - ogoh-mai
```

---

## 1. Node.js 20 LTS

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v   # v20.x
```

---

## 2. PostgreSQL 16

```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable --now postgresql
```

DB + user:
```bash
sudo -u postgres psql <<'SQL'
CREATE USER ogoh-mai WITH PASSWORD 'KUCHLI_PAROL';
CREATE DATABASE ogoh-mai OWNER ogoh-mai;
GRANT ALL PRIVILEGES ON DATABASE ogoh-mai TO ogoh-mai;
SQL
```

---

## 3. Redis 7

```bash
sudo apt install -y redis-server
sudo systemctl enable --now redis-server
redis-cli ping   # PONG
```

(Ixtiyoriy xavfsizlik: `/etc/redis/redis.conf` da `requirepass` qo'ying → `REDIS_URL` ga parol qo'shing.)

---

## 4. Loyihani joylash

```bash
sudo mkdir -p /var/www && sudo chown ogoh-mai:ogoh-mai /var/www
cd /var/www
git clone <REPO_URL> ogoh-mai
cd ogoh-mai
```

`.npmrc` da `legacy-peer-deps=true` bor (React 19 peers). Barcha paketlar (devDeps ham — workerlar `tsx` ishlatadi):
```bash
npm install
```

---

## 5. Muhit o'zgaruvchilari

`.env` (Prisma CLI + runtime):
```bash
cat > .env <<'ENV'
DATABASE_URL="postgresql://ogoh-mai:KUCHLI_PAROL@localhost:5432/ogoh-mai?schema=public"
REDIS_URL="redis://localhost:6379"
ENV
```

`.env.local` (Next.js runtime, maxfiy):
```bash
cat > .env.local <<'ENV'
AUTH_SECRET="<openssl rand -base64 32>"
AUTH_URL="https://ogoh-mai.example.uz"
AUTH_TRUST_HOST="true"
ENCRYPTION_KEY="<node -e crypto.randomBytes(32).hex>"

NVD_API_KEY="<ixtiyoriy, tezroq ingest>"
GITHUB_TOKEN="<ixtiyoriy, GHSA>"

SMTP_HOST="smtp-relay.gmail.com"
SMTP_PORT="587"
SMTP_USER="<gmail>"
SMTP_PASSWORD="<app password>"
SMTP_FROM="security@ogoh-mai.example.uz"
ENV
```

Kalitlarni generatsiya:
```bash
openssl rand -base64 32                                              # AUTH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"  # ENCRYPTION_KEY
```

> `AUTH_URL` real domen + `https`. `AUTH_TRUST_HOST=true` nginx orqasida shart.
> Worker `dotenv` faqat `.env` o'qiydi → `NVD_API_KEY`/SMTP workerga kerak bo'lsa `.env` ga ham qo'ying yoki systemd `EnvironmentFile` ga ikkalasini bering.

---

## 6. DB sxema + seed + build

```bash
npx prisma generate
npx prisma migrate deploy      # migration'lar bo'lsa; aks holda: npx prisma db push
npx prisma db seed             # admin@example.uz / Admin@12345
npm run build
```

> **Production'da 2FA YOQILADI** (kod `NODE_ENV !== production` da o'chiradi). Birinchi kirishdan keyin profil → 2FA enroll qiling.
> **Seed parolini darhol o'zgartiring** yoki yangi admin yarating.

---

## 7. Boshlang'ich CVE yig'ish

```bash
# Tez (offline + asosiy manbalar):
npm run ingest all

# To'liq backfill (~355k CVE, NVD_API_KEY bilan tezroq, soatlar):
npm run ingest:full
```

---

## 8. PM2 bilan jarayonlarni boshqarish

```bash
sudo npm install -g pm2
```

`ecosystem.config.js`:
```js
module.exports = {
  apps: [
    { name: "ogoh-mai-web",    script: "npm", args: "run start", cwd: "/var/www/ogoh-mai", env: { PORT: 3001 } },
    { name: "ogoh-mai-worker", script: "npm", args: "run worker", cwd: "/var/www/ogoh-mai" },
    // scheduler PM2 daemon EMAS — bir martalik (npm run scheduler) repeatable joblarni Redis'ga yozadi.
  ],
}
```

> Scheduler daemon emas: deploy.sh uni `npm run scheduler` bilan bir marta ishga tushiradi (repeatable joblar Redis'da saqlanadi, worker bajaradi). Redis tozalansa qayta ishga tushiring.

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd      # chiqgan buyruqni sudo bilan bajaring
pm2 logs                 # loglar
pm2 status
```

---

## 9. Nginx reverse proxy + HTTPS

```bash
sudo apt install -y nginx
```

`/etc/nginx/sites-available/ogoh-mai`:
```nginx
server {
    listen 80;
    server_name ogoh-mai.example.uz;

    client_max_body_size 20M;   # JSON import / fayl yuklash uchun

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/ogoh-mai /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

TLS (Let's Encrypt):
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d ogoh-mai.example.uz
```

---

## 10. Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

Postgres/Redis tashqariga ochilmasin (default localhost) — port 5432/6379 ni UFW'da ochmang.

---

## 11. Yangilash (redeploy)

```bash
cd /var/www/ogoh-mai
git pull
npm install
npx prisma migrate deploy
npm run build
pm2 reload ogoh-mai-web ogoh-mai-worker ogoh-mai-scheduler
```

---

## 12. Tekshirish ro'yxati

- [ ] `https://ogoh-mai.example.uz/login` → 200, login karta
- [ ] Admin kirish → `/dashboard`
- [ ] Seed parol o'zgartirildi / yangi admin
- [ ] `pm2 status` → web/worker/scheduler **online**
- [ ] `redis-cli ping` → PONG; `psql` ulanish OK
- [ ] CVE bazasi to'ldi (`/cve`)
- [ ] Qo'lda skan → topilmalar + email yetib bordi (SMTP)
- [ ] HTTPS sertifikat (certbot) faol
- [ ] `.env*` fayllar `chmod 600`, git'ga tushmagan

---

## Backup (tavsiya)

```bash
# Kunlik DB dump (cron)
pg_dump -U ogoh-mai ogoh-mai | gzip > /var/backups/ogoh-mai-$(date +\%F).sql.gz
```

`storage/reports/` (PDF/Excel) ham backup qiling.
