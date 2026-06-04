// notifications.jsx — Xabarnomalar (yuborilgan emaillar) tarixi.
const { useState: nState } = React;

const NST = {
  SENT: { label: 'Yuborilgan', tone: 'info' },
  ACKNOWLEDGED: { label: 'Tasdiqlangan', tone: 'ok' },
  QUEUED: { label: 'Navbatda', tone: 'new' },
  FAILED: { label: 'Xato', tone: 'crit' },
  BOUNCED: { label: 'Qaytarilgan', tone: 'warn' },
};
const NOTIFS = [
  { id: 'n1', who: 'Anvar Karimov', email: 'a.karimov@example.uz', subj: '3 ta zaiflik aniqlandi — 2 shoshilinch (KEV)', cnt: 3, crit: 2, high: 1, status: 'SENT', sent: '2026-06-03 09:14', ack: null },
  { id: 'n2', who: 'Dilnoza Yusupova', email: 'd.yusupova@example.uz', subj: '2 ta zaiflik aniqlandi', cnt: 2, crit: 1, high: 1, status: 'ACKNOWLEDGED', sent: '2026-06-02 02:06', ack: '2026-06-02 10:31' },
  { id: 'n3', who: 'Sardor Aliyev', email: 's.aliyev@example.uz', subj: '2 ta zaiflik aniqlandi — 1 shoshilinch', cnt: 2, crit: 1, high: 1, status: 'ACKNOWLEDGED', sent: '2026-06-02 02:06', ack: '2026-06-02 09:12' },
  { id: 'n4', who: 'Jasur Tursunov', email: 'j.tursunov@example.uz', subj: '2 ta zaiflik aniqlandi', cnt: 2, crit: 0, high: 1, status: 'SENT', sent: '2026-06-02 02:06', ack: null },
  { id: 'n5', who: 'Kamola Saidova', email: 'k.saidova@example.uz', subj: '2 ta zaiflik aniqlandi — 1 shoshilinch', cnt: 2, crit: 1, high: 1, status: 'SENT', sent: '2026-06-02 02:06', ack: null },
  { id: 'n6', who: 'Nodira Rashidova', email: 'n.rashidova@example.uz', subj: '1 ta zaiflik aniqlandi', cnt: 1, crit: 0, high: 1, status: 'ACKNOWLEDGED', sent: '2026-06-02 02:06', ack: '2026-06-02 14:55' },
  { id: 'n7', who: "Aziz To'xtayev", email: 'a.toxtayev@example.uz', subj: '1 ta zaiflik aniqlandi', cnt: 1, crit: 0, high: 1, status: 'BOUNCED', sent: '2026-06-02 02:06', ack: null },
  { id: 'n8', who: 'Bekzod Rahimov', email: 'b.rahimov@example.uz', subj: 'Past darajali topilma', cnt: 1, crit: 0, high: 0, status: 'QUEUED', sent: '—', ack: null },
];

function Notifications({ toast }) {
  const [rows] = nState(NOTIFS);
  const [f, setF] = nState('all');
  const sent = rows.filter(r => r.status !== 'QUEUED' && r.status !== 'FAILED').length;
  const ack = rows.filter(r => r.status === 'ACKNOWLEDGED').length;
  const ackRate = sent ? Math.round((ack / sent) * 100) : 0;
  const issues = rows.filter(r => r.status === 'BOUNCED' || r.status === 'FAILED').length;

  const FILTERS = [['all', 'Hammasi'], ['SENT', 'Yuborilgan'], ['ACKNOWLEDGED', 'Tasdiqlangan'], ['BOUNCED', 'Muammoli']];
  const filtered = rows.filter(r => {
    if (f === 'all') return true;
    if (f === 'BOUNCED') return r.status === 'BOUNCED' || r.status === 'FAILED';
    return r.status === f;
  });

  return (
    <div className="ds-stack">
      <div className="exa-supstats">
        <div className="exa-supstat"><span className="exa-supstat__ico"><Icon name="mail" size={16} /></span><div><div className="exa-supstat__v">{sent}</div><div className="exa-supstat__l">Yuborilgan xabar</div></div></div>
        <div className="exa-supstat"><span className="exa-supstat__ico" style={{ color: 'oklch(0.64 0.15 155)', background: 'color-mix(in oklab, oklch(0.64 0.15 155) 15%, transparent)' }}><Icon name="circle-check" size={16} /></span><div><div className="exa-supstat__v">{ackRate}%</div><div className="exa-supstat__l">Tasdiqlash darajasi</div></div></div>
        <div className="exa-supstat"><span className="exa-supstat__ico exa-supstat__ico--warn"><Icon name="alert-triangle" size={16} /></span><div><div className="exa-supstat__v">{issues}</div><div className="exa-supstat__l">Yetkazilmagan</div></div></div>
      </div>

      <div className="exa-seg">
        {FILTERS.map(([id, label]) => (
          <button key={id} className={'exa-seg__btn' + (f === id ? ' is-active' : '')} onClick={() => setF(id)}>{label}</button>
        ))}
      </div>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <table className="ui-table exa-table">
          <thead>
            <tr><th>Qabul qiluvchi</th><th>Mavzu</th><th style={{ textAlign: 'center' }}>Topilma</th><th>Holat</th><th>Yuborilgan</th><th>Tasdiqlangan</th><th style={{ width: 36 }}></th></tr>
          </thead>
          <tbody>
            {filtered.map(n => (
              <tr key={n.id}>
                <td>
                  <div className="exa-cell-owner"><Avatar initials={n.who.split(' ').map(s => s[0]).join('').slice(0, 2)} />
                    <div><div className="exa-cell-name" style={{ fontWeight: 500 }}>{n.who}</div><div className="exa-cell-mail" style={{ fontSize: '0.6875rem', color: 'var(--muted-foreground)' }}>{n.email}</div></div>
                  </div>
                </td>
                <td><span style={{ fontSize: '0.8125rem' }}>{n.subj}</span></td>
                <td style={{ textAlign: 'center' }}>
                  <span className="exa-find" style={{ justifyContent: 'center' }}>
                    {n.crit > 0 && <span className="exa-pill" style={{ color: 'var(--sev-c)', background: 'color-mix(in oklab, var(--sev-c) 14%, transparent)' }}>{n.crit}C</span>}
                    {n.high > 0 && <span className="exa-pill" style={{ color: 'var(--sev-h)', background: 'color-mix(in oklab, var(--sev-h) 16%, transparent)' }}>{n.high}H</span>}
                    {n.crit === 0 && n.high === 0 && <span style={{ color: 'var(--muted-foreground)', fontSize: '0.75rem' }}>{n.cnt}</span>}
                  </span>
                </td>
                <td><span className={'exa-status exa-status--' + NST[n.status].tone}>{NST[n.status].label}</span></td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{n.sent}</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: n.ack ? 'oklch(0.64 0.15 155)' : 'var(--muted-foreground)' }}>{n.ack || '—'}</td>
                <td>
                  <Menu trigger={<button className="ui-btn ui-btn--ghost ui-btn--icon" style={{ height: 30, width: 30 }}><Icon name="more-horizontal" size={16} /></button>}>
                    <MenuItem><Icon name="eye" size={15} /> Emailni ko'rish</MenuItem>
                    <MenuItem onClick={() => toast({ title: 'Qayta yuborildi', desc: n.who + ' ga.' })}><Icon name="refresh-cw" size={15} /> Qayta yuborish</MenuItem>
                  </Menu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <div className="ds-table-foot">{filtered.length} ta xabar · {ack} tasdiqlangan</div>
    </div>
  );
}

window.Notifications = Notifications;
