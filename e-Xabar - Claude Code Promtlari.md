# e-Xabar — Claude Code Promtlari (Next.js + shadcn/ui)

> UI prototip (`e-Xabar Dashboard.html`) asosida haqiqiy ilovani qurish uchun
> bosqichma-bosqich promtlar. Har bir promtni alohida sessiyada Claude Code'ga bering.
> Ma'lumot modeli uchun `e-Xabar_Development_Roadmap.md` (Prisma schema) manba bo'ladi.

## Qanday foydalanish
1. Promtlarni **ketma-ket** bering — har biri oldingisiga tayanadi.
2. Har promtdan keyin `npm run dev` bilan natijani ko'ring, keyin keyingisiga o'ting.
3. Promt formati: **KONTEKST → VAZIFA → FAYLLAR → TALABLAR → NATIJA**.
4. Dizayn manbasi: prototipdagi ekranlar (dark mode, o'zbek tili, zinc + severity ranglar).

---

## P0 — Loyiha skeleti va shadcn

```
KONTEKST: "e-Xabar" CVE monitoring tizimi UI'sini quryapman. Next.js 14
App Router, TypeScript, Tailwind, shadcn/ui (New York uslubi, zinc bazaviy rang).
Interfeys tili — o'zbek (lotin). Standart mavzu — DARK.

VAZIFA: Loyihani sozla va shadcn komponentlarini o'rnat.

FAYLLAR: package.json, tailwind.config.ts, app/globals.css, app/layout.tsx,
components/ui/* (shadcn), lib/utils.ts

TALABLAR:
- npx create-next-app + npx shadcn@latest init (zinc, CSS variables=yes)
- Komponentlar: button input label card table dialog sheet form select
  dropdown-menu badge tabs sonner avatar separator switch checkbox
  command popover skeleton tooltip progress
- Geist Sans + Geist Mono fontlari (next/font)
- next-themes bilan dark/light; <html> default class="dark"
- date-fns o'zbek locale

NATIJA: bo'sh sahifa dark mode'da ochiladi, shadcn <Button> ko'rinadi.
```

---

## P1 — Dizayn tokenlari (severity palitra)

```
KONTEKST: e-Xabar UI. Zinc bazaviy tema ustiga xavfsizlik darajalari uchun
maxsus ranglar kerak.

VAZIFA: globals.css ga severity CSS o'zgaruvchilarini qo'sh (light + dark).

FAYLLAR: app/globals.css, lib/severity.ts

TALABLAR:
- --sev-c (Critical, qizil), --sev-h (High, to'q sariq), --sev-m (Medium, sariq),
  --sev-l (Low, ko'k), --kev (binafsha). OKLCH formatida, .dark uchun yorqinroq.
- lib/severity.ts: severity enum (CRITICAL/HIGH/MEDIUM/LOW), label (uz),
  color var, cvssToSeverity(score) yordamchi.
- Badge variantlari: severity, status, kev uchun.

NATIJA: <SeverityBadge sev="CRITICAL" /> to'g'ri rangda chiqadi.
```

---

## P2 — App layout (sidebar + topbar)

```
KONTEKST: e-Xabar himoyalangan layout. Chap sidebar (3 guruh) + sticky topbar.

VAZIFA: Dashboard layout'ini qur.

FAYLLAR: app/(dashboard)/layout.tsx, components/app-sidebar.tsx,
components/app-topbar.tsx, lib/nav.ts

TALABLAR:
- Sidebar 256px, icon-collapse 64px. Brend: qalqon logosi + "e-Xabar / Kiberxavfsizlik".
- 3 nav guruh:
  Monitoring: Dashboard, Vositalar, Topilmalar(badge 342), Triage(badge 28),
    CVE bazasi
  Operatsiyalar: Skanlar, Xabarnomalar, Bostirishlar
  Tizim: Hisobotlar, Audit jurnali, Foydalanuvchilar, Sozlamalar
- Pastda foydalanuvchi (avatar + ism + rol), dropdown: Profil, Sozlamalar, Chiqish.
- Topbar: sidebar toggle, breadcrumb, qidiruv (⌘K), mavzu toggle, ogohlantirishlar
  (bell + dot), avatar menyu.
- lucide-react ikonkalar. Nav rolga qarab filtrlangan (RBAC).

NATIJA: layout barcha sahifalarda ko'rinadi, navigatsiya ishlaydi.
```

---

## P3 — Umumiy komponentlar (DataTable, Drawer, Charts)

```
KONTEKST: e-Xabar bir nechta ekranda jadval, detal paneli va diagrammalardan
foydalanadi. Ularni bir marta yozib qayta ishlatamiz.

VAZIFA: Umumiy komponentlarni qur.

FAYLLAR: components/data-table/* (@tanstack/react-table asosida),
components/detail-drawer.tsx (shadcn Sheet), components/charts/*

TALABLAR:
- DataTable: ustun bo'yicha saralash (sarlavha bosilganda), qidiruv,
  filtr chiplari (faceted), qator tanlash (checkbox), bulk action bar,
  client-side (keyin server-side'ga moslanadi).
- DetailDrawer: o'ng tomondan Sheet, sarlavha + status, scroll body, footer amallar.
- Charts (recharts): LineChart (ko'p seriya, gradient area, tooltip),
  DonutChart (legenda + markaz total). Ranglar severity tokenlardan.

NATIJA: Storybook yoki demo sahifada uch komponent ham ishlaydi.
```

---

## P4 — Dashboard

```
KONTEKST: e-Xabar boshqaruv paneli. Zaiflik holatining umumiy ko'rinishi.

VAZIFA: Dashboard sahifasini qur.

FAYLLAR: app/(dashboard)/dashboard/page.tsx, components/dashboard/*

TALABLAR:
- Davr segmenti (7/30/90 kun) + "Skan ishga tushirish" + "Eksport".
- 4 KPI Card: Jami vositalar, Aktiv topilmalar, Critical+High, KEV topilmalar.
  Har birida son + trend (yuqori=yomon qizil, pasayish=yaxshi yashil).
- 2 ustun: chapda 90-kunlik LineChart (Aktiv topilmalar + Critical/High),
  o'ngda severity DonutChart.
- Pastda: TOP-10 zaif vosita jadvali (severity mini-bar, KEV, CVSS) +
  So'nggi faoliyat ro'yxati (ikonka + matn + vaqt).

NATIJA: dashboard prototipga mos ko'rinadi, diagrammalar render bo'ladi.
```

---

## P5 — Vositalar (inventar)

```
KONTEKST: e-Xabar inventari — Asset modeli (Prisma) bilan ishlaydi.

VAZIFA: Vositalar ekranini qur.

FAYLLAR: app/(dashboard)/assets/page.tsx, components/assets/*,
lib/actions/asset.actions.ts

TALABLAR:
- DataTable: Vosita(nom+versiya+vendor), Xost/platforma, Turi, Muhit, Kritiklik,
  Topilmalar(mini-bar + KEV), Mas'ul. Toza vositada yashil "Toza" belgisi.
- Filtrlar: Turi, Kritiklik chiplari, "Internetga ochiq" toggle, qidiruv.
- Qator bosilganda DetailDrawer: metrikalar (topilma/Crit+High/KEV/maxCVSS),
  identifikatorlar (xost, OS, vendor, PURL, CPE), mas'ul xodim,
  shu vositaga tegishli topilmalar ro'yxati.
- "Vosita qo'shish" Dialog: nom, vendor, versiya, turi, platforma, xost, muhit,
  kritiklik, internetga ochiq toggle, mas'ul, PURL/CPE. Zod validatsiya.
- "JSON import" — roadmap importItemSchema bo'yicha.

NATIJA: vositalar ro'yxati, filtr, drawer, qo'shish dialogi ishlaydi.
```

---

## P6 — Topilmalar (findings)

```
KONTEKST: e-Xabar topilmalari — Finding modeli (asset × CVE moslik).

VAZIFA: Topilmalar ekranini qur.

FAYLLAR: app/(dashboard)/findings/page.tsx, components/findings/*,
lib/actions/finding.actions.ts

TALABLAR:
- DataTable: tanlash checkbox, CVE(id+title+manba teglari), Vosita, Daraja,
  CVSS, Ishonch (progress + %), Holat, Yoshi. Saralash: CVE/Daraja/CVSS/Ishonch/Yoshi.
- Filtr chiplari: Daraja (C/H/M/L), "Faqat KEV", Holat (multi dropdown).
- Bulk amallar: tanlanganda yuqorida panel — Triage / Bostirish / Xabar.
- Qator bosilganda DetailDrawer: tavsif, CVSS vektor, EPSS, ta'sirlangan vosita,
  mas'ul xodim, ishonch omillari taqsimoti (+/-), manbalar, amallar (footer).
- Status badge'lar: Yangi, Ko'rib chiqilmoqda, Tasdiqlangan, Xabar berilgan,
  Jarayonda, Tuzatilgan, Tegishli emas, Xavf qabul qilingan.

NATIJA: topilmalar jadvali, filtr, bulk, drawer to'liq ishlaydi.
```

---

## P7 — Triage (kanban)

```
KONTEKST: e-Xabar triage — past ishonchli topilmalarni qo'lda ko'rib chiqish.

VAZIFA: Triage kanban doskasini qur.

FAYLLAR: app/(dashboard)/triage/page.tsx, components/triage/*

TALABLAR:
- 5 ustun: Navbatda → Tekshirilmoqda → Tasdiqlangan → Tegishli emas →
  Xavf qabul qilingan. Har ustun: rangli nuqta + nom + hisoblagich.
- Kartalar: @dnd-kit bilan drag & drop, ustunlar orasida ko'chiriladi,
  drop zonasi yoritiladi, ko'chirilganda toast + status yangilanadi (server action).
- Karta: CVE, sarlavha, vosita, ishonch mini-bar, mas'ul (initsiallar), yoshi, KEV.
- Karta bosilganda Topilma DetailDrawer ochiladi.

NATIJA: kartalarni ustunlar orasida tortish ishlaydi, holat saqlanadi.
```

---

## P8 — CVE bazasi (read-only katalog)

```
KONTEKST: e-Xabar CVE bilim bazasi — Vulnerability modeli, 6 manbadan yig'iladi.

VAZIFA: CVE bazasi ekranini qur (read-only).

FAYLLAR: app/(dashboard)/vulnerabilities/page.tsx, components/cve/*

TALABLAR:
- DataTable: CVE(id+title), Daraja, CVSS, EPSS, Manbalar, Nashr sanasi.
  Saralash: Daraja/CVSS/EPSS/Sana. Filtr: Daraja, "Faqat KEV", qidiruv.
- Qator bosilganda DetailDrawer: metrikalar (CVSS/EPSS/CWE/ta'sir soni),
  tavsif, CVSS vektor, KEV banneri (sana), ta'sirlangan/tuzatilgan versiyalar
  (distro bo'yicha), tashqi havolalar (NVD, advisory).
- "Ta'sir" = bu CVE inventardagi nechta vositaga tegishli (Finding count).

NATIJA: CVE katalogi va boy detal paneli ishlaydi.
```

---

## P9 — Skanlar

```
KONTEKST: e-Xabar skanlari — ScanRun modeli, BullMQ worker'lar.

VAZIFA: Skanlar ekranini qur.

FAYLLAR: app/(dashboard)/scans/page.tsx, components/scans/*,
lib/actions/scan.actions.ts

TALABLAR:
- Stat strip: keyingi rejali skan, oxirgi skandagi vosita, oxirgi yangi topilma.
- "Skan ishga tushirish" — Progress bar bilan jonli holat (bajarilmoqda),
  yakunlangach jadvalga yangi qator + toast.
- Jadval: Turi (Rejali/Qo'lda/KEV ustuvor), Boshlandi, Davomiyligi, Vositalar,
  Yangi, Takroriy, Email, Holat (Yakunlandi/Bajarilmoqda/Xato). Pulse animatsiya.

NATIJA: skan tarixi + qo'lda ishga tushirish + progress ishlaydi.
```

---

## P10 — Xabarnomalar

```
KONTEKST: e-Xabar xabarnomalari — Notification modeli, yuborilgan emaillar.

VAZIFA: Xabarnomalar ekranini qur.

FAYLLAR: app/(dashboard)/notifications/page.tsx, components/notifications/*

TALABLAR:
- Stat strip: yuborilgan, tasdiqlash darajasi (%), yetkazilmagan.
- Segment filtr: Hammasi / Yuborilgan / Tasdiqlangan / Muammoli.
- Jadval: qabul qiluvchi (avatar+email), mavzu, topilma pill'lari (2C/1H),
  holat (Navbatda/Yuborilgan/Tasdiqlangan/Xato/Qaytarilgan), yuborilgan/tasdiqlangan vaqt.
- Amal: emailni ko'rish, qayta yuborish.

NATIJA: xabarnomalar tarixi va statistikasi ishlaydi.
```

---

## P11 — Bostirishlar (suppressions)

```
KONTEKST: e-Xabar bostirishlari — Suppression modeli. Har bostirishda muddat MAJBURIY.

VAZIFA: Bostirishlar ekranini qur.

FAYLLAR: app/(dashboard)/suppressions/page.tsx, components/suppressions/*,
lib/actions/suppression.actions.ts

TALABLAR:
- Stat strip: faol qoida, tez orada tugaydi, bostirilgan topilma.
- Segment filtr: Hammasi/Faol/Tez orada/Tugagan.
- Jadval: Qamrov+nishon (CVE / CVE+vosita / CVE+vendor / atribut / global),
  Sabab, Yaratgan, Amal muddati (Faol/Tez orada/Tugagan badge), Ta'sir, Holat (switch).
- "Qoida qo'shish" Dialog: Qamrov select — tanlovga qarab nishon maydonlari
  o'zgaradi (CVE-ID / vendor / vosita / atribut+qiymat), Sabab, Muddat (30/60/90/180).
  Pastda jonli preview + taxminiy ta'sir soni. Zod validatsiya.

NATIJA: bostirish qoidalari, moslashuvchan dialog, toggle ishlaydi.
```

---

## P12 — Hisobotlar

```
KONTEKST: e-Xabar hisobotlari — Report modeli, PDF/Excel generatsiya.

VAZIFA: Hisobotlar ekranini qur.

FAYLLAR: app/(dashboard)/reports/page.tsx, components/reports/*,
lib/actions/report.actions.ts

TALABLAR:
- Generator Card: tur (Haftalik/Oylik/Ad-hoc) segment, format (PDF/Excel) segment,
  qamrov select, "Hisobot yaratish" (yuklanish spinner → toast + yangi qator).
- Joriy hafta xulosasi Card: yangi/hal qilingan/KEV/email — 4 mini-stat.
- Jadval: hisobot nomi (ikon), davr, turi, format, hajmi, yaratilgan, yuklab olish.

NATIJA: hisobot generatori + ro'yxat ishlaydi.
```

---

## P13 — Audit jurnali

```
KONTEKST: e-Xabar audit — AuditLog modeli, o'zgarmas jurnal.

VAZIFA: Audit jurnali ekranini qur.

FAYLLAR: app/(dashboard)/audit-log/page.tsx, components/audit/*

TALABLAR:
- Sana bo'yicha guruhlangan tasma (timeline): ikonka (amal turi bo'yicha rangli),
  "<actor> · <amal>", detal, vaqt + IP.
- Amal turlari: LOGIN, RUN_SCAN, TRIAGE_DECISION, CREATE_SUPPRESSION,
  SEND_NOTIFICATION, IMPORT_INVENTORY, UPDATE_SETTINGS, DELETE_ASSET.
- Qidiruv + amal turi bo'yicha filtr (dropdown) + Eksport.

NATIJA: audit tasmasi, guruhlash, filtr ishlaydi.
```

---

## P14 — Foydalanuvchilar (RBAC)

```
KONTEKST: e-Xabar foydalanuvchilari — User + Role + UserRole. Admin bo'limi.
Rollar: ADMIN, SPECIALIST, SECTION_HEAD, DEPARTMENT_HEAD (bir userda bir nechta).

VAZIFA: Foydalanuvchilar ekranini qur.

FAYLLAR: app/(dashboard)/admin/users/page.tsx, components/users/*,
lib/actions/user.actions.ts

TALABLAR:
- Stat strip: jami, faol, administrator soni.
- Jadval: foydalanuvchi (avatar+email, joriyda "Siz"), rollar (rang-kodli badge'lar),
  2FA (Yoqilgan/O'chiq), holat (Faol/Nofaol), oxirgi kirish.
- Amallar: tahrirlash, rollarni boshqarish, bloklash/faollashtirish, 2FA so'rash, o'chirish.
- "Foydalanuvchi qo'shish" Dialog: ism, email, rollar (multi-select tugmalar).
- requirePermission('users:manage') bilan himoyalangan.

NATIJA: foydalanuvchilar jadvali, ko'p rol, qo'shish dialogi ishlaydi.
```

---

## P15 — Sozlamalar

```
KONTEKST: e-Xabar sozlamalari — SystemSetting (AES shifrlangan) + IntegrationHealth.

VAZIFA: Sozlamalar ekranini qur (Tabs bilan).

FAYLLAR: app/(dashboard)/admin/settings/page.tsx, components/settings/*,
lib/actions/settings.actions.ts

TALABLAR:
- Tabs: Umumiy / Skanlash / Email(SMTP) / Integratsiyalar / API kalitlari.
- Umumiy: tashkilot, til, vaqt mintaqasi, seans muddati.
- Skanlash: chastota, kun/vaqt, KEV ustuvor toggle, avto qayta tekshirish toggle.
- SMTP: host/port/user/parol/from + TLS toggle + "Test yuborish".
- Integratsiyalar: 6 manba sog'lik jadvali (Sog'lom/Sekinlashgan/Ishlamayapti) + Tekshirish.
- API kalitlari: NVD/GitHub (masked), AES-256-GCM shifrlash belgisi.

NATIJA: sozlamalar tablari, formalar, integratsiya holati ishlaydi.
```

---

## P16 — Login + 2FA

```
KONTEKST: e-Xabar autentifikatsiya — Auth.js v5, Credentials + otplib TOTP.

VAZIFA: Login sahifasini qur.

FAYLLAR: app/(auth)/login/page.tsx, components/auth/*

TALABLAR:
- Split-panel: chapda brend paneli (qalqon, tagline, xususiyatlar, grid fon),
  o'ngda forma. Mobil'da chap panel yashiriladi.
- 2 bosqich: email+parol → 6 xonali OTP (avto-o'tish, paste, Backspace nav).
- react-hook-form + Zod. Xato xabarlari o'zbek tilida.
- Muvaffaqiyatda /dashboard ga yo'naltirish.

NATIJA: login → 2FA → dashboard oqimi ishlaydi.
```

---

## P17 — Email shabloni (xabarnoma)

```
KONTEKST: e-Xabar xodimga yuboradigan zaiflik ogohlantirishi emaili.
React Email + Nodemailer.

VAZIFA: vulnerability-alert email shablonini qur.

FAYLLAR: emails/vulnerability-alert.tsx, emails/components/*

TALABLAR:
- Yorug' tema, jadval-asosli (email-safe). Brendli sarlavha (qora, qalqon).
- Shaxsiy murojaat → topilmalar xulosasi (severity chiplar) → KEV shoshilinch blok →
  har topilma kartasi (vosita+versiya, xost, CVE+severity+CVSS, tavsiya) →
  muddat ogohlantirishi (7 kun) → "Ko'rib chiqdim" CTA (ack token havolasi) → footer.
- Props: employee, findings[], ackUrl, deadline.

NATIJA: react-email preview'da email to'g'ri render bo'ladi.
```

---

## Tavsiya etilgan tartib
**P0 → P1 → P2 → P3** (asos) → keyin ekranlar **P4–P16** istalgan tartibda →
**P17** (email) oxirida. Backend (Prisma, server actions, worker'lar) uchun
roadmap'dagi Faza 1–11 promtlaridan foydalaning — bu hujjat faqat **UI** uchun.
