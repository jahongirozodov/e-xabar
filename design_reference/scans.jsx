// scans.jsx — Skanlar tarixi + qo'lda ishga tushirish.
const { useState: scState, useEffect: scEffect } = React;

const SCANTYPE = {
  SCHEDULED: { label: 'Rejali', icon: 'clock', tone: 'info' },
  MANUAL: { label: "Qo'lda", icon: 'radar', tone: 'new' },
  KEV_PRIORITY: { label: 'KEV ustuvor', icon: 'shield-alert', tone: 'warn' },
};
const SCAN_SEED = [
  { id: 'sc2', type: 'SCHEDULED', started: '2026-06-02 02:00', dur: '6m 12s', assets: 1248, neu: 18, rec: 41, mail: 24, status: 'COMPLETED' },
  { id: 'sc3', type: 'KEV_PRIORITY', started: '2026-06-01 06:00', dur: '1m 48s', assets: 312, neu: 3, rec: 5, mail: 6, status: 'COMPLETED' },
  { id: 'sc4', type: 'MANUAL', started: '2026-05-29 14:22', dur: '5m 51s', assets: 1248, neu: 9, rec: 38, mail: 12, status: 'COMPLETED' },
  { id: 'sc5', type: 'SCHEDULED', started: '2026-05-26 02:00', dur: '6m 02s', assets: 1241, neu: 14, rec: 36, mail: 19, status: 'COMPLETED' },
  { id: 'sc6', type: 'SCHEDULED', started: '2026-05-19 02:00', dur: '0m 34s', assets: 0, neu: 0, rec: 0, mail: 0, status: 'FAILED' },
  { id: 'sc7', type: 'MANUAL', started: '2026-05-16 11:08', dur: '5m 44s', assets: 1238, neu: 7, rec: 33, mail: 10, status: 'COMPLETED' },
  { id: 'sc8', type: 'SCHEDULED', started: '2026-05-12 02:00', dur: '5m 58s', assets: 1235, neu: 12, rec: 35, mail: 16, status: 'COMPLETED' },
];
const SCST = { COMPLETED: { label: 'Yakunlandi', tone: 'ok' }, RUNNING: { label: 'Bajarilmoqda', tone: 'info' }, FAILED: { label: 'Xato', tone: 'crit' } };

function Scans({ toast }) {
  const [rows, setRows] = scState(SCAN_SEED);
  const [running, setRunning] = scState(null); // {progress}
  scEffect(() => {
    if (!running) return;
    if (running.progress >= 100) {
      const id = 'sc' + Date.now();
      setRows(rs => [{ id, type: 'MANUAL', started: '2026-06-03 09:14', dur: '5m 39s', assets: 1248, neu: 6, rec: 29, mail: 9, status: 'COMPLETED' }, ...rs]);
      setRunning(null);
      toast({ title: 'Skan yakunlandi', desc: '1,248 vosita · 6 yangi topilma · 9 email.' });
      return;
    }
    const t = setTimeout(() => setRunning(r => ({ progress: Math.min(100, r.progress + 11) })), 360);
    return () => clearTimeout(t);
  }, [running]);

  function startScan() {
    if (running) return;
    setRunning({ progress: 6 });
    toast({ title: 'Skan boshlandi', desc: "Qo'lda to'liq skan ishga tushirildi." });
  }

  const last = rows.find(r => r.status === 'COMPLETED');
  return (
    <div className="ds-stack">
      <div className="exa-supstats">
        <div className="exa-supstat"><span className="exa-supstat__ico"><Icon name="clock" size={16} /></span><div><div className="exa-supstat__v" style={{ fontSize: '1rem' }}>Yakshanba 02:00</div><div className="exa-supstat__l">Keyingi rejali skan</div></div></div>
        <div className="exa-supstat"><span className="exa-supstat__ico"><Icon name="scan-line" size={16} /></span><div><div className="exa-supstat__v">{last ? last.assets.toLocaleString() : '—'}</div><div className="exa-supstat__l">Oxirgi skanda vosita</div></div></div>
        <div className="exa-supstat"><span className="exa-supstat__ico exa-supstat__ico--warn"><Icon name="bug" size={16} /></span><div><div className="exa-supstat__v">{last ? last.neu : '—'}</div><div className="exa-supstat__l">Oxirgi yangi topilma</div></div></div>
      </div>

      <div className="exa-toolbar">
        <span className="exa-tri-hint"><Icon name="refresh-cw" size={14} /> Skanlar avtomatik (haftalik) yoki qo'lda ishga tushiriladi</span>
        <div className="exa-toolbar__right">
          <Button variant="primary" size="sm" onClick={startScan} disabled={!!running}>
            <Icon name={running ? 'refresh-cw' : 'radar'} size={15} className={running ? 'exa-spin' : ''} /> {running ? 'Bajarilmoqda...' : 'Skan ishga tushirish'}
          </Button>
        </div>
      </div>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <table className="ui-table exa-table">
          <thead>
            <tr>
              <th>Turi</th><th>Boshlandi</th><th>Davomiyligi</th>
              <th style={{ textAlign: 'right' }}>Vositalar</th><th style={{ textAlign: 'right' }}>Yangi</th>
              <th style={{ textAlign: 'right' }}>Takroriy</th><th style={{ textAlign: 'right' }}>Email</th><th>Holat</th>
            </tr>
          </thead>
          <tbody>
            {running && (
              <tr className="exa-scan-running">
                <td><span className="exa-scope"><span className="exa-scope__ico"><Icon name="radar" size={14} /></span><div><div className="exa-scope__target" style={{ fontFamily: 'inherit', fontWeight: 600 }}>Qo'lda</div></div></span></td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>2026-06-03 09:14</td>
                <td colSpan="5">
                  <div className="exa-progress"><span className="exa-progress__bar" style={{ width: running.progress + '%' }} /></div>
                  <span className="exa-progress__lbl">{running.progress}% · vositalar tekshirilmoqda...</span>
                </td>
                <td><span className="exa-status exa-status--info"><span className="exa-pulse" />Bajarilmoqda</span></td>
              </tr>
            )}
            {rows.map(s => (
              <tr key={s.id}>
                <td>
                  <span className="exa-scope" style={{ gap: '0.5rem' }}>
                    <span className="exa-scope__ico"><Icon name={SCANTYPE[s.type].icon} size={14} /></span>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{SCANTYPE[s.type].label}</span>
                  </span>
                </td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{s.started}</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{s.dur}</td>
                <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{s.assets ? s.assets.toLocaleString() : '—'}</td>
                <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600, color: s.neu ? 'var(--sev-c)' : 'var(--muted-foreground)' }}>{s.status === 'FAILED' ? '—' : s.neu}</td>
                <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--muted-foreground)' }}>{s.status === 'FAILED' ? '—' : s.rec}</td>
                <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--muted-foreground)' }}>{s.status === 'FAILED' ? '—' : s.mail}</td>
                <td><span className={'exa-status exa-status--' + SCST[s.status].tone}>{SCST[s.status].label}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <div className="ds-table-foot">{rows.length} ta skan · oxirgi 30 kun</div>
    </div>
  );
}

window.Scans = Scans;
