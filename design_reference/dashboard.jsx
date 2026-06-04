// dashboard.jsx — e-Xabar boshqaruv paneli (KPIs, charts, top assets, activity)
const { useState: dState } = React;

const SEV = {
  c: 'var(--sev-c)', h: 'var(--sev-h)', m: 'var(--sev-m)', l: 'var(--sev-l)', kev: 'var(--kev)',
};

// ---- 90-day trend (deterministic synthetic series) -------------------------
function genTrend() {
  const active = [], crit = [];
  let a = 298, c = 71;
  for (let i = 0; i < 90; i++) {
    const wobble = Math.sin(i / 6) * 6 + Math.sin(i / 2.3) * 3;
    a += (i > 60 ? 0.9 : 0.3) + (i % 7 === 0 ? 4 : 0) - (i % 11 === 0 ? 3 : 0);
    active.push(Math.round(a + wobble));
    c += (i > 55 ? -0.18 : 0.05) + Math.sin(i / 9) * 0.8;
    crit.push(Math.max(38, Math.round(c + Math.sin(i / 3) * 2)));
  }
  active[89] = 342; crit[89] = 57;
  return { active, crit };
}
const TREND = genTrend();
const X_TICKS = [
  { i: 2, label: 'Mart' }, { i: 28, label: 'Aprel' }, { i: 58, label: 'May' }, { i: 87, label: 'Iyun' },
];

const SEVERITY = [
  { label: 'Critical', value: 23, color: SEV.c },
  { label: 'High', value: 41, color: SEV.h },
  { label: 'Medium', value: 108, color: SEV.m },
  { label: 'Low', value: 170, color: SEV.l },
];

const KPIS = [
  { label: 'Jami vositalar', value: '1,248', icon: 'server', delta: '+3.2%', dir: 'up', tone: 'neutral', sub: "o'tgan oyga nisbatan" },
  { label: 'Aktiv topilmalar', value: '342', icon: 'bug', delta: '+18', dir: 'up', tone: 'bad', sub: 'so\u2019nggi 7 kun' },
  { label: 'Critical + High', value: '57', icon: 'flame', delta: '\u22128', dir: 'down', tone: 'good', sub: 'so\u2019nggi 7 kun' },
  { label: 'KEV topilmalar', value: '14', icon: 'shield-alert', delta: '+3', dir: 'up', tone: 'bad', sub: 'faol ekspluatatsiya' },
];

const TOP_ASSETS = [
  { name: 'OpenSSL', ver: '1.1.1f', plat: 'ubuntu 22.04', host: 'WS-IT-042', sev: 'c', cnt: 14, b: { c: 4, h: 6, m: 3, l: 1 }, kev: true, risk: '9.8' },
  { name: 'Apache Log4j', ver: '2.14.1', plat: 'rhel 9', host: 'SRV-APP-07', sev: 'c', cnt: 11, b: { c: 3, h: 5, m: 2, l: 1 }, kev: true, risk: '10.0' },
  { name: 'Apache HTTP Server', ver: '2.4.49', plat: 'debian 11', host: 'SRV-WEB-02', sev: 'c', cnt: 9, b: { c: 2, h: 4, m: 2, l: 1 }, kev: true, risk: '9.8' },
  { name: 'OpenSSH', ver: '8.2p1', plat: 'ubuntu 20.04', host: 'WS-IT-018', sev: 'h', cnt: 9, b: { c: 0, h: 5, m: 3, l: 1 }, kev: false, risk: '8.1' },
  { name: 'nginx', ver: '1.18.0', plat: 'ubuntu 22.04', host: 'SRV-WEB-05', sev: 'h', cnt: 7, b: { c: 0, h: 3, m: 3, l: 1 }, kev: false, risk: '7.5' },
  { name: 'PostgreSQL', ver: '13.4', plat: 'debian 11', host: 'SRV-DB-01', sev: 'h', cnt: 6, b: { c: 0, h: 2, m: 3, l: 1 }, kev: false, risk: '8.8' },
  { name: 'Node.js', ver: '16.14.0', plat: 'ubuntu 22.04', host: 'SRV-APP-11', sev: 'h', cnt: 6, b: { c: 0, h: 2, m: 2, l: 2 }, kev: false, risk: '7.5' },
  { name: 'Windows Server', ver: '2019', plat: 'windows', host: 'SRV-DC-01', sev: 'h', cnt: 5, b: { c: 1, h: 2, m: 1, l: 1 }, kev: false, risk: '8.1' },
  { name: 'curl', ver: '7.68.0', plat: 'ubuntu 20.04', host: 'WS-IT-031', sev: 'm', cnt: 4, b: { c: 0, h: 0, m: 3, l: 1 }, kev: false, risk: '7.5' },
  { name: 'Python', ver: '3.8.10', plat: 'ubuntu 20.04', host: 'WS-DEV-09', sev: 'm', cnt: 4, b: { c: 0, h: 0, m: 2, l: 2 }, kev: false, risk: '6.5' },
];

const SEV_LABEL = { c: 'Critical', h: 'High', m: 'Medium', l: 'Low' };

const ACTIVITY = [
  { icon: 'scan-line', tone: 'plain', title: 'Haftalik skan yakunlandi', meta: '1,248 vosita · 18 yangi topilma', time: '12 daqiqa oldin' },
  { icon: 'shield-alert', tone: 'crit', title: 'KEV topilma: CVE-2021-44228', meta: 'Log4Shell · 3 vositada aniqlandi', time: '41 daqiqa oldin' },
  { icon: 'list-checks', tone: 'plain', title: 'Topilma triage qilindi — Applicable', meta: 'OpenSSL 1.1.1f · b.saidov', time: '1 soat oldin' },
  { icon: 'mail', tone: 'plain', title: 'Xabarnoma yuborildi', meta: '24 xodimga · Critical/High', time: '2 soat oldin' },
  { icon: 'ban', tone: 'plain', title: 'Bostirish qoidasi qo\u2019shildi', meta: 'CVE-2023-38545 · 90 kun', time: '3 soat oldin' },
  { icon: 'refresh-cw', tone: 'good', title: 'NVD manbasi qayta ulandi', meta: 'Integratsiya · holat: healthy', time: '5 soat oldin' },
  { icon: 'shield-check', tone: 'good', title: 'Patch tasdiqlandi', meta: 'nginx 1.18.0 → 1.24.0', time: '6 soat oldin' },
];

const RANGES = ['7 kun', '30 kun', '90 kun'];

function Kpi({ k }) {
  const up = k.dir === 'up';
  return (
    <Card>
      <CardContent style={{ padding: '1.25rem' }}>
        <div className="ds-stat-top">
          <span className="ds-stat-label">{k.label}</span>
          <span className="exa-kpi-ico"><Icon name={k.icon} size={16} /></span>
        </div>
        <div className="ds-stat-value">{k.value}</div>
        <div className="exa-kpi-foot">
          <span className={'exa-trend exa-trend--' + k.tone}>
            <Icon name={up ? 'trending-up' : 'trending-down'} size={13} /> {k.delta}
          </span>
          <span className="exa-kpi-sub">{k.sub}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function SevBar({ b }) {
  const total = b.c + b.h + b.m + b.l || 1;
  const segs = [['c', b.c], ['h', b.h], ['m', b.m], ['l', b.l]].filter(([, v]) => v > 0);
  return (
    <div className="exa-sevbar" title={`C:${b.c} H:${b.h} M:${b.m} L:${b.l}`}>
      {segs.map(([k, v]) => (
        <span key={k} style={{ width: (v / total * 100) + '%', background: SEV[k] }} />
      ))}
    </div>
  );
}

function Dashboard() {
  const [range, setRange] = dState('90 kun');
  return (
    <div className="ds-stack">
      {/* toolbar */}
      <div className="exa-toolbar">
        <div className="exa-seg">
          {RANGES.map(r => (
            <button key={r} className={'exa-seg__btn' + (range === r ? ' is-active' : '')} onClick={() => setRange(r)}>{r}</button>
          ))}
        </div>
        <div className="exa-toolbar__right">
          <Button variant="outline" size="sm"><Icon name="download" size={15} /> Eksport</Button>
          <Button variant="primary" size="sm"><Icon name="radar" size={15} /> Skan ishga tushirish</Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="ds-grid-stats">
        {KPIS.map(k => <Kpi key={k.label} k={k} />)}
      </div>

      {/* charts */}
      <div className="ds-grid-2">
        <Card>
          <CardHeader>
            <CardTitle>Topilmalar dinamikasi</CardTitle>
            <CardDesc>So'nggi 90 kun · aktiv va yuqori darajali topilmalar</CardDesc>
          </CardHeader>
          <CardContent>
            <LineChart
              height={272}
              series={[
                { name: 'Aktiv topilmalar', color: SEV.l, data: TREND.active, area: true },
                { name: 'Critical + High', color: SEV.c, data: TREND.crit },
              ]}
              xLabels={X_TICKS}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Darajalar bo'yicha</CardTitle>
            <CardDesc>342 ta aktiv topilma</CardDesc>
          </CardHeader>
          <CardContent>
            <DonutChart data={SEVERITY} centerLabel="Topilma" />
          </CardContent>
        </Card>
      </div>

      {/* bottom: top assets + activity */}
      <div className="ds-grid-2 ds-grid-2--bottom">
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div className="exa-card-head">
            <div>
              <CardTitle>TOP-10 zaif vosita</CardTitle>
              <CardDesc>Topilmalar soni bo'yicha</CardDesc>
            </div>
            <Button variant="ghost" size="sm">Hammasi <Icon name="chevron-right" size={14} /></Button>
          </div>
          <table className="ui-table exa-table">
            <thead>
              <tr>
                <th style={{ width: 28 }}>#</th>
                <th>Vosita</th>
                <th>Platforma</th>
                <th style={{ width: 150 }}>Topilmalar</th>
                <th style={{ width: 70, textAlign: 'right' }}>CVSS</th>
              </tr>
            </thead>
            <tbody>
              {TOP_ASSETS.map((a, i) => (
                <tr key={a.host}>
                  <td className="exa-rank">{i + 1}</td>
                  <td>
                    <div className="exa-asset">
                      <span className="exa-asset__ico"><Icon name="package" size={15} /></span>
                      <div>
                        <div className="exa-asset__name">
                          {a.name} <span className="exa-asset__ver">{a.ver}</span>
                          {a.kev && <span className="exa-kev">KEV</span>}
                        </div>
                        <div className="exa-asset__host">{a.host}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="exa-plat">{a.plat}</span></td>
                  <td>
                    <div className="exa-find">
                      <span className="exa-sev-dot" style={{ background: SEV[a.sev] }} />
                      <span className="exa-find__cnt">{a.cnt}</span>
                      <SevBar b={a.b} />
                    </div>
                  </td>
                  <td className="exa-cvss" style={{ color: SEV[a.sev] }}>{a.risk}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div className="exa-card-head">
            <div>
              <CardTitle>So'nggi faoliyat</CardTitle>
              <CardDesc>Tizim hodisalari</CardDesc>
            </div>
            <Button variant="ghost" size="sm"><Icon name="activity" size={15} /></Button>
          </div>
          <div className="exa-feed">
            {ACTIVITY.map((it, i) => (
              <div className="exa-feed__item" key={i}>
                <span className={'exa-feed__ico exa-feed__ico--' + it.tone}><Icon name={it.icon} size={15} /></span>
                <div className="exa-feed__body">
                  <div className="exa-feed__title">{it.title}</div>
                  <div className="exa-feed__meta">{it.meta}</div>
                </div>
                <span className="exa-feed__time">{it.time}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

window.Dashboard = Dashboard;
