// cve.jsx — CVE bazasi (vulnerabilities knowledge base, read-only).
const { useState: cvState, useMemo: cvMemo, useEffect: cvEffect } = React;

const CSEV = { c: 'var(--sev-c)', h: 'var(--sev-h)', m: 'var(--sev-m)', l: 'var(--sev-l)' };
const CSEV_LABEL = { c: 'Critical', h: 'High', m: 'Medium', l: 'Low' };
const CSEV_ORDER = { c: 4, h: 3, m: 2, l: 1 };

const CVE_DB = [
  { cve: 'CVE-2024-3094', title: 'XZ Utils orqa eshigi (backdoor)', sev: 'c', cvss: 10.0, epss: 0.70, kev: true, kevDate: '2024-03-29', sources: ['NVD', 'KEV', 'OSV', 'GHSA'], published: '2024-03-29', modified: '2026-04-12', cwe: 'CWE-506', vector: 'AV:N/AC:H/PR:N/UI:N/S:C/C:H/I:H/A:H', affected: 'xz 5.6.0 – 5.6.1', patched: [['debian', '5.6.1+really5.4.5'], ['fedora', '5.4.6']], desc: 'liblzma kutubxonasiga kiritilgan zararli kod SSH autentifikatsiyasini chetlab o\u2019tish imkonini beradi. Yetkazib berish zanjiriga (supply chain) hujum.', refs: [['NVD detali', 'https://nvd.nist.gov/vuln/detail/CVE-2024-3094'], ['CISA KEV', 'https://www.cisa.gov/known-exploited-vulnerabilities-catalog']] },
  { cve: 'CVE-2021-44228', title: 'Apache Log4j masofadan kod ijrosi (Log4Shell)', sev: 'c', cvss: 10.0, epss: 0.975, kev: true, kevDate: '2021-12-10', sources: ['NVD', 'KEV', 'OSV', 'GHSA'], published: '2021-12-10', modified: '2025-11-20', cwe: 'CWE-502', vector: 'AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H', affected: 'log4j-core 2.0-beta9 – 2.14.1', patched: [['maven', '2.17.1']], desc: 'JNDI lookup orqali hujumchi log xabariga maxsus satr yuborib, ixtiyoriy masofaviy kod ijro etadi. Eng keng tarqalgan kritik zaifliklardan biri.', refs: [['NVD detali', 'https://nvd.nist.gov/vuln/detail/CVE-2021-44228'], ['Apache advisory', 'https://logging.apache.org/log4j/2.x/security.html']] },
  { cve: 'CVE-2020-1472', title: 'Netlogon imtiyoz oshirish (Zerologon)', sev: 'c', cvss: 10.0, epss: 0.97, kev: true, kevDate: '2021-11-03', sources: ['NVD', 'KEV'], published: '2020-08-17', modified: '2025-07-02', cwe: 'CWE-330', vector: 'AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H', affected: 'Windows Server 2008–2019', patched: [['windows', 'KB4565349 (2020-08)']], desc: 'Netlogon protokolidagi kriptografik kamchilik hujumchiga autentifikatsiyasiz domen administratori huquqlarini olish imkonini beradi.', refs: [['NVD detali', 'https://nvd.nist.gov/vuln/detail/CVE-2020-1472']] },
  { cve: 'CVE-2021-41773', title: 'Apache HTTP path traversal', sev: 'c', cvss: 9.8, epss: 0.961, kev: true, kevDate: '2021-11-03', sources: ['NVD', 'KEV'], published: '2021-10-05', modified: '2024-09-18', cwe: 'CWE-22', vector: 'AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H', affected: 'httpd 2.4.49', patched: [['debian', '2.4.51'], ['rhel', '2.4.51']], desc: 'URL kodlangan path traversal orqali server fayllariga ruxsatsiz kirish va, CGI yoqilgan bo\u2019lsa, masofaviy kod ijrosi.', refs: [['NVD detali', 'https://nvd.nist.gov/vuln/detail/CVE-2021-41773']] },
  { cve: 'CVE-2014-0160', title: 'OpenSSL Heartbleed', sev: 'c', cvss: 9.8, epss: 0.944, kev: true, kevDate: '2022-05-04', sources: ['NVD', 'KEV', 'USN'], published: '2014-04-07', modified: '2023-11-09', cwe: 'CWE-125', vector: 'AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N', affected: 'openssl 1.0.1 – 1.0.1f', patched: [['ubuntu', '1.0.1f-1ubuntu2.1']], desc: 'TLS heartbeat kengaytmasidagi chegaradan tashqari o\u2019qish server xotirasini (shu jumladan maxfiy kalitlar) oshkor qiladi.', refs: [['NVD detali', 'https://nvd.nist.gov/vuln/detail/CVE-2014-0160']] },
  { cve: 'CVE-2023-44487', title: 'HTTP/2 Rapid Reset (DDoS)', sev: 'h', cvss: 7.5, epss: 0.88, kev: true, kevDate: '2023-10-10', sources: ['NVD', 'KEV', 'GHSA'], published: '2023-10-10', modified: '2025-02-14', cwe: 'CWE-400', vector: 'AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H', affected: 'Ko\u2019plab HTTP/2 serverlar', patched: [['ubuntu', 'nginx 1.18.0-6ubuntu14.4']], desc: 'HTTP/2 stream\u2019larini tez bekor qilish orqali katta hajmli DDoS hujumi amalga oshiriladi.', refs: [['NVD detali', 'https://nvd.nist.gov/vuln/detail/CVE-2023-44487']] },
  { cve: 'CVE-2023-4863', title: 'libwebp heap chiqib ketishi', sev: 'h', cvss: 8.8, epss: 0.55, kev: true, kevDate: '2023-09-13', sources: ['NVD', 'KEV', 'GHSA'], published: '2023-09-12', modified: '2024-12-01', cwe: 'CWE-787', vector: 'AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:H/A:H', affected: 'libwebp < 1.3.2', patched: [['ubuntu', '1.2.2-2ubuntu0.1']], desc: 'WebP rasm dekodlashda heap bufer chiqib ketishi. Zararli rasm orqali kod ijrosi (brauzerlar va Node.js ta\u2019sirlangan).', refs: [['NVD detali', 'https://nvd.nist.gov/vuln/detail/CVE-2023-4863']] },
  { cve: 'CVE-2023-38545', title: 'curl SOCKS5 heap chiqib ketishi', sev: 'h', cvss: 8.8, epss: 0.42, kev: false, kevDate: null, sources: ['NVD', 'OSV'], published: '2023-10-11', modified: '2025-01-30', cwe: 'CWE-787', vector: 'AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:H/A:H', affected: 'curl 7.69.0 – 8.3.0', patched: [['ubuntu', '7.68.0-1ubuntu2.21']], desc: 'SOCKS5 proksi xost nomini ko\u2019chirishda heap bufer chiqib ketishi. Faqat ma\u2019lum konfiguratsiyada ekspluatatsiya qilinadi.', refs: [['NVD detali', 'https://nvd.nist.gov/vuln/detail/CVE-2023-38545']] },
  { cve: 'CVE-2021-3156', title: 'sudo Baron Samedit', sev: 'h', cvss: 7.8, epss: 0.66, kev: true, kevDate: '2022-03-25', sources: ['NVD', 'KEV', 'USN'], published: '2021-01-26', modified: '2024-06-11', cwe: 'CWE-787', vector: 'AV:L/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H', affected: 'sudo 1.8.2 – 1.9.5p1', patched: [['ubuntu', '1.8.31-1ubuntu1.2']], desc: 'sudoedit\u2019dagi heap bufer chiqib ketishi orqali har qanday mahalliy foydalanuvchi root huquqini oladi.', refs: [['NVD detali', 'https://nvd.nist.gov/vuln/detail/CVE-2021-3156']] },
  { cve: 'CVE-2022-0778', title: 'OpenSSL BN_mod_sqrt cheksiz tsikl (DoS)', sev: 'h', cvss: 7.5, epss: 0.31, kev: false, kevDate: null, sources: ['NVD', 'USN', 'OSV'], published: '2022-03-15', modified: '2024-02-20', cwe: 'CWE-835', vector: 'AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H', affected: 'openssl 1.0.2 – 3.0.1', patched: [['ubuntu', '1.1.1f-1ubuntu2.12']], desc: 'Maxsus shakllangan sertifikatni tahlil qilishda cheksiz tsikl yuzaga keladi va xizmat ishdan chiqadi.', refs: [['NVD detali', 'https://nvd.nist.gov/vuln/detail/CVE-2022-0778']] },
  { cve: 'CVE-2024-21626', title: 'runc fayl deskriptori sizishi (konteyner qochish)', sev: 'h', cvss: 8.6, epss: 0.36, kev: false, kevDate: null, sources: ['NVD', 'GHSA', 'OSV'], published: '2024-01-31', modified: '2025-09-04', cwe: 'CWE-403', vector: 'AV:L/AC:L/PR:L/UI:N/S:C/C:H/I:H/A:H', affected: 'runc <= 1.1.11', patched: [['ubuntu', '1.1.12-0ubuntu1']], desc: 'Ochiq fayl deskriptori sizishi konteynerdan xost fayl tizimiga chiqish imkonini beradi.', refs: [['NVD detali', 'https://nvd.nist.gov/vuln/detail/CVE-2024-21626']] },
  { cve: 'CVE-2023-50164', title: 'Apache Struts fayl yuklash orqali RCE', sev: 'c', cvss: 9.8, epss: 0.62, kev: false, kevDate: null, sources: ['NVD', 'GHSA'], published: '2023-12-07', modified: '2024-10-15', cwe: 'CWE-552', vector: 'AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H', affected: 'Struts 2.0.0 – 6.3.0', patched: [['maven', '6.3.0.2']], desc: 'Fayl yuklash parametrini manipulyatsiya qilib path traversal va masofaviy kod ijrosiga erishiladi.', refs: [['NVD detali', 'https://nvd.nist.gov/vuln/detail/CVE-2023-50164']] },
  { cve: 'CVE-2022-37434', title: 'zlib inflate() chegaradan tashqari o\u2019qish', sev: 'm', cvss: 6.5, epss: 0.08, kev: false, kevDate: null, sources: ['NVD', 'OSV'], published: '2022-08-05', modified: '2024-03-18', cwe: 'CWE-787', vector: 'AV:N/AC:H/PR:N/UI:N/S:U/C:N/I:N/A:H', affected: 'zlib 1.2.2.4 – 1.2.12', patched: [['debian', '1.2.11.dfsg-2+deb11u2']], desc: 'inflate() funksiyasida gzip sarlavhasini qayta ishlashda heap chegaradan tashqari o\u2019qish/yozish.', refs: [['NVD detali', 'https://nvd.nist.gov/vuln/detail/CVE-2022-37434']] },
  { cve: 'CVE-2021-3711', title: 'OpenSSL SM2 dekodlash chiqib ketishi', sev: 'h', cvss: 7.4, epss: 0.12, kev: false, kevDate: null, sources: ['NVD', 'USN'], published: '2021-08-24', modified: '2023-12-05', cwe: 'CWE-787', vector: 'AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H', affected: 'openssl 1.1.1 – 1.1.1k', patched: [['ubuntu', '1.1.1f-1ubuntu2.8']], desc: 'SM2 shifrlangan ma\u2019lumotni ochishda bufer chiqib ketishi. Amaliy ekspluatatsiya kam uchraydi.', refs: [['NVD detali', 'https://nvd.nist.gov/vuln/detail/CVE-2021-3711']] },
  { cve: 'CVE-2022-31676', title: 'VMware Tools mahalliy imtiyoz oshirish', sev: 'h', cvss: 7.0, epss: 0.06, kev: false, kevDate: null, sources: ['NVD'], published: '2022-08-23', modified: '2023-08-10', cwe: 'CWE-269', vector: 'AV:L/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H', affected: 'open-vm-tools < 12.1.0', patched: [['rhel', '12.1.0']], desc: 'open-vm-tools\u2019dagi kamchilik mehmon mashinada mahalliy imtiyozlarni oshirish imkonini beradi.', refs: [['NVD detali', 'https://nvd.nist.gov/vuln/detail/CVE-2022-31676']] },
  { cve: 'CVE-2023-29491', title: 'ncurses mahalliy imtiyoz oshirish', sev: 'm', cvss: 6.5, epss: 0.04, kev: false, kevDate: null, sources: ['NVD', 'USN'], published: '2023-04-13', modified: '2024-01-22', cwe: 'CWE-426', vector: 'AV:L/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H', affected: 'ncurses < 6.4', patched: [['ubuntu', '6.2-0ubuntu2.1']], desc: 'setuid dasturlarda muhit o\u2019zgaruvchilari orqali mahalliy imtiyozlarni oshirish mumkin.', refs: [['NVD detali', 'https://nvd.nist.gov/vuln/detail/CVE-2023-29491']] },
];

function cveMatchCount(cve, findings) {
  return findings.filter(f => f.cve === cve).length;
}

function CveDrawer({ c, onClose }) {
  cvEffect(() => {
    if (!c) return;
    const onKey = e => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [c, onClose]);
  if (!c) return null;
  const matches = cveMatchCount(c.cve, window.ExaFINDINGS || []);
  const SourceTags = window.ExaSourceTags;
  return (
    <div className="exa-drawer-overlay" onMouseDown={onClose}>
      <aside className="exa-drawer" onMouseDown={e => e.stopPropagation()}>
        <div className="exa-drawer__head">
          <div className="exa-drawer__titlewrap">
            <div className="exa-drawer__cve">{c.cve}{c.kev && <span className="exa-kev">KEV</span>}</div>
            <div className="exa-drawer__title">{c.title}</div>
          </div>
          <button className="ui-btn ui-btn--ghost ui-btn--icon" onClick={onClose} aria-label="Yopish"><Icon name="x" size={18} /></button>
        </div>
        <div className="exa-drawer__sub">
          <span className="exa-sevtag" style={{ color: CSEV[c.sev], background: `color-mix(in oklab, ${CSEV[c.sev]} 16%, transparent)` }}><span className="exa-sevtag__dot" style={{ background: CSEV[c.sev] }} />{CSEV_LABEL[c.sev]}</span>
          {SourceTags && <SourceTags sources={c.sources} />}
        </div>

        <div className="exa-drawer__body">
          <div className="exa-metrics">
            <div className="exa-metric"><div className="exa-metric__k">CVSS</div><div className="exa-metric__v" style={{ color: CSEV[c.sev] }}>{c.cvss.toFixed(1)}</div></div>
            <div className="exa-metric"><div className="exa-metric__k">EPSS</div><div className="exa-metric__v">{Math.round(c.epss * 100)}%</div></div>
            <div className="exa-metric"><div className="exa-metric__k">CWE</div><div className="exa-metric__v" style={{ fontSize: '0.8125rem' }}>{c.cwe}</div></div>
            <div className="exa-metric"><div className="exa-metric__k">Ta'sir</div><div className="exa-metric__v" style={{ color: matches ? 'var(--sev-c)' : 'inherit' }}>{matches}</div></div>
          </div>

          <section className="exa-sec">
            <div className="exa-sec__t">Tavsif</div>
            <p className="exa-desc">{c.desc}</p>
            <div className="exa-vector"><Icon name="bug" size={13} /> {c.vector}</div>
          </section>

          {c.kev && (
            <section className="exa-sec">
              <div className="exa-kevbanner"><Icon name="shield-alert" size={16} /><div><b>CISA KEV ro'yxatida</b><span>{c.kevDate} dan beri · faol ekspluatatsiya</span></div></div>
            </section>
          )}

          <section className="exa-sec">
            <div className="exa-sec__t">Versiyalar</div>
            <div className="exa-kv">
              <div className="exa-kv__row"><span>Ta'sirlangan</span><b style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{c.affected}</b></div>
            </div>
            <div className="exa-idblock"><div className="exa-idblock__k">Tuzatilgan versiyalar</div>
              <div className="exa-patched">
                {c.patched.map(([d, v], i) => (<div className="exa-patched__row" key={i}><span className="exa-patched__d">{d}</span><span className="exa-patched__v">{v}</span></div>))}
              </div>
            </div>
          </section>

          <section className="exa-sec">
            <div className="exa-sec__t">Sana</div>
            <div className="exa-kv">
              <div className="exa-kv__row"><span>Nashr qilingan</span><b style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{c.published}</b></div>
              <div className="exa-kv__row"><span>Oxirgi o'zgarish</span><b style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{c.modified}</b></div>
            </div>
          </section>

          <section className="exa-sec">
            <div className="exa-sec__t">Havolalar</div>
            <div className="exa-refs">
              {c.refs.map((r, i) => (
                <a className="exa-ref" key={i} href={r[1]} target="_blank" rel="noopener noreferrer">
                  <Icon name="external-link" size={14} /> {r[0]}
                </a>
              ))}
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}

function Cve() {
  const ALLF = window.ExaFINDINGS || [];
  const [q, setQ] = cvState('');
  const [sevF, setSevF] = cvState(new Set());
  const [kevOnly, setKevOnly] = cvState(false);
  const [sort, setSort] = cvState({ k: 'cvss', dir: 'desc' });
  const [open, setOpen] = cvState(null);
  const toggle = (set, setter, v) => { const n = new Set(set); n.has(v) ? n.delete(v) : n.add(v); setter(n); };

  const rows = cvMemo(() => {
    let r = CVE_DB.filter(c => {
      if (sevF.size && !sevF.has(c.sev)) return false;
      if (kevOnly && !c.kev) return false;
      if (q && !(c.cve + c.title).toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
    const dir = sort.dir === 'asc' ? 1 : -1;
    r = [...r].sort((a, b) => {
      if (sort.k === 'cvss') return (a.cvss - b.cvss) * dir;
      if (sort.k === 'epss') return (a.epss - b.epss) * dir;
      if (sort.k === 'sev') return (CSEV_ORDER[a.sev] - CSEV_ORDER[b.sev]) * dir;
      if (sort.k === 'pub') return (new Date(a.published) - new Date(b.published)) * dir;
      return 0;
    });
    return r;
  }, [q, sevF, kevOnly, sort]);

  const SortHead = ({ label, k, align }) => {
    const active = sort.k === k;
    return (
      <th style={{ textAlign: align || 'left', cursor: 'pointer', userSelect: 'none' }}
        onClick={() => setSort(s => ({ k, dir: s.k === k && s.dir === 'desc' ? 'asc' : 'desc' }))}>
        <span className="exa-sorth" style={{ justifyContent: align === 'right' ? 'flex-end' : 'flex-start' }}>{label}<Icon name="chevron-down" size={13} className={'exa-sorth__ic' + (active ? ' is-active' : '') + (active && sort.dir === 'asc' ? ' is-asc' : '')} /></span>
      </th>
    );
  };
  const SourceTags = window.ExaSourceTags;

  return (
    <div className="ds-stack">
      <div className="exa-toolbar">
        <div className="ds-search ds-search--inline">
          <Icon name="search" size={15} style={{ color: 'var(--muted-foreground)' }} />
          <input placeholder="CVE-ID yoki sarlavha..." value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <div className="exa-toolbar__right">
          <span className="exa-tri-hint"><Icon name="refresh-cw" size={14} /> 6 manbadan kunlik sinxronlanadi</span>
        </div>
      </div>

      <div className="exa-filterbar">
        <span className="exa-filterbar__lbl">Daraja</span>
        {['c', 'h', 'm', 'l'].map(s => (
          <button key={s} className={'exa-chip' + (sevF.has(s) ? ' is-active' : '')} onClick={() => toggle(sevF, setSevF, s)}
            style={sevF.has(s) ? { borderColor: CSEV[s], color: CSEV[s], background: `color-mix(in oklab, ${CSEV[s]} 14%, transparent)` } : {}}>
            <span className="exa-chip__dot" style={{ background: CSEV[s] }} />{CSEV_LABEL[s]}
          </button>
        ))}
        <span className="exa-filterbar__sep" />
        <button className={'exa-chip exa-chip--kev' + (kevOnly ? ' is-active' : '')} onClick={() => setKevOnly(v => !v)}><Icon name="shield-alert" size={13} /> Faqat KEV</button>
      </div>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <table className="ui-table exa-table exa-ftable">
          <thead>
            <tr>
              <th>CVE</th>
              <SortHead label="Daraja" k="sev" />
              <SortHead label="CVSS" k="cvss" align="right" />
              <SortHead label="EPSS" k="epss" align="right" />
              <th>Manbalar</th>
              <SortHead label="Nashr" k="pub" align="right" />
              <th style={{ width: 36 }}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(c => (
              <tr key={c.cve} className="exa-frow" onClick={() => setOpen(c)}>
                <td>
                  <div className="exa-cve">
                    <span className="exa-cve__id">{c.cve}{c.kev && <span className="exa-kev">KEV</span>}</span>
                    <span className="exa-cve__title">{c.title}</span>
                  </div>
                </td>
                <td><span className="exa-sevtag" style={{ color: CSEV[c.sev], background: `color-mix(in oklab, ${CSEV[c.sev]} 16%, transparent)` }}><span className="exa-sevtag__dot" style={{ background: CSEV[c.sev] }} />{CSEV_LABEL[c.sev]}</span></td>
                <td className="exa-cvss" style={{ color: CSEV[c.sev] }}>{c.cvss.toFixed(1)}</td>
                <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{Math.round(c.epss * 100)}%</td>
                <td>{SourceTags && <SourceTags sources={c.sources} />}</td>
                <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{c.published}</td>
                <td onClick={e => e.stopPropagation()}>
                  <button className="ui-btn ui-btn--ghost ui-btn--icon" style={{ height: 30, width: 30 }} onClick={() => setOpen(c)}><Icon name="eye" size={15} /></button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted-foreground)' }}>Hech narsa topilmadi.</td></tr>}
          </tbody>
        </table>
      </Card>
      <div className="ds-table-foot">{rows.length} ta CVE · {CVE_DB.filter(c => c.kev).length} KEV · bazada jami {CVE_DB.length}</div>

      <CveDrawer c={open} onClose={() => setOpen(null)} />
    </div>
  );
}

window.Cve = Cve;
