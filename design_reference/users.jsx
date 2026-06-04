// users.jsx — Foydalanuvchilar (tizim foydalanuvchilari + RBAC).
const { useState: usState } = React;

const ROLE = {
  ADMIN:           { label: 'Administrator', tone: 'kev' },
  SPECIALIST:      { label: 'Mutaxassis', tone: 'l' },
  SECTION_HEAD:    { label: "Bo'lim boshlig'i", tone: 'h' },
  DEPARTMENT_HEAD: { label: 'Departament rahbari', tone: 'ok' },
};
const ROLE_VAR = { kev: 'var(--kev)', l: 'var(--sev-l)', h: 'var(--sev-h)', ok: 'oklch(0.64 0.15 155)' };

const USERS_SEED = [
  { id: 'u1', name: 'Bobur Saidov', email: 'b.saidov@example.uz', roles: ['ADMIN', 'SPECIALIST'], totp: true, active: true, last: '3 Iyun, 08:58', you: true },
  { id: 'u2', name: 'Anvar Karimov', email: 'a.karimov@example.uz', roles: ['ADMIN'], totp: true, active: true, last: '3 Iyun, 07:41' },
  { id: 'u3', name: 'Dilnoza Yusupova', email: 'd.yusupova@example.uz', roles: ['SPECIALIST'], totp: true, active: true, last: '2 Iyun, 16:22' },
  { id: 'u4', name: 'Sardor Aliyev', email: 's.aliyev@example.uz', roles: ['SPECIALIST'], totp: false, active: true, last: '2 Iyun, 11:05' },
  { id: 'u5', name: 'Nodira Rashidova', email: 'n.rashidova@example.uz', roles: ['SECTION_HEAD'], totp: true, active: true, last: '1 Iyun, 09:33' },
  { id: 'u6', name: 'Jasur Tursunov', email: 'j.tursunov@example.uz', roles: ['DEPARTMENT_HEAD'], totp: false, active: true, last: '28 May, 14:50' },
  { id: 'u7', name: 'Kamola Saidova', email: 'k.saidova@example.uz', roles: ['SPECIALIST'], totp: true, active: false, last: '12 May, 10:18' },
];
const ALL_ROLES = Object.keys(ROLE);

function RoleBadge({ r }) {
  const t = ROLE[r];
  return <span className="exa-rolebadge" style={{ color: ROLE_VAR[t.tone], background: `color-mix(in oklab, ${ROLE_VAR[t.tone]} 14%, transparent)` }}>{t.label}</span>;
}

function Users({ toast }) {
  const [rows, setRows] = usState(USERS_SEED);
  const [q, setQ] = usState('');
  const [addOpen, setAddOpen] = usState(false);
  const [form, setForm] = usState({ name: '', email: '', roles: ['SPECIALIST'] });

  const filtered = rows.filter(u => !q || (u.name + u.email).toLowerCase().includes(q.toLowerCase()));
  const total = rows.length, active = rows.filter(u => u.active).length;
  const admins = rows.filter(u => u.roles.includes('ADMIN')).length;

  function toggleRole(r) {
    setForm(f => ({ ...f, roles: f.roles.includes(r) ? f.roles.filter(x => x !== r) : [...f.roles, r] }));
  }
  function addUser() {
    if (!form.name.trim() || !form.email.includes('@') || form.roles.length === 0) {
      toast({ title: 'Maydonlar to\u2019ldirilmagan', desc: 'Ism, email va kamida bitta rol majburiy.', variant: 'destructive' }); return;
    }
    const id = 'u' + Date.now();
    setRows([{ id, name: form.name, email: form.email, roles: form.roles, totp: false, active: true, last: '—' }, ...rows]);
    setAddOpen(false); setForm({ name: '', email: '', roles: ['SPECIALIST'] });
    toast({ title: 'Foydalanuvchi qo\u2019shildi', desc: form.name + ' tizimga qo\u2019shildi.' });
  }
  function toggleActive(id) { setRows(rs => rs.map(u => u.id === id ? { ...u, active: !u.active } : u)); }

  return (
    <div className="ds-stack">
      <div className="exa-supstats">
        <div className="exa-supstat"><span className="exa-supstat__ico"><Icon name="users" size={16} /></span><div><div className="exa-supstat__v">{total}</div><div className="exa-supstat__l">Jami foydalanuvchi</div></div></div>
        <div className="exa-supstat"><span className="exa-supstat__ico" style={{ color: 'oklch(0.64 0.15 155)', background: 'color-mix(in oklab, oklch(0.64 0.15 155) 15%, transparent)' }}><Icon name="circle-check" size={16} /></span><div><div className="exa-supstat__v">{active}</div><div className="exa-supstat__l">Faol</div></div></div>
        <div className="exa-supstat"><span className="exa-supstat__ico" style={{ color: 'var(--kev)', background: 'color-mix(in oklab, var(--kev) 14%, transparent)' }}><Icon name="shield" size={16} /></span><div><div className="exa-supstat__v">{admins}</div><div className="exa-supstat__l">Administrator</div></div></div>
      </div>

      <div className="exa-toolbar">
        <div className="ds-search ds-search--inline">
          <Icon name="search" size={15} style={{ color: 'var(--muted-foreground)' }} />
          <input placeholder="Ism yoki email..." value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <div className="exa-toolbar__right">
          <Button variant="primary" size="sm" onClick={() => setAddOpen(true)}><Icon name="plus" size={15} /> Foydalanuvchi qo'shish</Button>
        </div>
      </div>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <table className="ui-table exa-table exa-ftable">
          <thead>
            <tr><th>Foydalanuvchi</th><th>Rollar</th><th>2FA</th><th>Holat</th><th>Oxirgi kirish</th><th style={{ width: 36 }}></th></tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} className={u.active ? '' : 'exa-row-off'}>
                <td>
                  <div className="exa-cell-owner">
                    <Avatar initials={u.name.split(' ').map(s => s[0]).join('').slice(0, 2)} />
                    <div>
                      <div className="exa-cell-name" style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>{u.name}{u.you && <span className="exa-you">Siz</span>}</div>
                      <div className="exa-cell-mail" style={{ fontSize: '0.6875rem', color: 'var(--muted-foreground)', fontFamily: 'var(--font-mono)' }}>{u.email}</div>
                    </div>
                  </div>
                </td>
                <td><div className="exa-roles">{u.roles.map(r => <RoleBadge key={r} r={r} />)}</div></td>
                <td>
                  {u.totp
                    ? <span className="exa-2fa exa-2fa--on"><Icon name="shield-check" size={13} /> Yoqilgan</span>
                    : <span className="exa-2fa exa-2fa--off"><Icon name="shield" size={13} /> O'chiq</span>}
                </td>
                <td><span className={'exa-status exa-status--' + (u.active ? 'ok' : 'mute')}>{u.active ? 'Faol' : 'Nofaol'}</span></td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{u.last}</td>
                <td>
                  <Menu trigger={<button className="ui-btn ui-btn--ghost ui-btn--icon" style={{ height: 30, width: 30 }}><Icon name="more-horizontal" size={16} /></button>}>
                    <MenuItem><Icon name="pencil" size={15} /> Tahrirlash</MenuItem>
                    <MenuItem onClick={() => toast({ title: 'Rollar', desc: u.name + ' rollarini boshqarish.' })}><Icon name="shield" size={15} /> Rollarni boshqarish</MenuItem>
                    <MenuItem onClick={() => toggleActive(u.id)}><Icon name={u.active ? 'ban' : 'circle-check'} size={15} /> {u.active ? 'Bloklash' : 'Faollashtirish'}</MenuItem>
                    {!u.totp && <MenuItem onClick={() => toast({ title: '2FA so\u2019rovi yuborildi', desc: u.name + ' ga.' })}><Icon name="mail" size={15} /> 2FA so'rash</MenuItem>}
                    <div className="ds-sep-line" />
                    <MenuItem danger><Icon name="trash-2" size={15} /> O'chirish</MenuItem>
                  </Menu>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted-foreground)' }}>Hech narsa topilmadi.</td></tr>}
          </tbody>
        </table>
      </Card>
      <div className="ds-table-foot">{filtered.length} ta foydalanuvchi · bir foydalanuvchi bir nechta rolga ega bo'lishi mumkin</div>

      <Dialog open={addOpen} onClose={() => setAddOpen(false)}
        title="Foydalanuvchi qo'shish" desc="Yangi foydalanuvchiga rol(lar) tayinlang. Boshlang'ich parol emailga yuboriladi." maxWidth="32rem"
        footer={<>
          <Button variant="outline" onClick={() => setAddOpen(false)}>Bekor qilish</Button>
          <Button variant="primary" onClick={addUser}>Saqlash</Button>
        </>}>
        <div className="ds-form-grid">
          <div className="ds-form-grid ds-form-grid--2">
            <Field label="To'liq ism"><Input placeholder="Ism Familiya" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="Email"><Input type="email" placeholder="ism@example.uz" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></Field>
          </div>
          <Field label="Rollar" hint="Kamida bittasini tanlang.">
            <div className="exa-rolepick">
              {ALL_ROLES.map(r => (
                <button key={r} type="button" className={'exa-rolepick__btn' + (form.roles.includes(r) ? ' is-active' : '')} onClick={() => toggleRole(r)}>
                  <span className="exa-check">{form.roles.includes(r) && <Icon name="check" size={13} />}</span>
                  <RoleBadge r={r} />
                </button>
              ))}
            </div>
          </Field>
        </div>
      </Dialog>
    </div>
  );
}

window.Users = Users;
