// assets.jsx — Vositalar (inventar) ekrani. findings.jsx ma'lumotiga bog'langan.
const { useState: aState, useMemo: aMemo } = React;

const ASEV = { c: 'var(--sev-c)', h: 'var(--sev-h)', m: 'var(--sev-m)', l: 'var(--sev-l)' };
const TYPE = {
  OS: 'Operatsion tizim', LIBRARY: 'Kutubxona', APPLICATION: 'Ilova', FRAMEWORK: 'Freymvork', DATABASE: "Ma'lumotlar bazasi",
};
const TYPE_SHORT = { OS: 'OT', LIBRARY: 'Kutubxona', APPLICATION: 'Ilova', FRAMEWORK: 'Freymvork', DATABASE: 'MB' };
const ENV = { production: { label: 'Ishlab chiqarish', tone: 'prod' }, staging: { label: 'Staging', tone: 'stg' }, dev: { label: 'Dev', tone: 'dev' } };
const CRIT = { high: { label: 'Yuqori', v: 'var(--sev-c)' }, medium: { label: "O'rta", v: 'var(--sev-h)' }, low: { label: 'Past', v: 'var(--sev-l)' } };

const ASSETS = [
  { id: 'a1', name: 'Apache Log4j', vendor: 'Apache', ver: '2.14.1', host: 'SRV-APP-07', os: 'rhel 9', type: 'LIBRARY', env: 'production', crit: 'high', net: true, owner: 'Anvar Karimov', email: 'a.karimov@example.uz', dept: 'IT infratuzilma', purl: 'pkg:maven/org.apache.logging.log4j/log4j-core@2.14.1', cpe: 'cpe:2.3:a:apache:log4j:2.14.1:*:*:*:*:*:*:*' },
  { id: 'a2', name: 'OpenSSL', vendor: 'OpenSSL', ver: '1.1.1f', host: 'WS-IT-042', os: 'ubuntu 22.04', type: 'LIBRARY', env: 'production', crit: 'high', net: true, owner: 'Dilnoza Yusupova', email: 'd.yusupova@example.uz', dept: 'Tarmoq xavfsizligi', purl: 'pkg:deb/ubuntu/openssl@1.1.1f-1ubuntu2.16', cpe: 'cpe:2.3:a:openssl:openssl:1.1.1f:*:*:*:*:*:*:*' },
  { id: 'a3', name: 'Apache HTTP Server', vendor: 'Apache', ver: '2.4.49', host: 'SRV-WEB-02', os: 'debian 11', type: 'APPLICATION', env: 'production', crit: 'medium', net: true, owner: 'Sardor Aliyev', email: 's.aliyev@example.uz', dept: 'Veb xizmatlar', purl: 'pkg:deb/debian/apache2@2.4.49-1', cpe: 'cpe:2.3:a:apache:http_server:2.4.49:*:*:*:*:*:*:*' },
  { id: 'a4', name: 'nginx', vendor: 'F5', ver: '1.18.0', host: 'SRV-WEB-05', os: 'ubuntu 22.04', type: 'APPLICATION', env: 'production', crit: 'medium', net: true, owner: 'Sardor Aliyev', email: 's.aliyev@example.uz', dept: 'Veb xizmatlar', purl: 'pkg:deb/ubuntu/nginx@1.18.0-0ubuntu1', cpe: 'cpe:2.3:a:f5:nginx:1.18.0:*:*:*:*:*:*:*' },
  { id: 'a5', name: 'Node.js', vendor: 'OpenJS', ver: '16.14.0', host: 'SRV-APP-11', os: 'ubuntu 22.04', type: 'FRAMEWORK', env: 'production', crit: 'medium', net: true, owner: 'Kamola Saidova', email: 'k.saidova@example.uz', dept: 'Veb xizmatlar', purl: 'pkg:generic/nodejs@16.14.0', cpe: 'cpe:2.3:a:nodejs:node.js:16.14.0:*:*:*:*:*:*:*' },
  { id: 'a6', name: 'Windows Server', vendor: 'Microsoft', ver: '2019', host: 'SRV-DC-01', os: 'windows', type: 'OS', env: 'production', crit: 'high', net: false, owner: 'Anvar Karimov', email: 'a.karimov@example.uz', dept: 'IT infratuzilma', purl: null, cpe: 'cpe:2.3:o:microsoft:windows_server_2019:*:*:*:*:*:*:*:*' },
  { id: 'a7', name: 'PostgreSQL', vendor: 'PostgreSQL', ver: '13.4', host: 'SRV-DB-01', os: 'debian 11', type: 'DATABASE', env: 'production', crit: 'high', net: false, owner: 'Jasur Tursunov', email: 'j.tursunov@example.uz', dept: "Ma'lumotlar bazasi", purl: 'pkg:deb/debian/postgresql-13@13.4-1', cpe: 'cpe:2.3:a:postgresql:postgresql:13.4:*:*:*:*:*:*:*' },
  { id: 'a8', name: 'OpenSSL', vendor: 'OpenSSL', ver: '1.1.1f', host: 'SRV-DB-01', os: 'debian 11', type: 'LIBRARY', env: 'production', crit: 'high', net: false, owner: 'Jasur Tursunov', email: 'j.tursunov@example.uz', dept: "Ma'lumotlar bazasi", purl: 'pkg:deb/debian/openssl@1.1.1f-1', cpe: 'cpe:2.3:a:openssl:openssl:1.1.1f:*:*:*:*:*:*:*' },
  { id: 'a9', name: 'OpenSSL', vendor: 'OpenSSL', ver: '1.1.1f', host: 'WS-IT-018', os: 'ubuntu 20.04', type: 'LIBRARY', env: 'staging', crit: 'low', net: false, owner: "Aziz To'xtayev", email: 'a.toxtayev@example.uz', dept: 'IT infratuzilma', purl: 'pkg:deb/ubuntu/openssl@1.1.1f-1ubuntu2', cpe: 'cpe:2.3:a:openssl:openssl:1.1.1f:*:*:*:*:*:*:*' },
  { id: 'a10', name: 'curl', vendor: 'curl', ver: '7.68.0', host: 'WS-IT-031', os: 'ubuntu 20.04', type: 'LIBRARY', env: 'production', crit: 'medium', net: false, owner: 'Nodira Rashidova', email: 'n.rashidova@example.uz', dept: 'IT infratuzilma', purl: 'pkg:deb/ubuntu/curl@7.68.0-1ubuntu2', cpe: 'cpe:2.3:a:haxx:curl:7.68.0:*:*:*:*:*:*:*' },
  { id: 'a11', name: 'sudo', vendor: 'Sudo', ver: '1.8.31', host: 'WS-IT-042', os: 'ubuntu 22.04', type: 'APPLICATION', env: 'production', crit: 'high', net: false, owner: 'Dilnoza Yusupova', email: 'd.yusupova@example.uz', dept: 'Tarmoq xavfsizligi', purl: 'pkg:deb/ubuntu/sudo@1.8.31-1ubuntu1', cpe: 'cpe:2.3:a:sudo_project:sudo:1.8.31:*:*:*:*:*:*:*' },
  { id: 'a12', name: 'xz-utils', vendor: 'Tukaani', ver: '5.4.1', host: 'SRV-APP-11', os: 'ubuntu 22.04', type: 'LIBRARY', env: 'production', crit: 'medium', net: false, owner: 'Kamola Saidova', email: 'k.saidova@example.uz', dept: 'Veb xizmatlar', purl: 'pkg:deb/ubuntu/xz-utils@5.4.1-0ubuntu1', cpe: 'cpe:2.3:a:tukaani:xz:5.4.1:*:*:*:*:*:*:*' },
  { id: 'a13', name: 'Python', vendor: 'PSF', ver: '3.8.10', host: 'WS-DEV-09', os: 'ubuntu 20.04', type: 'FRAMEWORK', env: 'dev', crit: 'low', net: false, owner: 'Bekzod Rahimov', email: 'b.rahimov@example.uz', dept: 'Dasturlash', purl: 'pkg:deb/ubuntu/python3@3.8.10-0ubuntu1', cpe: 'cpe:2.3:a:python:python:3.8.10:*:*:*:*:*:*:*' },
  { id: 'a14', name: 'open-vm-tools', vendor: 'VMware', ver: '11.3.0', host: 'SRV-APP-07', os: 'rhel 9', type: 'APPLICATION', env: 'production', crit: 'medium', net: false, owner: 'Anvar Karimov', email: 'a.karimov@example.uz', dept: 'IT infratuzilma', purl: 'pkg:rpm/redhat/open-vm-tools@11.3.0', cpe: 'cpe:2.3:a:vmware:tools:11.3.0:*:*:*:*:*:*:*' },
  { id: 'a15', name: 'Redis', vendor: 'Redis', ver: '7.2.4', host: 'SRV-CACHE-01', os: 'debian 12', type: 'DATABASE', env: 'production', crit: 'medium', net: false, owner: 'Jasur Tursunov', email: 'j.tursunov@example.uz', dept: "Ma'lumotlar bazasi", purl: 'pkg:deb/debian/redis-server@7.2.4-1', cpe: 'cpe:2.3:a:redis:redis:7.2.4:*:*:*:*:*:*:*' },
  { id: 'a16', name: 'Docker Engine', vendor: 'Docker', ver: '24.0.7', host: 'SRV-APP-11', os: 'ubuntu 22.04', type: 'APPLICATION', env: 'production', crit: 'medium', net: false, owner: 'Kamola Saidova', email: 'k.saidova@example.uz', dept: 'Veb xizmatlar', purl: 'pkg:deb/ubuntu/docker-ce@24.0.7', cpe: 'cpe:2.3:a:docker:docker:24.0.7:*:*:*:*:*:*:*' },
  { id: 'a17', name: 'Grafana', vendor: 'Grafana Labs', ver: '10.4.2', host: 'SRV-MON-01', os: 'ubuntu 22.04', type: 'APPLICATION', env: 'staging', crit: 'low', net: true, owner: "Aziz To'xtayev", email: 'a.toxtayev@example.uz', dept: 'IT infratuzilma', purl: 'pkg:deb/ubuntu/grafana@10.4.2', cpe: 'cpe:2.3:a:grafana:grafana:10.4.2:*:*:*:*:*:*:*' },
];

const ALL_TYPES = ['LIBRARY', 'APPLICATION', 'FRAMEWORK', 'DATABASE', 'OS'];
const ALL_CRIT = ['high', 'medium', 'low'];

function ASevBar({ b }) {
  const total = b.c + b.h + b.m + b.l || 1;
  const segs = [['c', b.c], ['h', b.h], ['m', b.m], ['l', b.l]].filter(([, v]) => v > 0);
  return (
    <div className="exa-sevbar" title={`C:${b.c} H:${b.h} M:${b.m} L:${b.l}`}>
      {segs.map(([k, v]) => <span key={k} style={{ width: (v / total * 100) + '%', background: ASEV[k] }} />)}
    </div>
  );
}

function findingsFor(a, all) {
  return all.filter(f => f.asset.host === a.host && f.asset.name === a.name && f.asset.ver === a.ver);
}
function breakdown(fs) {
  const b = { c: 0, h: 0, m: 0, l: 0 };
  fs.forEach(f => b[f.sev]++);
  return b;
}

function AssetDrawer({ a, onClose, toast }) {
  const SevBadge = window.ExaSevBadge, StatusBadge = window.ExaStatusBadge;
  React.useEffect(() => {
    if (!a) return;
    const onKey = e => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [a, onClose]);
  if (!a) return null;
  const fs = findingsFor(a, window.ExaFINDINGS || []);
  const b = breakdown(fs);
  const ch = b.c + b.h;
  const kev = fs.filter(f => f.kev).length;
  const maxCvss = fs.length ? Math.max(...fs.map(f => f.cvss)) : 0;
  return (
    <div className="exa-drawer-overlay" onMouseDown={onClose}>
      <aside className="exa-drawer" onMouseDown={e => e.stopPropagation()}>
        <div className="exa-drawer__head">
          <div className="exa-drawer__titlewrap">
            <div className="exa-drawer__cve" style={{ textTransform: 'none' }}>
              <span className="exa-asset__ico" style={{ width: 24, height: 24 }}><Icon name="package" size={14} /></span>
              {a.name} <span className="exa-asset__ver">{a.ver}</span>
            </div>
            <div className="exa-drawer__title">{TYPE[a.type]} · {a.vendor}</div>
          </div>
          <button className="ui-btn ui-btn--ghost ui-btn--icon" onClick={onClose} aria-label="Yopish"><Icon name="x" size={18} /></button>
        </div>
        <div className="exa-drawer__sub">
          <span className={'exa-env exa-env--' + ENV[a.env].tone}>{ENV[a.env].label}</span>
          <span className="exa-critbadge"><span className="exa-sev-dot" style={{ background: CRIT[a.crit].v }} />{CRIT[a.crit].label} kritiklik</span>
          {a.net && <span className="exa-net"><Icon name="radar" size={12} /> Internetga ochiq</span>}
        </div>

        <div className="exa-drawer__body">
          <div className="exa-metrics">
            <div className="exa-metric"><div className="exa-metric__k">Topilma</div><div className="exa-metric__v">{fs.length}</div></div>
            <div className="exa-metric"><div className="exa-metric__k">Crit+High</div><div className="exa-metric__v" style={{ color: ch ? 'var(--sev-c)' : 'inherit' }}>{ch}</div></div>
            <div className="exa-metric"><div className="exa-metric__k">KEV</div><div className="exa-metric__v" style={{ color: kev ? 'var(--kev)' : 'inherit' }}>{kev}</div></div>
            <div className="exa-metric"><div className="exa-metric__k">Max CVSS</div><div className="exa-metric__v">{maxCvss.toFixed(1)}</div></div>
          </div>

          <section className="exa-sec">
            <div className="exa-sec__t">Identifikatorlar</div>
            <div className="exa-kv">
              <div className="exa-kv__row"><span>Xost</span><b style={{ fontFamily: 'var(--font-mono)' }}>{a.host}</b></div>
              <div className="exa-kv__row"><span>Platforma</span><b style={{ fontFamily: 'var(--font-mono)' }}>{a.os}</b></div>
              <div className="exa-kv__row"><span>Ishlab chiqaruvchi</span><b>{a.vendor}</b></div>
            </div>
            <div className="exa-idblock">
              <div className="exa-idblock__k">PURL</div>
              <div className="exa-idblock__v">{a.purl || '—'}</div>
            </div>
            <div className="exa-idblock">
              <div className="exa-idblock__k">CPE</div>
              <div className="exa-idblock__v">{a.cpe}</div>
            </div>
          </section>

          <section className="exa-sec">
            <div className="exa-sec__t">Mas'ul xodim</div>
            <div className="exa-owner">
              <Avatar initials={a.owner.split(' ').map(s => s[0]).join('').slice(0, 2)} />
              <div><div className="exa-owner__n">{a.owner}</div><div className="exa-owner__m">{a.email} · {a.dept}</div></div>
            </div>
          </section>

          <section className="exa-sec">
            <div className="exa-sec__t">Topilmalar <span className="exa-sec__badge">{fs.length}</span></div>
            {fs.length === 0 && <div className="exa-meta-line">Topilma yo'q.</div>}
            <div className="exa-findlist">
              {fs.map(f => (
                <div className="exa-findlist__row" key={f.id}>
                  <span className="exa-sev-dot" style={{ background: ASEV[f.sev], flex: 'none' }} />
                  <div className="exa-findlist__main">
                    <div className="exa-findlist__cve">{f.cve}{f.kev && <span className="exa-kev">KEV</span>}</div>
                    <div className="exa-findlist__t">{f.title}</div>
                  </div>
                  <StatusBadge status={f.status} />
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="exa-drawer__foot">
          <Button variant="outline" size="sm" onClick={() => { toast({ title: 'Tahrirlash', desc: a.name + ' ' + a.ver }); }}><Icon name="pencil" size={15} /> Tahrirlash</Button>
          <Button variant="primary" size="sm" onClick={() => { toast({ title: 'Skan boshlandi', desc: a.host + ' qayta tekshirilmoqda.' }); onClose(); }}><Icon name="radar" size={15} /> Skan qilish</Button>
        </div>
      </aside>
    </div>
  );
}

function Assets({ toast }) {
  const ALLF = window.ExaFINDINGS || [];
  const [q, setQ] = aState('');
  const [typeF, setTypeF] = aState(new Set());
  const [critF, setCritF] = aState(new Set());
  const [netOnly, setNetOnly] = aState(false);
  const [sort, setSort] = aState({ k: 'findings', dir: 'desc' });
  const [open, setOpen] = aState(null);
  const [assetList, setAssetList] = aState(ASSETS);
  const [addOpen, setAddOpen] = aState(false);
  const blankForm = { name: '', vendor: '', ver: '', type: 'LIBRARY', os: 'ubuntu 22.04', host: '', env: 'production', crit: 'medium', net: false, owner: '', purl: '', cpe: '' };
  const [form, setForm] = aState(blankForm);

  // unique owners for the select
  const OWNERS = aMemo(() => {
    const seen = {}; ASSETS.forEach(a => { if (!seen[a.owner]) seen[a.owner] = { name: a.owner, email: a.email, dept: a.dept }; });
    return Object.values(seen);
  }, []);

  function addAsset() {
    if (!form.name.trim() || !form.ver.trim() || !form.host.trim()) {
      toast({ title: 'Maydonlar to\u2019ldirilmagan', desc: 'Nomi, versiyasi va xost majburiy.', variant: 'destructive' }); return;
    }
    const ow = OWNERS.find(o => o.name === form.owner) || { name: form.owner || '—', email: '—', dept: '—' };
    const id = 'a' + Date.now();
    setAssetList([{ id, name: form.name, vendor: form.vendor || '—', ver: form.ver, host: form.host.toUpperCase(), os: form.os, type: form.type, env: form.env, crit: form.crit, net: form.net, owner: ow.name, email: ow.email, dept: ow.dept, purl: form.purl || null, cpe: form.cpe || '—' }, ...assetList]);
    setAddOpen(false); setForm(blankForm);
    toast({ title: 'Vosita qo\u2019shildi', desc: form.name + ' ' + form.ver + ' inventarga qo\u2019shildi.' });
  }

  const toggle = (set, setter, v) => { const n = new Set(set); n.has(v) ? n.delete(v) : n.add(v); setter(n); };

  const enriched = aMemo(() => assetList.map(a => {
    const fs = findingsFor(a, ALLF);
    return { ...a, fc: fs.length, b: breakdown(fs), kev: fs.some(f => f.kev), maxCvss: fs.length ? Math.max(...fs.map(f => f.cvss)) : 0, topSev: fs.reduce((acc, f) => Math.max(acc, { c: 4, h: 3, m: 2, l: 1 }[f.sev]), 0) };
  }), []);

  const rows = aMemo(() => {
    let r = enriched.filter(a => {
      if (typeF.size && !typeF.has(a.type)) return false;
      if (critF.size && !critF.has(a.crit)) return false;
      if (netOnly && !a.net) return false;
      if (q) { const s = (a.name + a.ver + a.host + a.os + a.owner + a.vendor).toLowerCase(); if (!s.includes(q.toLowerCase())) return false; }
      return true;
    });
    const dir = sort.dir === 'asc' ? 1 : -1;
    const critRank = { high: 3, medium: 2, low: 1 };
    r = [...r].sort((a, b) => {
      if (sort.k === 'name') return a.name.localeCompare(b.name) * dir;
      if (sort.k === 'findings') return (a.fc - b.fc) * dir;
      if (sort.k === 'crit') return (critRank[a.crit] - critRank[b.crit]) * dir;
      if (sort.k === 'cvss') return (a.maxCvss - b.maxCvss) * dir;
      return 0;
    });
    return r;
  }, [q, typeF, critF, netOnly, sort, enriched]);

  const SortHead = ({ label, k, align }) => {
    const active = sort.k === k;
    return (
      <th style={{ textAlign: align || 'left', cursor: 'pointer', userSelect: 'none' }}
        onClick={() => setSort(s => ({ k, dir: s.k === k && s.dir === 'desc' ? 'asc' : 'desc' }))}>
        <span className="exa-sorth" style={{ justifyContent: align === 'right' ? 'flex-end' : 'flex-start' }}>
          {label}<Icon name="chevron-down" size={13} className={'exa-sorth__ic' + (active ? ' is-active' : '') + (active && sort.dir === 'asc' ? ' is-asc' : '')} />
        </span>
      </th>
    );
  };
  const activeFilters = typeF.size + critF.size + (netOnly ? 1 : 0);

  return (
    <div className="ds-stack">
      <div className="exa-toolbar">
        <div className="ds-search ds-search--inline">
          <Icon name="search" size={15} style={{ color: 'var(--muted-foreground)' }} />
          <input placeholder="Vosita, xost, platforma yoki egasi..." value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <div className="exa-toolbar__right">
          <Button variant="outline" size="sm"><Icon name="download" size={15} /> JSON import</Button>
          <Button variant="primary" size="sm" onClick={() => setAddOpen(true)}><Icon name="plus" size={15} /> Vosita qo'shish</Button>
        </div>
      </div>

      <div className="exa-filterbar">
        <span className="exa-filterbar__lbl">Turi</span>
        {ALL_TYPES.map(t => (
          <button key={t} className={'exa-chip' + (typeF.has(t) ? ' is-active' : '')} onClick={() => toggle(typeF, setTypeF, t)}>
            {TYPE_SHORT[t]}
          </button>
        ))}
        <span className="exa-filterbar__sep" />
        <span className="exa-filterbar__lbl">Kritiklik</span>
        {ALL_CRIT.map(c => (
          <button key={c} className={'exa-chip' + (critF.has(c) ? ' is-active' : '')} onClick={() => toggle(critF, setCritF, c)}
            style={critF.has(c) ? { borderColor: CRIT[c].v, color: CRIT[c].v, background: `color-mix(in oklab, ${CRIT[c].v} 14%, transparent)` } : {}}>
            <span className="exa-chip__dot" style={{ background: CRIT[c].v }} />{CRIT[c].label}
          </button>
        ))}
        <span className="exa-filterbar__sep" />
        <button className={'exa-chip' + (netOnly ? ' is-active' : '')} onClick={() => setNetOnly(v => !v)}>
          <Icon name="radar" size={13} /> Internetga ochiq
        </button>
        {activeFilters > 0 && (
          <button className="exa-clear" onClick={() => { setTypeF(new Set()); setCritF(new Set()); setNetOnly(false); }}>
            <Icon name="x" size={13} /> Tozalash
          </button>
        )}
      </div>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <table className="ui-table exa-table exa-ftable">
          <thead>
            <tr>
              <SortHead label="Vosita" k="name" />
              <th>Xost / platforma</th>
              <th>Turi</th>
              <th>Muhit</th>
              <SortHead label="Kritiklik" k="crit" />
              <SortHead label="Topilmalar" k="findings" />
              <th>Mas'ul</th>
              <th style={{ width: 36 }}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(a => (
              <tr key={a.id} className="exa-frow" onClick={() => setOpen(a)}>
                <td>
                  <div className="exa-asset">
                    <span className="exa-asset__ico"><Icon name="package" size={15} /></span>
                    <div>
                      <div className="exa-asset__name">{a.name} <span className="exa-asset__ver">{a.ver}</span>{a.net && <span className="exa-net-dot" title="Internetga ochiq" />}</div>
                      <div className="exa-asset__host" style={{ textTransform: 'none' }}>{a.vendor}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="exa-fasset">
                    <span className="exa-fasset__n" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{a.host}</span>
                    <span className="exa-fasset__h">{a.os}</span>
                  </div>
                </td>
                <td><span className="exa-typetag">{TYPE_SHORT[a.type]}</span></td>
                <td><span className={'exa-env exa-env--' + ENV[a.env].tone}>{ENV[a.env].label}</span></td>
                <td><span className="exa-critbadge"><span className="exa-sev-dot" style={{ background: CRIT[a.crit].v }} />{CRIT[a.crit].label}</span></td>
                <td>
                  {a.fc === 0 ? <span className="exa-clean"><Icon name="shield-check" size={13} /> Toza</span> : (
                    <div className="exa-find">
                      <span className="exa-find__cnt">{a.fc}</span>
                      <ASevBar b={a.b} />
                      {a.kev && <span className="exa-kev">KEV</span>}
                    </div>
                  )}
                </td>
                <td>
                  <div className="exa-cell-owner"><Avatar initials={a.owner.split(' ').map(s => s[0]).join('').slice(0, 2)} /><span className="exa-cell-owner__n">{a.owner}</span></div>
                </td>
                <td onClick={e => e.stopPropagation()}>
                  <Menu trigger={<button className="ui-btn ui-btn--ghost ui-btn--icon" style={{ height: 30, width: 30 }}><Icon name="more-horizontal" size={16} /></button>}>
                    <MenuItem onClick={() => setOpen(a)}><Icon name="eye" size={15} /> Batafsil</MenuItem>
                    <MenuItem onClick={() => toast({ title: 'Skan boshlandi', desc: a.host + ' tekshirilmoqda.' })}><Icon name="radar" size={15} /> Skan qilish</MenuItem>
                    <MenuItem><Icon name="pencil" size={15} /> Tahrirlash</MenuItem>
                    <div className="ds-sep-line" />
                    <MenuItem danger><Icon name="trash-2" size={15} /> O'chirish</MenuItem>
                  </Menu>
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted-foreground)' }}>Hech narsa topilmadi.</td></tr>}
          </tbody>
        </table>
      </Card>
      <div className="ds-table-foot">{rows.length} ta vosita · {enriched.filter(a => a.fc > 0).length} ta zaif · {enriched.filter(a => a.fc === 0).length} ta toza</div>

      <AssetDrawer a={open} onClose={() => setOpen(null)} toast={toast} />

      <Dialog open={addOpen} onClose={() => setAddOpen(false)}
        title="Vosita qo'shish" desc="Inventarga yangi vosita qo'shing. Nomi, versiyasi va xost majburiy." maxWidth="36rem"
        footer={<>
          <Button variant="outline" onClick={() => setAddOpen(false)}>Bekor qilish</Button>
          <Button variant="primary" onClick={addAsset}>Saqlash</Button>
        </>}>
        <div className="exa-dialog-scroll">
          <div className="ds-form-grid">
            <div className="ds-form-grid ds-form-grid--2">
              <Field label="Vosita nomi"><Input placeholder="masalan: OpenSSL" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></Field>
              <Field label="Ishlab chiqaruvchi"><Input placeholder="masalan: OpenSSL" value={form.vendor} onChange={e => setForm({ ...form, vendor: e.target.value })} /></Field>
            </div>
            <div className="ds-form-grid ds-form-grid--2">
              <Field label="Versiya"><Input placeholder="1.1.1f" value={form.ver} onChange={e => setForm({ ...form, ver: e.target.value })} /></Field>
              <Field label="Turi"><Select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>{ALL_TYPES.map(t => <option key={t} value={t}>{TYPE[t]}</option>)}</Select></Field>
            </div>
            <div className="ds-form-grid ds-form-grid--2">
              <Field label="Xost"><Input placeholder="WS-IT-042" value={form.host} onChange={e => setForm({ ...form, host: e.target.value })} /></Field>
              <Field label="Platforma">
                <Select value={form.os} onChange={e => setForm({ ...form, os: e.target.value })}>
                  {['ubuntu 22.04', 'ubuntu 20.04', 'debian 11', 'debian 12', 'rhel 9', 'windows'].map(o => <option key={o} value={o}>{o}</option>)}
                </Select>
              </Field>
            </div>
            <div className="ds-form-grid ds-form-grid--2">
              <Field label="Muhit">
                <Select value={form.env} onChange={e => setForm({ ...form, env: e.target.value })}>
                  {Object.keys(ENV).map(k => <option key={k} value={k}>{ENV[k].label}</option>)}
                </Select>
              </Field>
              <Field label="Kritiklik">
                <div className="exa-seg" style={{ display: 'flex' }}>
                  {ALL_CRIT.map(c => (
                    <button key={c} type="button" className={'exa-seg__btn' + (form.crit === c ? ' is-active' : '')} style={{ flex: 1 }} onClick={() => setForm({ ...form, crit: c })}>{CRIT[c].label}</button>
                  ))}
                </div>
              </Field>
            </div>
            <Field label="Mas'ul xodim">
              <Select value={form.owner} onChange={e => setForm({ ...form, owner: e.target.value })}>
                <option value="">— tanlanmagan —</option>
                {OWNERS.map(o => <option key={o.name} value={o.name}>{o.name} · {o.dept}</option>)}
              </Select>
            </Field>
            <div className="ds-toggle-row">
              <div><div className="ds-toggle-title">Internetga ochiq</div><div className="ds-toggle-desc">Vosita tashqi tarmoqdan kirish mumkin.</div></div>
              <input type="checkbox" className="ui-switch" checked={form.net} onChange={e => setForm({ ...form, net: e.target.checked })} />
            </div>
            <div className="ui-sep" />
            <div className="exa-sec__t" style={{ marginBottom: 0 }}>Identifikatorlar (ixtiyoriy)</div>
            <Field label="PURL" hint="Paket URL — moslashtirish aniqligini oshiradi."><Input placeholder="pkg:deb/ubuntu/openssl@1.1.1f" value={form.purl} onChange={e => setForm({ ...form, purl: e.target.value })} /></Field>
            <Field label="CPE"><Input placeholder="cpe:2.3:a:openssl:openssl:1.1.1f:*:*:*:*:*:*:*" value={form.cpe} onChange={e => setForm({ ...form, cpe: e.target.value })} /></Field>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

window.Assets = Assets;
