// Topbar.jsx — e-Xabar header: sidebar toggle, breadcrumb, search, scan, theme, alerts
function Topbar({ title, onToggleSidebar, onNavigate, theme, onToggleTheme }) {
  return (
    <header className="ds-topbar">
      <div className="ds-topbar__left">
        <button className="ui-btn ui-btn--ghost ui-btn--icon" onClick={onToggleSidebar} aria-label="Menu">
          <Icon name="panel-left" size={18} />
        </button>
        <div className="ds-divider-v" />
        <nav className="ds-breadcrumb">
          <span className="ds-breadcrumb__muted">e-Xabar</span>
          <Icon name="chevron-right" size={14} style={{ color: 'var(--muted-foreground)' }} />
          <span>{title}</span>
        </nav>
      </div>

      <div className="ds-topbar__right">
        <div className="ds-search">
          <Icon name="search" size={15} style={{ color: 'var(--muted-foreground)' }} />
          <input placeholder="CVE, vosita yoki xodim..." />
          <span className="ui-kbd">⌘K</span>
        </div>
        <button className="ui-btn ui-btn--ghost ui-btn--icon" onClick={onToggleTheme} aria-label="Mavzu">
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
        </button>
        <Menu trigger={
          <button className="ui-btn ui-btn--ghost ui-btn--icon" aria-label="Ogohlantirishlar" style={{ position: 'relative' }}>
            <Icon name="bell" size={18} />
            <span className="ds-notif-dot" />
          </button>
        }>
          <div className="ds-menu__label">Ogohlantirishlar</div>
          <div className="ds-sep-line" />
          <MenuItem><span><b>3 ta KEV</b> topilma aniqlandi</span></MenuItem>
          <MenuItem><span>Skan <b>yakunlandi</b> — 1,248 vosita</span></MenuItem>
          <MenuItem><span><b>NVD</b> manbasi qayta ulandi</span></MenuItem>
        </Menu>
        <Menu trigger={<button className="ds-avatar-btn"><Avatar initials="BS" /></button>}>
          <div className="ds-menu__userhead">
            <div className="ds-user__name">Bobur Saidov</div>
            <div className="ds-user__mail">b.saidov@example.uz</div>
          </div>
          <div className="ds-sep-line" />
          <MenuItem onClick={() => onNavigate && onNavigate('profile')}><Icon name="users" size={15} /> Profil</MenuItem>
          <MenuItem onClick={() => onNavigate && onNavigate('settings')}><Icon name="settings" size={15} /> Sozlamalar</MenuItem>
          <div className="ds-sep-line" />
          <MenuItem danger onClick={() => { window.location.href = 'e-Xabar Login.html'; }}><Icon name="log-out" size={15} /> Chiqish</MenuItem>
        </Menu>
      </div>
    </header>
  );
}
window.Topbar = Topbar;
