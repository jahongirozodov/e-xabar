// settings.jsx — Sozlamalar: umumiy, skanlash, SMTP, integratsiyalar, API.
const { useState: seState } = React;

const INTEGRATIONS = [
  { src: 'NVD', desc: 'National Vulnerability Database', status: 'healthy', last: '5 daqiqa oldin', note: '2.0 REST API · kalit ulangan' },
  { src: 'OSV', desc: 'Open Source Vulnerabilities (Google)', status: 'healthy', last: '5 daqiqa oldin', note: 'Batch API' },
  { src: 'GHSA', desc: 'GitHub Security Advisories', status: 'healthy', last: '12 daqiqa oldin', note: 'GraphQL · token ulangan' },
  { src: 'KEV', desc: 'CISA Known Exploited Vulnerabilities', status: 'healthy', last: '1 soat oldin', note: 'Kunlik JSON feed' },
  { src: 'USN', desc: 'Ubuntu Security Notices', status: 'degraded', last: '38 daqiqa oldin', note: 'Sekin javob (>3s)' },
  { src: 'DSA', desc: 'Debian Security Advisories', status: 'healthy', last: '22 daqiqa oldin', note: 'OK' },
  { src: 'OVAL', desc: 'RHEL OVAL definitions', status: 'down', last: '2 soat oldin', note: 'Ulanish xatosi (timeout)' },
];
const IST = { healthy: { label: 'Sog\u2019lom', tone: 'ok' }, degraded: { label: 'Sekinlashgan', tone: 'warn' }, down: { label: 'Ishlamayapti', tone: 'crit' } };
const TABS = [
  { value: 'general', label: 'Umumiy' },
  { value: 'scan', label: 'Skanlash' },
  { value: 'smtp', label: 'Email (SMTP)' },
  { value: 'integrations', label: 'Integratsiyalar' },
  { value: 'api', label: 'API kalitlari' },
];

function Settings({ toast }) {
  const [tab, setTab] = seState('general');
  const [kevPriority, setKevPriority] = seState(true);
  const [autoVerify, setAutoVerify] = seState(true);
  const [notifyCrit, setNotifyCrit] = seState(true);
  const [notifyHigh, setNotifyHigh] = seState(true);
  const [smtpTls, setSmtpTls] = seState(true);
  const save = (msg) => toast({ title: 'Saqlandi', desc: msg });

  return (
    <div className="ds-stack" style={{ maxWidth: 860 }}>
      <Tabs tabs={TABS} value={tab} onChange={setTab} />

      {tab === 'general' && (
        <Card>
          <CardHeader><CardTitle>Umumiy</CardTitle><CardDesc>Tashkilot va til sozlamalari.</CardDesc></CardHeader>
          <CardContent>
            <div className="ds-form-grid ds-form-grid--2">
              <Field label="Tashkilot nomi"><Input defaultValue="Misol tashkiloti" /></Field>
              <Field label="Standart til"><Select defaultValue="O'zbek"><option>O'zbek</option><option>Русский</option><option>English</option></Select></Field>
              <Field label="Vaqt mintaqasi"><Select defaultValue="Asia/Tashkent (UTC+5)"><option>Asia/Tashkent (UTC+5)</option><option>UTC</option></Select></Field>
              <Field label="Seans muddati" hint="Faolsizlikdan keyin chiqish."><Select defaultValue="30 daqiqa"><option>15 daqiqa</option><option>30 daqiqa</option><option>1 soat</option></Select></Field>
            </div>
          </CardContent>
          <CardFooter><Button variant="primary" onClick={() => save('Umumiy sozlamalar yangilandi.')}>O'zgarishlarni saqlash</Button></CardFooter>
        </Card>
      )}

      {tab === 'scan' && (
        <Card>
          <CardHeader><CardTitle>Skanlash jadvali</CardTitle><CardDesc>Avtomatik skan va qayta tekshirish.</CardDesc></CardHeader>
          <CardContent>
            <div className="ds-form-grid ds-form-grid--2">
              <Field label="Skan chastotasi"><Select defaultValue="Haftalik"><option>Har kuni</option><option>Haftalik</option><option>Har 2 haftada</option></Select></Field>
              <Field label="Kun va vaqt"><Select defaultValue="Yakshanba 02:00"><option>Yakshanba 02:00</option><option>Dushanba 01:00</option><option>Shanba 03:00</option></Select></Field>
            </div>
            <div className="ui-sep" />
            <div className="ds-toggle-row">
              <div><div className="ds-toggle-title">KEV ustuvor skanlash</div><div className="ds-toggle-desc">Faol ekspluatatsiyadagi zaifliklar har kuni tekshiriladi.</div></div>
              <input type="checkbox" className="ui-switch" checked={kevPriority} onChange={e => setKevPriority(e.target.checked)} />
            </div>
            <div className="ui-sep" />
            <div className="ds-toggle-row">
              <div><div className="ds-toggle-title">Avtomatik qayta tekshirish</div><div className="ds-toggle-desc">Patchdan 7 kun keyin topilma qayta tasdiqlanadi.</div></div>
              <input type="checkbox" className="ui-switch" checked={autoVerify} onChange={e => setAutoVerify(e.target.checked)} />
            </div>
          </CardContent>
          <CardFooter><Button variant="primary" onClick={() => save('Skanlash jadvali yangilandi.')}>Saqlash</Button></CardFooter>
        </Card>
      )}

      {tab === 'smtp' && (
        <Card>
          <CardHeader><CardTitle>Email (SMTP)</CardTitle><CardDesc>Xabarnomalar shu server orqali yuboriladi.</CardDesc></CardHeader>
          <CardContent>
            <div className="ds-form-grid ds-form-grid--2">
              <Field label="SMTP host"><Input defaultValue="smtp-relay.gmail.com" /></Field>
              <Field label="Port"><Input defaultValue="587" /></Field>
              <Field label="Foydalanuvchi"><Input defaultValue="security@example.uz" /></Field>
              <Field label="Parol"><Input type="password" defaultValue="************" /></Field>
              <Field label="Jo'natuvchi (From)" hint="Email shu manzildan yuboriladi."><Input defaultValue="security@example.uz" /></Field>
            </div>
            <div className="ui-sep" />
            <div className="ds-toggle-row">
              <div><div className="ds-toggle-title">TLS shifrlash</div><div className="ds-toggle-desc">STARTTLS orqali xavfsiz ulanish.</div></div>
              <input type="checkbox" className="ui-switch" checked={smtpTls} onChange={e => setSmtpTls(e.target.checked)} />
            </div>
          </CardContent>
          <CardFooter style={{ gap: '0.5rem' }}>
            <Button variant="outline" onClick={() => toast({ title: 'Test email yuborildi', desc: 'security@example.uz manziliga.' })}><Icon name="mail" size={15} /> Test yuborish</Button>
            <Button variant="primary" onClick={() => save('SMTP sozlamalari yangilandi.')}>Saqlash</Button>
          </CardFooter>
        </Card>
      )}

      {tab === 'integrations' && (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div className="exa-card-head">
            <div><CardTitle>CVE manbalari</CardTitle><CardDesc>Integratsiyalar holati va sog'ligi.</CardDesc></div>
            <Button variant="outline" size="sm" onClick={() => toast({ title: 'Tekshirilmoqda', desc: 'Barcha manbalar qayta tekshirilmoqda.' })}><Icon name="refresh-cw" size={15} /> Tekshirish</Button>
          </div>
          <table className="ui-table exa-table">
            <thead><tr><th>Manba</th><th>Holat</th><th>Oxirgi tekshiruv</th><th>Izoh</th></tr></thead>
            <tbody>
              {INTEGRATIONS.map(it => (
                <tr key={it.src}>
                  <td>
                    <div className="exa-asset">
                      <span className="exa-src" style={{ fontSize: '0.6875rem' }}>{it.src}</span>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground)' }}>{it.desc}</span>
                    </div>
                  </td>
                  <td>
                    <span className={'exa-status exa-status--' + IST[it.status].tone}>
                      <span className="exa-sev-dot" style={{ background: 'currentColor', marginRight: 5, opacity: 0.9 }} />{IST[it.status].label}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground)', fontFamily: 'var(--font-mono)' }}>{it.last}</td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground)' }}>{it.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {tab === 'api' && (
        <Card>
          <CardHeader><CardTitle>API kalitlari</CardTitle><CardDesc>Tashqi manbalar uchun autentifikatsiya. Shifrlangan holda saqlanadi.</CardDesc></CardHeader>
          <CardContent>
            <div className="ds-form-grid">
              <Field label="NVD API kaliti" hint="50 so'rov / 30 soniya limit."><Input type="password" defaultValue="nvd-************************" /></Field>
              <Field label="GitHub tokeni" hint="GHSA manbasi uchun (read-only)."><Input type="password" defaultValue="ghp_********************" /></Field>
              <Field label="Shifrlash holati">
                <div className="exa-enc"><Icon name="shield-check" size={15} /> AES-256-GCM bilan shifrlangan</div>
              </Field>
            </div>
          </CardContent>
          <CardFooter><Button variant="primary" onClick={() => save('API kalitlari yangilandi.')}>Saqlash</Button></CardFooter>
        </Card>
      )}
    </div>
  );
}

window.Settings = Settings;
