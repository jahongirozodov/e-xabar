// app.jsx — OGOH MAI admin shell (dark default, Uzbek)
const { useState: uS, useEffect: uE, useCallback } = React;

const NAV = [
  { label: 'Monitoring', items: [
    { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
    { id: 'assets', label: 'Vositalar', icon: 'server' },
    { id: 'findings', label: 'Topilmalar', icon: 'bug', badge: '342' },
    { id: 'triage', label: 'Triage', icon: 'list-checks', badge: '28', badgeTone: 'warning' },
    { id: 'cve', label: 'CVE bazasi', icon: 'shield' },
  ]},
  { label: 'Operatsiyalar', items: [
    { id: 'scans', label: 'Skanlar', icon: 'radar' },
    { id: 'notifications', label: 'Xabarnomalar', icon: 'mail' },
    { id: 'suppressions', label: 'Bostirishlar', icon: 'ban' },
  ]},
  { label: 'Tizim', items: [
    { id: 'reports', label: 'Hisobotlar', icon: 'bar-chart-3' },
    { id: 'audit', label: 'Audit jurnali', icon: 'file-text' },
    { id: 'users', label: 'Foydalanuvchilar', icon: 'users' },
    { id: 'settings', label: 'Sozlamalar', icon: 'settings' },
  ]},
];
const TITLES = {
  dashboard: 'Boshqaruv paneli', assets: 'Vositalar', findings: 'Topilmalar', triage: 'Triage',
  scans: 'Skanlar', notifications: 'Xabarnomalar', suppressions: 'Bostirishlar',
  reports: 'Hisobotlar', audit: 'Audit jurnali', settings: 'Sozlamalar', cve: 'CVE bazasi', users: 'Foydalanuvchilar',
  profile: 'Profil',
};
const SUBS = {
  dashboard: 'Zaiflik holatining umumiy ko\u2019rinishi va so\u2019nggi faollik.',
  assets: 'Inventardagi vositalar va ularning zaifliklari.',
  findings: 'Aniqlangan topilmalar ro\u2019yxati.',
  triage: 'Ko\u2019rib chiqishni kutayotgan topilmalar.',
  scans: 'Skanlar tarixi va qo\u2019lda ishga tushirish.',
  notifications: 'Xodimlarga yuborilgan xabarnomalar.',
  suppressions: 'Faol bostirish qoidalari.',
  reports: 'Hisobotlar va eksport.',
  audit: 'Tizimdagi barcha amallar jurnali.',
  settings: 'Tizim va integratsiya sozlamalari.',
  cve: 'Manbalardan yig\u2019ilgan zaifliklar bilim bazasi.',
  users: 'Tizim foydalanuvchilari va rollar (RBAC).',
  profile: 'Hisob ma\u2019lumotlari va xavfsizlik sozlamalari.',
};

const ACCENTS = {
  default: null,
  blue:   { l: 'oklch(0.546 0.215 262.9)', d: 'oklch(0.623 0.214 259.8)' },
  violet: { l: 'oklch(0.541 0.246 293.0)', d: 'oklch(0.606 0.250 292.7)' },
  green:  { l: 'oklch(0.527 0.154 150.1)', d: 'oklch(0.696 0.170 162.5)' },
};

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "dark",
  "density": "comfortable",
  "sidebar": "expanded",
  "accent": "default"
}/*EDITMODE-END*/;

function Toasts({ items, dismiss }) {
  return (
    <div className="ds-toast-wrap">
      {items.map(t => (
        <div key={t.id} className="ui-toast ds-anim-toast">
          <span style={{ marginTop: 1, color: t.variant === 'destructive' ? 'var(--destructive)' : 'oklch(0.6 0.13 155)' }}>
            <Icon name={t.variant === 'destructive' ? 'trash-2' : 'circle-check'} size={18} />
          </span>
          <div style={{ flex: 1 }}>
            <div className="ui-toast__title">{t.title}</div>
            {t.desc && <div className="ui-toast__desc">{t.desc}</div>}
          </div>
          <button className="ui-btn ui-btn--ghost ui-btn--icon" style={{ height: 28, width: 28 }} onClick={() => dismiss(t.id)}>
            <Icon name="x" size={15} />
          </button>
        </div>
      ))}
    </div>
  );
}

function Placeholder({ title }) {
  return (
    <Card><CardContent style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
      <div style={{ display: 'inline-flex', width: 44, height: 44, borderRadius: 'var(--radius-lg)', background: 'var(--muted)', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
        <Icon name="inbox" size={20} />
      </div>
      <div style={{ fontWeight: 600, color: 'var(--foreground)' }}>{title}</div>
      <div style={{ fontSize: '0.8125rem', marginTop: 4 }}>Bu bo'lim keyingi bosqichda tayyorlanadi.</div>
    </CardContent></Card>
  );
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [route, setRoute] = uS('dashboard');
  const [toasts, setToasts] = uS([]);
  const [collapsed, setCollapsed] = uS(t.sidebar === 'icon');
  uE(() => { setCollapsed(t.sidebar === 'icon'); }, [t.sidebar]);

  const toast = useCallback((payload) => {
    const id = Date.now() + Math.random();
    setToasts(ts => [...ts, { id, ...payload }]);
    setTimeout(() => setToasts(ts => ts.filter(x => x.id !== id)), 3800);
  }, []);
  const dismiss = (id) => setToasts(ts => ts.filter(x => x.id !== id));

  uE(() => {
    const root = document.documentElement;
    root.classList.add('ds-no-transition');
    root.classList.toggle('dark', t.theme === 'dark');
    const a = ACCENTS[t.accent];
    if (a) {
      const v = t.theme === 'dark' ? a.d : a.l;
      root.style.setProperty('--primary', v);
      root.style.setProperty('--ring', v);
      root.style.setProperty('--sidebar-primary', v);
      root.style.setProperty('--primary-foreground', 'oklch(0.985 0 0)');
    } else {
      ['--primary','--ring','--sidebar-primary','--primary-foreground'].forEach(p => root.style.removeProperty(p));
    }
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('ds-no-transition')));
  }, [t.theme, t.accent]);

  return (
    <div className={'ds-app density-' + t.density} data-screen-label={TITLES[route]}>
      <Sidebar nav={NAV} active={route} onNavigate={setRoute} collapsed={collapsed} />
      <div className="ds-main">
        <Topbar
          title={TITLES[route]}
          onToggleSidebar={() => setCollapsed(c => !c)}
          onNavigate={setRoute}
          theme={t.theme}
          onToggleTheme={() => setTweak('theme', t.theme === 'dark' ? 'light' : 'dark')}
        />
        <main className="ds-content">
          <div className="ds-content__head">
            <div>
              <h1 className="ds-page-title">{TITLES[route]}</h1>
              <p className="ds-page-sub">{SUBS[route]}</p>
            </div>
          </div>
          {route === 'dashboard' ? <Dashboard />
            : route === 'findings' ? <Findings toast={toast} />
            : route === 'triage' ? <Triage toast={toast} />
            : route === 'assets' ? <Assets toast={toast} />
            : route === 'suppressions' ? <Suppressions toast={toast} />
            : route === 'scans' ? <Scans toast={toast} />
            : route === 'notifications' ? <Notifications toast={toast} />
            : route === 'audit' ? <Audit />
            : route === 'cve' ? <Cve />
            : route === 'users' ? <Users toast={toast} />
            : route === 'reports' ? <Reports toast={toast} />
            : route === 'settings' ? <Settings toast={toast} />
            : route === 'profile' ? <Profile toast={toast} />
            : <Placeholder title={TITLES[route]} />}
        </main>
      </div>

      <Toasts items={toasts} dismiss={dismiss} />

      <TweaksPanel>
        <TweakSection label="Tartib" />
        <TweakRadio label="Zichlik" value={t.density} options={['comfortable', 'compact']}
          onChange={(v) => setTweak('density', v)} />
        <TweakRadio label="Yon panel" value={t.sidebar} options={['expanded', 'icon']}
          onChange={(v) => setTweak('sidebar', v)} />
        <TweakSection label="Ko'rinish" />
        <TweakRadio label="Mavzu" value={t.theme} options={['light', 'dark']}
          onChange={(v) => setTweak('theme', v)} />
        <TweakColor label="Asosiy rang" value={t.accent === 'default' ? '#18181b' : { blue:'#2563eb', violet:'#7c3aed', green:'#16a34a' }[t.accent]}
          options={['#18181b', '#2563eb', '#7c3aed', '#16a34a']}
          onChange={(hex) => setTweak('accent', { '#18181b':'default', '#2563eb':'blue', '#7c3aed':'violet', '#16a34a':'green' }[hex] || 'default')} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
