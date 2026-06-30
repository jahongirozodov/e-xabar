// Sidebar.jsx — OGOH MAI app sidebar (nav groups, collapsible icon mode)
function Sidebar({ nav, active, onNavigate, collapsed }) {
  return (
    <aside className={'ds-sidebar' + (collapsed ? ' ds-sidebar--collapsed' : '')}>
      <div className="ds-sidebar__brand">
        <div className="ds-brand-mark"><Icon name="shield" size={17} /></div>
        {!collapsed && (
          <div className="ds-brand-text">
            <div className="ds-brand-name">OGOH MAI</div>
            <div className="ds-brand-plan">Kiberxavfsizlik</div>
          </div>
        )}
        {!collapsed && <Icon name="chevrons-up-down" size={14} className="ds-brand-chev" />}
      </div>

      <nav className="ds-sidebar__nav">
        {nav.map(group => (
          <div className="ds-nav-group" key={group.label}>
            {!collapsed && <div className="ds-nav-group__label">{group.label}</div>}
            {group.items.map(item => (
              <button key={item.id}
                className={'ds-nav-item' + (active === item.id ? ' is-active' : '')}
                onClick={() => onNavigate(item.id)}
                title={collapsed ? item.label : undefined}>
                <Icon name={item.icon} size={16} />
                {!collapsed && <span>{item.label}</span>}
                {!collapsed && item.badge && (
                  <span className={'ds-nav-item__badge' + (item.badgeTone ? ' ds-nav-item__badge--' + item.badgeTone : '')}>{item.badge}</span>
                )}
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className="ds-sidebar__footer">
        <button className={'ds-nav-item' + (active === 'profile' ? ' is-active' : '')} onClick={() => onNavigate('profile')} title={collapsed ? 'Profil' : undefined}>
          <Avatar initials="BS" />
          {!collapsed && (
            <span className="ds-user">
              <span className="ds-user__name">Bobur Saidov</span>
              <span className="ds-user__mail">Mutaxassis</span>
            </span>
          )}
          {!collapsed && <Icon name="chevrons-up-down" size={14} style={{ color: 'var(--muted-foreground)' }} />}
        </button>
      </div>
    </aside>
  );
}
window.Sidebar = Sidebar;
