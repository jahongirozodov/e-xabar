// audit.jsx — Audit jurnali (actor → action timeline).
const { useState: auState } = React;

const ACT = {
  LOGIN:            { label: 'Tizimga kirish', icon: 'log-out', tone: 'mute' },
  RUN_SCAN:         { label: 'Skan ishga tushirildi', icon: 'radar', tone: 'info' },
  TRIAGE_DECISION:  { label: 'Triage qarori', icon: 'list-checks', tone: 'new' },
  CREATE_SUPPRESSION:{ label: 'Bostirish qoidasi', icon: 'ban', tone: 'warn' },
  SEND_NOTIFICATION:{ label: 'Xabarnoma yuborildi', icon: 'mail', tone: 'info' },
  IMPORT_INVENTORY: { label: 'Inventar import', icon: 'download', tone: 'new' },
  UPDATE_SETTINGS:  { label: 'Sozlama o\u2019zgartirildi', icon: 'settings', tone: 'mute' },
  DELETE_ASSET:     { label: 'Vosita o\u2019chirildi', icon: 'trash-2', tone: 'crit' },
};
const LOG = [
  { id: 'l1', actor: 'Bobur Saidov', action: 'RUN_SCAN', detail: "Qo'lda to'liq skan · 1,248 vosita", time: '09:14', date: '3 Iyun', ip: '10.0.4.18' },
  { id: 'l2', actor: 'Bobur Saidov', action: 'TRIAGE_DECISION', detail: 'CVE-2021-44228 → Tasdiqlangan (Applicable)', time: '09:02', date: '3 Iyun', ip: '10.0.4.18' },
  { id: 'l3', actor: 'Bobur Saidov', action: 'LOGIN', detail: '2FA bilan kirish', time: '08:58', date: '3 Iyun', ip: '10.0.4.18' },
  { id: 'l4', actor: 'Tizim', action: 'SEND_NOTIFICATION', detail: '24 xodimga email yuborildi', time: '02:06', date: '2 Iyun', ip: 'worker' },
  { id: 'l5', actor: 'Tizim', action: 'RUN_SCAN', detail: 'Rejali skan · 18 yangi topilma', time: '02:00', date: '2 Iyun', ip: 'scheduler' },
  { id: 'l6', actor: 'Dilnoza Yusupova', action: 'CREATE_SUPPRESSION', detail: 'CVE-2019-11043 · 90 kun', time: '16:42', date: '1 Iyun', ip: '10.0.4.22' },
  { id: 'l7', actor: 'Anvar Karimov', action: 'UPDATE_SETTINGS', detail: 'SMTP host yangilandi', time: '15:10', date: '1 Iyun', ip: '10.0.4.7' },
  { id: 'l8', actor: 'Dilnoza Yusupova', action: 'LOGIN', detail: '2FA bilan kirish', time: '14:30', date: '1 Iyun', ip: '10.0.4.22' },
  { id: 'l9', actor: 'Bobur Saidov', action: 'IMPORT_INVENTORY', detail: '142 vosita import qilindi', time: '11:25', date: '31 May', ip: '10.0.4.18' },
  { id: 'l10', actor: 'Bobur Saidov', action: 'DELETE_ASSET', detail: 'jenkins 2.289 (eskirgan) o\u2019chirildi', time: '10:08', date: '31 May', ip: '10.0.4.18' },
  { id: 'l11', actor: 'Tizim', action: 'SEND_NOTIFICATION', detail: '6 xodimga KEV ogohlantirishi', time: '06:05', date: '1 Iyun', ip: 'worker' },
  { id: 'l12', actor: 'Anvar Karimov', action: 'TRIAGE_DECISION', detail: 'CVE-2022-31676 → Xavf qabul qilingan', time: '09:40', date: '30 May', ip: '10.0.4.7' },
];

function Audit() {
  const [q, setQ] = auState('');
  const [actF, setActF] = auState('all');
  const rows = LOG.filter(l => {
    if (actF !== 'all' && l.action !== actF) return false;
    if (q && !(l.actor + l.detail).toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });
  // group by date
  const groups = [];
  rows.forEach(l => {
    let g = groups.find(x => x.date === l.date);
    if (!g) { g = { date: l.date, items: [] }; groups.push(g); }
    g.items.push(l);
  });

  return (
    <div className="ds-stack">
      <div className="exa-toolbar">
        <div className="ds-search ds-search--inline">
          <Icon name="search" size={15} style={{ color: 'var(--muted-foreground)' }} />
          <input placeholder="Foydalanuvchi yoki amal..." value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <div className="exa-toolbar__right">
          <Menu align="end" trigger={<button className="exa-chip"><Icon name="filter" size={13} /> {actF === 'all' ? 'Barcha amallar' : ACT[actF].label} <Icon name="chevron-down" size={12} /></button>}>
            <MenuItem onClick={() => setActF('all')}><span className="exa-check">{actF === 'all' && <Icon name="check" size={13} />}</span> Barcha amallar</MenuItem>
            <div className="ds-sep-line" />
            {Object.keys(ACT).map(k => (
              <MenuItem key={k} onClick={() => setActF(k)}><span className="exa-check">{actF === k && <Icon name="check" size={13} />}</span> {ACT[k].label}</MenuItem>
            ))}
          </Menu>
          <Button variant="outline" size="sm"><Icon name="download" size={15} /> Eksport</Button>
        </div>
      </div>

      <Card>
        <CardContent style={{ padding: '0.5rem 0' }}>
          {groups.map(g => (
            <div key={g.date} className="exa-audit-group">
              <div className="exa-audit-date">{g.date} 2026</div>
              {g.items.map(l => (
                <div className="exa-audit" key={l.id}>
                  <span className={'exa-audit__ico exa-audit__ico--' + ACT[l.action].tone}><Icon name={ACT[l.action].icon} size={14} /></span>
                  <div className="exa-audit__main">
                    <div className="exa-audit__line"><b>{l.actor}</b> · {ACT[l.action].label}</div>
                    <div className="exa-audit__detail">{l.detail}</div>
                  </div>
                  <div className="exa-audit__meta">
                    <span className="exa-audit__time">{l.time}</span>
                    <span className="exa-audit__ip">{l.ip}</span>
                  </div>
                </div>
              ))}
            </div>
          ))}
          {rows.length === 0 && <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--muted-foreground)' }}>Hech narsa topilmadi.</div>}
        </CardContent>
      </Card>
      <div className="ds-table-foot">{rows.length} ta yozuv · o'zgarmas jurnal</div>
    </div>
  );
}

window.Audit = Audit;
