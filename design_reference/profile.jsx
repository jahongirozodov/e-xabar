// profile.jsx — Profil: hisob ma'lumotlari, xavfsizlik (parol + 2FA), seanslar.
const { useState: prState } = React;

const PROF_TABS = [
  { value: 'account', label: 'Hisob' },
  { value: 'security', label: 'Xavfsizlik' },
  { value: 'sessions', label: 'Seanslar' },
];

const PROF_SESSIONS = [
  { device: 'Chrome · Windows', ip: '10.8.2.14', loc: 'Toshkent, UZ', last: 'Hozir faol', current: true },
  { device: 'Firefox · Ubuntu', ip: '10.8.2.51', loc: 'Toshkent, UZ', last: '2 soat oldin', current: false },
  { device: 'Safari · iPhone', ip: '84.54.71.20', loc: 'Samarqand, UZ', last: 'Kecha, 19:42', current: false },
];

function Profile({ toast }) {
  const [tab, setTab] = prState('account');
  const [twoFa, setTwoFa] = prState(true);
  const save = (msg) => toast({ title: 'Saqlandi', desc: msg });

  return (
    <div className="ds-stack" style={{ maxWidth: 860 }}>
      <Card>
        <CardContent style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          <span className="exa-prof-avatar">BS</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1.0625rem', fontWeight: 600, letterSpacing: '-0.01em' }}>Bobur Saidov</span>
              <Badge variant="secondary">Mutaxassis</Badge>
              {twoFa && (
                <span className="exa-status exa-status--ok" style={{ fontSize: '0.6875rem' }}>
                  <Icon name="shield-check" size={13} style={{ marginRight: 4 }} />2FA yoqilgan
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground)', marginTop: 3, fontFamily: 'var(--font-mono)' }}>b.saidov@example.uz</div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setTab('account')}><Icon name="pencil" size={15} /> Tahrirlash</Button>
        </CardContent>
      </Card>

      <Tabs tabs={PROF_TABS} value={tab} onChange={setTab} />

      {tab === 'account' && (
        <Card>
          <CardHeader><CardTitle>Shaxsiy ma'lumotlar</CardTitle><CardDesc>Profil va aloqa ma'lumotlari.</CardDesc></CardHeader>
          <CardContent>
            <div className="ds-form-grid ds-form-grid--2">
              <Field label="To'liq ism"><Input defaultValue="Bobur Saidov" /></Field>
              <Field label="Email" hint="Tizimga kirish va xabarnomalar uchun."><Input type="email" defaultValue="b.saidov@example.uz" /></Field>
              <Field label="Telefon"><Input defaultValue="+998 90 123 45 67" /></Field>
              <Field label="Lavozim"><Input defaultValue="Xavfsizlik mutaxassisi" /></Field>
              <Field label="Bo'lim"><Select defaultValue="SOC"><option>SOC</option><option>IT infratuzilma</option><option>Boshqaruv</option></Select></Field>
              <Field label="Rol" hint="Rolni faqat administrator o'zgartiradi."><Input defaultValue="Mutaxassis" disabled /></Field>
            </div>
          </CardContent>
          <CardFooter><Button variant="primary" onClick={() => save('Profil ma\u2019lumotlari yangilandi.')}>O'zgarishlarni saqlash</Button></CardFooter>
        </Card>
      )}

      {tab === 'security' && (
        <div className="ds-stack">
          <Card>
            <CardHeader><CardTitle>Parolni o'zgartirish</CardTitle><CardDesc>Kamida 12 belgi, harf va raqam aralash.</CardDesc></CardHeader>
            <CardContent>
              <div className="ds-form-grid ds-form-grid--2">
                <Field label="Joriy parol"><Input type="password" defaultValue="************" /></Field>
                <div />
                <Field label="Yangi parol"><Input type="password" placeholder="Yangi parol" /></Field>
                <Field label="Yangi parolni tasdiqlang"><Input type="password" placeholder="Takrorlang" /></Field>
              </div>
            </CardContent>
            <CardFooter><Button variant="primary" onClick={() => save('Parol o\u2019zgartirildi.')}>Parolni yangilash</Button></CardFooter>
          </Card>

          <Card>
            <CardHeader><CardTitle>Ikki bosqichli autentifikatsiya</CardTitle><CardDesc>TOTP ilovasi (Google Authenticator, Authy) orqali himoya.</CardDesc></CardHeader>
            <CardContent>
              <div className="ds-toggle-row">
                <div>
                  <div className="ds-toggle-title">TOTP autentifikator</div>
                  <div className="ds-toggle-desc">Kirishda 6 xonali bir martalik kod so'raladi.</div>
                </div>
                <input type="checkbox" className="ui-switch" checked={twoFa}
                  onChange={e => { setTwoFa(e.target.checked); toast({ title: e.target.checked ? '2FA yoqildi' : '2FA o\u2019chirildi', desc: e.target.checked ? 'Endi kirishda kod so\u2019raladi.' : 'Hisobingiz endi kamroq himoyalangan.', variant: e.target.checked ? undefined : 'destructive' }); }} />
              </div>
              <div className="ui-sep" />
              <div className="ds-toggle-row">
                <div>
                  <div className="ds-toggle-title">Zaxira kodlar</div>
                  <div className="ds-toggle-desc">Ilovaga kirib bo'lmasa, bir martalik kodlar.</div>
                </div>
                <Button variant="outline" size="sm" onClick={() => toast({ title: 'Kodlar yaratildi', desc: '10 ta zaxira kod yuklab olindi.' })}><Icon name="download" size={15} /> Yuklab olish</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {tab === 'sessions' && (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div className="exa-card-head">
            <div><CardTitle>Faol seanslar</CardTitle><CardDesc>Hisobingizga ulangan qurilmalar.</CardDesc></div>
            <Button variant="outline" size="sm" onClick={() => toast({ title: 'Chiqildi', desc: 'Boshqa barcha seanslar yopildi.' })}><Icon name="log-out" size={15} /> Hammasidan chiqish</Button>
          </div>
          <table className="ui-table exa-table">
            <thead><tr><th>Qurilma</th><th>IP manzil</th><th>Joylashuv</th><th>Faollik</th><th></th></tr></thead>
            <tbody>
              {PROF_SESSIONS.map((s, i) => (
                <tr key={i}>
                  <td>
                    <div className="exa-asset">
                      <span style={{ fontWeight: 500 }}>{s.device}</span>
                      {s.current && <span className="exa-status exa-status--ok" style={{ fontSize: '0.6875rem' }}>Joriy seans</span>}
                    </div>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--muted-foreground)' }}>{s.ip}</td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground)' }}>{s.loc}</td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground)' }}>{s.last}</td>
                  <td style={{ textAlign: 'right' }}>
                    {!s.current && (
                      <Button variant="ghost" size="sm" onClick={() => toast({ title: 'Seans yopildi', desc: s.device })}><Icon name="x" size={15} /></Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

window.Profile = Profile;
