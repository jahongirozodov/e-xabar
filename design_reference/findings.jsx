// findings.jsx — OGOH MAI Topilmalar (findings) ekrani: data-table, filtrlar,
// saralash, bulk amallar, confidence, manba teglari + detal drawer.
const { useState: fState, useMemo: fMemo, useEffect: fEffect } = React;

const FSEV = { c: 'var(--sev-c)', h: 'var(--sev-h)', m: 'var(--sev-m)', l: 'var(--sev-l)' };
const SEV_META = {
  c: { label: 'Critical' }, h: { label: 'High' }, m: { label: 'Medium' }, l: { label: 'Low' },
};
const SEV_ORDER = { c: 4, h: 3, m: 2, l: 1 };

// status -> { label, tone }  (tone drives badge color)
const STATUS = {
  NEW:            { label: 'Yangi', tone: 'new' },
  PENDING_REVIEW: { label: "Ko'rib chiqilmoqda", tone: 'warn' },
  APPLICABLE:     { label: 'Tasdiqlangan', tone: 'crit' },
  NOTIFIED:       { label: 'Xabar berilgan', tone: 'info' },
  IN_PROGRESS:    { label: 'Jarayonda', tone: 'warn' },
  PATCHED:        { label: 'Tuzatilgan', tone: 'ok' },
  NOT_APPLICABLE: { label: 'Tegishli emas', tone: 'mute' },
  ACCEPTED_RISK:  { label: 'Xavf qabul qilingan', tone: 'mute' },
};

// ---- seed data -------------------------------------------------------------
const FINDINGS = [
  { id: 'f1', cve: 'CVE-2021-44228', title: 'Apache Log4j RCE (Log4Shell)', sev: 'c', cvss: 10.0, epss: 0.975, kev: true, sources: ['NVD', 'GHSA', 'KEV', 'OSV'], conf: 0.98, status: 'APPLICABLE', firstSeen: '2026-05-29', age: 5,
    asset: { name: 'Apache Log4j', ver: '2.14.1', host: 'SRV-APP-07', os: 'rhel 9', crit: 'high', net: true, owner: 'Anvar Karimov', email: 'a.karimov@example.uz', dept: 'IT infratuzilma' },
    vector: 'AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H', published: '2021-12-10',
    desc: 'JNDI funksiyasi orqali masofadan kod ijro etish. Hujumchi log xabariga maxsus satr yuborib, ixtiyoriy kod ishga tushira oladi.',
    factors: [['CPE/PURL aniq mos keldi', 0.4], ['Versiya diapazoni tasdiqlandi', 0.3], ['KEV ro\u2019yxatida', 0.18], ['Bir nechta manba', 0.1]] },
  { id: 'f2', cve: 'CVE-2014-0160', title: 'OpenSSL Heartbleed', sev: 'c', cvss: 9.8, epss: 0.944, kev: true, sources: ['NVD', 'KEV', 'USN'], conf: 0.96, status: 'NOTIFIED', firstSeen: '2026-05-27', age: 7,
    asset: { name: 'OpenSSL', ver: '1.1.1f', host: 'WS-IT-042', os: 'ubuntu 22.04', crit: 'high', net: true, owner: 'Dilnoza Yusupova', email: 'd.yusupova@example.uz', dept: 'Tarmoq xavfsizligi' },
    vector: 'AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N', published: '2014-04-07',
    desc: 'TLS heartbeat kengaytmasidagi bufer chiqib ketishi xotira tarkibini (kalitlar, parollar) oshkor qiladi.',
    factors: [['PURL aniq mos keldi', 0.42], ['Versiya zaif', 0.32], ['KEV ro\u2019yxatida', 0.16], ['USN tasdiqladi', 0.06]] },
  { id: 'f3', cve: 'CVE-2021-41773', title: 'Apache HTTP path traversal', sev: 'c', cvss: 9.8, epss: 0.961, kev: true, sources: ['NVD', 'KEV'], conf: 0.91, status: 'APPLICABLE', firstSeen: '2026-05-30', age: 4,
    asset: { name: 'Apache HTTP Server', ver: '2.4.49', host: 'SRV-WEB-02', os: 'debian 11', crit: 'medium', net: true, owner: 'Sardor Aliyev', email: 's.aliyev@example.uz', dept: 'Veb xizmatlar' },
    vector: 'AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H', published: '2021-10-05',
    desc: 'URL kodlash bilan path traversal — server fayllariga ruxsatsiz kirish va kod ijrosi.',
    factors: [['Versiya 2.4.49 aniq', 0.45], ['KEV ro\u2019yxatida', 0.2], ['Internetga ochiq', 0.16], ['NVD CPE mos', 0.1]] },
  { id: 'f4', cve: 'CVE-2023-38545', title: 'curl SOCKS5 heap overflow', sev: 'h', cvss: 8.8, epss: 0.42, kev: false, sources: ['NVD', 'OSV'], conf: 0.74, status: 'PENDING_REVIEW', firstSeen: '2026-05-25', age: 9,
    asset: { name: 'curl', ver: '7.68.0', host: 'WS-IT-031', os: 'ubuntu 20.04', crit: 'medium', net: false, owner: 'Nodira Rashidova', email: 'n.rashidova@example.uz', dept: 'IT infratuzilma' },
    vector: 'AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:H/A:H', published: '2023-10-11',
    desc: 'SOCKS5 proksi nomini ko\u2019chirishda heap bufer chiqib ketishi. Faqat ma\u2019lum konfiguratsiyada amal qiladi.',
    factors: [['PURL mos keldi', 0.4], ['Versiya diapazoni', 0.24], ['Konfiguratsiya noaniq', -0.1], ['OSV tasdiqladi', 0.1]] },
  { id: 'f5', cve: 'CVE-2022-0778', title: 'OpenSSL BN_mod_sqrt DoS', sev: 'h', cvss: 7.5, epss: 0.31, kev: false, sources: ['NVD', 'USN', 'OSV'], conf: 0.82, status: 'IN_PROGRESS', firstSeen: '2026-05-20', age: 14,
    asset: { name: 'OpenSSL', ver: '1.1.1f', host: 'SRV-DB-01', os: 'debian 11', crit: 'high', net: false, owner: 'Jasur Tursunov', email: 'j.tursunov@example.uz', dept: "Ma'lumotlar bazasi" },
    vector: 'AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H', published: '2022-03-15',
    desc: 'Sertifikat tahlilida cheksiz tsikl — xizmat ko\u2019rsatishdan voz kechish (DoS).',
    factors: [['PURL mos keldi', 0.4], ['Versiya zaif', 0.3], ['USN+OSV', 0.12]] },
  { id: 'f6', cve: 'CVE-2023-44487', title: 'HTTP/2 Rapid Reset', sev: 'h', cvss: 7.5, epss: 0.88, kev: true, sources: ['NVD', 'KEV', 'GHSA'], conf: 0.79, status: 'NEW', firstSeen: '2026-06-01', age: 2,
    asset: { name: 'nginx', ver: '1.18.0', host: 'SRV-WEB-05', os: 'ubuntu 22.04', crit: 'medium', net: true, owner: 'Sardor Aliyev', email: 's.aliyev@example.uz', dept: 'Veb xizmatlar' },
    vector: 'AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H', published: '2023-10-10',
    desc: 'HTTP/2 stream bekor qilish orqali DDoS hujumi. Ko\u2019plab so\u2019rovlar serverni ortiqcha yuklaydi.',
    factors: [['Versiya mos', 0.36], ['KEV ro\u2019yxatida', 0.2], ['Internetga ochiq', 0.14], ['Aniqlik o\u2019rta', 0.09]] },
  { id: 'f7', cve: 'CVE-2021-3711', title: 'OpenSSL SM2 decryption overflow', sev: 'h', cvss: 7.4, epss: 0.12, kev: false, sources: ['NVD', 'USN'], conf: 0.68, status: 'NEW', firstSeen: '2026-05-31', age: 3,
    asset: { name: 'OpenSSL', ver: '1.1.1f', host: 'WS-IT-018', os: 'ubuntu 20.04', crit: 'low', net: false, owner: 'Aziz To\u2019xtayev', email: 'a.toxtayev@example.uz', dept: 'IT infratuzilma' },
    vector: 'AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H', published: '2021-08-24',
    desc: 'SM2 shifrini ochishda bufer chiqib ketishi mumkin. Amaliy ekspluatatsiya kam uchraydi.',
    factors: [['PURL mos keldi', 0.4], ['EPSS past', -0.06], ['Versiya zaif', 0.28]] },
  { id: 'f8', cve: 'CVE-2023-4863', title: 'libwebp heap overflow', sev: 'h', cvss: 8.8, epss: 0.55, kev: true, sources: ['NVD', 'KEV', 'GHSA'], conf: 0.86, status: 'NOTIFIED', firstSeen: '2026-05-22', age: 12,
    asset: { name: 'Node.js', ver: '16.14.0', host: 'SRV-APP-11', os: 'ubuntu 22.04', crit: 'medium', net: true, owner: 'Kamola Saidova', email: 'k.saidova@example.uz', dept: 'Veb xizmatlar' },
    vector: 'AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:H/A:H', published: '2023-09-12',
    desc: 'WebP rasm dekodlashda heap chiqib ketishi. Zararli rasm orqali kod ijrosi.',
    factors: [['Bog\u2019liq kutubxona', 0.34], ['KEV ro\u2019yxatida', 0.2], ['Versiya mos', 0.22], ['GHSA', 0.1]] },
  { id: 'f9', cve: 'CVE-2020-1472', title: 'Netlogon Zerologon', sev: 'c', cvss: 10.0, epss: 0.97, kev: true, sources: ['NVD', 'KEV'], conf: 0.93, status: 'IN_PROGRESS', firstSeen: '2026-05-18', age: 16,
    asset: { name: 'Windows Server', ver: '2019', host: 'SRV-DC-01', os: 'windows', crit: 'high', net: false, owner: 'Anvar Karimov', email: 'a.karimov@example.uz', dept: 'IT infratuzilma' },
    vector: 'AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H', published: '2020-08-17',
    desc: 'Netlogon protokolidagi kriptografik kamchilik domen kontrollerini to\u2019liq egallashga imkon beradi.',
    factors: [['CPE mos keldi', 0.42], ['KEV ro\u2019yxatida', 0.2], ['Kritik aktiv', 0.2], ['NVD', 0.11]] },
  { id: 'f10', cve: 'CVE-2022-37434', title: 'zlib heap overflow', sev: 'm', cvss: 6.5, epss: 0.08, kev: false, sources: ['NVD', 'OSV'], conf: 0.61, status: 'PENDING_REVIEW', firstSeen: '2026-05-15', age: 19,
    asset: { name: 'PostgreSQL', ver: '13.4', host: 'SRV-DB-01', os: 'debian 11', crit: 'high', net: false, owner: 'Jasur Tursunov', email: 'j.tursunov@example.uz', dept: "Ma'lumotlar bazasi" },
    vector: 'AV:N/AC:H/PR:N/UI:N/S:U/C:N/I:N/A:H', published: '2022-08-05',
    desc: 'inflate() funksiyasida chegaradan tashqari o\u2019qish. Bog\u2019liqlik orqali kelgan.',
    factors: [['Bog\u2019liq kutubxona', 0.3], ['EPSS past', -0.08], ['Versiya mos', 0.25]] },
  { id: 'f11', cve: 'CVE-2023-29491', title: 'ncurses local privilege', sev: 'm', cvss: 6.5, epss: 0.04, kev: false, sources: ['NVD', 'USN'], conf: 0.58, status: 'NOT_APPLICABLE', firstSeen: '2026-05-10', age: 24,
    asset: { name: 'Python', ver: '3.8.10', host: 'WS-DEV-09', os: 'ubuntu 20.04', crit: 'low', net: false, owner: 'Bekzod Rahimov', email: 'b.rahimov@example.uz', dept: 'Dasturlash' },
    vector: 'AV:L/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H', published: '2023-04-13',
    desc: 'Muhit o\u2019zgaruvchilari orqali mahalliy imtiyozlarni oshirish. Tegishli konfiguratsiya yo\u2019q.',
    factors: [['Bog\u2019liq kutubxona', 0.3], ['Mahalliy vektor', -0.1], ['Konfiguratsiya yo\u2019q', -0.12]] },
  { id: 'f12', cve: 'CVE-2024-3094', title: 'XZ Utils backdoor', sev: 'c', cvss: 10.0, epss: 0.7, kev: true, sources: ['NVD', 'KEV', 'OSV'], conf: 0.4, status: 'PENDING_REVIEW', firstSeen: '2026-06-02', age: 1,
    asset: { name: 'xz-utils', ver: '5.4.1', host: 'SRV-APP-11', os: 'ubuntu 22.04', crit: 'medium', net: false, owner: 'Kamola Saidova', email: 'k.saidova@example.uz', dept: 'Veb xizmatlar' },
    vector: 'AV:N/AC:H/PR:N/UI:N/S:C/C:H/I:H/A:H', published: '2024-03-29',
    desc: 'Liblzma orqali kiritilgan backdoor. Versiya 5.6.x ga taalluqli — joriy versiya chegarada.',
    factors: [['Versiya chegarada', 0.1], ['Aniqlik past', -0.2], ['KEV ro\u2019yxatida', 0.2], ['Tekshirish kerak', -0.1]] },
  { id: 'f13', cve: 'CVE-2022-31676', title: 'VMware Tools local priv esc', sev: 'h', cvss: 7.0, epss: 0.06, kev: false, sources: ['NVD'], conf: 0.65, status: 'ACCEPTED_RISK', firstSeen: '2026-05-05', age: 29,
    asset: { name: 'open-vm-tools', ver: '11.3.0', host: 'SRV-APP-07', os: 'rhel 9', crit: 'medium', net: false, owner: 'Anvar Karimov', email: 'a.karimov@example.uz', dept: 'IT infratuzilma' },
    vector: 'AV:L/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H', published: '2022-08-23',
    desc: 'Mahalliy imtiyozlarni oshirish. Xavf qabul qilingan — kompensatsion nazoratlar mavjud.',
    factors: [['Versiya mos', 0.35], ['Mahalliy vektor', -0.08], ['Faqat NVD', -0.05]] },
  { id: 'f14', cve: 'CVE-2021-3156', title: 'sudo Baron Samedit', sev: 'h', cvss: 7.8, epss: 0.66, kev: true, sources: ['NVD', 'KEV', 'USN'], conf: 0.88, status: 'PATCHED', firstSeen: '2026-04-28', age: 36,
    asset: { name: 'sudo', ver: '1.8.31', host: 'WS-IT-042', os: 'ubuntu 22.04', crit: 'high', net: false, owner: 'Dilnoza Yusupova', email: 'd.yusupova@example.uz', dept: 'Tarmoq xavfsizligi' },
    vector: 'AV:L/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H', published: '2021-01-26',
    desc: 'Heap-based bufer chiqib ketishi orqali root imtiyozlarini olish. Tuzatildi va tasdiqlandi.',
    factors: [['PURL mos keldi', 0.4], ['KEV ro\u2019yxatida', 0.2], ['USN tasdiqladi', 0.18], ['Versiya zaif', 0.1]] },
];

const ALL_STATUSES = ['NEW', 'PENDING_REVIEW', 'APPLICABLE', 'NOTIFIED', 'IN_PROGRESS', 'PATCHED', 'NOT_APPLICABLE', 'ACCEPTED_RISK'];
const ALL_SEV = ['c', 'h', 'm', 'l'];

// ---- small UI bits ---------------------------------------------------------
function SevBadge({ sev }) {
  return (
    <span className="exa-sevtag" style={{ color: FSEV[sev], background: `color-mix(in oklab, ${FSEV[sev]} 16%, transparent)` }}>
      <span className="exa-sevtag__dot" style={{ background: FSEV[sev] }} />{SEV_META[sev].label}
    </span>
  );
}
function StatusBadge({ status }) {
  const s = STATUS[status];
  return <span className={'exa-status exa-status--' + s.tone}>{s.label}</span>;
}
function SourceTags({ sources }) {
  return (
    <div className="exa-srcs">
      {sources.map(s => <span key={s} className={'exa-src' + (s === 'KEV' ? ' exa-src--kev' : '')}>{s}</span>)}
    </div>
  );
}
function Confidence({ v }) {
  const pct = Math.round(v * 100);
  const tone = v >= 0.85 ? 'ok' : v >= 0.6 ? 'warn' : 'low';
  return (
    <div className="exa-conf" title={'Ishonch darajasi: ' + pct + '%'}>
      <div className="exa-conf__track"><span className={'exa-conf__fill exa-conf__fill--' + tone} style={{ width: pct + '%' }} /></div>
      <span className="exa-conf__pct">{pct}%</span>
    </div>
  );
}
function SortHead({ label, k, sort, setSort, align }) {
  const active = sort.k === k;
  return (
    <th style={{ textAlign: align || 'left', cursor: 'pointer', userSelect: 'none' }}
      onClick={() => setSort(s => ({ k, dir: s.k === k && s.dir === 'desc' ? 'asc' : 'desc' }))}>
      <span className="exa-sorth" style={{ justifyContent: align === 'right' ? 'flex-end' : 'flex-start' }}>
        {label}
        <Icon name="chevron-down" size={13} className={'exa-sorth__ic' + (active ? ' is-active' : '') + (active && sort.dir === 'asc' ? ' is-asc' : '')} />
      </span>
    </th>
  );
}

// ---- detail drawer ---------------------------------------------------------
function Drawer({ f, onClose, toast }) {
  fEffect(() => {
    if (!f) return;
    const onKey = e => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [f, onClose]);
  if (!f) return null;
  const act = (msg, variant) => { toast({ title: msg.t, desc: msg.d, variant }); onClose(); };
  return (
    <div className="exa-drawer-overlay" onMouseDown={onClose}>
      <aside className="exa-drawer" onMouseDown={e => e.stopPropagation()}>
        <div className="exa-drawer__head">
          <div className="exa-drawer__titlewrap">
            <div className="exa-drawer__cve">{f.cve}{f.kev && <span className="exa-kev">KEV</span>}</div>
            <div className="exa-drawer__title">{f.title}</div>
          </div>
          <button className="ui-btn ui-btn--ghost ui-btn--icon" onClick={onClose} aria-label="Yopish"><Icon name="x" size={18} /></button>
        </div>

        <div className="exa-drawer__sub">
          <SevBadge sev={f.sev} />
          <StatusBadge status={f.status} />
          <SourceTags sources={f.sources} />
        </div>

        <div className="exa-drawer__body">
          {/* metric strip */}
          <div className="exa-metrics">
            <div className="exa-metric"><div className="exa-metric__k">CVSS</div><div className="exa-metric__v" style={{ color: FSEV[f.sev] }}>{f.cvss.toFixed(1)}</div></div>
            <div className="exa-metric"><div className="exa-metric__k">EPSS</div><div className="exa-metric__v">{Math.round(f.epss * 100)}%</div></div>
            <div className="exa-metric"><div className="exa-metric__k">Yoshi</div><div className="exa-metric__v">{f.age} kun</div></div>
            <div className="exa-metric"><div className="exa-metric__k">Ishonch</div><div className="exa-metric__v">{Math.round(f.conf * 100)}%</div></div>
          </div>

          <section className="exa-sec">
            <div className="exa-sec__t">Tavsif</div>
            <p className="exa-desc">{f.desc}</p>
            <div className="exa-vector"><Icon name="bug" size={13} /> {f.vector}</div>
            <div className="exa-meta-line">Nashr qilingan: {f.published}</div>
          </section>

          <section className="exa-sec">
            <div className="exa-sec__t">Ta'sirlangan vosita</div>
            <div className="exa-kv">
              <div className="exa-kv__row"><span>Vosita</span><b>{f.asset.name} <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 500, color: 'var(--muted-foreground)' }}>{f.asset.ver}</span></b></div>
              <div className="exa-kv__row"><span>Xost</span><b style={{ fontFamily: 'var(--font-mono)' }}>{f.asset.host}</b></div>
              <div className="exa-kv__row"><span>Platforma</span><b style={{ fontFamily: 'var(--font-mono)' }}>{f.asset.os}</b></div>
              <div className="exa-kv__row"><span>Kritiklik</span><b style={{ textTransform: 'capitalize' }}>{f.asset.crit}</b></div>
              <div className="exa-kv__row"><span>Internetga ochiq</span><b>{f.asset.net ? 'Ha' : "Yo'q"}</b></div>
            </div>
          </section>

          <section className="exa-sec">
            <div className="exa-sec__t">Mas'ul xodim</div>
            <div className="exa-owner">
              <Avatar initials={f.asset.owner.split(' ').map(s => s[0]).join('').slice(0, 2)} />
              <div><div className="exa-owner__n">{f.asset.owner}</div><div className="exa-owner__m">{f.asset.email} · {f.asset.dept}</div></div>
            </div>
          </section>

          <section className="exa-sec">
            <div className="exa-sec__t">Ishonch darajasi <span className="exa-sec__badge">{Math.round(f.conf * 100)}%</span></div>
            <div className="exa-conf exa-conf--lg"><div className="exa-conf__track"><span className={'exa-conf__fill exa-conf__fill--' + (f.conf >= 0.85 ? 'ok' : f.conf >= 0.6 ? 'warn' : 'low')} style={{ width: Math.round(f.conf * 100) + '%' }} /></div></div>
            <div className="exa-factors">
              {f.factors.map(([name, w], i) => (
                <div className="exa-factor" key={i}>
                  <span className={'exa-factor__w' + (w < 0 ? ' is-neg' : '')}>{w > 0 ? '+' : ''}{Math.round(w * 100)}</span>
                  <span className="exa-factor__n">{name}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="exa-drawer__foot">
          <Button variant="outline" size="sm" onClick={() => act({ t: 'Bostirildi', d: f.cve + ' bostirish ro\u2019yxatiga qo\u2019shildi.' })}><Icon name="ban" size={15} /> Bostirish</Button>
          <Button variant="outline" size="sm" onClick={() => act({ t: 'Xabarnoma yuborildi', d: f.asset.owner + ' ga email jo\u2019natildi.' })}><Icon name="mail" size={15} /> Xabar</Button>
          <Button variant="primary" size="sm" onClick={() => act({ t: 'Triage qilindi', d: f.cve + ' — Tasdiqlangan deb belgilandi.' })}><Icon name="list-checks" size={15} /> Triage</Button>
        </div>
      </aside>
    </div>
  );
}

// ---- main screen -----------------------------------------------------------
function Findings({ toast }) {
  const [q, setQ] = fState('');
  const [sevF, setSevF] = fState(new Set());
  const [statusF, setStatusF] = fState(new Set());
  const [kevOnly, setKevOnly] = fState(false);
  const [sort, setSort] = fState({ k: 'cvss', dir: 'desc' });
  const [sel, setSel] = fState(new Set());
  const [open, setOpen] = fState(null);

  const toggle = (set, setter, v) => {
    const n = new Set(set); n.has(v) ? n.delete(v) : n.add(v); setter(n);
  };

  const rows = fMemo(() => {
    let r = FINDINGS.filter(f => {
      if (sevF.size && !sevF.has(f.sev)) return false;
      if (statusF.size && !statusF.has(f.status)) return false;
      if (kevOnly && !f.kev) return false;
      if (q) {
        const s = (f.cve + ' ' + f.title + ' ' + f.asset.name + ' ' + f.asset.host + ' ' + f.asset.owner).toLowerCase();
        if (!s.includes(q.toLowerCase())) return false;
      }
      return true;
    });
    const dir = sort.dir === 'asc' ? 1 : -1;
    r = [...r].sort((a, b) => {
      let av, bv;
      if (sort.k === 'sev') { av = SEV_ORDER[a.sev]; bv = SEV_ORDER[b.sev]; }
      else if (sort.k === 'cvss') { av = a.cvss; bv = b.cvss; }
      else if (sort.k === 'conf') { av = a.conf; bv = b.conf; }
      else if (sort.k === 'age') { av = a.age; bv = b.age; }
      else if (sort.k === 'cve') { av = a.cve; bv = b.cve; return av.localeCompare(bv) * dir; }
      return (av - bv) * dir;
    });
    return r;
  }, [q, sevF, statusF, kevOnly, sort]);

  const allSel = rows.length > 0 && rows.every(r => sel.has(r.id));
  const someSel = sel.size > 0;
  function toggleAll() {
    if (allSel) setSel(new Set());
    else setSel(new Set(rows.map(r => r.id)));
  }
  function bulk(label, variant) {
    toast({ title: label, desc: sel.size + ' ta topilma uchun bajarildi.', variant });
    setSel(new Set());
  }
  const activeFilters = sevF.size + statusF.size + (kevOnly ? 1 : 0);

  return (
    <div className="ds-stack">
      {/* toolbar */}
      <div className="exa-toolbar">
        <div className="ds-search ds-search--inline">
          <Icon name="search" size={15} style={{ color: 'var(--muted-foreground)' }} />
          <input placeholder="CVE, vosita, xost yoki xodim..." value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <div className="exa-toolbar__right">
          {activeFilters > 0 && (
            <button className="exa-clear" onClick={() => { setSevF(new Set()); setStatusF(new Set()); setKevOnly(false); }}>
              <Icon name="x" size={13} /> Filtrni tozalash ({activeFilters})
            </button>
          )}
          <Button variant="outline" size="sm"><Icon name="download" size={15} /> Eksport</Button>
        </div>
      </div>

      {/* filter chips */}
      <div className="exa-filterbar">
        <span className="exa-filterbar__lbl">Daraja</span>
        {ALL_SEV.map(s => (
          <button key={s} className={'exa-chip' + (sevF.has(s) ? ' is-active' : '')} onClick={() => toggle(sevF, setSevF, s)}
            style={sevF.has(s) ? { borderColor: FSEV[s], color: FSEV[s], background: `color-mix(in oklab, ${FSEV[s]} 14%, transparent)` } : {}}>
            <span className="exa-chip__dot" style={{ background: FSEV[s] }} />{SEV_META[s].label}
          </button>
        ))}
        <span className="exa-filterbar__sep" />
        <button className={'exa-chip exa-chip--kev' + (kevOnly ? ' is-active' : '')} onClick={() => setKevOnly(v => !v)}>
          <Icon name="shield-alert" size={13} /> Faqat KEV
        </button>
        <span className="exa-filterbar__sep" />
        <span className="exa-filterbar__lbl">Holat</span>
        <Menu align="start" trigger={
          <button className={'exa-chip' + (statusF.size ? ' is-active' : '')}>
            <Icon name="filter" size={13} /> Holat{statusF.size ? ` (${statusF.size})` : ''} <Icon name="chevron-down" size={12} />
          </button>
        }>
          {ALL_STATUSES.map(s => (
            <MenuItem key={s} onClick={() => toggle(statusF, setStatusF, s)}>
              <span className="exa-check">{statusF.has(s) && <Icon name="check" size={13} />}</span>
              <StatusBadge status={s} />
            </MenuItem>
          ))}
        </Menu>
      </div>

      {/* table */}
      <Card style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
        {someSel && (
          <div className="exa-bulk">
            <span className="exa-bulk__count"><b>{sel.size}</b> tanlandi</span>
            <div className="exa-bulk__actions">
              <Button variant="outline" size="sm" onClick={() => bulk('Triage qilindi')}><Icon name="list-checks" size={15} /> Triage</Button>
              <Button variant="outline" size="sm" onClick={() => bulk('Bostirildi')}><Icon name="ban" size={15} /> Bostirish</Button>
              <Button variant="outline" size="sm" onClick={() => bulk('Xabarnoma yuborildi')}><Icon name="mail" size={15} /> Xabar</Button>
            </div>
            <button className="exa-bulk__x" onClick={() => setSel(new Set())}><Icon name="x" size={15} /></button>
          </div>
        )}
        <table className="ui-table exa-table exa-ftable">
          <thead>
            <tr>
              <th style={{ width: 32 }}><input type="checkbox" className="ui-checkbox" checked={allSel} onChange={toggleAll} /></th>
              <SortHead label="CVE / Topilma" k="cve" sort={sort} setSort={setSort} />
              <th>Vosita</th>
              <SortHead label="Daraja" k="sev" sort={sort} setSort={setSort} />
              <SortHead label="CVSS" k="cvss" sort={sort} setSort={setSort} align="right" />
              <SortHead label="Ishonch" k="conf" sort={sort} setSort={setSort} />
              <th>Holat</th>
              <SortHead label="Yoshi" k="age" sort={sort} setSort={setSort} align="right" />
              <th style={{ width: 36 }}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(f => (
              <tr key={f.id} className={'exa-frow' + (sel.has(f.id) ? ' is-sel' : '')} onClick={() => setOpen(f)}>
                <td onClick={e => e.stopPropagation()}>
                  <input type="checkbox" className="ui-checkbox" checked={sel.has(f.id)} onChange={() => toggle(sel, setSel, f.id)} />
                </td>
                <td>
                  <div className="exa-cve">
                    <span className="exa-cve__id">{f.cve}{f.kev && <span className="exa-kev">KEV</span>}</span>
                    <span className="exa-cve__title">{f.title}</span>
                    <SourceTags sources={f.sources} />
                  </div>
                </td>
                <td>
                  <div className="exa-fasset">
                    <span className="exa-fasset__n">{f.asset.name} <span className="exa-asset__ver">{f.asset.ver}</span></span>
                    <span className="exa-fasset__h">{f.asset.host} · {f.asset.os}</span>
                  </div>
                </td>
                <td><SevBadge sev={f.sev} /></td>
                <td className="exa-cvss" style={{ color: FSEV[f.sev] }}>{f.cvss.toFixed(1)}</td>
                <td style={{ minWidth: 110 }}><Confidence v={f.conf} /></td>
                <td><StatusBadge status={f.status} /></td>
                <td style={{ textAlign: 'right', color: 'var(--muted-foreground)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{f.age} kun</td>
                <td onClick={e => e.stopPropagation()}>
                  <Menu trigger={<button className="ui-btn ui-btn--ghost ui-btn--icon" style={{ height: 30, width: 30 }}><Icon name="more-horizontal" size={16} /></button>}>
                    <MenuItem onClick={() => setOpen(f)}><Icon name="eye" size={15} /> Batafsil</MenuItem>
                    <MenuItem onClick={() => toast({ title: 'Triage qilindi', desc: f.cve + ' belgilandi.' })}><Icon name="list-checks" size={15} /> Triage</MenuItem>
                    <MenuItem onClick={() => toast({ title: 'Xabarnoma yuborildi', desc: f.asset.owner + ' ga jo\u2019natildi.' })}><Icon name="mail" size={15} /> Xabar yuborish</MenuItem>
                    <div className="ds-sep-line" />
                    <MenuItem danger onClick={() => toast({ title: 'Bostirildi', desc: f.cve + ' bostirildi.', variant: 'destructive' })}><Icon name="ban" size={15} /> Bostirish</MenuItem>
                  </Menu>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan="9" style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted-foreground)' }}>Hech narsa topilmadi.</td></tr>
            )}
          </tbody>
        </table>
      </Card>
      <div className="ds-table-foot">{rows.length} ta topilma · {FINDINGS.filter(f => f.kev).length} KEV · {FINDINGS.filter(f => f.sev === 'c').length} critical</div>

      <Drawer f={open} onClose={() => setOpen(null)} toast={toast} />
    </div>
  );
}

window.Findings = Findings;
// reuse across screens (triage)
Object.assign(window, { ExaFINDINGS: FINDINGS, ExaSevBadge: SevBadge, ExaConfidence: Confidence, ExaSourceTags: SourceTags, ExaStatusBadge: StatusBadge, ExaDrawer: Drawer, ExaSTATUS: STATUS });
