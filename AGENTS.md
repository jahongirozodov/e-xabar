<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# e-Xabar — loyiha qoidalari (CONVENTIONS)

CVE monitoring tizimi. Til: **o'zbek (lotin)**, turlangan apostrof `ʻ`. Mavzu: dark default.
Spec: `README.md`, `e-Xabar_Development_Roadmap.md` (Faza 0–12), `e-Xabar - Claude Code Promtlari.md` (UI P0–P17). Dizayn manbasi: `design_reference/*.jsx`+`app.css` (ko'chirma EMAS — shadcn'da qayta yoz).

## Stack (pinlangan — o'zgartirma)
- **Next 16** (App Router, Turbopack) + React 19 + Tailwind v4 + shadcn (zinc, New York).
- **Prisma 6** (klassik `@prisma/client`, NOT v7). Schema `url = env("DATABASE_URL")`, `.env` avtomatik yuklanadi.
- **Auth.js v5** (`next-auth@beta`). JWT strategiya. Middleware **`proxy.ts`** (Next 16 nomi), `lib/auth/auth.config.ts` edge-safe (faqat type import), `lib/auth/auth.ts` node.
- **otplib v12** (v13 emas — `authenticator` API). **react-day-picker v9**. **@dnd-kit/core** triage uchun.
- `.npmrc` → `legacy-peer-deps=true` (React 19 peers). Yangi paket: `npm i X --silent`.

## Arxitektura patternlari (ENG MUHIM)
- **Query fayllar** (`lib/actions/*.queries.ts`): `import "server-only"` + oddiy async funksiya. Server component'dan chaqiriladi. `"use server"` QO'YMA (action serializatsiyasidan qochish).
- **Mutation fayllar** (`lib/actions/*.actions.ts`): `"use server"`, har export async action. `requirePermission('perm')` bilan boshlanadi, oxirida `revalidatePath` + `logAudit`.
- **Sahifa guard**: server component'da `await requirePagePermission('perm')` (throw EMAS, `/dashboard` ga redirect). Action'da `requirePermission` (throw).
- **Ekran tuzilishi**: `app/(dashboard)/<route>/page.tsx` (server: guard + query) → `components/<feature>/<feature>-view.tsx` (client, "use client") + columns/drawer/dialog.
- Reuse: `components/data-table/*` (DataTable, `getRowId`), `components/detail-drawer.tsx` (Sheet), `components/severity-badge.tsx`, `lib/severity.ts`, `lib/findings.ts`, `lib/rbac/*`, `lib/services/audit.service.ts` (`logAudit`).
- Severity ranglar: CSS var `var(--sev-c/-h/-m/-l)`, `var(--kev)`, `var(--success)`; yarim shaffof fon `color-mix(in oklab, VAR 14%, transparent)`.

## Ma'lum tuzoqlar (GOTCHAS)
- **zodResolver + `.default()`** → RHF generics buziladi ("boolean|undefined not assignable"). `.default()` olib tashla, blank()/defaultValues'da ber.
- **Radix Select** bo'sh string value qabul qilmaydi → ixtiyoriy uchun `"none"` sentinel.
- **Radix nested DropdownMenu** (menu-ichida-menu-item) ishonchsiz → row menyuda variantlarni inline sana; bulk/drawer top-level menu (Button trigger).
- **DropdownMenuCheckboxItem** ochiq qolishi uchun `onSelect={e=>e.preventDefault()}`.
- **React Email `<Preview>`** bitta string child kutadi → interpolatsiyani bitta template literalga o'ra.
- **NotificationStatus** enum = QUEUED/SENT/FAILED/BOUNCED (ACKNOWLEDGED YO'Q — ack = `acknowledgedAt` maydoni).
- Concrete interface'ni `Record<string,unknown>` prop'ga berib bo'lmaydi (index signature yo'q) → `readonly object[]` ishlat (chart `data`).
- Asset compound unique **`name_objectId_category`** (obyekt+kategoriya modeli). Vosita `version` ENDI ixtiyoriy (null bo'lishi mumkin) → `versionLt(null,..)`=true (zaif deb hisoblanadi). `a.version`'ni string deb ishlatuvchi joylar `?? ""`.

## Ishlash tartibi (HAR safar)
1. Yangi ekran/feature: dizayn (`design_reference/<x>.jsx`) + spec (Roadmap/README) o'qi.
2. Yoz: query → action → komponentlar → page.
3. **`npm run build`** — typecheck/lint toza bo'lishi SHART. Xatoni darhol tuzat.
4. **Testla**: prod (`npm run start -- -p 3001`) bilan login (`admin@example.uz`/`Admin@12345`) → ekran 200, kontent. RBAC: `boshliq@example.uz` (SECTION_HEAD) bloklangan ekranlar → `/dashboard` redirect. Mutatsiyalarni DB darajasida (`node -e` + prisma) tasdiqla.
5. Auth.js REST login (curl): `GET /api/auth/csrf` → `POST /api/auth/callback/credentials` (csrfToken+email+password+redirect=false), cookie jar bilan.
6. Xotira faylini (`memory/exabar-faza0-stack.md`) yangila.

## Vositalar (Assets) — Obyekt + Kategoriya modeli
- **Yangi import format** (massiv obyektlar): har obyekt `name` (obyekt nomi) + `subject` (tashkilot) + `stuff` (mas'ul xodim) + `infoToolList` (Axborotlashtirish vositalari → category `INFO`) + `cyberSecToolList` (Kiberxavfsizlik → `CYBERSEC`). Vosita = `{ name:{name}, manufacturer, type }`. Eski `employee·system·tools` format YO'Q.
- Modellar: `Organization` (subject, externalId=subject.id unique), `MonitoredObject` (obyekt, number unique, responsible→Employee, organization→Organization), `Asset` (+`category` enum, `toolType`, `objectId`, `version` ixtiyoriy). `Employee.department` ixtiyoriy + `phone`.
- Upsert kalitlari: org=externalId(yoki name), obyekt=number(yoki name), employee=email(stuff.emails[0]), asset=`name_objectId_category`. Mas'ul har vositaga EmployeeAsset owner sifatida (notification pipeline buzilmasin).
- `extractVersion(name)` (import.actions) — nomdan versiya regex (V10.2.16→10.2.16; "Vmware 8"/"Dell R750"→null).
- UI filtr: Kategoriya chips + Tur(toolType) dropdown + Tashkilot dropdown (eski kritiklik/muhit/internet/assetType YO'Q). `getMonitoredObjectsForSelect()` forma+filtr uchun.
- Schema o'zgarsa: `npx prisma db push --accept-data-loss` (oddiy push, NOT --force-reset → AI consent guard). Mavjud asset object_id=NULL bo'lgani uchun yangi unique konflikt bermaydi. Seed: 2 org/2 obyekt + 8 vosita (6 INFO/2 CYBERSEC).

## Dev server (Windows, Turbopack)
- **Force-kill QILMA** dev'ni compile vaqtida → `.next` cache buziladi ("unable to handle stdout ... stream closed"). Ctrl+C bilan to'xtat.
- Cache buzilsa: portni bo'shat + `Remove-Item -Recurse -Force .next` + qayta dev.
- Port 3001 (`AUTH_URL`/`AUTH_TRUST_HOST` shunga mos `.env.local`). Bash tool npx topa olmaydi → **PowerShell** ishlat npm/npx uchun.

## Infra
- Lokal Postgres 16 (`exabar` db, user `postgres`). Docker YO'Q (docker-compose.yml namuna).
- **Redis**: lokal 6379 = 3.0.504 (BullMQ <5 → ISHLAMAYDI). YECHIM: Redis 5.0.14.1 Windows port (tporadowski) `~/redis5/` ga yuklangan, **6380** portda. `npm run redis5` ishga tushiradi; `.env` REDIS_URL=`redis://localhost:6380`. BullMQ worker shu Redis'da REAL ishlaydi (test: worker + `npm run scan:enqueue` → ScanRun COMPLETED). BullMQ 6.2 tavsiya ogohlantirishi beradi, lekin 5.0.14 qabul qiladi.
- **Redis autostart**: schtasks admin talab qiladi → admin'siz yo'l: Startup papkasida `exabar-redis5.vbs` (`%APPDATA%\...\Startup\`) — logon'da redis5'ni yashirin (konsolsiz) 6380'da ko'taradi. Test tasdiqlangan (wscript → 6380 PONG).
- **Reports (real PDF/Excel)**: `lib/services/report.service.ts` `buildReportData` (KPI+severity+top vositalar+davr) → `lib/reports/report-pdf.tsx` (@react-pdf `renderToBuffer`) / `report-excel.ts` (exceljs 3 varaq). `report.actions.createReport` faylni `storage/reports/<id>.{pdf,xlsx}` ga yozadi + filePath. Download: `app/api/reports/[id]/route.ts` (requirePermission `reports:export`, path-traversal himoya, Content-Disposition). next.config `serverExternalPackages:[@react-pdf/renderer,exceljs]`. `storage/` gitignore'da. Test: PDF magic `%PDF`, XLSX `PK`; E2E download auth'siz→401, admin→200 application/pdf.
- **2FA**: enroll = profile.actions (otplib v12 `confirmTotpEnroll`), login = auth.ts `authorize` `totpEnabled` branch (`authenticator.verify`). E2E tasdiqlangan: to'g'ri kod→kirish, noto'g'ri/kodsiz→bloklash (Auth.js REST csrf→callback/credentials+totp).
- Seed: `npx prisma db seed` (idempotent upsert). Admin: `admin@example.uz`/`Admin@12345` (ADMIN+SPECIALIST), `specialist@`, `boshliq@` (SECTION_HEAD).
- Workers: `npm run worker` (scan + verify worker), `npm run scheduler` (repeatable: skan yak 02:00 + verification kunlik 03:00), `npm run scan:enqueue` (manual job). tsx `@/*` path'larni hal qiladi.
- Ingestion: `npm run ingest [local|all|<nomlar>]` — 7 adapter (`lib/adapters/`): LOCAL (offline), KEV/NVD/GHSA/USN/DSA (tarmoq), OSV (boyitish). Endpoint'lar: `CVE-MANBALAR.md`. Tuzoq: USN `notices.json` max limit=20 + `offset` shart; OSV proprietar CVE'larda 404 → GHSA-linked.
- **`npm run ingest:full`** (`workers/ingest-full.ts`) — TO'LIQ backfill: NVD **barcha ~355k CVE** (streaming pagination `fetchPaged`, resultsPerPage=2000+startIndex, throttle 700ms kalitli/6.5s kalitsiz, retry/backoff) + KEV to'liq + GHSA/USN/DSA/OSV + **EPSS boyitish**. REAL: jami **355,298 vuln**, EPSS 337k. `NVD_API_KEY` `.env.local`da (web) + worker uchun `$env:` orqali (dotenv faqat `.env` o'qiydi). `NVD_MAX_PAGES=N` test cheklovi.
- **CVSS fallback** (nvd.adapter `pickCvss`): v3.1→v3.0→v2 (eski CVE'lar daraja oladi). **CPE affected** (`parseAffected`): `configurations[].cpeMatch[]`→`affectedVersions={product,vendor,fixed,list[25],count}` (matching uchun + drawer "Ta'sirlangan versiyalar"). **EPSS** (`lib/services/epss.service.ts` `enrichEpss`): FIRST.org `epss_scores-current.csv.gz` (gunzip) → chunked raw `UPDATE` (faqat mavjud vuln'lar).
- **Vulnerability dedup**: `cveId @unique` upsert + `VulnerabilitySource @@unique([vulnerabilityId, source])` → bir CVE ko'p manbadan = 1 yozuv, ko'p source tag. `defined()` null bilan ustiga yozmaydi (manbalar to'ldiradi).
- **Kunlik incremental cron** (`workers/ingest.worker.ts` + `ingestQueue` + scheduler `0 1 * * *`, sinceDays=2): NVD `fetchPagedSince` (`lastModStartDate/EndDate` → faqat o'zgargan ~1234/2kun) + KEV + EPSS. Skan (yak 02:00) faqat matching, ingest EMAS — shuning uchun alohida ingest cron. Worker: scan+verify+ingest queue.
- **CVE ro'yxati server-side pagination**: `getVulnerabilitiesPage({page,q,severities,kevOnly})` (skip/take + count, `cvssV3Score desc nulls last`). 355k'ni limitsiz yuklash YO'Q. `cve-view` URL-driven (searchParams: page/q/sev/kev).
- **Matching (355k masshtab) — 2 KRITIK tuzoq**: (1) `runMatching` zaifliklarni **cursor-paginatsiya** bilan o'qiydi (`findMany take:3000, id>lastId`) — `findMany()` limitsiz = OOM (heap crash). (2) Nom mosligi `MIN_TOKEN=4` (`nameMatch`): bo'sh/qisqa product (`""`,`"i"`,`"sd"`) `includes` orqali HAMMASIGA mos kelib soxta findings beradi (My ID SDK→249 soxta). CPE parser ham `pNorm.length>=3` + escaped-colon `split(/(?<!\\):/)` bilan axlat nomni tashlaydi. Vositalar mos kelmasa findings=0 (to'g'ri).
- Verification: `npm run verify [kunlar]` (default 7) — muddati o'tgan topilmalar: hali zaif → PENDING_VERIFICATION (eskalatsiya), tuzatilgan → CLOSED. `matchPair(asset,vuln)` (matching.service) qayta ishlatiladi. Offline.
- Email: `lib/services/email.service.ts` `sendAlertEmail` — nodemailer + React Email `render` (`@react-email/components`'dan). SMTP_HOST yo'q → simulyatsiya. notification.service email yuboradi + Notification SENT/FAILED yozadi. Lokal test: `npm run mail:dev` (maildev SMTP :1025 + UI :1080) + `.env.local` SMTP_HOST=localhost SMTP_PORT=1025 (auth yo'q) → REAL yuboriladi, Notification=SENT (test tasdiqlangan: inbox'da xat).
