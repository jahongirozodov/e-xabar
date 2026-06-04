// login.jsx — e-Xabar tizimga kirish (email + parol → 2FA TOTP).
const { useState: lState, useRef: lRef, useEffect: lEffect } = React;

function Login() {
  const [step, setStep] = lState('cred'); // cred | otp
  const [email, setEmail] = lState('admin@example.uz');
  const [pw, setPw] = lState('Admin@12345');
  const [err, setErr] = lState('');
  const [busy, setBusy] = lState(false);
  const [code, setCode] = lState(['', '', '', '', '', '']);
  const otpRefs = lRef([]);

  function submitCred(e) {
    e.preventDefault();
    setErr('');
    if (!email.includes('@') || pw.length < 6) { setErr('Email yoki parol noto\u2019g\u2019ri.'); return; }
    setBusy(true);
    setTimeout(() => { setBusy(false); setStep('otp'); setTimeout(() => otpRefs.current[0]?.focus(), 50); }, 700);
  }
  function setDigit(i, v) {
    v = v.replace(/\D/g, '').slice(-1);
    const next = [...code]; next[i] = v; setCode(next);
    if (v && i < 5) otpRefs.current[i + 1]?.focus();
  }
  function onKey(i, e) {
    if (e.key === 'Backspace' && !code[i] && i > 0) otpRefs.current[i - 1]?.focus();
  }
  function onPaste(e) {
    const t = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6);
    if (t) { e.preventDefault(); const n = ['', '', '', '', '', '']; t.split('').forEach((d, i) => n[i] = d); setCode(n); otpRefs.current[Math.min(t.length, 5)]?.focus(); }
  }
  function submitOtp(e) {
    e.preventDefault(); setErr('');
    if (code.join('').length < 6) { setErr('6 xonali kodni kiriting.'); return; }
    setBusy(true);
    setTimeout(() => { window.location.href = 'e-Xabar Dashboard.html'; }, 800);
  }

  return (
    <div className="lg-wrap">
      {/* brand panel */}
      <div className="lg-brand">
        <div className="lg-brand__top">
          <div className="lg-logo"><div className="ds-brand-mark" style={{ width: 36, height: 36 }}><Icon name="shield" size={20} /></div><span className="lg-logo__name">e-Xabar</span></div>
        </div>
        <div className="lg-brand__mid">
          <h1 className="lg-tagline">Avtomatik kiberzaiflik monitoringi</h1>
          <p className="lg-sub">Tashkilot vositalaridagi zaifliklarni avtomatik aniqlash, baholash va mas'ul xodimlarni xabardor qilish tizimi.</p>
          <div className="lg-feats">
            <div className="lg-feat"><Icon name="radar" size={16} /> 6 ta CVE manbasidan kunlik yig'ish</div>
            <div className="lg-feat"><Icon name="shield-alert" size={16} /> KEV ustuvor monitoring</div>
            <div className="lg-feat"><Icon name="list-checks" size={16} /> False-positive kamaytirish va triage</div>
          </div>
        </div>
        <div className="lg-brand__foot">© 2026 e-Xabar · Kiberxavfsizlik markazi</div>
        <div className="lg-grid" aria-hidden="true" />
      </div>

      {/* form panel */}
      <div className="lg-formwrap">
        <div className="lg-card">
          <div className="lg-logo lg-logo--m"><div className="ds-brand-mark" style={{ width: 32, height: 32 }}><Icon name="shield" size={17} /></div><span className="lg-logo__name">e-Xabar</span></div>

          {step === 'cred' ? (
            <form onSubmit={submitCred} className="lg-form">
              <div className="lg-head"><h2>Tizimga kirish</h2><p>Hisobingizga kirish uchun ma'lumotlarni kiriting.</p></div>
              <Field label="Email"><Input type="email" placeholder="ism@example.uz" value={email} onChange={e => setEmail(e.target.value)} autoFocus /></Field>
              <Field label={<span className="lg-pwlabel">Parol <a href="#" onClick={e => e.preventDefault()}>Parolni unutdingizmi?</a></span>}>
                <Input type="password" placeholder="••••••••" value={pw} onChange={e => setPw(e.target.value)} />
              </Field>
              {err && <div className="lg-err"><Icon name="alert-triangle" size={14} /> {err}</div>}
              <Button variant="primary" type="submit" disabled={busy} style={{ width: '100%', height: 40 }}>
                {busy ? <><Icon name="refresh-cw" size={15} className="exa-spin" /> Tekshirilmoqda...</> : <>Davom etish <Icon name="chevron-right" size={15} /></>}
              </Button>
              <div className="lg-demo"><Icon name="command" size={13} /> Demo: <code>admin@example.uz</code> · <code>Admin@12345</code></div>
            </form>
          ) : (
            <form onSubmit={submitOtp} className="lg-form">
              <button type="button" className="lg-back" onClick={() => { setStep('cred'); setErr(''); setCode(['', '', '', '', '', '']); }}><Icon name="chevron-left" size={15} /> Orqaga</button>
              <div className="lg-head">
                <div className="lg-otpico"><Icon name="shield-check" size={22} /></div>
                <h2>Ikki bosqichli tasdiqlash</h2>
                <p>Autentifikator ilovasidagi 6 xonali kodni kiriting.</p>
              </div>
              <div className="lg-otp" onPaste={onPaste}>
                {code.map((d, i) => (
                  <input key={i} ref={el => otpRefs.current[i] = el} className="lg-otp__in" inputMode="numeric" maxLength="1"
                    value={d} onChange={e => setDigit(i, e.target.value)} onKeyDown={e => onKey(i, e)} />
                ))}
              </div>
              {err && <div className="lg-err"><Icon name="alert-triangle" size={14} /> {err}</div>}
              <Button variant="primary" type="submit" disabled={busy} style={{ width: '100%', height: 40 }}>
                {busy ? <><Icon name="refresh-cw" size={15} className="exa-spin" /> Kirilmoqda...</> : <>Tasdiqlash va kirish</>}
              </Button>
              <div className="lg-demo"><Icon name="command" size={13} /> Demo: istalgan 6 xonali kod</div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Login />);
