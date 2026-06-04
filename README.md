# Handoff: e-Xabar — Next.js + shadcn/ui + Backend

> Bu paket **dizayn manbasidir** — `HTML/React` prototipi e-Xabar CVE monitoring
> tizimining koʻrinishi va xulq-atvorini koʻrsatadi. Vazifa — shu dizaynni
> **haqiqiy Next.js 14 (App Router) + TypeScript + shadcn/ui** kod bazasida,
> backend bilan birga qayta qurish. Prototip kodini toʻgʻridan-toʻgʻri koʻchirib
> oʻtkazmang — uni manba sifatida ishlatib, quyidagi stack'da idiomatik qayta yozing.

---

## 1. Umumiy maʼlumot (Overview)

**e-Xabar** — tashkilot xodimlari foydalanadigan dasturiy taʼminotdagi zaifliklarni
(CVE) avtomatik aniqlaydigan va tegishli xodimlarga email orqali xabar beradigan
ichki (internal) kiberxavfsizlik tizimi.

Asosiy ish jarayoni:
```
Inventar (xodim + vositalar) → 6 manbadan CVE yigʻish → vosita↔CVE moslashtirish
→ confidence score → yuqori ishonch: email; past ishonch: triage queue
→ xodim patch qiladi → 7 kundan keyin avtomatik qayta tekshirish
```

Interfeys tili: **oʻzbek (lotin)**. Standart mavzu: **DARK**.

---

## 2. Fidelity: **High-fidelity (hifi)**

Prototip — yakuniy ranglar, tipografiya, masofalar va interaksiyalar bilan
piksel-darajadagi maketdir. UI'ni shadcn/ui komponentlari va quyidagi tokenlar
bilan **aynan** qayta yarating. Mock maʼlumotlar (sonlar, ismlar) — namuna; ularni
haqiqiy backend bilan almashtiring.

---

## 3. Texnologik stack (manba: Roadmap §2)

| Qatlam | Texnologiya |
|---|---|
| Framework | **Next.js 14 (App Router)** — UI + backend bitta loyihada |
| Til | **TypeScript** |
| UI | **shadcn/ui** (New York uslubi) + **Tailwind** |
| ORM / DB | **Prisma** + **PostgreSQL 15** |
| Cache / Queue | **Redis 7** + **BullMQ** (3 process: web, workers, scheduler) |
| Auth / 2FA | **Auth.js v5 (NextAuth)** + **otplib** (TOTP) |
| Jadvallar | **@tanstack/react-table** (server-side) |
| Forms | **react-hook-form + Zod** |
| Charts | **Recharts** |
| Email | **Nodemailer + React Email** |
| Hisobot | **@react-pdf/renderer** (PDF) + **exceljs** (Excel) |
| Process mgr | **PM2** |

> **Diqqat:** prototip ranglar uchun zinc bazaviy temaga `--sev-*` (severity)
> tokenlarini qoʻshadi. shadcn init'da zinc bazasini tanlang, soʻng severity
> tokenlarini `globals.css`ga qoʻshing (§7 ga qarang).

---

## 4. Ekranlar (Screens)

App-shell: chap **sidebar** (256px, icon-collapse 64px) + sticky **topbar** (56px)
+ scroll qiluvchi content. Sidebar 3 nav-guruhga boʻlinadi. RBAC: nav rolga qarab
filtrlanadi (Section/Department-Head faqat Dashboardni koʻradi).

| # | Ekran (route) | Maqsad | Asosiy komponentlar |
|---|---|---|---|
| 1 | **Dashboard** `/dashboard` | Zaiflik holatining umumiy koʻrinishi | 4 KPI Card (son+trend), 90-kunlik LineChart, severity DonutChart, TOP-10 zaif vosita jadvali, soʻnggi faoliyat tasmasi |
| 2 | **Vositalar** `/assets` | Inventar — Asset modeli | DataTable (mini-bar+KEV), filtr chiplari, DetailDrawer, "Vosita qoʻshish" Dialog, JSON import |
| 3 | **Topilmalar** `/findings` | asset×CVE topilmalari | DataTable (tanlash, CVSS, confidence progress), bulk-action panel, DetailDrawer (CVSS vektor, EPSS, confidence omillari) |
| 4 | **Triage** `/triage` | past-ishonchli topilmalar | 5-ustunli **kanban** (@dnd-kit drag&drop), karta→DetailDrawer, holat oʻzgarganda toast |
| 5 | **CVE bazasi** `/vulnerabilities` | read-only katalog | DataTable (EPSS, manbalar), DetailDrawer (KEV banner, taʼsirlangan versiyalar, NVD havolalar) |
| 6 | **Skanlar** `/scans` | skan tarixi + qoʻlda trigger | stat strip, jonli Progress bar, jadval (pulse animatsiya) |
| 7 | **Xabarnomalar** `/notifications` | yuborilgan emaillar | stat strip, segment filtr, jadval (qabul qiluvchi+holat), emailni koʻrish |
| 8 | **Bostirishlar** `/suppressions` | suppression qoidalari | stat strip, jadval (muddat badge, holat switch), moslashuvchan "Qoida qoʻshish" Dialog + jonli preview |
| 9 | **Hisobotlar** `/reports` | PDF/Excel generatsiya | generator Card (tur+format segment), joriy hafta xulosasi, jadval (yuklab olish) |
| 10 | **Audit jurnali** `/audit-log` | oʻzgarmas jurnal | sana boʻyicha guruhlangan timeline, amal turi filtr, eksport |
| 11 | **Foydalanuvchilar** `/admin/users` | RBAC admin | stat strip, jadval (koʻp rol badge, 2FA, holat), "Foydalanuvchi qoʻshish" Dialog |
| 12 | **Sozlamalar** `/admin/settings` | tizim sozlamalari | Tabs: Umumiy/Skanlash/SMTP/Integratsiyalar/API kalitlari |
| 13 | **Profil** `/profile` | hisob + xavfsizlik | sarlavha kartasi, Tabs: Hisob (forma) / Xavfsizlik (parol+2FA TOTP) / Seanslar (jadval) |
| 14 | **Login + 2FA** `/login` | autentifikatsiya | split-panel, 2 bosqich: email+parol → 6-xonali OTP (avto-oʻtish, paste, Backspace nav) |
| 15 | **Email shabloni** | xodimga zaiflik ogohlantirishi | React Email, jadval-asosli, yorugʻ tema, brendli sarlavha, KEV blok, ack CTA |

Har ekranning aniq layout va xulqi UI promtlarida (P0–P17) batafsil; manba fayllar §8.

---

## 5. Dizayn tokenlari (Design Tokens)

### Baza (shadcn zinc)
- **Bazaviy palitra:** zinc (sovuqroq kulrang). Asosiy aksent: oq/qora (light: qora, dark: oq).
- **Radius:** `--radius: 0.625rem` (10px). Hosilalar: sm 6 / md 8 / lg 10 / xl 14px.
  Tugma/input = md (8px), karta = xl (14px), badge/avatar = toʻliq dumaloq.
- **Shriftlar:** Geist Sans (UI) + Geist Mono (sonlar, CVE-ID, versiya, IP) — `next/font`.
- **UI body:** 14px (`text-sm`). Sarlavhalar: weight 600–700, `letter-spacing: -0.025em`.
- **Border:** 1px hairline `--border`. Soyalar juda nozik (`shadow-sm` kartada, `shadow-lg` faqat dialog/menu/toast).
- **Rang maydoni:** OKLCH. Gradient yoʻq.

### Severity tokenlari (zinc ustiga qoʻshiladi) — `globals.css`
```css
:root {
  --sev-c: oklch(0.58 0.22 25);   /* Critical — qizil */
  --sev-h: oklch(0.66 0.17 52);   /* High — toʻq sariq */
  --sev-m: oklch(0.76 0.14 82);   /* Medium — sariq */
  --sev-l: oklch(0.60 0.12 230);  /* Low — koʻk */
  --kev:   oklch(0.55 0.24 300);  /* KEV — binafsha */
}
.dark {
  --sev-c: oklch(0.68 0.20 25);
  --sev-h: oklch(0.75 0.16 58);
  --sev-m: oklch(0.83 0.15 86);
  --sev-l: oklch(0.71 0.13 232);
  --kev:   oklch(0.67 0.24 300);
}
/* success/yashil (mockda inline): light oklch(0.62 0.15 155), dark oklch(0.64 0.15 155) */
```
- **Severity → label (uz):** CRITICAL=Kritik, HIGH=Yuqori, MEDIUM=Oʻrta, LOW=Past.
- **Badge fonlari** `color-mix(in oklab, var(--sev-x) 14–16%, transparent)` bilan yarim shaffof.
- **Trend:** yuqoriga = **yomon** (qizil `--sev-c`), pasayish = **yaxshi** (yashil). Bu xavfsizlik konteksti — odatdagi teskari.

### Masofa
4px grid (Tailwind). Karta padding 24px (compact: 16px). Boʻlimlar orasi 20px (`gap: 1.25rem`).

---

## 6. Kontent qoidalari (Copy)

- **Til:** oʻzbek (lotin), turlangan apostrof `ʻ` (oʻ, gʻ). Sentence case (Title Case EMAS).
- **Ohang:** toʻgʻridan-toʻgʻri, neytral, professional. Undov belgisi va emoji yoʻq.
- **Sonlar:** Geist Mono, tabular. CVSS 2 kasr (`7.5`), confidence `%`.
- **Glossariy:** Faol=Active · Holat=Status · Daraja=Severity · Topilma=Finding ·
  Vosita=Asset · Bostirish=Suppression · Skan=Scan · Xodim=Employee (passiv).

---

## 7. Backend (Data model + API + Jobs)

Toʻliq spetsifikatsiya: **`e-Xabar_Development_Roadmap.md`** (Faza 0–12, Prisma schema,
server actions, BullMQ worker'lar, env). Qisqacha:

### Maʼlumot modeli (Prisma — Roadmap §1.1)
`User`, `Role`, `UserRole` (koʻp rol/user) · `Employee` (passiv, login qilmaydi) ·
`Asset`, `AssetAttribute`, `EmployeeAsset` · `Vulnerability`, `VulnerabilitySource` ·
`Finding` (asset×CVE, confidence+status) · `Suppression` (muddat MAJBURIY) ·
`ScanRun` · `Notification`, `NotificationFinding` · `AuditLog` · `VendorFpStat` ·
`SystemSetting` (AES-256-GCM shifrlangan) · `IntegrationHealth`.

Enumlar: `Severity`, `FindingStatus`, `SuppressionScope`, `ScanType`/`ScanStatus`,
`NotificationStatus`, `RoleName` (ADMIN/SPECIALIST/SECTION_HEAD/DEPARTMENT_HEAD).

### Rollar (RBAC)
| Rol | Huquq |
|---|---|
| Specialist | barcha operatsion ish |
| Admin | foydalanuvchilar + global sozlamalar (SMTP, API key) |
| Section-Head / Department-Head | faqat Dashboard (read-only) |

Server action'larni `requirePermission('...')` bilan himoyalang.

### Background jobs (BullMQ — Roadmap Faza 3,4,7,8)
- **Ingestion:** 6 manba — NVD, OSV, GHSA, KEV (CISA), USN (Ubuntu), DSA (Debian).
- **Matching engine:** vosita ↔ CVE (PURL/CPE/vendor+versiya) → Finding.
- **Confidence scoring:** false-positive kamaytirish (`VendorFpStat` boʻyicha).
- **Notification:** yuqori-ishonchli findinglar → email (React Email + Nodemailer).
- **Verification:** patchdan 7 kun keyin avtomatik qayta tekshirish (repeatable job).

### JSON import formati
Inventar `{ employee, system, tools[] }` koʻrinishida import qilinadi — namuna
Roadmap §1'da. Zod (`importItemSchema`) bilan validatsiya.

### Env (Roadmap §7)
`DATABASE_URL`, `REDIS_URL`, `AUTH_SECRET`, `AUTH_URL`, `ENCRYPTION_KEY` (32-bayt hex),
`NVD_API_KEY`, `GITHUB_TOKEN`, `SMTP_*`. Dev uchun Postgres+Redis `docker-compose.yml`.

---

## 8. Qurish tartibi va manba fayllar

### Tavsiya etilgan tartib
1. **Backend asos** — Roadmap **Faza 0 → 1** (setup, Prisma schema, migration, Auth.js+2FA, RBAC seed).
2. **UI skeleti** — UI promtlari **P0 → P3** (loyiha+shadcn, severity tokenlar, app-layout, umumiy DataTable/Drawer/Charts).
3. **Ekranlar** — har ekran uchun: backend fazasini (Roadmap) + UI promtini (P-raqam) juftlab bering.
   Masalan Vositalar = Roadmap Faza 2 + UI P5; Topilmalar = Faza 4 + P6; h.k.
4. **Operatsion fazalar** — ingestion (Faza 3), matching (4), FP (5), triage (6), notification (7), jobs (8).
5. **Dashboard/Reports (9), Admin (10), Audit (11)** → **Testing/Deploy (12)**.

### Paketdagi fayllar
| Fayl | Nima |
|---|---|
| `e-Xabar - Claude Code Promtlari.md` | **UI promtlari P0–P17** — har ekranni shadcn'da qurish uchun tayyor promtlar |
| `e-Xabar_Development_Roadmap.md` | **Backend roadmap** — Prisma schema, server actions, BullMQ, env, Faza 0–12 |
| `design_reference/e-Xabar Dashboard.html` | Asosiy prototip (13 ekran, dark/light, Tweaks) — brauzerda oching |
| `design_reference/e-Xabar Login.html` | Login + 2FA prototip |
| `design_reference/e-Xabar Email.html` | Email shabloni prototip |
| `design_reference/*.jsx` | Ekran komponentlarining manba kodi (React) — layout va xulq uchun aniq manba |
| `design_reference/*.css` | `colors_and_type.css`, `components.css`, `app.css` — aniq tokenlar va komponent stillari |

> `*.jsx` fayllar — shadcn/ui'siz, vanilla CSS ustidagi kosmetik React. Ularni
> koʻchirmang; layout, masofa, copy va xulqni oʻqib, shadcn komponentlarida qayta yozing.

---

## 9. Eslatmalar
- Prototip standalone HTML faylida ham mavjud (offline) — lekin u dizayn referensi, ishlab chiqarish kodi emas.
- Ikonkalar: **Lucide** (`lucide-react`). Prototipda inline SVG; production'da named import.
- "Chiqish" va sahifalararo navigatsiya prototipda soddalashtirilgan — production'da Auth.js session + App Router.
- Agar biror oʻlcham/rang/copy noaniq boʻlsa, `design_reference/`dagi tegishli `.jsx`/`.css` faylni manba sifatida oching.
