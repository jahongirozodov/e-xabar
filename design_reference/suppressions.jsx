// suppressions.jsx — Bostirishlar (suppression rules) ekrani.
const { useState: suState } = React;

const NOW = new Date('2026-06-03');
const SCOPE = {
  CVE:        { label: 'CVE bo\u2019yicha', icon: 'bug' },
  CVE_ASSET:  { label: 'CVE + vosita', icon: 'package' },
  CVE_VENDOR: { label: 'CVE + ishlab chiqaruvchi', icon: 'server' },
  ASSET_ATTR: { label: 'Vosita atributi', icon: 'filter' },
  GLOBAL:     { label: 'Global', icon: 'shield' },
};

const SUPP = [
  { id: 's1', scope: 'CVE_ASSET', target: 'CVE-2023-29491 · Python @ WS-DEV-09', reason: 'Tegishli konfiguratsiya yo\u2019q — false positive deb tasdiqlandi.', by: 'Bobur Saidov', created: '2026-05-12', expires: '2026-08-15', affected: 1, active: true },
  { id: 's2', scope: 'CVE', target: 'CVE-2022-37434 (zlib)', reason: 'Bog\u2019liqlik orqali kelgan, amaliy ekspluatatsiya imkonsiz.', by: 'Bobur Saidov', created: '2026-05-20', expires: '2026-06-12', affected: 3, active: true },
  { id: 's3', scope: 'CVE_VENDOR', target: 'CVE-2021-3711 · OpenSSL', reason: 'Ishlab chiqaruvchi patchi kutilmoqda, vaqtinchalik bostirish.', by: 'Dilnoza Yusupova', created: '2026-05-08', expires: '2026-07-01', affected: 2, active: true },
  { id: 's4', scope: 'ASSET_ATTR', target: 'environment = dev', reason: 'Dev muhitidagi past darajali topilmalar e\u2019tiborga olinmaydi.', by: 'Bobur Saidov', created: '2026-04-30', expires: '2026-09-30', affected: 12, active: true },
  { id: 's5', scope: 'CVE_ASSET', target: 'CVE-2022-31676 · open-vm-tools @ SRV-APP-07', reason: 'Kompensatsion nazorat mavjud — xavf qabul qilingan.', by: 'Anvar Karimov', created: '2026-05-05', expires: '2026-12-31', affected: 1, active: true },
  { id: 's6', scope: 'CVE_VENDOR', target: 'CVE-2023-21709 · Microsoft', reason: 'Yangilanish rejalashtirilgan oynaga qadar bostirildi.', by: 'Anvar Karimov', created: '2026-04-22', expires: '2026-06-09', affected: 4, active: true },
  { id: 's7', scope: 'GLOBAL', target: 'severity = Low (informational)', reason: 'Axborot darajali topilmalar dashboardda ko\u2019rsatilmaydi.', by: 'Bobur Saidov', created: '2026-03-15', expires: '2026-10-01', affected: 28, active: true },
  { id: 's8', scope: 'CVE', target: 'CVE-2019-11043', reason: 'Tekshirildi — ta\u2019sir yo\u2019q, muddati tugagan.', by: 'Dilnoza Yusupova', created: '2026-02-20', expires: '2026-05-20', affected: 0, active: false },
];

function daysLeft(dateStr) {
  return Math.round((new Date(dateStr) - NOW) / 86400000);
}
function expiryMeta(s) {
  const d = daysLeft(s.expires);
  if (!s.active) return { tone: 'mute', label: 'O\u2019chirilgan', sub: s.expires };
  if (d < 0) return { tone: 'crit', label: 'Tugagan', sub: Math.abs(d) + ' kun oldin' };
  if (d <= 14) return { tone: 'warn', label: 'Tez orada', sub: d + ' kun qoldi' };
  return { tone: 'ok', label: 'Faol', sub: d + ' kun qoldi' };
}

function Suppressions({ toast }) {
  const [rows, setRows] = suState(SUPP);
  const [q, setQ] = suState('');
  const [scopeF, setScopeF] = suState('all'); // all | active | expiring | expired
  const [addOpen, setAddOpen] = suState(false);
  const [delRow, setDelRow] = suState(null);
  const [form, setForm] = suState({ scope: 'CVE', cve: '', vendor: '', asset: '', attrKey: 'environment', attrVal: 'production', reason: '', days: '90' });

  // build human-readable target string from structured fields
  function buildTarget(f) {
    if (f.scope === 'CVE') return f.cve.trim();
    if (f.scope === 'CVE_ASSET') return `${f.cve.trim()} · ${f.asset.trim()}`;
    if (f.scope === 'CVE_VENDOR') return `${f.cve.trim()} · ${f.vendor.trim()}`;
    if (f.scope === 'ASSET_ATTR') return `${f.attrKey} = ${f.attrVal}`;
    return 'Barcha topilmalar';
  }
  // rough estimate of affected findings for preview
  function estimate(f) {
    const all = window.ExaFINDINGS || [];
    if ((f.scope === 'CVE' || f.scope === 'CVE_ASSET' || f.scope === 'CVE_VENDOR') && f.cve.trim()) {
      let m = all.filter(x => x.cve.toLowerCase() === f.cve.trim().toLowerCase());
      if (f.scope === 'CVE_ASSET' && f.asset.trim()) m = m.filter(x => (x.asset.name + ' ' + x.asset.host).toLowerCase().includes(f.asset.trim().toLowerCase()));
      return m.length;
    }
    return null;
  }

  const filtered = rows.filter(s => {
    if (q && !(s.target + s.reason + s.by).toLowerCase().includes(q.toLowerCase())) return false;
    const d = daysLeft(s.expires);
    if (scopeF === 'active') return s.active && d >= 0;
    if (scopeF === 'expiring') return s.active && d >= 0 && d <= 14;
    if (scopeF === 'expired') return !s.active || d < 0;
    return true;
  });

  const activeCount = rows.filter(s => s.active && daysLeft(s.expires) >= 0).length;
  const expiringCount = rows.filter(s => s.active && daysLeft(s.expires) >= 0 && daysLeft(s.expires) <= 14).length;
  const suppressedCount = rows.filter(s => s.active && daysLeft(s.expires) >= 0).reduce((a, s) => a + s.affected, 0);

  function toggleActive(id) {
    setRows(rs => rs.map(s => s.id === id ? { ...s, active: !s.active } : s));
  }
  function addRule() {
    const target = buildTarget(form);
    const needsCve = form.scope === 'CVE' || form.scope === 'CVE_ASSET' || form.scope === 'CVE_VENDOR';
    if (!form.reason.trim()) { toast({ title: 'Sabab kiritilmagan', desc: 'Bostirish sababi majburiy.', variant: 'destructive' }); return; }
    if (needsCve && !form.cve.trim()) { toast({ title: 'CVE kiritilmagan', desc: 'CVE-ID majburiy.', variant: 'destructive' }); return; }
    if (form.scope === 'CVE_ASSET' && !form.asset.trim()) { toast({ title: 'Vosita kiritilmagan', desc: 'Vosita yoki xost majburiy.', variant: 'destructive' }); return; }
    if (form.scope === 'CVE_VENDOR' && !form.vendor.trim()) { toast({ title: 'Vendor kiritilmagan', desc: 'Ishlab chiqaruvchi majburiy.', variant: 'destructive' }); return; }
    if (form.scope === 'ASSET_ATTR' && !form.attrVal.trim()) { toast({ title: 'Qiymat kiritilmagan', desc: 'Atribut qiymati majburiy.', variant: 'destructive' }); return; }
    const exp = new Date(NOW); exp.setDate(exp.getDate() + Number(form.days));
    const id = 's' + (Date.now());
    setRows([{ id, scope: form.scope, target, reason: form.reason, by: 'Bobur Saidov', created: '2026-06-03', expires: exp.toISOString().slice(0, 10), affected: estimate(form) || 0, active: true }, ...rows]);
    setAddOpen(false); setForm({ scope: 'CVE', cve: '', vendor: '', asset: '', attrKey: 'environment', attrVal: 'production', reason: '', days: '90' });
    toast({ title: 'Qoida qo\u2019shildi', desc: target + ' bostirildi.' });
  }
  function removeRule() {
    setRows(rs => rs.filter(s => s.id !== delRow.id));
    toast({ title: 'O\u2019chirildi', desc: 'Bostirish qoidasi olib tashlandi.', variant: 'destructive' });
    setDelRow(null);
  }

  const FILTERS = [['all', 'Hammasi'], ['active', 'Faol'], ['expiring', 'Tez orada tugaydi'], ['expired', 'Tugagan']];

  return (
    <div className="ds-stack">
      {/* stat strip */}
      <div className="exa-supstats">
        <div className="exa-supstat"><span className="exa-supstat__ico"><Icon name="ban" size={16} /></span><div><div className="exa-supstat__v">{activeCount}</div><div className="exa-supstat__l">Faol qoida</div></div></div>
        <div className="exa-supstat"><span className="exa-supstat__ico exa-supstat__ico--warn"><Icon name="clock" size={16} /></span><div><div className="exa-supstat__v">{expiringCount}</div><div className="exa-supstat__l">Tez orada tugaydi</div></div></div>
        <div className="exa-supstat"><span className="exa-supstat__ico"><Icon name="shield" size={16} /></span><div><div className="exa-supstat__v">{suppressedCount}</div><div className="exa-supstat__l">Bostirilgan topilma</div></div></div>
      </div>

      <div className="exa-toolbar">
        <div className="ds-search ds-search--inline">
          <Icon name="search" size={15} style={{ color: 'var(--muted-foreground)' }} />
          <input placeholder="CVE, nishon yoki sabab..." value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <div className="exa-toolbar__right">
          <Button variant="primary" size="sm" onClick={() => setAddOpen(true)}><Icon name="plus" size={15} /> Qoida qo'shish</Button>
        </div>
      </div>

      <div className="exa-seg">
        {FILTERS.map(([id, label]) => (
          <button key={id} className={'exa-seg__btn' + (scopeF === id ? ' is-active' : '')} onClick={() => setScopeF(id)}>{label}</button>
        ))}
      </div>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <table className="ui-table exa-table">
          <thead>
            <tr>
              <th>Qamrov / nishon</th>
              <th>Sabab</th>
              <th>Yaratgan</th>
              <th style={{ width: 150 }}>Amal muddati</th>
              <th style={{ width: 70, textAlign: 'center' }}>Ta'sir</th>
              <th style={{ width: 60, textAlign: 'center' }}>Holat</th>
              <th style={{ width: 36 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => {
              const em = expiryMeta(s);
              return (
                <tr key={s.id} className={s.active ? '' : 'exa-row-off'}>
                  <td>
                    <div className="exa-scope">
                      <span className="exa-scope__ico"><Icon name={SCOPE[s.scope].icon} size={14} /></span>
                      <div>
                        <div className="exa-scope__target">{s.target}</div>
                        <div className="exa-scope__label">{SCOPE[s.scope].label}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="exa-reason">{s.reason}</span></td>
                  <td>
                    <div className="exa-cell-owner"><Avatar initials={s.by.split(' ').map(x => x[0]).join('').slice(0, 2)} /><span className="exa-cell-owner__n">{s.by}</span></div>
                  </td>
                  <td>
                    <span className={'exa-status exa-status--' + em.tone}>{em.label}</span>
                    <div className="exa-exp-sub">{em.sub}</div>
                  </td>
                  <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{s.affected}</td>
                  <td style={{ textAlign: 'center' }}>
                    <input type="checkbox" className="ui-switch" checked={s.active} onChange={() => toggleActive(s.id)} />
                  </td>
                  <td>
                    <Menu trigger={<button className="ui-btn ui-btn--ghost ui-btn--icon" style={{ height: 30, width: 30 }}><Icon name="more-horizontal" size={16} /></button>}>
                      <MenuItem><Icon name="pencil" size={15} /> Tahrirlash</MenuItem>
                      <MenuItem onClick={() => toggleActive(s.id)}><Icon name={s.active ? 'ban' : 'circle-check'} size={15} /> {s.active ? 'O\u2019chirish' : 'Yoqish'}</MenuItem>
                      <div className="ds-sep-line" />
                      <MenuItem danger onClick={() => setDelRow(s)}><Icon name="trash-2" size={15} /> Butunlay o'chirish</MenuItem>
                    </Menu>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && <tr><td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted-foreground)' }}>Hech narsa topilmadi.</td></tr>}
          </tbody>
        </table>
      </Card>
      <div className="ds-table-foot">{filtered.length} ta qoida · har bir bostirish muddati majburiy</div>

      {/* add dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)}
        title="Bostirish qoidasi qo'shish" desc="Qoida muddati majburiy. Muddat tugagach topilmalar qayta faollashadi." maxWidth="32rem"
        footer={<>
          <Button variant="outline" onClick={() => setAddOpen(false)}>Bekor qilish</Button>
          <Button variant="primary" onClick={addRule}>Saqlash</Button>
        </>}>
        <div className="ds-form-grid">
          <Field label="Qamrov" hint="Bostirish qanchalik keng qo'llanishini belgilaydi.">
            <Select value={form.scope} onChange={e => setForm({ ...form, scope: e.target.value })}>
              {Object.keys(SCOPE).map(k => <option key={k} value={k}>{SCOPE[k].label}</option>)}
            </Select>
          </Field>

          {(form.scope === 'CVE' || form.scope === 'CVE_ASSET' || form.scope === 'CVE_VENDOR') && (
            <Field label="CVE-ID"><Input placeholder="CVE-2023-29491" value={form.cve} onChange={e => setForm({ ...form, cve: e.target.value })} /></Field>
          )}
          {form.scope === 'CVE_ASSET' && (
            <Field label="Vosita yoki xost" hint="masalan: OpenSSL yoki WS-IT-042"><Input placeholder="Vosita @ xost" value={form.asset} onChange={e => setForm({ ...form, asset: e.target.value })} /></Field>
          )}
          {form.scope === 'CVE_VENDOR' && (
            <Field label="Ishlab chiqaruvchi"><Input placeholder="OpenSSL" value={form.vendor} onChange={e => setForm({ ...form, vendor: e.target.value })} /></Field>
          )}
          {form.scope === 'ASSET_ATTR' && (
            <div className="ds-form-grid ds-form-grid--2">
              <Field label="Atribut">
                <Select value={form.attrKey} onChange={e => { const k = e.target.value; const def = { environment: 'production', criticality: 'high', internet_facing: 'true' }[k]; setForm({ ...form, attrKey: k, attrVal: def }); }}>
                  <option value="environment">Muhit (environment)</option>
                  <option value="criticality">Kritiklik (criticality)</option>
                  <option value="internet_facing">Internetga ochiq</option>
                </Select>
              </Field>
              <Field label="Qiymat">
                <Select value={form.attrVal} onChange={e => setForm({ ...form, attrVal: e.target.value })}>
                  {({ environment: ['production', 'staging', 'dev'], criticality: ['high', 'medium', 'low'], internet_facing: ['true', 'false'] }[form.attrKey]).map(v => <option key={v} value={v}>{v}</option>)}
                </Select>
              </Field>
            </div>
          )}
          {form.scope === 'GLOBAL' && (
            <div className="exa-globalnote"><Icon name="alert-triangle" size={15} /> Bu qoida tizimdagi <b>barcha</b> mos topilmalarga ta'sir qiladi. Ehtiyot bo'ling.</div>
          )}

          <Field label="Sabab"><Textarea placeholder="Nima uchun bostirilmoqda..." value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} /></Field>
          <Field label="Amal qilish muddati" hint="Muddat tugagach topilmalar avtomatik qayta faollashadi.">
            <div className="exa-seg" style={{ display: 'flex' }}>
              {['30', '60', '90', '180'].map(d => (
                <button key={d} type="button" className={'exa-seg__btn' + (form.days === d ? ' is-active' : '')} style={{ flex: 1 }} onClick={() => setForm({ ...form, days: d })}>{d} kun</button>
              ))}
            </div>
          </Field>

          {/* live preview */}
          <div className="exa-supprev">
            <div className="exa-supprev__head"><Icon name="eye" size={13} /> Ko'rinish</div>
            <div className="exa-supprev__row"><span>Qamrov</span><b>{SCOPE[form.scope].label}</b></div>
            <div className="exa-supprev__row"><span>Nishon</span><b style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{buildTarget(form) || '—'}</b></div>
            {estimate(form) != null && (
              <div className="exa-supprev__row"><span>Taxminiy ta'sir</span><b style={{ color: estimate(form) ? 'var(--sev-h)' : 'var(--muted-foreground)' }}>{estimate(form)} ta topilma</b></div>
            )}
          </div>
        </div>
      </Dialog>

      <Dialog open={!!delRow} onClose={() => setDelRow(null)}
        title="Qoidani o'chirish" desc={delRow ? `"${delRow.target}" bostirish qoidasi butunlay o'chiriladi. Bu amalni qaytarib bo'lmaydi.` : ''}
        footer={<>
          <Button variant="outline" onClick={() => setDelRow(null)}>Bekor qilish</Button>
          <Button variant="destructive" onClick={removeRule}>Ha, o'chirish</Button>
        </>} />
    </div>
  );
}

window.Suppressions = Suppressions;
