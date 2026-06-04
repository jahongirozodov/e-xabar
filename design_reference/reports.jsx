// reports.jsx — Hisobotlar ekrani: generator + xulosa + yaratilgan hisobotlar.
const { useState: rState } = React;

const REPORTS = [
  { id: 'r1', name: 'Haftalik xavfsizlik hisoboti', period: '26 May – 1 Iyun 2026', type: 'weekly', fmt: 'PDF', size: '2.4 MB', by: 'Tizim', date: '2026-06-02' },
  { id: 'r2', name: 'KEV topilmalar hisoboti', period: 'Ad-hoc · 1 Iyun 2026', type: 'adhoc', fmt: 'Excel', size: '184 KB', by: 'Bobur Saidov', date: '2026-06-01' },
  { id: 'r3', name: 'Haftalik xavfsizlik hisoboti', period: '19 – 25 May 2026', type: 'weekly', fmt: 'PDF', size: '2.2 MB', by: 'Tizim', date: '2026-05-26' },
  { id: 'r4', name: 'Oylik boshqaruv hisoboti', period: 'May 2026', type: 'monthly', fmt: 'PDF', size: '4.1 MB', by: 'Tizim', date: '2026-05-31' },
  { id: 'r5', name: 'Departament kesimida zaifliklar', period: 'Ad-hoc · 28 May 2026', type: 'adhoc', fmt: 'Excel', size: '312 KB', by: 'Dilnoza Yusupova', date: '2026-05-28' },
  { id: 'r6', name: 'Haftalik xavfsizlik hisoboti', period: '12 – 18 May 2026', type: 'weekly', fmt: 'PDF', size: '2.0 MB', by: 'Tizim', date: '2026-05-19' },
  { id: 'r7', name: 'Oylik boshqaruv hisoboti', period: 'Aprel 2026', type: 'monthly', fmt: 'PDF', size: '3.8 MB', by: 'Tizim', date: '2026-04-30' },
];
const RTYPE = { weekly: 'Haftalik', monthly: 'Oylik', adhoc: 'Ad-hoc' };
const RTONE = { weekly: 'info', monthly: 'new', adhoc: 'warn' };

const SUMMARY = [
  { k: 'Yangi topilma', v: '18', icon: 'bug' },
  { k: 'Hal qilingan', v: '11', icon: 'shield-check' },
  { k: 'KEV aniqlangan', v: '3', icon: 'shield-alert' },
  { k: 'Email yuborilgan', v: '24', icon: 'mail' },
];

function Reports({ toast }) {
  const [rows, setRows] = rState(REPORTS);
  const [type, setType] = rState('weekly');
  const [fmt, setFmt] = rState('PDF');
  const [scope, setScope] = rState('all');
  const [busy, setBusy] = rState(false);

  function generate() {
    setBusy(true);
    setTimeout(() => {
      const names = { weekly: 'Haftalik xavfsizlik hisoboti', monthly: 'Oylik boshqaruv hisoboti', adhoc: 'Ad-hoc hisobot' };
      const id = 'r' + Date.now();
      setRows([{ id, name: names[type], period: type === 'weekly' ? '2 – 8 Iyun 2026' : type === 'monthly' ? 'Iyun 2026' : 'Ad-hoc · 3 Iyun 2026', type, fmt, size: fmt === 'PDF' ? '2.5 MB' : '256 KB', by: 'Bobur Saidov', date: '2026-06-03' }, ...rows]);
      setBusy(false);
      toast({ title: 'Hisobot tayyor', desc: names[type] + ' (' + fmt + ') yaratildi.' });
    }, 900);
  }

  return (
    <div className="ds-stack">
      <div className="ds-grid-2">
        {/* generator */}
        <Card>
          <CardHeader><CardTitle>Yangi hisobot yaratish</CardTitle><CardDesc>Davr va formatni tanlang.</CardDesc></CardHeader>
          <CardContent>
            <div className="ds-form-grid">
              <Field label="Hisobot turi">
                <div className="exa-seg" style={{ display: 'flex' }}>
                  {Object.keys(RTYPE).map(k => (
                    <button key={k} className={'exa-seg__btn' + (type === k ? ' is-active' : '')} style={{ flex: 1 }} onClick={() => setType(k)}>{RTYPE[k]}</button>
                  ))}
                </div>
              </Field>
              <div className="ds-form-grid ds-form-grid--2">
                <Field label="Format">
                  <div className="exa-seg" style={{ display: 'flex' }}>
                    {['PDF', 'Excel'].map(f => (
                      <button key={f} className={'exa-seg__btn' + (fmt === f ? ' is-active' : '')} style={{ flex: 1 }} onClick={() => setFmt(f)}>{f}</button>
                    ))}
                  </div>
                </Field>
                <Field label="Qamrov">
                  <Select value={scope} onChange={e => setScope(e.target.value)}>
                    <option value="all">Butun tashkilot</option>
                    <option value="dept">Departament bo'yicha</option>
                    <option value="kev">Faqat KEV</option>
                    <option value="crit">Critical + High</option>
                  </Select>
                </Field>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="primary" onClick={generate} disabled={busy}>
              <Icon name={busy ? 'refresh-cw' : 'file-text'} size={15} className={busy ? 'exa-spin' : ''} /> {busy ? 'Yaratilmoqda...' : 'Hisobot yaratish'}
            </Button>
          </CardFooter>
        </Card>

        {/* this week summary */}
        <Card>
          <CardHeader><CardTitle>Joriy hafta xulosasi</CardTitle><CardDesc>26 May – 1 Iyun 2026</CardDesc></CardHeader>
          <CardContent>
            <div className="exa-rsum">
              {SUMMARY.map(s => (
                <div className="exa-rsum__item" key={s.k}>
                  <span className="exa-rsum__ico"><Icon name={s.icon} size={16} /></span>
                  <div><div className="exa-rsum__v">{s.v}</div><div className="exa-rsum__k">{s.k}</div></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* generated reports */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div className="exa-card-head">
          <div><CardTitle>Yaratilgan hisobotlar</CardTitle><CardDesc>{rows.length} ta hisobot</CardDesc></div>
        </div>
        <table className="ui-table exa-table">
          <thead>
            <tr>
              <th>Hisobot</th><th>Davr</th><th>Turi</th><th>Format</th>
              <th style={{ textAlign: 'right' }}>Hajmi</th><th>Yaratilgan</th><th style={{ width: 90 }}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                <td>
                  <div className="exa-asset">
                    <span className="exa-asset__ico" style={{ color: r.fmt === 'PDF' ? 'var(--sev-c)' : 'oklch(0.64 0.15 155)' }}><Icon name="file-text" size={15} /></span>
                    <div className="exa-asset__name" style={{ fontWeight: 600 }}>{r.name}</div>
                  </div>
                </td>
                <td style={{ color: 'var(--muted-foreground)', fontSize: '0.8125rem' }}>{r.period}</td>
                <td><span className={'exa-status exa-status--' + RTONE[r.type]}>{RTYPE[r.type]}</span></td>
                <td><span className="exa-typetag">{r.fmt}</span></td>
                <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{r.size}</td>
                <td style={{ fontSize: '0.8125rem' }}><span style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted-foreground)' }}>{r.date}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                    <button className="ui-btn ui-btn--ghost ui-btn--icon" style={{ height: 30, width: 30 }} title="Yuklab olish" onClick={() => toast({ title: 'Yuklab olinmoqda', desc: r.name + ' (' + r.fmt + ')' })}><Icon name="download" size={15} /></button>
                    <button className="ui-btn ui-btn--ghost ui-btn--icon" style={{ height: 30, width: 30 }} title="Ochish"><Icon name="external-link" size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

window.Reports = Reports;
