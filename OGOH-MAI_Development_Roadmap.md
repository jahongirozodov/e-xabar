# OGOH MAI — Loyihani Ishlab Chiqish Rejasi (Development Roadmap)

> **Avtomatik kiberzaiflik monitoringi tizimi**
> Vibe coding uchun bosqichma-bosqich qo'llanma — kod misollari va AI promptlari bilan
> Versiya: 1.0 | Stack: Next.js 14 + Prisma + BullMQ + PostgreSQL + Redis

---

## 📑 MUNDARIJA

> ⭐ **Sizda tayyor `studio-admin` loyihasi bor.** Avval hujjat oxiridagi
> **[«MAVJUD LOYIHANI MOSLASHTIRISH»](#mavjud-loyihani-moslashtirish)** bo'limini o'qing —
> u Faza 0 o'rnini bosadi va auth/Prisma qismlarini sizning loyihangizga moslaydi.

0. [⭐ MAVJUD LOYIHANI MOSLASHTIRISH (studio-admin)](#mavjud-loyihani-moslashtirish)
1. [Loyiha haqida umumiy ma'lumot](#1-loyiha-haqida)
2. [Texnologik stek va qarorlar](#2-texnologik-stek)
3. [Loyiha strukturasi (papkalar)](#3-loyiha-strukturasi)
4. [Vibe coding bo'yicha umumiy maslahatlar](#4-vibe-coding-maslahatlar)
5. [BOSQICHLAR (Phases)](#5-bosqichlar)
   - [Faza 0: Setup va asos](#faza-0-setup)
   - [Faza 1: Database va Auth](#faza-1-database-auth)
   - [Faza 2: Inventar (Inventory)](#faza-2-inventar)
   - [Faza 3: CVE Ingestion Pipeline](#faza-3-cve-ingestion)
   - [Faza 4: Matching Engine](#faza-4-matching)
   - [Faza 5: False Positive boshqaruvi](#faza-5-fp)
   - [Faza 6: Triage Workflow](#faza-6-triage)
   - [Faza 7: Notification (Email)](#faza-7-notification)
   - [Faza 8: Background Jobs (BullMQ)](#faza-8-jobs)
   - [Faza 9: Dashboard va Reports](#faza-9-dashboard)
   - [Faza 10: Admin panel va Settings](#faza-10-admin)
   - [Faza 11: Audit log va Monitoring](#faza-11-audit)
   - [Faza 12: Testing va Deployment](#faza-12-deploy)
6. [Bog'liqliklar grafigi](#6-bogliqliklar)
7. [Environment o'zgaruvchilari](#7-env)

---

## 1. LOYIHA HAQIDA <a name="1-loyiha-haqida"></a>

### Maqsad
Tashkilot hodimlari foydalanadigan dasturiy ta'minotning zaifliklarini (CVE) avtomatik aniqlash va tegishli xodimlarga email orqali xabar berish.

### Asosiy ish jarayoni (high-level flow)
```
1. Inventar (xodimlar + vositalar) → JSON import yoki qo'lda
2. Har hafta: 6 ta CVE manbasidan ma'lumot yig'ish
3. Vosita ↔ CVE moslashtirish (matching)
4. Confidence score hisoblash (false positive kamaytirish)
5. Yuqori ishonchli findinglar → email yuborish
6. Past ishonchli findinglar → triage queue (mutaxassis ko'rib chiqadi)
7. Xodim patch qiladi → 7 kundan keyin avtomatik qayta tekshirish
```

### Foydalanuvchi rollari (4 ta)
| Rol | Huquq |
|-----|-------|
| **Specialist** | Hamma operatsion ish (inventory, triage, suppressions, skan, hisobotlar) |
| **Admin** | Foydalanuvchilar + global sozlamalar (SMTP, API key) |
| **Section-Head** | Faqat Dashboard (read-only) |
| **Department-Head** | Faqat Dashboard (read-only) |

> Bir foydalanuvchi bir nechta rolga ega bo'lishi mumkin (masalan, Admin+Specialist).
> Vosita egasi = passiv xodim (login qilmaydi, faqat email oladi).

### Kirish ma'lumotlari formati (JSON)
```json
[
  {
    "employee": {
      "id": "uuid",
      "full_name": "Karimov Anvar Akmalovich",
      "email": "a.karimov@example.uz",
      "department": "Axborot texnologiyalari",
      "section": "Tarmoq xavfsizligi",
      "position": "Tizim administratori"
    },
    "system": {
      "org_name": "Misol tashkiloti",
      "hostname": "WS-IT-042",
      "os": "ubuntu",
      "os_version": "22.04",
      "environment": "production",
      "internet_facing": true,
      "criticality": "high"
    },
    "tools": [
      {
        "name": "OpenSSL",
        "vendor": "OpenSSL",
        "version": "1.1.1f",
        "purl": "pkg:deb/ubuntu/openssl@1.1.1f-1ubuntu2.16",
        "cpe": "cpe:2.3:a:openssl:openssl:1.1.1f:*:*:*:*:*:*:*"
      }
    ]
  }
]
```

---

## 2. TEXNOLOGIK STEK VA QARORLAR <a name="2-texnologik-stek"></a>

| Qatlam | Texnologiya | Sabab |
|--------|-------------|-------|
| Framework | **Next.js 14 (App Router)** | Fullstack — UI + backend bitta loyihada |
| Til | **TypeScript** | Type-safety, vibe coding'da xato kam |
| ORM | **Prisma** | Schema-first, type-safe, migration oson |
| DB | **PostgreSQL 15** | JSONB, ishonchli, sanoat standarti |
| Cache/Queue | **Redis 7** | BullMQ backend + cache |
| Background jobs | **BullMQ** | Node.js'da eng mashhur, repeatable jobs |
| Auth | **Auth.js v5 (NextAuth)** | RBAC + session, Prisma adapter |
| 2FA | **otplib** | TOTP (Google Authenticator) |
| UI | **shadcn/ui + Tailwind** | Copy-paste komponentlar, to'liq nazorat |
| Jadvallar | **@tanstack/react-table** | Server-side pagination/sort/filter |
| Forms | **react-hook-form + Zod** | Validatsiya, type-safe |
| Charts | **Recharts** | Dashboard diagrammalari |
| Email | **Nodemailer + React Email** | Gmail SMTP + HTML shablonlar |
| PDF | **@react-pdf/renderer** | Hisobotlar |
| Excel | **exceljs** | Hisobot eksport |
| Logging | **pino** | Strukturali loglar |
| Validation | **Zod** | Hamma joyda (API, form, JSON import) |
| Process manager | **PM2** | Production deploy (web + workers) |

### Muhim arxitektura qarori: 3 ta alohida process
```
1. Next.js web server  (UI + Server Actions + API routes)
2. BullMQ workers       (skan, ingestion, email, verification)
3. BullMQ scheduler     (repeatable jobs ni queue ga qo'yadi)
```
Bularning hammasi bitta kod bazasida, lekin alohida ishga tushadi (PM2 orqali).

---

## 3. LOYIHA STRUKTURASI <a name="3-loyiha-strukturasi"></a>

```
ogoh-mai/
├── app/                              # Next.js App Router
│   ├── (auth)/
│   │   └── login/page.tsx            # Login + 2FA
│   ├── (dashboard)/                  # Himoyalangan layout
│   │   ├── layout.tsx                # Sidebar + auth guard
│   │   ├── dashboard/page.tsx        # Asosiy dashboard
│   │   ├── employees/                # Xodimlar (passiv)
│   │   ├── assets/                   # Vositalar
│   │   ├── assignments/              # Xodim ↔ vosita
│   │   ├── findings/                 # Topilmalar
│   │   ├── triage/                   # Triage queue (kanban)
│   │   ├── suppressions/             # Bostirish qoidalari
│   │   ├── vulnerabilities/          # CVE bazasi (read-only)
│   │   ├── scans/                    # Skanlar tarixi + manual trigger
│   │   ├── reports/                  # Hisobotlar
│   │   ├── notifications/            # Yuborilgan emaillar
│   │   ├── audit-log/                # Audit jurnali
│   │   └── admin/
│   │       ├── users/                # Foydalanuvchilar (Admin)
│   │       └── settings/             # Sozlamalar (Admin)
│   ├── api/
│   │   ├── health/route.ts           # Health check
│   │   ├── metrics/route.ts          # Prometheus metrikalari
│   │   ├── ack/[token]/route.ts      # Email acknowledge havola
│   │   └── import/route.ts           # JSON import (REST)
│   └── layout.tsx                    # Root layout
├── components/
│   ├── ui/                           # shadcn/ui komponentlari
│   ├── data-table/                   # Umumiy jadval komponenti
│   ├── charts/                       # Recharts wrapper'lar
│   └── forms/                        # Form komponentlari
├── lib/
│   ├── actions/                      # Server Actions
│   │   ├── employee.actions.ts
│   │   ├── asset.actions.ts
│   │   ├── finding.actions.ts
│   │   ├── triage.actions.ts
│   │   ├── suppression.actions.ts
│   │   ├── scan.actions.ts
│   │   ├── user.actions.ts
│   │   └── settings.actions.ts
│   ├── services/                     # Biznes-mantiq
│   │   ├── matching.service.ts       # Asset ↔ CVE matching
│   │   ├── confidence.service.ts     # Confidence score
│   │   ├── suppression.service.ts    # Suppression qo'llash
│   │   ├── notification.service.ts   # Email tayyorlash
│   │   └── report.service.ts         # Hisobot generatsiya
│   ├── adapters/                     # CVE manba adapterlari
│   │   ├── base.adapter.ts           # Umumiy interfeys
│   │   ├── nvd.adapter.ts
│   │   ├── osv.adapter.ts
│   │   ├── ghsa.adapter.ts
│   │   ├── kev.adapter.ts
│   │   ├── ubuntu-usn.adapter.ts
│   │   ├── debian-dsa.adapter.ts
│   │   └── rhel-oval.adapter.ts
│   ├── auth/
│   │   ├── auth.config.ts            # Auth.js config
│   │   └── auth.ts                   # NextAuth instance
│   ├── rbac/
│   │   ├── permissions.ts            # Rol → ruxsatlar
│   │   └── guard.ts                  # checkPermission()
│   ├── db/
│   │   └── prisma.ts                 # Prisma client singleton
│   ├── redis/
│   │   └── client.ts                 # Redis client
│   ├── validations/                  # Zod sxemalari
│   │   ├── employee.schema.ts
│   │   ├── asset.schema.ts
│   │   └── import.schema.ts          # JSON import sxemasi
│   └── utils/
│       ├── purl.ts                   # PURL parser
│       ├── cpe.ts                    # CPE parser
│       ├── version-compare.ts        # Semver + distro versiya
│       └── crypto.ts                 # AES shifrlash (settings)
├── workers/
│   ├── index.ts                      # Worker entry point
│   ├── scheduler.ts                  # Repeatable jobs
│   ├── queues.ts                     # BullMQ queue ta'riflari
│   ├── scan.worker.ts
│   ├── ingestion.worker.ts
│   ├── notification.worker.ts
│   ├── verification.worker.ts
│   └── report.worker.ts
├── emails/                           # React Email shablonlar
│   ├── vulnerability-alert.tsx       # Asosiy email
│   └── components/
├── prisma/
│   ├── schema.prisma                 # DB sxema
│   ├── seed.ts                       # Boshlang'ich ma'lumot
│   └── migrations/
├── messages/                         # i18n
│   ├── uz.json
│   ├── ru.json
│   └── en.json
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .env.local                        # Maxfiy o'zgaruvchilar
├── .env.example                      # Namuna
├── ecosystem.config.js               # PM2 config
├── docker-compose.yml                # Postgres + Redis (dev uchun)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

---

## 4. VIBE CODING BO'YICHA MASLAHATLAR <a name="4-vibe-coding-maslahatlar"></a>

### Umumiy printsiplar
1. **Bitta faza = bitta ish sessiyasi.** Har fazani tugatib, sinab ko'ring, keyin keyingisiga o'ting.
2. **Schema avval.** Har doim Prisma schema'dan boshlang — qolgan hammasi shunga tayanadi.
3. **"Definition of Done"ni tekshiring.** Har faza oxirida "tugagani qanday bilinadi" bo'limini bajaring.
4. **Type-safety'dan foydalaning.** TypeScript xatolarini e'tiborsiz qoldirmang — ular bug'larni oldindan ushlaydi.
5. **Kichik commitlar.** Har bir ishlaydigan feature'dan keyin commit qiling.

### AI'ga prompt berish formati
Har faza uchun tayyor promptlar bor. Ularni Cursor / Claude Code / v0 ga bering. Prompt strukturasi:
```
KONTEKST: [loyiha haqida qisqa]
VAZIFA: [aniq nima qilish kerak]
FAYLLAR: [qaysi fayllar yaratiladi/o'zgartiriladi]
TALABLAR: [aniq texnik talablar]
NATIJA: [nima ishlashi kerak]
```

### Sinov strategiyasi
- Har faza oxirida `npm run dev` bilan UI'ni ko'ring
- API/Action'larni avval Prisma Studio (`npx prisma studio`) bilan tekshiring
- Worker'larni alohida terminal'da ishga tushiring va loglarni kuzating

---

## 5. BOSQICHLAR <a name="5-bosqichlar"></a>

---

### 🟢 FAZA 0: SETUP VA ASOS <a name="faza-0-setup"></a>

**Maqsad:** Loyiha skeleti, barcha asosiy paketlar, dev muhit (Postgres + Redis) tayyor.

**Davomiyligi:** ~yarim kun

#### 0.1. Loyihani yaratish
```bash
npx create-next-app@latest ogoh-mai --typescript --tailwind --app --eslint --src-dir=false --import-alias="@/*"
cd ogoh-mai
```

#### 0.2. Asosiy paketlarni o'rnatish
```bash
# Database & ORM
npm install prisma @prisma/client
npm install -D prisma

# Auth & Security
npm install next-auth@beta @auth/prisma-adapter
npm install otplib bcryptjs
npm install -D @types/bcryptjs

# Background jobs
npm install bullmq ioredis

# Validation & Forms
npm install zod react-hook-form @hookform/resolvers

# UI komponentlari
npm install lucide-react class-variance-authority clsx tailwind-merge
npm install @tanstack/react-table
npm install recharts

# Email
npm install nodemailer react-email @react-email/components
npm install -D @types/nodemailer

# PDF & Excel
npm install @react-pdf/renderer exceljs

# Utils
npm install date-fns pino pino-pretty papaparse
npm install -D @types/papaparse

# i18n
npm install next-intl

# Prometheus
npm install prom-client
```

#### 0.3. shadcn/ui sozlash
```bash
npx shadcn@latest init
# Tanlovlar: New York style, Slate rang, CSS variables = yes

# Asosiy komponentlarni qo'shish
npx shadcn@latest add button input label card table dialog sheet form
npx shadcn@latest add select dropdown-menu badge tabs toast sonner
npx shadcn@latest add avatar separator skeleton alert checkbox
npx shadcn@latest add command popover calendar
```

#### 0.4. Docker Compose (dev uchun Postgres + Redis)
```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: exabar
      POSTGRES_PASSWORD: exabar_dev_password
      POSTGRES_DB: exabar
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redisdata:/data
    command: redis-server --appendonly yes

volumes:
  pgdata:
  redisdata:
```

```bash
docker compose up -d
```

#### 0.5. Environment fayl
```bash
# .env.local
DATABASE_URL="postgresql://exabar:exabar_dev_password@localhost:5432/exabar"
REDIS_URL="redis://localhost:6379"

# Auth.js
AUTH_SECRET="<openssl rand -base64 32 bilan generatsiya qiling>"
AUTH_URL="http://localhost:3000"

# Shifrlash kaliti (settings uchun)
ENCRYPTION_KEY="<32 baytli hex kalit>"

# NVD API (keyinroq)
NVD_API_KEY=""
GITHUB_TOKEN=""

# SMTP (keyinroq, admin paneldan ham sozlanadi)
SMTP_HOST="smtp-relay.gmail.com"
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASSWORD=""
SMTP_FROM="security@example.uz"
```

#### 0.6. Prisma init
```bash
npx prisma init
```

#### 📋 Definition of Done (Faza 0)
- [ ] `npm run dev` ishlaydi, `localhost:3000` ochiladi
- [ ] `docker compose ps` — postgres va redis "running"
- [ ] `npx prisma studio` ochiladi (bo'sh DB)
- [ ] shadcn `<Button>` komponenti import qilinadi va ko'rinadi
- [ ] `.env.local` to'ldirilgan

#### 🤖 Vibe coding prompt (Faza 0)
```
KONTEKST: Men "OGOH MAI" nomli CVE monitoring tizimini quryapman.
Stack: Next.js 14 App Router, TypeScript, Prisma, PostgreSQL, Redis,
BullMQ, Auth.js v5, shadcn/ui, Tailwind.

VAZIFA: Loyiha asosini sozlash. package.json, tsconfig, tailwind.config,
docker-compose.yml va .env.example fayllarini to'g'ri sozla.

TALABLAR:
- Path alias @/* root'ga ishora qilsin
- Prisma client singleton pattern (lib/db/prisma.ts)
- Redis client singleton (lib/redis/client.ts)
- pino logger sozlangan (lib/utils/logger.ts)

NATIJA: npm run dev ishlasin, Prisma va Redis client'lar import qilinsin.
```
---

### 🟢 FAZA 1: DATABASE VA AUTH <a name="faza-1-database-auth"></a>

**Maqsad:** To'liq DB sxema (Prisma), migration, Auth.js v5 + 2FA, RBAC asosi.

**Davomiyligi:** ~1-2 kun

**Bog'liqlik:** Faza 0

#### 1.1. To'liq Prisma Schema

`prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ==================== TIZIM FOYDALANUVCHILARI ====================

model User {
  id            String     @id @default(uuid())
  fullName      String     @map("full_name")
  email         String     @unique
  passwordHash  String     @map("password_hash")
  totpSecret    String?    @map("totp_secret")  // shifrlangan
  totpEnabled   Boolean    @default(false) @map("totp_enabled")
  status        UserStatus @default(ACTIVE)
  createdAt     DateTime   @default(now()) @map("created_at")
  updatedAt     DateTime   @updatedAt @map("updated_at")

  roles         UserRole[]
  auditLogs     AuditLog[]
  triagedFindings Finding[] @relation("TriagedBy")
  createdSuppressions Suppression[]

  @@map("users")
}

enum UserStatus {
  ACTIVE
  INACTIVE
}

model Role {
  id    Int        @id @default(autoincrement())
  name  RoleName   @unique
  users UserRole[]

  @@map("roles")
}

enum RoleName {
  ADMIN
  SPECIALIST
  SECTION_HEAD
  DEPARTMENT_HEAD
}

model UserRole {
  userId String @map("user_id")
  roleId Int    @map("role_id")
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  role   Role   @relation(fields: [roleId], references: [id], onDelete: Cascade)

  @@id([userId, roleId])
  @@map("user_roles")
}

// ==================== PASSIV XODIMLAR ====================

model Employee {
  id         String   @id @default(uuid())
  externalId String?  @map("external_id")  // JSON dan kelgan id
  fullName   String   @map("full_name")
  email      String   @unique
  department String
  section    String?
  position   String?
  status     EmployeeStatus @default(ACTIVE)
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")

  assets        EmployeeAsset[]
  notifications Notification[]

  @@index([email])
  @@index([department])
  @@map("employees")
}

enum EmployeeStatus {
  ACTIVE
  INACTIVE
}

// ==================== VOSITALAR ====================

model Asset {
  id          String   @id @default(uuid())
  name        String
  vendor      String?
  version     String
  purl        String?
  cpeUri      String?  @map("cpe_uri")
  hostname    String?
  assetType   AssetType @default(APPLICATION) @map("asset_type")
  platform    String?
  description String?
  status      AssetStatus @default(ACTIVE)
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  attributes  AssetAttribute[]
  employees   EmployeeAsset[]
  findings    Finding[]
  suppressions Suppression[]

  @@index([purl])
  @@index([status])
  @@map("assets")
}

enum AssetType {
  OS
  LIBRARY
  APPLICATION
  FRAMEWORK
  DATABASE
}

enum AssetStatus {
  ACTIVE
  INACTIVE
}

model AssetAttribute {
  id      String @id @default(uuid())
  assetId String @map("asset_id")
  key     String  // org_name, os, os_version, env, internet_facing, criticality
  value   String
  source  String @default("imported")  // manual / imported / auto-detected
  asset   Asset  @relation(fields: [assetId], references: [id], onDelete: Cascade)

  @@index([assetId])
  @@index([key, value])
  @@map("asset_attributes")
}

model EmployeeAsset {
  id           String   @id @default(uuid())
  employeeId   String   @map("employee_id")
  assetId      String   @map("asset_id")
  role         String   @default("user")  // owner / user
  assignedAt   DateTime @default(now()) @map("assigned_at")
  unassignedAt DateTime? @map("unassigned_at")

  employee Employee @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  asset    Asset    @relation(fields: [assetId], references: [id], onDelete: Cascade)

  @@unique([employeeId, assetId])
  @@map("employee_assets")
}

// ==================== ZAIFLIKLAR (CVE) ====================

model Vulnerability {
  id             String   @id @default(uuid())
  cveId          String   @unique @map("cve_id")
  title          String?
  description    String?
  cvssV3Score    Decimal? @map("cvss_v3_score") @db.Decimal(3, 1)
  cvssV3Vector   String?  @map("cvss_v3_vector")
  severity       Severity @default(NONE)
  epssScore      Decimal? @map("epss_score") @db.Decimal(5, 4)
  isKev          Boolean  @default(false) @map("is_kev")
  kevAddedDate   DateTime? @map("kev_added_date")
  publishedAt    DateTime? @map("published_at")
  lastModifiedAt DateTime? @map("last_modified_at")
  affectedVersions Json?  @map("affected_versions")
  references     Json?
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  sources  VulnerabilitySource[]
  findings Finding[]

  @@index([cveId])
  @@index([isKev])
  @@index([severity])
  @@map("vulnerabilities")
}

enum Severity {
  NONE
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

model VulnerabilitySource {
  id              String   @id @default(uuid())
  vulnerabilityId String   @map("vulnerability_id")
  source          String   // NVD / OSV / GHSA / KEV / USN / DSA / OVAL
  sourceUrl       String?  @map("source_url")
  rawData         Json?    @map("raw_data")
  patchedVersions Json?    @map("patched_versions")
  fetchedAt       DateTime @default(now()) @map("fetched_at")

  vulnerability Vulnerability @relation(fields: [vulnerabilityId], references: [id], onDelete: Cascade)

  @@index([vulnerabilityId])
  @@map("vulnerability_sources")
}

// ==================== TOPILMALAR (FINDINGS) ====================

model Finding {
  id                String   @id @default(uuid())
  assetId           String   @map("asset_id")
  vulnerabilityId   String   @map("vulnerability_id")
  scanRunId         String?  @map("scan_run_id")
  confidenceScore   Decimal  @map("confidence_score") @db.Decimal(3, 2)
  confidenceFactors Json?    @map("confidence_factors")
  riskScore         Decimal? @map("risk_score") @db.Decimal(5, 2)
  sources           Json     // ["NVD", "OSV", "USN"]
  status            FindingStatus @default(NEW)
  triageReason      String?  @map("triage_reason")
  triagedById       String?  @map("triaged_by")
  triagedAt         DateTime? @map("triaged_at")
  firstSeenAt       DateTime @default(now()) @map("first_seen_at")
  lastSeenAt        DateTime @default(now()) @map("last_seen_at")
  lastVerifiedAt    DateTime? @map("last_verified_at")
  notificationSentAt DateTime? @map("notification_sent_at")

  asset         Asset         @relation(fields: [assetId], references: [id], onDelete: Cascade)
  vulnerability Vulnerability @relation(fields: [vulnerabilityId], references: [id], onDelete: Cascade)
  scanRun       ScanRun?      @relation(fields: [scanRunId], references: [id])
  triagedBy     User?         @relation("TriagedBy", fields: [triagedById], references: [id])
  notificationFindings NotificationFinding[]

  @@unique([assetId, vulnerabilityId])
  @@index([status])
  @@index([confidenceScore])
  @@map("findings")
}

enum FindingStatus {
  NEW
  PENDING_REVIEW
  APPLICABLE
  NOTIFIED
  ACKNOWLEDGED
  IN_PROGRESS
  PATCHED
  PENDING_VERIFICATION
  VERIFIED
  CLOSED
  NOT_APPLICABLE
  ACCEPTED_RISK
  NEEDS_INVESTIGATION
  PATCH_FAILED
}

// ==================== SUPPRESSION (BOSTIRISH) ====================

model Suppression {
  id                   String   @id @default(uuid())
  scope                SuppressionScope
  cveId                String?  @map("cve_id")
  assetId              String?  @map("asset_id")
  vendor               String?
  assetAttributeFilter Json?    @map("asset_attribute_filter")
  reason               String
  createdById          String   @map("created_by")
  createdAt            DateTime @default(now()) @map("created_at")
  expiresAt            DateTime @map("expires_at")  // MAJBURIY
  isActive             Boolean  @default(true) @map("is_active")

  asset     Asset? @relation(fields: [assetId], references: [id])
  createdBy User   @relation(fields: [createdById], references: [id])

  @@index([isActive])
  @@map("suppressions")
}

enum SuppressionScope {
  CVE
  CVE_ASSET
  CVE_VENDOR
  ASSET_ATTR
  GLOBAL
}

// ==================== SKANLAR ====================

model ScanRun {
  id               String   @id @default(uuid())
  scanType         ScanType @map("scan_type")
  startedAt        DateTime @default(now()) @map("started_at")
  finishedAt       DateTime? @map("finished_at")
  status           ScanStatus @default(RUNNING)
  triggeredById    String?  @map("triggered_by")
  assetsScanned    Int      @default(0) @map("assets_scanned")
  findingsNew      Int      @default(0) @map("findings_new")
  findingsRecurring Int     @default(0) @map("findings_recurring")
  emailsSent       Int      @default(0) @map("emails_sent")
  errorsCount      Int      @default(0) @map("errors_count")
  errorLog         Json?    @map("error_log")

  findings Finding[]

  @@map("scan_runs")
}

enum ScanType {
  SCHEDULED
  MANUAL
  KEV_PRIORITY
}

enum ScanStatus {
  RUNNING
  COMPLETED
  FAILED
  CANCELLED
}

// ==================== XABARNOMALAR ====================

model Notification {
  id                    String   @id @default(uuid())
  employeeId            String   @map("employee_id")
  scanRunId             String?  @map("scan_run_id")
  emailSubject          String   @map("email_subject")
  findingsCount         Int      @map("findings_count")
  findingsCriticalCount Int      @default(0) @map("findings_critical_count")
  findingsHighCount     Int      @default(0) @map("findings_high_count")
  status                NotificationStatus @default(QUEUED)
  sentAt                DateTime? @map("sent_at")
  deliveryAttempts      Int      @default(0) @map("delivery_attempts")
  errorMessage          String?  @map("error_message")
  acknowledgedAt        DateTime? @map("acknowledged_at")
  ackToken              String?  @unique @map("ack_token")

  employee Employee @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  notificationFindings NotificationFinding[]

  @@map("notifications")
}

enum NotificationStatus {
  QUEUED
  SENT
  FAILED
  BOUNCED
}

model NotificationFinding {
  notificationId String @map("notification_id")
  findingId      String @map("finding_id")

  notification Notification @relation(fields: [notificationId], references: [id], onDelete: Cascade)
  finding      Finding      @relation(fields: [findingId], references: [id], onDelete: Cascade)

  @@id([notificationId, findingId])
  @@map("notification_findings")
}

// ==================== AUDIT LOG ====================

model AuditLog {
  id         String   @id @default(uuid())
  actorId    String?  @map("actor_id")
  action     String   // LOGIN, CREATE_ASSET, TRIAGE_DECISION, ...
  entityType String?  @map("entity_type")
  entityId   String?  @map("entity_id")
  oldValue   Json?    @map("old_value")
  newValue   Json?    @map("new_value")
  ipAddress  String?  @map("ip_address")
  userAgent  String?  @map("user_agent")
  createdAt  DateTime @default(now()) @map("created_at")

  actor User? @relation(fields: [actorId], references: [id])

  @@index([actorId, createdAt])
  @@map("audit_log")
}

// ==================== QO'SHIMCHA ====================

model VendorFpStat {
  id          String   @id @default(uuid())
  vendor      String   @unique
  totalFindings Int    @default(0) @map("total_findings")
  falsePositives Int   @default(0) @map("false_positives")
  fpRate      Decimal  @default(0) @map("fp_rate") @db.Decimal(5, 4)
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@map("vendor_fp_stats")
}

model SystemSetting {
  key            String @id
  valueEncrypted String @map("value_encrypted")  // AES-256-GCM
  updatedAt      DateTime @updatedAt @map("updated_at")

  @@map("system_settings")
}

model IntegrationHealth {
  source        String   @id  // NVD, OSV, ...
  status        String   // healthy / degraded / down
  lastCheckedAt DateTime @map("last_checked_at")
  lastSuccessAt DateTime? @map("last_success_at")
  errorMessage  String?  @map("error_message")

  @@map("integration_health")
}

model Report {
  id          String   @id @default(uuid())
  reportType  String   @map("report_type")  // weekly / monthly / adhoc
  periodStart DateTime @map("period_start")
  periodEnd   DateTime @map("period_end")
  filePath    String?  @map("file_path")
  format      String   // pdf / excel
  createdAt   DateTime @default(now()) @map("created_at")

  @@map("reports")
}
```

#### 1.2. Migration va seed
```bash
npx prisma migrate dev --name init
npx prisma generate
```

`prisma/seed.ts` — rollar va boshlang'ich admin:
```typescript
import { PrismaClient, RoleName } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Rollarni yaratish
  for (const name of Object.values(RoleName)) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    })
  }

  // Boshlang'ich admin
  const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } })
  const specialistRole = await prisma.role.findUnique({ where: { name: 'SPECIALIST' } })

  const passwordHash = await bcrypt.hash('Admin@12345', 12)
  await prisma.user.upsert({
    where: { email: 'admin@example.uz' },
    update: {},
    create: {
      fullName: 'Tizim administratori',
      email: 'admin@example.uz',
      passwordHash,
      roles: {
        create: [
          { roleId: adminRole!.id },
          { roleId: specialistRole!.id },
        ],
      },
    },
  })

  console.log('Seed tugadi. Admin: admin@example.uz / Admin@12345')
}

main().finally(() => prisma.$disconnect())
```

```bash
# package.json ga qo'shish:
# "prisma": { "seed": "tsx prisma/seed.ts" }
npm install -D tsx
npx prisma db seed
```

#### 1.3. RBAC — ruxsatlar tizimi

`lib/rbac/permissions.ts`:
```typescript
import { RoleName } from '@prisma/client'

export type Permission =
  | 'dashboard:view'
  | 'reports:view'
  | 'reports:export'
  | 'employees:manage'
  | 'assets:manage'
  | 'findings:manage'
  | 'triage:manage'
  | 'suppressions:manage'
  | 'scans:run'
  | 'auditlog:view'
  | 'users:manage'
  | 'settings:manage'

export const ROLE_PERMISSIONS: Record<RoleName, Permission[]> = {
  SPECIALIST: [
    'dashboard:view', 'reports:view', 'reports:export',
    'employees:manage', 'assets:manage', 'findings:manage',
    'triage:manage', 'suppressions:manage', 'scans:run',
    'auditlog:view',
  ],
  ADMIN: [
    'dashboard:view', 'reports:view', 'reports:export',
    'users:manage', 'settings:manage', 'auditlog:view',
  ],
  SECTION_HEAD: [
    'dashboard:view', 'reports:view', 'reports:export', 'auditlog:view',
  ],
  DEPARTMENT_HEAD: [
    'dashboard:view', 'reports:view', 'reports:export', 'auditlog:view',
  ],
}

// Foydalanuvchining barcha ruxsatlari (ko'p rol birlashtiriladi)
export function getPermissions(roles: RoleName[]): Set<Permission> {
  const perms = new Set<Permission>()
  for (const role of roles) {
    ROLE_PERMISSIONS[role]?.forEach(p => perms.add(p))
  }
  return perms
}

export function hasPermission(roles: RoleName[], permission: Permission): boolean {
  return getPermissions(roles).has(permission)
}
```

`lib/rbac/guard.ts`:
```typescript
import { auth } from '@/lib/auth/auth'
import { hasPermission, type Permission } from './permissions'

// Server Action / Route Handler ichida ishlatish uchun
export async function requirePermission(permission: Permission) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('UNAUTHORIZED')
  }
  const roles = session.user.roles as any[]
  if (!hasPermission(roles, permission)) {
    throw new Error('FORBIDDEN')
  }
  return session
}
```

#### 1.4. Auth.js v5 sozlash

`lib/auth/auth.config.ts`:
```typescript
import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  pages: { signIn: '/login' },
  session: { strategy: 'jwt', maxAge: 30 * 60 }, // 30 daqiqa
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard') ||
        ['/employees','/assets','/findings','/triage','/suppressions',
         '/scans','/reports','/notifications','/audit-log','/admin']
         .some(p => nextUrl.pathname.startsWith(p))
      if (isOnDashboard) return isLoggedIn
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.roles = (user as any).roles
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        ;(session.user as any).roles = token.roles
      }
      return session
    },
  },
  providers: [], // auth.ts da qo'shiladi
} satisfies NextAuthConfig
```

`lib/auth/auth.ts`:
```typescript
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { authenticator } from 'otplib'
import { prisma } from '@/lib/db/prisma'
import { authConfig } from './auth.config'
import { decrypt } from '@/lib/utils/crypto'

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: {}, password: {}, totp: {},
      },
      async authorize(credentials) {
        const { email, password, totp } = credentials as any
        const user = await prisma.user.findUnique({
          where: { email },
          include: { roles: { include: { role: true } } },
        })
        if (!user || user.status !== 'ACTIVE') return null

        const valid = await bcrypt.compare(password, user.passwordHash)
        if (!valid) return null

        // 2FA tekshirish
        if (user.totpEnabled && user.totpSecret) {
          const secret = decrypt(user.totpSecret)
          const ok = authenticator.verify({ token: totp, secret })
          if (!ok) return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.fullName,
          roles: user.roles.map(r => r.role.name),
        } as any
      },
    }),
  ],
})
```

`app/api/auth/[...nextauth]/route.ts`:
```typescript
import { handlers } from '@/lib/auth/auth'
export const { GET, POST } = handlers
```

`middleware.ts` (root):
```typescript
import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth/auth.config'

export default NextAuth(authConfig).auth

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

#### 1.5. Shifrlash utility

`lib/utils/crypto.ts`:
```typescript
import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex')

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv)
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.concat([iv, tag, encrypted]).toString('base64')
}

export function decrypt(data: string): string {
  const buf = Buffer.from(data, 'base64')
  const iv = buf.subarray(0, 12)
  const tag = buf.subarray(12, 28)
  const encrypted = buf.subarray(28)
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv)
  decipher.setAuthTag(tag)
  return decipher.update(encrypted) + decipher.final('utf8')
}
```

#### 📋 Definition of Done (Faza 1)
- [ ] `npx prisma studio` — barcha jadvallar ko'rinadi (users, roles, employees, assets, findings, ...)
- [ ] Seed ishladi — `roles` jadvalida 4 rol, `users` da 1 admin bor
- [ ] Login sahifasi orqali admin kirib chiqadi
- [ ] Login bo'lmasdan `/dashboard` ga kirish `/login` ga yo'naltiradi
- [ ] `requirePermission()` huquqsiz user'ni rad etadi

#### 🤖 Vibe coding prompt (Faza 1)
```
KONTEKST: OGOH MAI CVE monitoring tizimi. Next.js 14, Prisma, Auth.js v5.
4 rol bor: ADMIN, SPECIALIST, SECTION_HEAD, DEPARTMENT_HEAD.
Bir user bir nechta rolga ega bo'lishi mumkin.

VAZIFA: To'liq autentifikatsiya tizimini qur.

FAYLLAR:
- lib/auth/auth.config.ts, lib/auth/auth.ts
- lib/rbac/permissions.ts, lib/rbac/guard.ts
- app/(auth)/login/page.tsx — login formasi (email + parol + 2FA TOTP)
- middleware.ts

TALABLAR:
- Credentials provider, bcrypt parol, otplib 2FA
- JWT session, 30 daqiqa
- Login formasi react-hook-form + zod + shadcn Form komponenti
- 2FA maydoni faqat kerak bo'lganda ko'rinsin
- Xato xabarlari o'zbek tilida

NATIJA: admin@example.uz / Admin@12345 bilan login qilish ishlasin.
```
---

### 🟢 FAZA 2: INVENTAR (INVENTORY) <a name="faza-2-inventar"></a>

**Maqsad:** Xodimlar, vositalar, bog'lanishlar uchun CRUD + JSON import. Dashboard layout va navigatsiya.

**Davomiyligi:** ~2 kun

**Bog'liqlik:** Faza 1

#### 2.1. Dashboard layout va sidebar

`app/(dashboard)/layout.tsx` — auth guard + sidebar (rolga mos menyu).

Menyu elementlari (har biri permission bilan):
```typescript
const NAV_ITEMS = [
  { href: '/dashboard',     label: 'Dashboard',      perm: 'dashboard:view' },
  { href: '/employees',     label: 'Xodimlar',       perm: 'employees:manage' },
  { href: '/assets',        label: 'Vositalar',      perm: 'assets:manage' },
  { href: '/assignments',   label: 'Bog\'lanishlar', perm: 'assets:manage' },
  { href: '/findings',      label: 'Topilmalar',     perm: 'findings:manage' },
  { href: '/triage',        label: 'Triage',         perm: 'triage:manage' },
  { href: '/suppressions',  label: 'Bostirishlar',   perm: 'suppressions:manage' },
  { href: '/vulnerabilities', label: 'CVE bazasi',   perm: 'findings:manage' },
  { href: '/scans',         label: 'Skanlar',        perm: 'scans:run' },
  { href: '/reports',       label: 'Hisobotlar',     perm: 'reports:view' },
  { href: '/notifications', label: 'Xabarnomalar',   perm: 'findings:manage' },
  { href: '/audit-log',     label: 'Audit jurnali',  perm: 'auditlog:view' },
  { href: '/admin/users',   label: 'Foydalanuvchilar', perm: 'users:manage' },
  { href: '/admin/settings', label: 'Sozlamalar',    perm: 'settings:manage' },
]
// Faqat permission bor elementlar ko'rsatiladi
```

#### 2.2. Umumiy DataTable komponenti

`components/data-table/data-table.tsx` — @tanstack/react-table asosida:
- Server-side pagination
- Qidiruv (search)
- Filtrlash
- Ustun bo'yicha tartiblash
- Ustun ko'rsatish/yashirish

> Bu komponentni bir marta yozasiz, keyin barcha jadvallarda qayta ishlatasiz.

#### 2.3. Zod sxemalar

`lib/validations/import.schema.ts` — JSON import uchun:
```typescript
import { z } from 'zod'

export const employeeSchema = z.object({
  id: z.string().optional(),
  full_name: z.string().min(1, "F.I.Sh. majburiy"),
  email: z.string().email("Email formati noto'g'ri"),
  department: z.string().min(1, "Departament majburiy"),
  section: z.string().optional(),
  position: z.string().optional(),
})

export const systemSchema = z.object({
  org_name: z.string().min(1, "Tashkilot nomi majburiy"),
  hostname: z.string().optional(),
  os: z.enum(['ubuntu', 'debian', 'rhel', 'windows', 'macos']),
  os_version: z.string().min(1, "OS versiyasi majburiy"),
  environment: z.enum(['production', 'staging', 'dev', 'test']).default('production'),
  internet_facing: z.boolean().default(false),
  criticality: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
})

export const toolSchema = z.object({
  name: z.string().min(1),
  vendor: z.string().optional(),
  version: z.string().min(1, "Versiya majburiy"),
  purl: z.string().nullable().optional(),
  cpe: z.string().nullable().optional(),
}).refine(
  (t) => t.purl || t.cpe,
  { message: "purl yoki cpe dan kamida bittasi bo'lishi shart" }
)

export const importItemSchema = z.object({
  employee: employeeSchema,
  system: systemSchema,
  tools: z.array(toolSchema).min(1, "Kamida bitta vosita bo'lishi kerak"),
})

export const importSchema = z.array(importItemSchema)
export type ImportItem = z.infer<typeof importItemSchema>
```

#### 2.4. JSON import Server Action

`lib/actions/import.actions.ts`:
```typescript
'use server'

import { prisma } from '@/lib/db/prisma'
import { requirePermission } from '@/lib/rbac/guard'
import { importSchema, type ImportItem } from '@/lib/validations/import.schema'
import { logAudit } from '@/lib/services/audit.service'

interface ImportResult {
  success: boolean
  totalItems: number
  employeesUpserted: number
  assetsUpserted: number
  errors: { index: number; field: string; message: string }[]
}

export async function importInventory(jsonData: unknown): Promise<ImportResult> {
  await requirePermission('assets:manage')

  // 1. Validatsiya
  const parsed = importSchema.safeParse(jsonData)
  if (!parsed.success) {
    return {
      success: false,
      totalItems: 0,
      employeesUpserted: 0,
      assetsUpserted: 0,
      errors: parsed.error.issues.map(i => ({
        index: Number(i.path[0]) || 0,
        field: i.path.slice(1).join('.'),
        message: i.message,
      })),
    }
  }

  const items = parsed.data
  let employeesUpserted = 0
  let assetsUpserted = 0

  // 2. Har bir element uchun upsert (transaction)
  for (const item of items) {
    await prisma.$transaction(async (tx) => {
      // Employee upsert (email bo'yicha)
      const employee = await tx.employee.upsert({
        where: { email: item.employee.email },
        update: {
          fullName: item.employee.full_name,
          department: item.employee.department,
          section: item.employee.section,
          position: item.employee.position,
          externalId: item.employee.id,
        },
        create: {
          email: item.employee.email,
          fullName: item.employee.full_name,
          department: item.employee.department,
          section: item.employee.section,
          position: item.employee.position,
          externalId: item.employee.id,
        },
      })
      employeesUpserted++

      // Har bir tool → asset upsert + attributes + bog'lanish
      for (const tool of item.tools) {
        const asset = await tx.asset.upsert({
          where: {
            // PURL yoki hostname+name+version bo'yicha
            // (Prisma'da composite unique kerak bo'ladi, yoki findFirst)
            id: (await tx.asset.findFirst({
              where: {
                name: tool.name,
                version: tool.version,
                hostname: item.system.hostname,
              },
            }))?.id ?? '00000000-0000-0000-0000-000000000000',
          },
          update: {
            vendor: tool.vendor,
            purl: tool.purl,
            cpeUri: tool.cpe,
          },
          create: {
            name: tool.name,
            vendor: tool.vendor,
            version: tool.version,
            purl: tool.purl,
            cpeUri: tool.cpe,
            hostname: item.system.hostname,
            platform: item.system.os,
          },
        })
        assetsUpserted++

        // Asset attributes (system maydonlari)
        const attrs = [
          { key: 'org_name', value: item.system.org_name },
          { key: 'os', value: item.system.os },
          { key: 'os_version', value: item.system.os_version },
          { key: 'env', value: item.system.environment },
          { key: 'internet_facing', value: String(item.system.internet_facing) },
          { key: 'criticality', value: item.system.criticality },
        ]
        for (const attr of attrs) {
          // upsert attribute (asset_id + key bo'yicha)
          const existing = await tx.assetAttribute.findFirst({
            where: { assetId: asset.id, key: attr.key },
          })
          if (existing) {
            await tx.assetAttribute.update({
              where: { id: existing.id },
              data: { value: attr.value },
            })
          } else {
            await tx.assetAttribute.create({
              data: { assetId: asset.id, key: attr.key, value: attr.value },
            })
          }
        }

        // Employee ↔ Asset bog'lanish
        await tx.employeeAsset.upsert({
          where: {
            employeeId_assetId: {
              employeeId: employee.id,
              assetId: asset.id,
            },
          },
          update: { unassignedAt: null },
          create: {
            employeeId: employee.id,
            assetId: asset.id,
            role: 'owner',
          },
        })
      }
    })
  }

  await logAudit('IMPORT_INVENTORY', 'inventory', null, {
    items: items.length, employeesUpserted, assetsUpserted,
  })

  return {
    success: true,
    totalItems: items.length,
    employeesUpserted,
    assetsUpserted,
    errors: [],
  }
}
```

> **Eslatma:** Yuqoridagi asset upsert biroz murakkab. Vibe coding'da soddalashtirib, avval `findFirst` keyin `create`/`update` qilsangiz ham bo'ladi. Yoki Prisma schema'ga `@@unique([name, version, hostname])` qo'shing.

#### 2.5. Sahifalar
- `app/(dashboard)/employees/page.tsx` — DataTable + "Import JSON" + "Qo'shish" tugmalari
- `app/(dashboard)/assets/page.tsx` — DataTable + filtr (turi, platforma, env, criticality)
- `app/(dashboard)/assignments/page.tsx` — bog'lanishlarni boshqarish

Import UI: fayl yuklash (drag-drop) yoki JSON paste → natija (qancha qo'shildi, xatolar jadvali).

#### 📋 Definition of Done (Faza 2)
- [ ] Sidebar rolga mos menyu ko'rsatadi (Specialist hammasini, Head faqat Dashboard/Reports)
- [ ] Xodim qo'shish/tahrirlash ishlaydi
- [ ] Vosita qo'shish/tahrirlash ishlaydi
- [ ] JSON import ishlaydi — yuqoridagi namuna JSON yuklanadi, DB ga tushadi
- [ ] Noto'g'ri JSON da xatolar aniq ko'rsatiladi (qaysi element, qaysi maydon)
- [ ] Prisma Studio'da employees, assets, asset_attributes, employee_assets to'ladi

#### 🤖 Vibe coding prompt (Faza 2)
```
KONTEKST: OGOH MAI. Next.js 14 Server Actions, Prisma, shadcn/ui.
Inventar: passiv xodimlar (employees) + vositalar (assets) + bog'lanish.

VAZIFA: Inventar boshqaruvini qur — CRUD + JSON import.

FAYLLAR:
- lib/validations/import.schema.ts (Zod — employee/system/tools)
- lib/actions/import.actions.ts (JSON import, idempotent upsert)
- lib/actions/employee.actions.ts, lib/actions/asset.actions.ts
- components/data-table/* (umumiy jadval, server-side)
- app/(dashboard)/layout.tsx (sidebar, rolga mos)
- app/(dashboard)/employees/page.tsx
- app/(dashboard)/assets/page.tsx

TALABLAR:
- JSON formati: [{ employee:{}, system:{}, tools:[] }]
- system maydonlari asset_attributes ga yoziladi (org_name, os, env, ...)
- Import idempotent (email + hostname bo'yicha upsert)
- Har action requirePermission() bilan himoyalangan
- Xato xabarlari o'zbek tilida, qaysi element/maydon aniq

NATIJA: JSON import qilganda DB to'ladi, UI da jadvallar ko'rinadi.
```

---

### 🟢 FAZA 3: CVE INGESTION PIPELINE <a name="faza-3-cve-ingestion"></a>

**Maqsad:** 6 ta tashqi manbadan CVE ma'lumotlarini yig'ish (adapter pattern), yagona formatga keltirish.

**Davomiyligi:** ~3 kun (eng murakkab fazalardan)

**Bog'liqlik:** Faza 1

#### 3.1. Adapter pattern — umumiy interfeys

`lib/adapters/base.adapter.ts`:
```typescript
// Yagona normalized format
export interface NormalizedVulnerability {
  cveId: string
  title?: string
  description?: string
  cvssV3Score?: number
  cvssV3Vector?: string
  severity: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  epssScore?: number
  isKev?: boolean
  kevAddedDate?: Date
  publishedAt?: Date
  lastModifiedAt?: Date
  affectedVersions?: AffectedVersion[]
  patchedVersions?: PatchedVersion[]
  references?: string[]
  source: string        // NVD / OSV / ...
  sourceUrl?: string
  rawData?: any
}

export interface AffectedVersion {
  purl?: string
  cpe?: string
  vendor?: string
  product?: string
  versionRange?: { introduced?: string; fixed?: string; lastAffected?: string }
}

export interface PatchedVersion {
  distro?: string      // ubuntu:22.04, debian:11, rhel:9
  package: string
  fixedVersion: string
}

export interface CveSourceAdapter {
  readonly sourceName: string
  // Oxirgi N kun ichida yangilangan CVE larni olish
  fetchRecent(sinceDays: number): Promise<NormalizedVulnerability[]>
  // Aniq paket bo'yicha qidirish (matching paytida)
  queryByPackage?(purl: string): Promise<NormalizedVulnerability[]>
  // Sog'liqni tekshirish
  healthCheck(): Promise<boolean>
}
```

#### 3.2. NVD adapter (eng muhim)

`lib/adapters/nvd.adapter.ts`:
```typescript
import { CveSourceAdapter, NormalizedVulnerability } from './base.adapter'

const NVD_BASE = 'https://services.nvd.nist.gov/rest/json/cves/2.0'

export class NvdAdapter implements CveSourceAdapter {
  readonly sourceName = 'NVD'
  private apiKey = process.env.NVD_API_KEY

  async fetchRecent(sinceDays: number): Promise<NormalizedVulnerability[]> {
    const results: NormalizedVulnerability[] = []
    const end = new Date()
    const start = new Date(end.getTime() - sinceDays * 86400000)

    let startIndex = 0
    const resultsPerPage = 2000

    while (true) {
      const params = new URLSearchParams({
        lastModStartDate: start.toISOString(),
        lastModEndDate: end.toISOString(),
        startIndex: String(startIndex),
        resultsPerPage: String(resultsPerPage),
      })

      const res = await fetch(`${NVD_BASE}?${params}`, {
        headers: this.apiKey ? { apiKey: this.apiKey } : {},
      })
      if (!res.ok) throw new Error(`NVD ${res.status}`)
      const data = await res.json()

      for (const v of data.vulnerabilities ?? []) {
        results.push(this.normalize(v.cve))
      }

      startIndex += resultsPerPage
      if (startIndex >= (data.totalResults ?? 0)) break

      // Rate limit: API key bilan 50 req/30s
      await new Promise(r => setTimeout(r, this.apiKey ? 700 : 6500))
    }
    return results
  }

  private normalize(cve: any): NormalizedVulnerability {
    const metrics = cve.metrics?.cvssMetricV31?.[0]?.cvssData
    const severity = this.mapSeverity(metrics?.baseScore)
    return {
      cveId: cve.id,
      description: cve.descriptions?.find((d: any) => d.lang === 'en')?.value,
      cvssV3Score: metrics?.baseScore,
      cvssV3Vector: metrics?.vectorString,
      severity,
      publishedAt: cve.published ? new Date(cve.published) : undefined,
      lastModifiedAt: cve.lastModified ? new Date(cve.lastModified) : undefined,
      affectedVersions: this.extractCpe(cve.configurations),
      references: cve.references?.map((r: any) => r.url),
      source: 'NVD',
      sourceUrl: `https://nvd.nist.gov/vuln/detail/${cve.id}`,
      rawData: cve,
    }
  }

  private extractCpe(configurations: any[]): any[] {
    // CPE match'larni AffectedVersion ga aylantirish
    // ... (vibe coding'da to'ldiriladi)
    return []
  }

  private mapSeverity(score?: number): NormalizedVulnerability['severity'] {
    if (!score) return 'NONE'
    if (score >= 9.0) return 'CRITICAL'
    if (score >= 7.0) return 'HIGH'
    if (score >= 4.0) return 'MEDIUM'
    return 'LOW'
  }

  async healthCheck(): Promise<boolean> {
    try {
      const res = await fetch(`${NVD_BASE}?resultsPerPage=1`,
        { headers: this.apiKey ? { apiKey: this.apiKey } : {} })
      return res.ok
    } catch { return false }
  }
}
```

#### 3.3. Boshqa adapterlar (qisqacha)

| Adapter | Endpoint | Autentifikatsiya | Maxsus |
|---------|----------|------------------|--------|
| **OSV** | `api.osv.dev/v1/query` (POST) | yo'q | PURL bo'yicha aniq |
| **GHSA** | `api.github.com/graphql` | GitHub token | npm/pip/maven... |
| **KEV** | `cisa.gov/.../known_exploited_vulnerabilities.json` | yo'q | Butun fayl, isKev=true |
| **Ubuntu USN** | `ubuntu.com/security/notices.json` | yo'q | patchedVersions! |
| **Debian DSA** | `security-tracker.debian.org/tracker/data/json` | yo'q | patchedVersions! |
| **RHEL OVAL** | `redhat.com/security/data/oval/v2/` | yo'q | OVAL XML parser |

> **MUHIM:** Distribution adapterlar (USN/DSA/OVAL) `patchedVersions` ni to'ldirishi shart — bu false positive kamaytirish uchun hal qiluvchi (backport-aware).

#### 3.4. Ingestion service

`lib/services/ingestion.service.ts`:
```typescript
import { prisma } from '@/lib/db/prisma'
import { NvdAdapter } from '@/lib/adapters/nvd.adapter'
import { OsvAdapter } from '@/lib/adapters/osv.adapter'
// ... boshqa adapterlar
import { CveSourceAdapter, NormalizedVulnerability } from '@/lib/adapters/base.adapter'

const ADAPTERS: CveSourceAdapter[] = [
  new NvdAdapter(),
  new OsvAdapter(),
  // new GhsaAdapter(), new KevAdapter(), new UbuntuUsnAdapter(), ...
]

export async function ingestAllSources(sinceDays = 7) {
  const stats = { sources: [] as any[], totalNew: 0, totalUpdated: 0 }

  for (const adapter of ADAPTERS) {
    try {
      const vulns = await adapter.fetchRecent(sinceDays)
      for (const v of vulns) {
        await upsertVulnerability(v)
      }
      stats.sources.push({ name: adapter.sourceName, count: vulns.length, ok: true })
      await updateIntegrationHealth(adapter.sourceName, 'healthy')
    } catch (e: any) {
      stats.sources.push({ name: adapter.sourceName, ok: false, error: e.message })
      await updateIntegrationHealth(adapter.sourceName, 'down', e.message)
      // Bitta manba ishlamasa, qolganlari davom etadi
    }
  }
  return stats
}

async function upsertVulnerability(v: NormalizedVulnerability) {
  const vuln = await prisma.vulnerability.upsert({
    where: { cveId: v.cveId },
    update: {
      // Eng yangi/to'liq ma'lumotni saqlash
      title: v.title,
      description: v.description,
      cvssV3Score: v.cvssV3Score,
      cvssV3Vector: v.cvssV3Vector,
      severity: v.severity,
      epssScore: v.epssScore,
      isKev: v.isKev || undefined,
      kevAddedDate: v.kevAddedDate,
      lastModifiedAt: v.lastModifiedAt,
      affectedVersions: v.affectedVersions as any,
      references: v.references as any,
    },
    create: {
      cveId: v.cveId,
      title: v.title,
      description: v.description,
      cvssV3Score: v.cvssV3Score,
      cvssV3Vector: v.cvssV3Vector,
      severity: v.severity,
      epssScore: v.epssScore,
      isKev: v.isKev ?? false,
      kevAddedDate: v.kevAddedDate,
      publishedAt: v.publishedAt,
      lastModifiedAt: v.lastModifiedAt,
      affectedVersions: v.affectedVersions as any,
      references: v.references as any,
    },
  })

  // Source yozish
  await prisma.vulnerabilitySource.create({
    data: {
      vulnerabilityId: vuln.id,
      source: v.source,
      sourceUrl: v.sourceUrl,
      rawData: v.rawData as any,
      patchedVersions: v.patchedVersions as any,
    },
  })
}
```

#### 📋 Definition of Done (Faza 3)
- [ ] NVD adapter ishlaydi — oxirgi 7 kunlik CVE larni oladi (NVD API key bilan)
- [ ] Kamida 3 adapter ishlaydi (NVD + OSV + KEV)
- [ ] CVE lar `vulnerabilities` jadvaliga tushadi
- [ ] Har CVE uchun `vulnerability_sources` yoziladi
- [ ] KEV CVE lar `isKev=true` bilan belgilanadi
- [ ] Bitta manba ishlamasa, qolganlari davom etadi (test: noto'g'ri URL bering)
- [ ] `integration_health` jadvali yangilanadi

#### 🤖 Vibe coding prompt (Faza 3)
```
KONTEKST: OGOH MAI. CVE ma'lumotlarini 6 manbadan yig'ish kerak:
NVD, OSV, GHSA, CISA KEV, Ubuntu USN, Debian DSA, RHEL OVAL.

VAZIFA: Adapter pattern bilan CVE ingestion pipeline qur.

FAYLLAR:
- lib/adapters/base.adapter.ts (interfeys + NormalizedVulnerability)
- lib/adapters/nvd.adapter.ts, osv.adapter.ts, kev.adapter.ts (avval shu 3 ta)
- lib/services/ingestion.service.ts

TALABLAR:
- Har adapter CveSourceAdapter interfeysini implement qilsin
- Yagona NormalizedVulnerability formatiga keltirilsin
- Distribution adapterlar (USN/DSA) patchedVersions ni to'ldirsin
- NVD rate limit: API key bilan 50 req/30s
- Manbalar mustaqil: biri ishlamasa qolganlari davom etsin
- upsert cveId bo'yicha (takrorlanmasin)
- integration_health jadvalini yangilasin

NATIJA: ingestAllSources() chaqirilganda DB ga CVE lar tushsin.
Avval NVD + OSV + KEV, keyin qolganlarini qo'shamiz.
```
---

### 🟢 FAZA 4: MATCHING ENGINE <a name="faza-4-matching"></a>

**Maqsad:** Vosita (asset) ↔ CVE moslashtirish. PURL, CPE, version range tekshirish.

**Davomiyligi:** ~2-3 kun

**Bog'liqlik:** Faza 2 (assets), Faza 3 (vulnerabilities)

#### 4.1. Version comparison utility

`lib/utils/version-compare.ts`:
```typescript
// Semver va distribution-specific versiya solishtirish
import semver from 'semver'

export function compareVersions(v1: string, v2: string, ecosystem?: string): number {
  // Semver (npm, pip, ...)
  const c1 = semver.coerce(v1)
  const c2 = semver.coerce(v2)
  if (c1 && c2) return semver.compare(c1, c2)

  // Debian/RPM versiya solishtirish (fallback)
  return compareDebianVersion(v1, v2)
}

export function isVersionInRange(
  version: string,
  range: { introduced?: string; fixed?: string; lastAffected?: string }
): boolean {
  // version >= introduced && version < fixed
  if (range.introduced && compareVersions(version, range.introduced) < 0) return false
  if (range.fixed && compareVersions(version, range.fixed) >= 0) return false
  if (range.lastAffected && compareVersions(version, range.lastAffected) > 0) return false
  return true
}

function compareDebianVersion(v1: string, v2: string): number {
  // Debian epoch:upstream-revision formatini parse qilish
  // ... (vibe coding'da to'ldiriladi, yoki 'compare-versions' paketi)
  return v1.localeCompare(v2, undefined, { numeric: true })
}
```
```bash
npm install semver
npm install -D @types/semver
```

#### 4.2. PURL parser

`lib/utils/purl.ts`:
```typescript
// pkg:deb/ubuntu/openssl@1.1.1f-1ubuntu2.16?arch=amd64&distro=jammy
export interface ParsedPurl {
  type: string       // deb, pypi, npm, docker, ...
  namespace?: string // ubuntu, debian, ...
  name: string       // openssl
  version?: string   // 1.1.1f-1ubuntu2.16
  qualifiers: Record<string, string>  // { arch: amd64, distro: jammy }
}

export function parsePurl(purl: string): ParsedPurl | null {
  const match = purl.match(/^pkg:([^/]+)\/(?:([^/]+)\/)?([^@?]+)(?:@([^?]+))?(?:\?(.+))?$/)
  if (!match) return null
  const [, type, namespace, name, version, qs] = match
  const qualifiers: Record<string, string> = {}
  if (qs) {
    for (const pair of qs.split('&')) {
      const [k, v] = pair.split('=')
      qualifiers[k] = decodeURIComponent(v)
    }
  }
  return { type, namespace, name: decodeURIComponent(name), version, qualifiers }
}

export function purlMatches(assetPurl: string, cvePurl: string): boolean {
  const a = parsePurl(assetPurl)
  const c = parsePurl(cvePurl)
  if (!a || !c) return false
  return a.type === c.type && a.namespace === c.namespace && a.name === c.name
}
```

#### 4.3. Matching service

`lib/services/matching.service.ts`:
```typescript
import { prisma } from '@/lib/db/prisma'
import { parsePurl, purlMatches } from '@/lib/utils/purl'
import { isVersionInRange } from '@/lib/utils/version-compare'

export interface MatchResult {
  assetId: string
  vulnerabilityId: string
  matchType: 'purl_exact' | 'cpe_range' | 'distro_feed'
  sources: string[]
  patchedByDistro: boolean   // distribution feed "patched" deydimi
}

// Bitta asset uchun mos CVE larni topish
export async function matchAsset(assetId: string): Promise<MatchResult[]> {
  const asset = await prisma.asset.findUnique({
    where: { id: assetId },
    include: { attributes: true },
  })
  if (!asset) return []

  const results: MatchResult[] = []

  // 1. PURL bo'yicha matching (asosiy)
  if (asset.purl) {
    const candidates = await findVulnsByPurl(asset.purl)
    for (const vuln of candidates) {
      const match = checkPurlMatch(asset, vuln)
      if (match) results.push(match)
    }
  }

  // 2. CPE bo'yicha matching (qo'shimcha)
  if (asset.cpeUri) {
    const candidates = await findVulnsByCpe(asset.cpeUri)
    for (const vuln of candidates) {
      const match = checkCpeMatch(asset, vuln)
      if (match && !results.find(r => r.vulnerabilityId === match.vulnerabilityId)) {
        results.push(match)
      }
    }
  }

  // 3. Distribution feed tekshirish (USN/DSA/OVAL)
  // Asset OS si bo'yicha patched versions ni tekshirish
  const osAttr = asset.attributes.find(a => a.key === 'os')?.value
  const osVersion = asset.attributes.find(a => a.key === 'os_version')?.value
  if (osAttr && osVersion) {
    for (const result of results) {
      result.patchedByDistro = await checkDistroPatched(
        result.vulnerabilityId, asset, osAttr, osVersion
      )
    }
  }

  return results
}

// Distribution feed "patched in X" deydimi va asset shu versiyadami?
async function checkDistroPatched(
  vulnId: string, asset: any, os: string, osVersion: string
): Promise<boolean> {
  const sources = await prisma.vulnerabilitySource.findMany({
    where: {
      vulnerabilityId: vulnId,
      source: { in: ['USN', 'DSA', 'OVAL'] },
    },
  })
  for (const src of sources) {
    const patched = src.patchedVersions as any[]
    if (!patched) continue
    for (const p of patched) {
      // distro mos kelsa va asset versiyasi >= fixed bo'lsa → patched
      if (p.distro?.startsWith(os) &&
          isVersionInRange(asset.version, { introduced: p.fixedVersion })) {
        return true
      }
    }
  }
  return false
}

// ... checkPurlMatch, checkCpeMatch, findVulnsByPurl, findVulnsByCpe
```

#### 📋 Definition of Done (Faza 4)
- [ ] PURL parser ishlaydi (test: turli PURL formatlar)
- [ ] Version comparison ishlaydi (semver + debian)
- [ ] `matchAsset(assetId)` mos CVE larni qaytaradi
- [ ] Distribution feed "patched" holatini aniqlaydi
- [ ] Unit testlar: ma'lum asset+CVE jufti to'g'ri match bo'ladi

#### 🤖 Vibe coding prompt (Faza 4)
```
KONTEKST: OGOH MAI. Asset (vosita) ↔ CVE moslashtirish kerak.
Asset'da purl, cpe, version bor. CVE'da affectedVersions bor.

VAZIFA: Matching engine qur.

FAYLLAR:
- lib/utils/purl.ts (PURL parser)
- lib/utils/version-compare.ts (semver + debian/rpm)
- lib/services/matching.service.ts

TALABLAR:
- 2 bosqich: avval PURL exact, keyin CPE version range
- Distribution feed (USN/DSA/OVAL) prioritetli:
  agar "patched in X" desa va asset shu versiyada bo'lsa → patchedByDistro=true
- Deduplication: bir asset-CVE jufti bir marta
- MatchResult: matchType, sources[], patchedByDistro

NATIJA: matchAsset(assetId) mos CVE larni topsin, distro patch holatini aniqlasin.
```

---

### 🟢 FAZA 5: FALSE POSITIVE BOSHQARUVI <a name="faza-5-fp"></a>

**Maqsad:** Confidence score (6 qatlamli yondashuv) — false positive larni kamaytirish.

**Davomiyligi:** ~2 kun

**Bog'liqlik:** Faza 4 (matching)

#### 5.1. Confidence scoring service

`lib/services/confidence.service.ts`:
```typescript
import { MatchResult } from './matching.service'

export interface ConfidenceInput {
  match: MatchResult
  isKev: boolean
  epssScore?: number
  vendorFpRate?: number   // 0.0 - 1.0
}

export interface ConfidenceResult {
  score: number           // 0.0 - 1.0
  factors: { name: string; modifier: number }[]
}

// Confidence score hisoblash (modifikatorlar TZ dan)
export function calculateConfidence(input: ConfidenceInput): ConfidenceResult {
  let score = 0
  const factors: { name: string; modifier: number }[] = []

  const add = (name: string, modifier: number) => {
    score += modifier
    factors.push({ name, modifier })
  }

  // 1-qatlam: PURL exact match
  if (input.match.matchType === 'purl_exact') {
    add('PURL aniq mos', 0.40)
  }
  // CPE version range
  if (input.match.matchType === 'cpe_range') {
    add('CPE version range mos', 0.20)
  }
  // 2-qatlam: Multi-source
  if (input.match.sources.length >= 2) {
    add('≥2 manba tasdiqlaydi', 0.20)
  }
  // KEV
  if (input.isKev) {
    add('CISA KEV da bor', 0.15)
  }
  // EPSS
  if (input.epssScore && input.epssScore > 0.3) {
    add('EPSS > 0.3', 0.10)
  }
  // Distribution patched (MINUS)
  if (input.match.patchedByDistro) {
    add('Distro feed "patched" deydi', -0.30)
  }
  // Vendor FP rate yuqori (MINUS)
  if (input.vendorFpRate && input.vendorFpRate > 0.7) {
    add('Vendor FP rate > 70%', -0.20)
  }
  // Faqat NVD (MINUS)
  if (input.match.sources.length === 1 && input.match.sources[0] === 'NVD') {
    add('Faqat NVD da bor', -0.10)
  }

  // 0.0 - 1.0 oralig'iga cheklash
  score = Math.max(0, Math.min(1, score))
  return { score: Number(score.toFixed(2)), factors }
}

// Email yuborish qarori
export function shouldNotify(score: number, isKev: boolean): 'send' | 'send_review' | 'triage_only' {
  if (isKev) return 'send'              // KEV — har doim yuboriladi
  if (score >= 0.8) return 'send'
  if (score >= 0.5) return 'send_review'
  return 'triage_only'                   // < 0.5 — faqat triage
}
```

#### 5.2. Risk score (kontekst bilan)

`lib/services/risk.service.ts`:
```typescript
// Risk = CVSS × criticality_multiplier × exposure_factor
export function calculateRisk(
  cvss: number,
  criticality: string,
  internetFacing: boolean
): number {
  const critMult: Record<string, number> = {
    low: 0.5, medium: 1.0, high: 1.5, critical: 2.0,
  }
  const exposure = internetFacing ? 1.5 : 1.0
  return Number((cvss * (critMult[criticality] ?? 1.0) * exposure).toFixed(2))
}
```

#### 5.3. Suppression service

`lib/services/suppression.service.ts`:
```typescript
import { prisma } from '@/lib/db/prisma'

// Finding suppress qilinishi kerakmi?
export async function isSuppressed(
  cveId: string, asset: any
): Promise<boolean> {
  const now = new Date()
  const suppressions = await prisma.suppression.findMany({
    where: { isActive: true, expiresAt: { gt: now } },
  })

  for (const s of suppressions) {
    switch (s.scope) {
      case 'CVE':
        if (s.cveId === cveId) return true
        break
      case 'CVE_ASSET':
        if (s.cveId === cveId && s.assetId === asset.id) return true
        break
      case 'CVE_VENDOR':
        if (s.cveId === cveId && s.vendor === asset.vendor) return true
        break
      case 'ASSET_ATTR':
        if (matchesAttrFilter(asset, s.assetAttributeFilter)) return true
        break
    }
  }
  return false
}

function matchesAttrFilter(asset: any, filter: any): boolean {
  // masalan: { env: "dev", maxSeverity: "high" }
  // ... (vibe coding'da to'ldiriladi)
  return false
}
```

#### 📋 Definition of Done (Faza 5)
- [ ] `calculateConfidence()` to'g'ri ball beradi (test: turli kombinatsiyalar)
- [ ] PURL exact + multi-source → yuqori ball (≥0.8)
- [ ] Distro patched → ball pasayadi
- [ ] `shouldNotify()` to'g'ri qaror beradi (send / review / triage)
- [ ] KEV har doim "send" qaytaradi
- [ ] `isSuppressed()` suppression rule larni qo'llaydi
- [ ] Risk score kontekst bilan hisoblanadi

#### 🤖 Vibe coding prompt (Faza 5)
```
KONTEKST: OGOH MAI. False positive kamaytirish uchun confidence score kerak.

VAZIFA: 6 qatlamli FP boshqaruvini qur.

FAYLLAR:
- lib/services/confidence.service.ts
- lib/services/risk.service.ts
- lib/services/suppression.service.ts

TALABLAR (confidence modifikatorlari):
- PURL exact: +0.40
- CPE range: +0.20
- ≥2 manba: +0.20
- KEV: +0.15
- EPSS>0.3: +0.10
- Distro "patched": -0.30
- Vendor FP>70%: -0.20
- Faqat NVD: -0.10
- Natija 0.0-1.0 ga cheklansin

Email qarori:
- KEV → har doim send
- ≥0.8 → send
- 0.5-0.8 → send_review
- <0.5 → triage_only

Risk = CVSS × criticality_mult × exposure_factor

NATIJA: Confidence va risk to'g'ri hisoblanadi, suppression qo'llaniladi.
```

---

### 🟢 FAZA 6: TRIAGE WORKFLOW <a name="faza-6-triage"></a>

**Maqsad:** Findinglar hayot sikli, triage UI (kanban), suppression yaratish.

**Davomiyligi:** ~2 kun

**Bog'liqlik:** Faza 5

#### 6.1. Finding status workflow

```
NEW → PENDING_REVIEW → APPLICABLE → NOTIFIED → ACKNOWLEDGED
                                              → IN_PROGRESS → PATCHED
                                                            → PENDING_VERIFICATION
                                                            → VERIFIED → CLOSED
          → NOT_APPLICABLE (suppression yaratiladi)
          → ACCEPTED_RISK (sabab + muddat)
          → NEEDS_INVESTIGATION
          → PATCH_FAILED (qayta tekshiruvda CVE topilsa)
```

#### 6.2. Triage Server Actions

`lib/actions/triage.actions.ts`:
```typescript
'use server'

import { prisma } from '@/lib/db/prisma'
import { requirePermission } from '@/lib/rbac/guard'
import { logAudit } from '@/lib/services/audit.service'
import { revalidatePath } from 'next/cache'

type TriageDecision = 'applicable' | 'not_applicable' | 'accepted_risk' | 'needs_investigation'

export async function triageFinding(
  findingId: string,
  decision: TriageDecision,
  reason?: string,
  expiresAt?: Date
) {
  const session = await requirePermission('triage:manage')

  const finding = await prisma.finding.findUnique({
    where: { id: findingId },
    include: { asset: true, vulnerability: true },
  })
  if (!finding) throw new Error('Finding topilmadi')

  const statusMap = {
    applicable: 'APPLICABLE',
    not_applicable: 'NOT_APPLICABLE',
    accepted_risk: 'ACCEPTED_RISK',
    needs_investigation: 'NEEDS_INVESTIGATION',
  } as const

  // Validatsiya
  if (decision === 'not_applicable' && !reason) {
    throw new Error("Not applicable uchun sabab majburiy")
  }
  if (decision === 'accepted_risk' && (!reason || !expiresAt)) {
    throw new Error("Accepted risk uchun sabab va muddat majburiy")
  }

  await prisma.$transaction(async (tx) => {
    // Status yangilash
    await tx.finding.update({
      where: { id: findingId },
      data: {
        status: statusMap[decision],
        triageReason: reason,
        triagedById: session.user.id,
        triagedAt: new Date(),
      },
    })

    // Not applicable → suppression yaratish
    if (decision === 'not_applicable') {
      await tx.suppression.create({
        data: {
          scope: 'CVE_ASSET',
          cveId: finding.vulnerability.cveId,
          assetId: finding.assetId,
          reason: reason!,
          createdById: session.user.id,
          expiresAt: expiresAt ?? new Date(Date.now() + 365 * 86400000), // default 1 yil
        },
      })
    }

    // Accepted risk → suppression (muddat bilan)
    if (decision === 'accepted_risk') {
      await tx.suppression.create({
        data: {
          scope: 'CVE_ASSET',
          cveId: finding.vulnerability.cveId,
          assetId: finding.assetId,
          reason: reason!,
          createdById: session.user.id,
          expiresAt: expiresAt!,
        },
      })
    }
  })

  await logAudit('TRIAGE_DECISION', 'finding', findingId, { decision, reason })
  revalidatePath('/triage')
}
```

#### 6.3. Triage UI (Kanban)

`app/(dashboard)/triage/page.tsx`:
- 3 ustun: Pending Review | Needs Investigation | Recently Triaged
- Har kartochka: CVE-ID, Asset, Severity badge, Confidence score (rangli indicator)
- Har kartochkada tugmalar: Applicable / Not applicable / Accepted risk / Investigate
- Bulk select + bulk action
- Not applicable / Accepted risk bosilganda → modal (sabab + muddat)

#### 6.4. Suppressions sahifasi

`app/(dashboard)/suppressions/page.tsx`:
- DataTable: scope, CVE, asset/vendor, sabab, yaratgan, muddat, holat
- Yangi suppression qo'shish (modal)
- Muddati tugaganlar belgilangan (rangli)
- Deaktivatsiya tugmasi

#### 📋 Definition of Done (Faza 6)
- [ ] Triage queue kanban ko'rinishida
- [ ] Finding statusini o'zgartirish ishlaydi
- [ ] Not applicable → suppression avtomatik yaratiladi
- [ ] Accepted risk → sabab+muddat majburiy
- [ ] Suppression muddat majburiy (max 1 yil)
- [ ] Audit log ga triage qarorlari yoziladi
- [ ] Suppressions sahifasi ishlaydi

#### 🤖 Vibe coding prompt (Faza 6)
```
KONTEKST: OGOH MAI. Findinglar (asset+CVE) triage qilinishi kerak.
Status workflow: NEW → PENDING_REVIEW → APPLICABLE/NOT_APPLICABLE/...

VAZIFA: Triage workflow va suppression boshqaruvini qur.

FAYLLAR:
- lib/actions/triage.actions.ts
- lib/actions/suppression.actions.ts
- app/(dashboard)/triage/page.tsx (kanban: 3 ustun)
- app/(dashboard)/suppressions/page.tsx

TALABLAR:
- 4 qaror: applicable / not_applicable / accepted_risk / needs_investigation
- not_applicable → suppression avtomatik (sabab majburiy)
- accepted_risk → sabab + muddat majburiy
- Suppression expiresAt majburiy (max 1 yil)
- Kanban: kartochkada CVE, asset, severity, confidence
- Bulk action
- Har qaror audit log ga

NATIJA: Triage UI ishlasin, qarorlar DB ga yozilsin, suppression yaratilsin.
```
---

### 🟢 FAZA 7: NOTIFICATION (EMAIL) <a name="faza-7-notification"></a>

**Maqsad:** Email shabloni (jadval shaklida), yuborish, acknowledge/patched havolalar.

**Davomiyligi:** ~2 kun

**Bog'liqlik:** Faza 5 (confidence), Faza 6 (findings)

#### 7.1. React Email shabloni (jadval shaklida)

`emails/vulnerability-alert.tsx`:
```typescript
import {
  Html, Head, Body, Container, Section, Text, Heading,
  Row, Column, Button, Hr, Link,
} from '@react-email/components'

interface ToolGroup {
  toolName: string
  version: string
  findings: {
    cveId: string
    cvss: number
    severity: string
    epss?: number
    isKev: boolean
    status: string
    description: string
    recommendation: string
  }[]
}

interface Props {
  employeeName: string
  orgName: string
  hostname: string
  os: string
  osVersion: string
  toolGroups: ToolGroup[]
  ackUrl: string
  patchedUrl: string
}

const severityColor = (s: string) => ({
  CRITICAL: '#dc2626', HIGH: '#ea580c',
  MEDIUM: '#ca8a04', LOW: '#16a34a',
}[s] ?? '#6b7280')

export default function VulnerabilityAlert(props: Props) {
  const totalFindings = props.toolGroups.reduce((n, g) => n + g.findings.length, 0)
  const criticalCount = props.toolGroups.reduce(
    (n, g) => n + g.findings.filter(f => f.severity === 'CRITICAL').length, 0
  )

  return (
    <Html lang="uz">
      <Head />
      <Body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f4f5' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
          <Heading style={{ fontSize: '20px', color: '#18181b' }}>
            🔒 {props.orgName} — Kiberxavfsizlik xabarnomasi
          </Heading>
          <Text>Hurmatli {props.employeeName},</Text>
          <Text>
            Siz foydalanadigan vositalarda {totalFindings} ta zaiflik
            aniqlandi ({criticalCount} ta Critical). Iltimos, imkon qadar
            tezroq bartaraf eting.
          </Text>
          <Text style={{ fontWeight: 'bold' }}>
            Tizim: {props.hostname} ({props.os} {props.osVersion})
          </Text>

          {props.toolGroups.map((group) => (
            <Section key={group.toolName} style={{ marginTop: '24px' }}>
              <Text style={{ fontWeight: 'bold', fontSize: '16px' }}>
                Vosita: {group.toolName} {group.version}
              </Text>
              {/* Jadval header */}
              <Row style={{ backgroundColor: '#e4e4e7', padding: '8px' }}>
                <Column style={{ width: '20%', fontWeight: 'bold' }}>CVE-ID</Column>
                <Column style={{ width: '12%', fontWeight: 'bold' }}>CVSS</Column>
                <Column style={{ width: '10%', fontWeight: 'bold' }}>EPSS</Column>
                <Column style={{ width: '13%', fontWeight: 'bold' }}>Holat</Column>
                <Column style={{ width: '45%', fontWeight: 'bold' }}>Tavsiya</Column>
              </Row>
              {/* Jadval qatorlari */}
              {group.findings.map((f) => (
                <Row key={f.cveId} style={{ borderBottom: '1px solid #e4e4e7', padding: '8px' }}>
                  <Column style={{ width: '20%' }}>
                    <Link href={`https://nvd.nist.gov/vuln/detail/${f.cveId}`}>
                      {f.cveId}
                    </Link>
                  </Column>
                  <Column style={{ width: '12%', color: severityColor(f.severity) }}>
                    {f.cvss} ({f.severity})
                  </Column>
                  <Column style={{ width: '10%' }}>{f.epss?.toFixed(2) ?? '—'}</Column>
                  <Column style={{ width: '13%' }}>
                    {f.isKev ? '⚠ KEV' : f.status}
                  </Column>
                  <Column style={{ width: '45%' }}>{f.recommendation}</Column>
                </Row>
              ))}
            </Section>
          ))}

          <Hr style={{ margin: '24px 0' }} />
          <Section style={{ textAlign: 'center' }}>
            <Button href={props.ackUrl}
              style={{ backgroundColor: '#3b82f6', color: '#fff', padding: '12px 24px',
                       borderRadius: '6px', marginRight: '12px' }}>
              Ko'rdim / Acknowledged
            </Button>
            <Button href={props.patchedUrl}
              style={{ backgroundColor: '#16a34a', color: '#fff', padding: '12px 24px',
                       borderRadius: '6px' }}>
              Bartaraf etdim / Patched
            </Button>
          </Section>

          <Hr style={{ margin: '24px 0' }} />
          <Text style={{ fontSize: '12px', color: '#71717a' }}>
            Savollaringiz bo'lsa, axborot xavfsizligi bo'limiga murojaat qiling:
            security@example.uz
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
```

#### 7.2. Notification service

`lib/services/notification.service.ts`:
```typescript
import { prisma } from '@/lib/db/prisma'
import { render } from '@react-email/render'
import nodemailer from 'nodemailer'
import crypto from 'crypto'
import VulnerabilityAlert from '@/emails/vulnerability-alert'

// Bir xodim uchun bitta jamlangan email tayyorlash
export async function buildNotificationForEmployee(
  employeeId: string, findingIds: string[], scanRunId: string
) {
  const employee = await prisma.employee.findUnique({ where: { id: employeeId } })
  if (!employee) return null

  const findings = await prisma.finding.findMany({
    where: { id: { in: findingIds } },
    include: { asset: { include: { attributes: true } }, vulnerability: true },
  })

  // Vositalar bo'yicha guruhlash
  const groupMap = new Map<string, any>()
  for (const f of findings) {
    const key = `${f.asset.name}@${f.asset.version}`
    if (!groupMap.has(key)) {
      groupMap.set(key, { toolName: f.asset.name, version: f.asset.version, findings: [] })
    }
    groupMap.get(key).findings.push({
      cveId: f.vulnerability.cveId,
      cvss: Number(f.vulnerability.cvssV3Score ?? 0),
      severity: f.vulnerability.severity,
      epss: f.vulnerability.epssScore ? Number(f.vulnerability.epssScore) : undefined,
      isKev: f.vulnerability.isKev,
      status: 'Yangi',
      description: f.vulnerability.description ?? '',
      recommendation: generateRecommendation(f),
    })
  }

  // CVSS bo'yicha saralash (har guruh ichida)
  const toolGroups = Array.from(groupMap.values())
  toolGroups.forEach(g => g.findings.sort((a: any, b: any) => b.cvss - a.cvss))

  // Acknowledge token
  const ackToken = crypto.randomBytes(32).toString('hex')
  const baseUrl = process.env.AUTH_URL

  const firstAsset = findings[0]?.asset
  const orgName = firstAsset?.attributes.find(a => a.key === 'org_name')?.value ?? 'Tashkilot'
  const os = firstAsset?.attributes.find(a => a.key === 'os')?.value ?? ''
  const osVersion = firstAsset?.attributes.find(a => a.key === 'os_version')?.value ?? ''

  const html = await render(VulnerabilityAlert({
    employeeName: employee.fullName,
    orgName,
    hostname: firstAsset?.hostname ?? '',
    os, osVersion,
    toolGroups,
    ackUrl: `${baseUrl}/api/ack/${ackToken}?action=acknowledge`,
    patchedUrl: `${baseUrl}/api/ack/${ackToken}?action=patched`,
  }))

  // Notification yozuvi
  const criticalCount = toolGroups.reduce((n, g) =>
    n + g.findings.filter((f: any) => f.severity === 'CRITICAL').length, 0)
  const highCount = toolGroups.reduce((n, g) =>
    n + g.findings.filter((f: any) => f.severity === 'HIGH').length, 0)

  const notification = await prisma.notification.create({
    data: {
      employeeId,
      scanRunId,
      emailSubject: `[OGOH MAI] ${findings.length} ta zaiflik aniqlandi (${criticalCount} Critical)`,
      findingsCount: findings.length,
      findingsCriticalCount: criticalCount,
      findingsHighCount: highCount,
      status: 'QUEUED',
      ackToken,
      notificationFindings: {
        create: findingIds.map(fId => ({ findingId: fId })),
      },
    },
  })

  return { notification, html, to: employee.email }
}

function generateRecommendation(finding: any): string {
  // patchedVersions dan tavsiya yaratish
  return `${finding.asset.name} ni yangi versiyaga yangilang.`
}

// Email yuborish (SMTP)
let transporter: nodemailer.Transporter | null = null

export async function getTransporter() {
  if (transporter) return transporter
  // Sozlamalarni DB dan (yoki .env dan) olish
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
    pool: true, maxConnections: 10,
  })
  return transporter
}

export async function sendNotification(notificationId: string, html: string, to: string, subject: string) {
  const t = await getTransporter()
  try {
    await t.sendMail({
      from: process.env.SMTP_FROM,
      to, subject, html,
      replyTo: process.env.SMTP_FROM,
    })
    await prisma.notification.update({
      where: { id: notificationId },
      data: { status: 'SENT', sentAt: new Date(), deliveryAttempts: { increment: 1 } },
    })
  } catch (e: any) {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { status: 'FAILED', deliveryAttempts: { increment: 1 }, errorMessage: e.message },
    })
    throw e
  }
}
```

#### 7.3. Acknowledge havola handler

`app/api/ack/[token]/route.ts`:
```typescript
import { prisma } from '@/lib/db/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  const action = req.nextUrl.searchParams.get('action')
  const notification = await prisma.notification.findUnique({
    where: { ackToken: params.token },
    include: { notificationFindings: true },
  })
  if (!notification) {
    return new NextResponse('Havola yaroqsiz yoki muddati tugagan', { status: 404 })
  }

  const findingIds = notification.notificationFindings.map(nf => nf.findingId)

  if (action === 'acknowledge') {
    await prisma.notification.update({
      where: { id: notification.id },
      data: { acknowledgedAt: new Date() },
    })
    await prisma.finding.updateMany({
      where: { id: { in: findingIds } },
      data: { status: 'ACKNOWLEDGED' },
    })
    return htmlResponse('✅ Rahmat! Xabarni ko\'rganingiz qayd etildi.')
  }

  if (action === 'patched') {
    await prisma.finding.updateMany({
      where: { id: { in: findingIds } },
      data: { status: 'PENDING_VERIFICATION' },
    })
    return htmlResponse('✅ Rahmat! 7 kun ichida avtomatik tekshiriladi.')
  }

  return new NextResponse('Noma\'lum amal', { status: 400 })
}

function htmlResponse(message: string) {
  return new NextResponse(
    `<html><body style="font-family:Arial;text-align:center;padding:50px">
     <h2>${message}</h2></body></html>`,
    { headers: { 'Content-Type': 'text/html' } }
  )
}
```

#### 📋 Definition of Done (Faza 7)
- [ ] Email shabloni jadval shaklida render bo'ladi (React Email preview)
- [ ] Har vosita uchun alohida jadval, CVE lar qatorlarda
- [ ] KEV ⚠ belgisi ko'rinadi, CVSS rangli
- [ ] CVE lar CVSS bo'yicha saralangan (eng xavflisi tepada)
- [ ] Bir xodimga bitta jamlangan email
- [ ] SMTP orqali yuborish ishlaydi (test: o'zingizga yuboring)
- [ ] Acknowledge havola finding statusini o'zgartiradi
- [ ] Patched havola → PENDING_VERIFICATION

#### 🤖 Vibe coding prompt (Faza 7)
```
KONTEKST: OGOH MAI. Xodimga email yuborish kerak — JADVAL shaklida.
Email login talab qilmaydi (token-based havolalar).

VAZIFA: Email notification tizimini qur.

FAYLLAR:
- emails/vulnerability-alert.tsx (React Email, jadval)
- lib/services/notification.service.ts
- app/api/ack/[token]/route.ts

TALABLAR:
- Email asosiy qismi HTML jadval: har vosita uchun alohida jadval
- Ustunlar: CVE-ID(NVD havola), CVSS(rangli), EPSS, Holat(KEV⚠), Tavsiya
- CVE lar CVSS bo'yicha kamayish tartibida
- Bir xodimga bitta jamlangan email
- Nodemailer + Gmail SMTP, pool, 3 marta retry
- Acknowledge/Patched token havolalar (HMAC, 30 kun)
- Patched → finding PENDING_VERIFICATION

NATIJA: Email render bo'lsin, yuborilsin, havolalar ishlasin.
```

---

### 🟢 FAZA 8: BACKGROUND JOBS (BULLMQ) <a name="faza-8-jobs"></a>

**Maqsad:** Barcha davriy va og'ir ishlarni BullMQ worker'larga ko'chirish.

**Davomiyligi:** ~2 kun

**Bog'liqlik:** Faza 3-7

#### 8.1. Queue ta'riflari

`workers/queues.ts`:
```typescript
import { Queue } from 'bullmq'
import { redisConnection } from '@/lib/redis/client'

export const queues = {
  fullScan: new Queue('full-scan', { connection: redisConnection }),
  cveIngestion: new Queue('cve-ingestion', { connection: redisConnection }),
  kevPriorityScan: new Queue('kev-priority-scan', { connection: redisConnection }),
  patchVerification: new Queue('patch-verification', { connection: redisConnection }),
  notificationDispatch: new Queue('notification-dispatch', { connection: redisConnection }),
  reportGeneration: new Queue('report-generation', { connection: redisConnection }),
  suppressionExpiry: new Queue('suppression-expiry', { connection: redisConnection }),
  vendorFpRecalc: new Queue('vendor-fp-recalc', { connection: redisConnection }),
  backup: new Queue('backup', { connection: redisConnection }),
}
```

#### 8.2. Scan worker (asosiy)

`workers/scan.worker.ts`:
```typescript
import { Worker } from 'bullmq'
import { redisConnection } from '@/lib/redis/client'
import { prisma } from '@/lib/db/prisma'
import { matchAsset } from '@/lib/services/matching.service'
import { calculateConfidence, shouldNotify } from '@/lib/services/confidence.service'
import { calculateRisk } from '@/lib/services/risk.service'
import { isSuppressed } from '@/lib/services/suppression.service'
import { queues } from './queues'

export const scanWorker = new Worker('full-scan', async (job) => {
  const scanRun = await prisma.scanRun.create({
    data: { scanType: job.data.type ?? 'SCHEDULED', status: 'RUNNING' },
  })

  let assetsScanned = 0, findingsNew = 0, findingsRecurring = 0

  const assets = await prisma.asset.findMany({
    where: { status: 'ACTIVE' },
    include: { attributes: true, employees: { include: { employee: true } } },
  })

  // Email queue: employee → findingIds
  const emailMap = new Map<string, string[]>()

  for (const asset of assets) {
    const matches = await matchAsset(asset.id)
    assetsScanned++

    for (const match of matches) {
      // Suppression tekshirish
      const vuln = await prisma.vulnerability.findUnique({
        where: { id: match.vulnerabilityId },
      })
      if (!vuln) continue
      if (await isSuppressed(vuln.cveId, asset)) continue

      // Confidence
      const vendorStat = asset.vendor
        ? await prisma.vendorFpStat.findUnique({ where: { vendor: asset.vendor } })
        : null
      const conf = calculateConfidence({
        match,
        isKev: vuln.isKev,
        epssScore: vuln.epssScore ? Number(vuln.epssScore) : undefined,
        vendorFpRate: vendorStat ? Number(vendorStat.fpRate) : undefined,
      })

      // Risk
      const criticality = asset.attributes.find(a => a.key === 'criticality')?.value ?? 'medium'
      const internetFacing = asset.attributes.find(a => a.key === 'internet_facing')?.value === 'true'
      const risk = calculateRisk(Number(vuln.cvssV3Score ?? 0), criticality, internetFacing)

      // Finding upsert
      const existing = await prisma.finding.findUnique({
        where: { assetId_vulnerabilityId: { assetId: asset.id, vulnerabilityId: vuln.id } },
      })

      const decision = shouldNotify(conf.score, vuln.isKev)
      const status = decision === 'triage_only' ? 'PENDING_REVIEW'
        : decision === 'send_review' ? 'PENDING_REVIEW'
        : 'APPLICABLE'

      if (existing) {
        await prisma.finding.update({
          where: { id: existing.id },
          data: { lastSeenAt: new Date(), confidenceScore: conf.score, riskScore: risk,
                   confidenceFactors: conf.factors as any, sources: match.sources as any },
        })
        findingsRecurring++
      } else {
        const finding = await prisma.finding.create({
          data: {
            assetId: asset.id, vulnerabilityId: vuln.id, scanRunId: scanRun.id,
            confidenceScore: conf.score, confidenceFactors: conf.factors as any,
            riskScore: risk, sources: match.sources as any, status,
          },
        })
        findingsNew++

        // Email kerakmi?
        if (decision === 'send' || decision === 'send_review') {
          for (const ea of asset.employees) {
            if (!emailMap.has(ea.employee.id)) emailMap.set(ea.employee.id, [])
            emailMap.get(ea.employee.id)!.push(finding.id)
          }
        }
      }
    }
  }

  // Email job larni queue ga qo'shish
  for (const [employeeId, findingIds] of emailMap) {
    await queues.notificationDispatch.add('send', { employeeId, findingIds, scanRunId: scanRun.id })
  }

  await prisma.scanRun.update({
    where: { id: scanRun.id },
    data: { status: 'COMPLETED', finishedAt: new Date(),
             assetsScanned, findingsNew, findingsRecurring },
  })

  return { assetsScanned, findingsNew, findingsRecurring }
}, { connection: redisConnection, concurrency: 1 })  // bir vaqtda bitta skan
```

#### 8.3. Scheduler (repeatable jobs)

`workers/scheduler.ts`:
```typescript
import { queues } from './queues'

export async function setupSchedules() {
  // Haftalik to'liq skan — dushanba 09:00
  await queues.fullScan.add('weekly', { type: 'SCHEDULED' }, {
    repeat: { pattern: '0 9 * * 1' },  // cron
    jobId: 'weekly-full-scan',
  })

  // CVE ingestion — har kuni 03:00
  await queues.cveIngestion.add('daily', { sinceDays: 7 }, {
    repeat: { pattern: '0 3 * * *' },
    jobId: 'daily-ingestion',
  })

  // KEV priority skan — har 6 soat
  await queues.kevPriorityScan.add('kev', {}, {
    repeat: { pattern: '0 */6 * * *' },
    jobId: 'kev-scan',
  })

  // Patch verification — har kuni 04:00
  await queues.patchVerification.add('verify', {}, {
    repeat: { pattern: '0 4 * * *' },
    jobId: 'patch-verification',
  })

  // Notification dispatch — har 5 daqiqa (yoki event-driven)
  // (scan worker o'zi qo'shadi, bu fallback)

  // Suppression expiry — har kuni 02:00
  await queues.suppressionExpiry.add('expire', {}, {
    repeat: { pattern: '0 2 * * *' },
    jobId: 'suppression-expiry',
  })

  // Vendor FP recalc — har kuni 05:00
  await queues.vendorFpRecalc.add('recalc', {}, {
    repeat: { pattern: '0 5 * * *' },
    jobId: 'vendor-fp-recalc',
  })

  // Report generation — dushanba 10:00
  await queues.reportGeneration.add('weekly', { type: 'weekly' }, {
    repeat: { pattern: '0 10 * * 1' },
    jobId: 'weekly-report',
  })

  console.log('Barcha repeatable job lar sozlandi')
}
```

#### 8.4. Worker entry point

`workers/index.ts`:
```typescript
import { scanWorker } from './scan.worker'
import { ingestionWorker } from './ingestion.worker'
import { notificationWorker } from './notification.worker'
import { verificationWorker } from './verification.worker'
import { reportWorker } from './report.worker'
import { setupSchedules } from './scheduler'

async function main() {
  await setupSchedules()
  console.log('Worker lar ishga tushdi')

  // Workers avtomatik ishlaydi (import qilingani uchun)
  const workers = [scanWorker, ingestionWorker, notificationWorker,
                   verificationWorker, reportWorker]

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    await Promise.all(workers.map(w => w.close()))
    process.exit(0)
  })
}

main()
```

Ishga tushirish:
```bash
# package.json scripts:
# "worker": "tsx workers/index.ts"
npm run worker
```

#### 📋 Definition of Done (Faza 8)
- [ ] `npm run worker` ishga tushadi, scheduler job larni qo'yadi
- [ ] Manual skan ishlaydi (Scans sahifasidan trigger)
- [ ] Skan: assets → match → confidence → finding → email queue
- [ ] CVE ingestion job ishlaydi
- [ ] Patch verification job: PENDING_VERIFICATION → qayta skan
- [ ] Notification dispatch job email yuboradi
- [ ] Suppression expiry job muddati tugaganlarni deaktivatsiya qiladi
- [ ] Bir vaqtda faqat bitta skan (concurrency: 1)

#### 🤖 Vibe coding prompt (Faza 8)
```
KONTEKST: OGOH MAI. Davriy ishlar BullMQ worker'larda bo'lishi kerak.
Worker'lar Next.js'dan alohida process'da ishlaydi.

VAZIFA: BullMQ job tizimini qur.

FAYLLAR:
- workers/queues.ts (queue ta'riflari)
- workers/scan.worker.ts (asosiy: match→confidence→finding→email)
- workers/ingestion.worker.ts, notification.worker.ts,
  verification.worker.ts, report.worker.ts
- workers/scheduler.ts (cron pattern'lar)
- workers/index.ts (entry point)

TALABLAR:
- Repeatable jobs: skan(dushanba 9:00), ingestion(har kun 3:00),
  KEV(6 soat), verification(4:00), suppression-expiry(2:00)
- Scan: bir vaqtda bitta (concurrency:1), ScanRun yozuvi
- Scan email map: employee→findingIds, notificationDispatch ga
- Verification: PENDING_VERIFICATION → qayta match → VERIFIED/PATCH_FAILED
- Graceful shutdown (SIGTERM)
- Failed jobs retry (3 marta, exponential)

NATIJA: npm run worker ishlasin, skan to'liq oqim ishlasin.
```
---

### 🟢 FAZA 9: DASHBOARD VA REPORTS <a name="faza-9-dashboard"></a>

**Maqsad:** Asosiy dashboard (widget + chartlar), hisobotlar (PDF/Excel).

**Davomiyligi:** ~2 kun

**Bog'liqlik:** Faza 6 (findings)

#### 9.1. Dashboard sahifasi

`app/(dashboard)/dashboard/page.tsx` (Server Component):
- **4 ta KPI card:** Jami vositalar | Aktiv findinglar | Critical+High | KEV findinglar
- **Trend chart (90 kun):** Recharts LineChart — kunlik yangi findinglar
- **Severity pie chart:** Critical/High/Medium/Low taqsimot
- **TOP-10 zaif vositalar:** jadval
- **Recent activity:** oxirgi triage/skan harakatlari
- Section-Head/Department-Head uchun action tugmalari yo'q (faqat ko'rish)

Dashboard ma'lumotlari Server Component'da to'g'ridan-to'g'ri Prisma orqali:
```typescript
async function getDashboardData() {
  const [totalAssets, activeFindings, criticalHigh, kevCount] = await Promise.all([
    prisma.asset.count({ where: { status: 'ACTIVE' } }),
    prisma.finding.count({ where: { status: { notIn: ['CLOSED', 'NOT_APPLICABLE'] } } }),
    prisma.finding.count({ where: {
      vulnerability: { severity: { in: ['CRITICAL', 'HIGH'] } },
      status: { notIn: ['CLOSED', 'NOT_APPLICABLE'] },
    }}),
    prisma.finding.count({ where: { vulnerability: { isKev: true },
      status: { notIn: ['CLOSED'] } } }),
  ])
  // ... trend, severity distribution, top assets
  return { totalAssets, activeFindings, criticalHigh, kevCount, /* ... */ }
}
```

#### 9.2. Report service (PDF)

`lib/services/report.service.ts` — @react-pdf/renderer bilan:
- Haftalik/oylik hisobot
- Tarkib: kirish, statistika, severity taqsimot, KEV findinglar, MTTD/MTTR, TOP-10, bo'lim kesimi, trend, xulosa
- PDF va Excel (exceljs) eksport

#### 9.3. Reports sahifasi

`app/(dashboard)/reports/page.tsx`:
- Mavjud hisobotlar ro'yxati
- "Yangi hisobot" — davr + filtr tanlash
- Eksport: PDF / Excel / CSV

#### 📋 Definition of Done (Faza 9)
- [ ] Dashboard KPI cardlar to'g'ri sonlar ko'rsatadi
- [ ] Trend chart va pie chart render bo'ladi
- [ ] TOP-10 vositalar jadvali
- [ ] Head rollar uchun read-only (action yo'q)
- [ ] Haftalik hisobot PDF generatsiya bo'ladi
- [ ] Excel eksport ishlaydi

#### 🤖 Vibe coding prompt (Faza 9)
```
KONTEKST: OGOH MAI. Dashboard va hisobotlar kerak.

VAZIFA: Dashboard + reporting qur.

FAYLLAR:
- app/(dashboard)/dashboard/page.tsx (Server Component)
- components/charts/* (Recharts wrapper)
- lib/services/report.service.ts (PDF/Excel)
- app/(dashboard)/reports/page.tsx

TALABLAR:
- 4 KPI card, trend chart(90 kun), severity pie, TOP-10
- Ma'lumot Server Component'da Prisma orqali
- Head rollar: read-only
- PDF: @react-pdf/renderer, Excel: exceljs
- Hisobot tarkibi: stats, severity, KEV, MTTD/MTTR, TOP-10, trend

NATIJA: Dashboard ko'rinsin, hisobot eksport bo'lsin.
```

---

### 🟢 FAZA 10: ADMIN PANEL VA SETTINGS <a name="faza-10-admin"></a>

**Maqsad:** Foydalanuvchilar boshqaruvi, global sozlamalar (faqat Admin).

**Davomiyligi:** ~1.5 kun

**Bog'liqlik:** Faza 1 (auth/RBAC)

#### 10.1. Foydalanuvchilar boshqaruvi

`app/(dashboard)/admin/users/page.tsx` + `lib/actions/user.actions.ts`:
- DataTable: F.I.Sh., email, rollar (badge), holat, oxirgi kirish
- Yangi foydalanuvchi: F.I.Sh., email, rol(lar) tanlash, boshlang'ich parol
- Bir foydalanuvchiga bir nechta rol (checkbox)
- Deaktivatsiya (o'chirmaslik)
- 2FA reset
- Parol reset

```typescript
'use server'
export async function createUser(data: {
  fullName: string; email: string; roles: RoleName[]; password: string
}) {
  await requirePermission('users:manage')
  const passwordHash = await bcrypt.hash(data.password, 12)
  const roleRecords = await prisma.role.findMany({ where: { name: { in: data.roles } } })
  await prisma.user.create({
    data: {
      fullName: data.fullName, email: data.email, passwordHash,
      roles: { create: roleRecords.map(r => ({ roleId: r.id })) },
    },
  })
  await logAudit('CREATE_USER', 'user', null, { email: data.email, roles: data.roles })
}

export async function reset2FA(userId: string) {
  await requirePermission('users:manage')
  await prisma.user.update({
    where: { id: userId },
    data: { totpSecret: null, totpEnabled: false },
  })
  await logAudit('RESET_2FA', 'user', userId, {})
}
```

#### 10.2. Sozlamalar

`app/(dashboard)/admin/settings/page.tsx` + `lib/actions/settings.actions.ts`:
- **SMTP:** host, port, user, parol (shifrlangan), from, reply-to
- **NVD API key, GitHub token** (shifrlangan)
- **Skan jadvali:** cron pattern
- **Confidence formula:** modifikator qiymatlari (sozlanadigan)
- **Mahalliylashtirish:** standart til

Maxfiy qiymatlar AES bilan shifrlanadi (`lib/utils/crypto.ts`), UI da maskalanadi (`••••••`).

```typescript
'use server'
export async function updateSetting(key: string, value: string, isSecret: boolean) {
  await requirePermission('settings:manage')
  const stored = isSecret ? encrypt(value) : value
  await prisma.systemSetting.upsert({
    where: { key },
    update: { valueEncrypted: stored },
    create: { key, valueEncrypted: stored },
  })
  await logAudit('UPDATE_SETTING', 'setting', key, { key })  // qiymat loglanmaydi
}
```

#### 10.3. 2FA sozlash (foydalanuvchi o'zi)

Profil sahifasida — TOTP QR kod, otplib bilan:
```typescript
import { authenticator } from 'otplib'
import QRCode from 'qrcode'

// Setup boshlanishi
const secret = authenticator.generateSecret()
const uri = authenticator.keyuri(user.email, 'OGOH MAI', secret)
const qrDataUrl = await QRCode.toDataURL(uri)
// User QR ni skanlaydi, kod kiritadi → tasdiqlash → totpEnabled=true
```

#### 📋 Definition of Done (Faza 10)
- [ ] Admin foydalanuvchi yaratadi (bir nechta rol bilan)
- [ ] Foydalanuvchi deaktivatsiya/2FA reset ishlaydi
- [ ] Sozlamalar saqlanadi, maxfiy qiymatlar shifrlanadi
- [ ] UI da parollar maskalanadi
- [ ] 2FA QR kod ishlaydi (Google Authenticator bilan test)
- [ ] Sozlamalar o'zgarishi audit log ga (qiymatsiz)

#### 🤖 Vibe coding prompt (Faza 10)
```
KONTEKST: OGOH MAI. Admin foydalanuvchilar + sozlamalarni boshqaradi.

VAZIFA: Admin panel qur.

FAYLLAR:
- app/(dashboard)/admin/users/page.tsx
- app/(dashboard)/admin/settings/page.tsx
- lib/actions/user.actions.ts, settings.actions.ts

TALABLAR:
- User CRUD, bir nechta rol (checkbox)
- Deaktivatsiya, 2FA reset, parol reset
- Settings: SMTP, NVD key, cron, confidence formula
- Maxfiy qiymatlar AES shifrlash, UI da maskalash
- 2FA: otplib QR kod (qrcode paketi)
- Faqat Admin (requirePermission users:manage / settings:manage)
- Qiymatlar audit log ga yozilmasin (faqat key)

NATIJA: Admin user/sozlama boshqaruvi ishlasin.
```

---

### 🟢 FAZA 11: AUDIT LOG VA MONITORING <a name="faza-11-audit"></a>

**Maqsad:** Audit jurnali, health/metrics endpoint, kuzatuv.

**Davomiyligi:** ~1 kun

**Bog'liqlik:** barcha fazalar

#### 11.1. Audit service

`lib/services/audit.service.ts`:
```typescript
import { prisma } from '@/lib/db/prisma'
import { auth } from '@/lib/auth/auth'
import { headers } from 'next/headers'

export async function logAudit(
  action: string,
  entityType: string | null,
  entityId: string | null,
  details: any
) {
  const session = await auth().catch(() => null)
  const h = headers()
  await prisma.auditLog.create({
    data: {
      actorId: session?.user?.id ?? null,
      action,
      entityType,
      entityId,
      newValue: details,
      ipAddress: h.get('x-forwarded-for') ?? h.get('x-real-ip'),
      userAgent: h.get('user-agent'),
    },
  })
}
```

#### 11.2. Audit log sahifasi

`app/(dashboard)/audit-log/page.tsx`:
- DataTable: vaqt, aktor, harakat, ob'ekt, IP
- Filtr: aktor, vaqt oralig'i, harakat turi
- CSV eksport
- Immutable (faqat ko'rish)

#### 11.3. Health & Metrics

`app/api/health/route.ts`:
```typescript
import { prisma } from '@/lib/db/prisma'
import { redisConnection } from '@/lib/redis/client'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`
    await redisConnection.ping()
    return NextResponse.json({ status: 'healthy', timestamp: new Date() })
  } catch (e: any) {
    return NextResponse.json({ status: 'unhealthy', error: e.message }, { status: 503 })
  }
}
```

`app/api/metrics/route.ts` — Prometheus:
```typescript
import { register, Counter, Gauge, Histogram } from 'prom-client'
import { NextResponse } from 'next/server'

// Metrikalar (singleton)
export const scanDuration = new Histogram({
  name: 'exabar_scan_duration_seconds',
  help: 'Skan davomiyligi',
})
export const emailsSent = new Counter({
  name: 'exabar_emails_sent_total',
  help: 'Yuborilgan emaillar',
})
export const activeFindings = new Gauge({
  name: 'exabar_active_findings',
  help: 'Aktiv findinglar',
})

export async function GET() {
  const metrics = await register.metrics()
  return new NextResponse(metrics, {
    headers: { 'Content-Type': register.contentType },
  })
}
```

#### 📋 Definition of Done (Faza 11)
- [ ] Audit log barcha muhim harakatlarni yozadi
- [ ] Audit log sahifasi filtr bilan ishlaydi
- [ ] `/api/health` 200/503 qaytaradi
- [ ] `/api/metrics` Prometheus formatida
- [ ] Audit log immutable (o'zgartirish/o'chirish yo'q)

#### 🤖 Vibe coding prompt (Faza 11)
```
KONTEKST: OGOH MAI. Audit log va monitoring kerak.

VAZIFA: Audit + health/metrics qur.

FAYLLAR:
- lib/services/audit.service.ts
- app/(dashboard)/audit-log/page.tsx
- app/api/health/route.ts
- app/api/metrics/route.ts

TALABLAR:
- logAudit: actor, action, entity, IP, UA
- Audit sahifa: filtr(aktor,vaqt,harakat), CSV eksport, read-only
- /api/health: Postgres + Redis ping
- /api/metrics: prom-client (scan_duration, emails_sent, active_findings)

NATIJA: Harakatlar loglanadi, health/metrics ishlasin.
```

---

### 🟢 FAZA 12: TESTING VA DEPLOYMENT <a name="faza-12-deploy"></a>

**Maqsad:** Testlar, PM2 deploy, production sozlash.

**Davomiyligi:** ~2-3 kun

**Bog'liqlik:** barcha fazalar

#### 12.1. Testlar

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm install -D playwright  # E2E
```

Asosiy testlar:
- **Unit:** confidence.service, matching.service, purl parser, version-compare
- **Integration:** import action, triage action (test DB bilan)
- **E2E:** login → inventory → scan → findings (Playwright)

```typescript
// tests/unit/confidence.test.ts (misol)
import { describe, it, expect } from 'vitest'
import { calculateConfidence, shouldNotify } from '@/lib/services/confidence.service'

describe('confidence', () => {
  it('PURL exact + multi-source → yuqori ball', () => {
    const r = calculateConfidence({
      match: { matchType: 'purl_exact', sources: ['NVD', 'OSV'], patchedByDistro: false } as any,
      isKev: false,
    })
    expect(r.score).toBeGreaterThanOrEqual(0.6)  // 0.40 + 0.20
  })

  it('KEV har doim send', () => {
    expect(shouldNotify(0.1, true)).toBe('send')
  })

  it('distro patched → ball pasayadi', () => {
    const r = calculateConfidence({
      match: { matchType: 'purl_exact', sources: ['NVD'], patchedByDistro: true } as any,
      isKev: false,
    })
    expect(r.score).toBeLessThan(0.4)  // 0.40 - 0.30 - 0.10
  })
})
```

#### 12.2. PM2 ecosystem

`ecosystem.config.js`:
```javascript
module.exports = {
  apps: [
    {
      name: 'exabar-web',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      instances: 2,
      exec_mode: 'cluster',
      env: { NODE_ENV: 'production' },
    },
    {
      name: 'exabar-workers',
      script: './workers/index.js',  // build qilingan
      instances: 1,
      exec_mode: 'fork',
      env: { NODE_ENV: 'production' },
    },
  ],
}
```

#### 12.3. Production o'rnatish (Ubuntu Server)

```bash
# 1. Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt install -y nodejs

# 2. PostgreSQL 15
sudo apt install -y postgresql-15

# 3. Redis 7
sudo apt install -y redis-server

# 4. Nginx
sudo apt install -y nginx

# 5. PM2
sudo npm install -g pm2

# 6. Loyiha
git clone <repo> /opt/exabar
cd /opt/exabar
npm ci
cp .env.example .env.production  # to'ldiring
npx prisma migrate deploy
npx prisma db seed
npm run build

# 7. Worker'larni build qilish (tsx → js, yoki tsx bilan ishlatish)
# 8. PM2
pm2 start ecosystem.config.js
pm2 startup
pm2 save
```

#### 12.4. Nginx config

`/etc/nginx/sites-available/exabar`:
```nginx
server {
    listen 443 ssl http2;
    server_name exabar.example.uz;

    ssl_certificate     /etc/letsencrypt/live/exabar.example.uz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/exabar.example.uz/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name exabar.example.uz;
    return 301 https://$host$request_uri;
}
```

#### 📋 Definition of Done (Faza 12)
- [ ] Unit testlar o'tadi (confidence, matching, purl)
- [ ] E2E test: login → skan → findings ishlaydi
- [ ] `npm run build` xatosiz
- [ ] PM2 web + workers ishga tushadi
- [ ] Nginx orqali HTTPS ishlaydi
- [ ] Server qayta yuklanганда avtomatik ishga tushadi (pm2 startup)
- [ ] Health check 200 qaytaradi

#### 🤖 Vibe coding prompt (Faza 12)
```
KONTEKST: OGOH MAI. Testlar va production deployment kerak.

VAZIFA: Test + deploy sozlash.

FAYLLAR:
- tests/unit/* (vitest)
- tests/e2e/* (playwright)
- ecosystem.config.js (PM2)
- nginx config, deploy.sh

TALABLAR:
- Unit: confidence, matching, purl, version-compare
- E2E: login→inventory→scan→findings
- PM2: web(cluster 2) + workers(fork)
- Nginx: HTTPS, security headers, proxy
- Prisma migrate deploy + seed

NATIJA: Testlar o'tsin, PM2 ishga tushsin, HTTPS ishlasin.
```

---

## 6. BOG'LIQLIKLAR GRAFIGI <a name="6-bogliqliklar"></a>

```
Faza 0 (Setup)
   │
   ▼
Faza 1 (DB + Auth) ──────────────────────┐
   │                                       │
   ├──────────────┬──────────────┐         │
   ▼              ▼              ▼         ▼
Faza 2         Faza 3         (RBAC)    Faza 10
(Inventory)    (Ingestion)              (Admin)
   │              │
   └──────┬───────┘
          ▼
       Faza 4 (Matching)
          │
          ▼
       Faza 5 (Confidence/FP)
          │
          ▼
       Faza 6 (Triage) ──────► Faza 7 (Email)
          │                       │
          └───────┬───────────────┘
                  ▼
              Faza 8 (BullMQ Jobs)
                  │
                  ▼
              Faza 9 (Dashboard/Reports)
                  │
                  ▼
              Faza 11 (Audit/Monitoring)
                  │
                  ▼
              Faza 12 (Test/Deploy)
```

**Tavsiya etilgan ketma-ketlik:**
`0 → 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12`

**Parallel ishlash mumkin:**
- Faza 2 va Faza 3 (inventory va ingestion bir-biriga bog'liq emas)
- Faza 10 (admin) Faza 1 dan keyin istalgan vaqtda

---

## 7. ENVIRONMENT O'ZGARUVCHILARI <a name="7-env"></a>

`.env.example`:
```bash
# ===== Database =====
DATABASE_URL="postgresql://exabar:PASSWORD@localhost:5432/exabar"

# ===== Redis =====
REDIS_URL="redis://localhost:6379"

# ===== Auth.js =====
AUTH_SECRET="<openssl rand -base64 32>"
AUTH_URL="https://exabar.example.uz"

# ===== Shifrlash (settings, 2FA secret) =====
ENCRYPTION_KEY="<openssl rand -hex 32>"

# ===== CVE manbalar =====
NVD_API_KEY="<https://nvd.nist.gov/developers/request-an-api-key>"
GITHUB_TOKEN="<github personal access token, public_repo>"

# ===== SMTP (Gmail) =====
SMTP_HOST="smtp-relay.gmail.com"
SMTP_PORT="587"
SMTP_USER="<gmail workspace user>"
SMTP_PASSWORD="<app password>"
SMTP_FROM="security@example.uz"

# ===== Ixtiyoriy =====
LOG_LEVEL="info"
NODE_ENV="production"
```

---

## 📝 YAKUNIY MASLAHATLAR

### Vibe coding tartibi
1. **Har fazani alohida sessiyada** qiling. Prompt'ni bering, kod yarating, sinab ko'ring.
2. **Definition of Done'ni** har fazadan keyin tekshiring — keyingisiga o'tishdan oldin.
3. **Prisma schema'ni avval to'liq yarating** (Faza 1) — bu butun loyihaning poydevori.
4. **Murakkab fazalarda** (3-Ingestion, 4-Matching, 5-FP) shoshilmang — bular tizimning yuragi.
5. **Mock data bilan test qiling** — har fazada Prisma Studio orqali ma'lumot kiriting.

### Birinchi ishlaydigan versiya (MVP) uchun minimal yo'l
Agar tez ishlaydigan demo kerak bo'lsa:
```
Faza 0 → 1 → 2 (faqat asset CRUD + import)
     → 3 (faqat NVD adapter)
     → 4 (faqat PURL matching)
     → 5 (confidence)
     → 7 (email)
     → 8 (faqat manual scan)
```
Keyin qolgan manbalar (OSV, GHSA, KEV, distro), triage UI, dashboard, admin'ni qo'shasiz.

### Eng ko'p vaqt talab qiladigan qismlar
1. **CVE adapterlar** (Faza 3) — har manba o'z formatига ega
2. **Version comparison** (Faza 4) — debian/rpm versiyalar murakkab
3. **Email shabloni** (Faza 7) — email mijozlari HTML/CSS cheklovlari

### Foydali havolalar
- PURL spec: https://github.com/package-url/purl-spec
- NVD API: https://nvd.nist.gov/developers/vulnerabilities
- OSV API: https://google.github.io/osv.dev/api/
- CISA KEV: https://www.cisa.gov/known-exploited-vulnerabilities-catalog
- BullMQ: https://docs.bullmq.io/
- Auth.js v5: https://authjs.dev/
- shadcn/ui: https://ui.shadcn.com/

---

*Ushbu reja "OGOH MAI" Texnik topshirig'i (TT.eX-2026.001) asosida tayyorlangan. Har bir faza mustaqil ishlab chiqilishi va sinovdan o'tkazilishi mumkin.*
---

<a name="mavjud-loyihani-moslashtirish"></a>
# 🔧 MAVJUD LOYIHANI MOSLASHTIRISH (studio-admin v2.2.0)

> **MUHIM:** Sizda allaqachon `studio-admin` nomli tayyor admin dashboard loyihasi bor.
> Quyida bu loyihaga OGOH MAI funksionalligini qo'shish bo'yicha aniq yo'riqnoma.
> Bu bo'limni Faza 0 o'rniga bajaring, keyin Faza 1 dan davom eting (moslashtirishlar bilan).

---

## 📊 LOYIHANGIZNING TAHLILI

Sizning `package.json` asosida quyidagilar **allaqachon mavjud**:

### ✅ MAVJUD (saqlanadi, qayta o'rnatish shart emas)

| Kategoriya | Paket | Izoh |
|------------|-------|------|
| **Framework** | next@16, react@19 | Eng yangi versiya (rejamdagidan yangiroq) |
| **ORM** | @prisma/client@7, @prisma/adapter-pg | Prisma 7 + native pg adapter |
| **UI asosi** | radix-ui, @base-ui/react, shadcn@4 | shadcn/ui to'liq |
| **Stillar** | tailwindcss@4, tw-animate-css | Tailwind v4 |
| **Jadvallar** | @tanstack/react-table | DataTable tayyor |
| **Formalar** | react-hook-form, @hookform/resolvers, zod@4 | Form stack to'liq |
| **Charts** | recharts@3 | Dashboard uchun |
| **Auth qismi** | bcryptjs, jose, input-otp | JWT + parol + OTP input |
| **Drag-drop** | @dnd-kit/* | Triage kanban uchun ideal! |
| **Excel** | exceljs | Hisobot eksport |
| **Theme** | next-themes, geist | Dark mode + font |
| **Toast** | sonner | Bildirgilar |
| **Boshqa UI** | cmdk, vaul, embla-carousel, react-resizable-panels | Command palette, drawer |
| **State** | zustand@5 | Client state |
| **Map** | d3-geo, topojson-client | Geografik vizualizatsiya (kerak bo'lmasligi mumkin) |
| **Date** | date-fns@4, react-day-picker | Sana tanlash |
| **Icons** | lucide-react, simple-icons | |
| **Linter** | biome (eslint o'rniga) | Husky + lint-staged |
| **Test** | vitest@4, @testing-library, jsdom | Test stack tayyor |

### ➕ QO'SHISH KERAK (OGOH MAI uchun yo'q)

```bash
# Background jobs (CVE skan, email, verification)
npm install bullmq ioredis

# Email yuborish
npm install nodemailer
npm install -D @types/nodemailer

# Email shablonlari (HTML)
npm install react-email @react-email/components

# PDF hisobotlar (exceljs bor, lekin PDF yo'q)
npm install @react-pdf/renderer

# 2FA TOTP generatsiya (input-otp UI bor, lekin TOTP logic yo'q)
npm install otplib qrcode
npm install -D @types/qrcode

# CSV import/parse (agar yo'q bo'lsa)
npm install papaparse
npm install -D @types/papaparse

# Versiya solishtirish (matching uchun)
npm install semver
npm install -D @types/semver

# Strukturali logging
npm install pino pino-pretty
```

### 🔄 MOSLASHTIRISH (bor, lekin OGOH MAI uchun o'zgartirish/sozlash kerak)

| Narsa | Holat | Nima qilish |
|-------|-------|-------------|
| **Auth** | jose + bcryptjs bor | Auth.js o'rniga **jose bilan custom JWT auth** yozish (quyida) |
| **Prisma 7** | @prisma/adapter-pg bilan | Schema'ni Prisma 7 sintaksisida yozish (driver adapter) |
| **OTP** | input-otp (faqat UI) | otplib bilan TOTP **logikasini** qo'shish |
| **Redis** | yo'q | BullMQ uchun Redis o'rnatish (docker yoki lokal) |

---

## ⚠️ REJADAGI O'ZGARISHLAR (studio-admin'ga moslangan)

Asosiy rejada **Auth.js v5 (NextAuth)** ishlatilgan edi. Sizning loyihangizda **jose** bor, shuning uchun auth qismini quyidagicha o'zgartiramiz:

### Auth strategiyasi: jose bilan custom JWT

`lib/auth/session.ts`:
```typescript
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const SECRET = new TextEncoder().encode(process.env.AUTH_SECRET!)
const ALG = 'HS256'

export interface SessionPayload {
  userId: string
  email: string
  roles: string[]
  expiresAt: number
}

// Token yaratish
export async function createSession(payload: Omit<SessionPayload, 'expiresAt'>) {
  const expiresAt = Date.now() + 30 * 60 * 1000 // 30 daqiqa
  const token = await new SignJWT({ ...payload, expiresAt })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime('30m')
    .sign(SECRET)

  const cookieStore = await cookies()
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(expiresAt),
    path: '/',
  })
  return token
}

// Token tekshirish
export async function verifySession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, SECRET, { algorithms: [ALG] })
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}

// Logout
export async function destroySession() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}
```

`lib/auth/login.ts`:
```typescript
'use server'

import bcrypt from 'bcryptjs'
import { authenticator } from 'otplib'
import { prisma } from '@/lib/db/prisma'
import { createSession } from './session'
import { decrypt } from '@/lib/utils/crypto'

export async function login(email: string, password: string, totp?: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { roles: { include: { role: true } } },
  })
  if (!user || user.status !== 'ACTIVE') {
    return { error: "Email yoki parol noto'g'ri" }
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) return { error: "Email yoki parol noto'g'ri" }

  // 2FA tekshirish
  if (user.totpEnabled && user.totpSecret) {
    if (!totp) return { error: 'TOTP_REQUIRED', requires2FA: true }
    const secret = decrypt(user.totpSecret)
    const ok = authenticator.verify({ token: totp, secret })
    if (!ok) return { error: "2FA kodi noto'g'ri" }
  }

  await createSession({
    userId: user.id,
    email: user.email,
    roles: user.roles.map(r => r.role.name),
  })
  return { success: true }
}
```

### RBAC guard (jose versiyasi)

`lib/rbac/guard.ts` (asosiy rejadan o'zgargan):
```typescript
import { verifySession } from '@/lib/auth/session'
import { hasPermission, type Permission } from './permissions'

export async function requirePermission(permission: Permission) {
  const session = await verifySession()
  if (!session) throw new Error('UNAUTHORIZED')
  if (!hasPermission(session.roles as any, permission)) {
    throw new Error('FORBIDDEN')
  }
  return session
}

export async function getCurrentUser() {
  return await verifySession()
}
```

### Middleware (jose versiyasi)

`middleware.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const SECRET = new TextEncoder().encode(process.env.AUTH_SECRET!)
const PROTECTED = ['/dashboard', '/employees', '/assets', '/findings',
  '/triage', '/suppressions', '/scans', '/reports', '/notifications',
  '/audit-log', '/admin', '/vulnerabilities', '/assignments']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const isProtected = PROTECTED.some(p => pathname.startsWith(p))
  if (!isProtected) return NextResponse.next()

  const token = req.cookies.get('session')?.value
  if (!token) return NextResponse.redirect(new URL('/login', req.url))

  try {
    await jwtVerify(token, SECRET, { algorithms: ['HS256'] })
    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL('/login', req.url))
  }
}

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico|login).*)'],
}
```

> **Eslatma:** Faza 1 dagi Auth.js kodini (`lib/auth/auth.ts`, `lib/auth/auth.config.ts`, `app/api/auth/[...nextauth]`) **ishlatmaslik** kerak. Buning o'rniga yuqoridagi jose-based auth'ni qo'llang.

---

## 📁 PRISMA 7 SOZLAMASI (adapter-pg bilan)

Sizda **Prisma 7** va `@prisma/adapter-pg` bor — bu yangiroq, driver adapter ishlatadi:

`lib/db/prisma.ts`:
```typescript
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL!

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

const adapter = new PrismaPg({ connectionString })

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

`prisma/schema.prisma` boshida (Prisma 7 uchun):
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

> Faza 1 dagi to'liq schema (18 model) **o'zgarmaydi** — faqat client init Prisma 7 / adapter-pg uchun yuqoridagidek bo'ladi.

---

## 🎯 MAVJUD UI KOMPONENTLARIDAN FOYDALANISH

studio-admin'da tayyor komponentlar bor — ularni qayta yozmang, ishlatib keting:

| OGOH MAI funksiyasi | studio-admin'dagi tayyor narsa |
|--------------------|-------------------------------|
| Findings/Assets jadvallari | `@tanstack/react-table` + mavjud DataTable komponenti |
| **Triage kanban** | **`@dnd-kit/*`** (drag-drop tayyor!) — kanban uchun ideal |
| Dashboard chartlar | `recharts@3` (mavjud chart komponentlari) |
| Formalar | `react-hook-form` + `zod` + shadcn Form |
| 2FA kod kiritish | `input-otp` (UI tayyor, faqat otplib logic qo'shing) |
| Toast bildirgilar | `sonner` |
| Excel eksport | `exceljs` |
| Sana filtri | `react-day-picker` + `date-fns` |
| Command palette | `cmdk` (tezkor qidiruv uchun) |
| Modal/drawer | `vaul` (mobil-friendly) |
| Sidebar collapse | `react-resizable-panels` |
| Dark mode | `next-themes` (tayyor) |

### Mavjud sahifa strukturasini tekshiring
studio-admin'da quyidagilar tayyor bo'lishi mumkin (loyihani oching va ko'ring):
- Sidebar + layout
- Dashboard sahifasi (namuna widgetlar)
- Settings sahifasi
- Login sahifasi (ehtimol)
- Theme switcher

**Strategiya:** Mavjud sahifalarni OGOH MAI uchun **moslashtiring** (rename + content o'zgartirish), yangidan yozmang.

---

## 🗺️ MOSLASHTIRILGAN BOSQICHLAR KETMA-KETLIGI

studio-admin bilan ishlaganda fazalar quyidagicha o'zgaradi:

```
Faza -1: Loyihani moslashtirish (BU BO'LIM)
   ├── Yangi paketlarni qo'shish (bullmq, nodemailer, otplib, ...)
   ├── Redis o'rnatish (docker-compose yoki lokal)
   ├── .env sozlash
   └── Mavjud strukturani o'rganish
   ▼
Faza 1: DB + Auth (MOSLASHTIRILGAN)
   ├── Prisma 7 schema (18 model) — adapter-pg bilan
   ├── jose-based auth (Auth.js EMAS)
   ├── RBAC (o'zgarmaydi)
   └── Mavjud login sahifasini moslashtirish
   ▼
Faza 2-12: Asosiy rejadagidek davom etadi
   (faqat auth chaqiruvlari verifySession/requirePermission bo'ladi)
```

---

## 📋 Definition of Done (Faza -1)

- [ ] Loyiha ochiladi, `npm run dev` ishlaydi
- [ ] Yangi paketlar o'rnatildi (bullmq, ioredis, nodemailer, otplib, qrcode, semver, papaparse, pino, @react-pdf/renderer, react-email)
- [ ] Redis ishlamoqda (`docker compose up -d` yoki lokal)
- [ ] `.env` to'ldirildi (DATABASE_URL, REDIS_URL, AUTH_SECRET, ENCRYPTION_KEY, ...)
- [ ] Prisma client adapter-pg bilan sozlandi
- [ ] Mavjud sahifa/komponent strukturasi o'rganildi (qaysi biri qayta ishlatiladi belgilandi)
- [ ] jose-based auth helper'lari (session.ts, login.ts) yaratildi

---

## 🤖 Vibe coding prompt (Faza -1)

```
KONTEKST: Menda "studio-admin" nomli tayyor Next.js 16 + React 19 +
shadcn/ui + Prisma 7 admin dashboard loyihasi bor. Unga OGOH MAI
(CVE monitoring) funksionalligini qo'shyapman.

Mavjud: next@16, react@19, prisma@7 (+adapter-pg), shadcn, tailwind@4,
@tanstack/react-table, react-hook-form, zod, recharts, @dnd-kit,
bcryptjs, jose, input-otp, exceljs, zustand, sonner, vitest.

YO'Q (qo'shish kerak): bullmq, ioredis, nodemailer, react-email,
@react-pdf/renderer, otplib, qrcode, semver, papaparse, pino.

VAZIFA: Loyihani OGOH MAI uchun tayyorlash.

TALABLAR:
1. Yangi paketlarni o'rnatish (yuqoridagi YO'Q ro'yxati)
2. docker-compose.yml (postgres + redis) qo'shish
3. lib/db/prisma.ts — Prisma 7 + PrismaPg adapter bilan
4. lib/auth/session.ts — jose bilan JWT session (Auth.js EMAS!)
5. lib/auth/login.ts — bcrypt + otplib 2FA
6. lib/rbac/guard.ts — verifySession asosida
7. middleware.ts — jose bilan himoya
8. .env.example to'ldirish

MUHIM: Auth.js/NextAuth ISHLATMA — jose bilan custom auth yoz.
Mavjud shadcn komponentlarini qayta ishlatish (yangidan yozma).

NATIJA: Loyiha ishga tushsin, auth helper'lar tayyor bo'lsin,
Redis ulanishi ishlasin.
```

---

## 💡 STUDIO-ADMIN BILAN ISHLASH BO'YICHA MASLAHATLAR

1. **Avval loyihani o'rganing.** `app/`, `components/`, `lib/` papkalarini ochib, nima borligini ko'ring. README bo'lsa o'qing.

2. **Mavjud sahifalarni qayta ishlating.** Agar dashboard, settings, users sahifalari bor bo'lsa — ularni OGOH MAI uchun moslang, yangidan yozmang.

3. **Biome (eslint emas).** Loyiha biome ishlatadi. `npm run check:fix` bilan kod formatlang.

4. **Prisma 7 farqi.** Driver adapter (`@prisma/adapter-pg`) ishlatiladi — connection pooling boshqacha. Migration: `npx prisma migrate dev`.

5. **React 19 + Next 16.** Server Actions, Server Components to'liq qo'llab-quvvatlanadi. `useActionState`, `useFormStatus` ishlatishingiz mumkin.

6. **@dnd-kit triage uchun.** Triage kanban (Faza 6) ni qurishda @dnd-kit allaqachon borligidan foydalaning — drag-drop tayyor.

7. **zustand state.** Agar client-side filtr holati kerak bo'lsa, zustand bor (yangi state kutubxonasi qo'shmang).

8. **input-otp + otplib.** 2FA da: UI uchun `input-otp` (bor), TOTP tekshirish uchun `otplib` (qo'shasiz).

9. **Theme presets.** Loyihada `generate:presets` skripti bor — maxsus theme tizimi. Buni saqlang.

10. **simple-icons + d3-geo.** Agar geografik xarita yoki brand iconlar kerak bo'lmasa, bu paketlarni ishlatmasangiz ham bo'ladi (lekin o'chirmang, boshqa narsa bog'liq bo'lishi mumkin).
