// primitives.jsx — thin React wrappers over the .ui-* component CSS.
// Cosmetic recreations of shadcn/ui primitives (not production logic).
const { useState, useEffect, useRef } = React;

function Button({ variant = 'primary', size, className = '', children, ...rest }) {
  const cls = ['ui-btn', `ui-btn--${variant}`, size ? `ui-btn--${size}` : '', className]
    .filter(Boolean).join(' ');
  return <button className={cls} {...rest}>{children}</button>;
}

function Card({ className = '', children, ...rest }) {
  return <div className={'ui-card ' + className} {...rest}>{children}</div>;
}
function CardHeader({ children }) { return <div className="ui-card__header">{children}</div>; }
function CardTitle({ children }) { return <div className="ui-card__title">{children}</div>; }
function CardDesc({ children }) { return <div className="ui-card__desc">{children}</div>; }
function CardContent({ children, style }) { return <div className="ui-card__content" style={style}>{children}</div>; }
function CardFooter({ children }) { return <div className="ui-card__footer">{children}</div>; }

function Badge({ variant = 'default', children, className = '' }) {
  return <span className={`ui-badge ui-badge--${variant} ${className}`}>{children}</span>;
}

function Field({ label, hint, children }) {
  return (
    <div className="ui-field">
      {label && <label className="ui-label">{label}</label>}
      {children}
      {hint && <div className="ui-hint">{hint}</div>}
    </div>
  );
}
function Input(props) { return <input className="ui-input" {...props} />; }
function Textarea(props) { return <textarea className="ui-input" {...props} />; }
function Select({ children, ...rest }) { return <select className="ui-input ui-select" {...rest}>{children}</select>; }

function Tabs({ tabs, value, onChange }) {
  return (
    <div className="ui-tabs__list" role="tablist">
      {tabs.map(t => (
        <button key={t.value} role="tab" className="ui-tab"
          aria-selected={value === t.value}
          onClick={() => onChange(t.value)}>{t.label}</button>
      ))}
    </div>
  );
}

function Avatar({ initials, src }) {
  return <span className="ui-avatar">{src ? <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}</span>;
}

// Dialog — overlay + panel with fade/scale entrance
function Dialog({ open, onClose, title, desc, children, footer, maxWidth = '28rem' }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="ui-overlay ds-anim-overlay" onMouseDown={onClose}>
      <div className="ui-dialog ds-anim-dialog" style={{ maxWidth }} onMouseDown={e => e.stopPropagation()}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.375rem' }}>
          <div className="ui-dialog__title">{title}</div>
          {desc && <div className="ui-dialog__desc">{desc}</div>}
        </div>
        {children}
        {footer && <div className="ui-dialog__footer">{footer}</div>}
      </div>
    </div>
  );
}

// Lightweight dropdown menu
function Menu({ trigger, children, align = 'end' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div onClick={() => setOpen(o => !o)}>{trigger}</div>
      {open && (
        <div className="ds-menu ds-anim-menu" style={{ [align === 'end' ? 'right' : 'left']: 0 }}
          onClick={() => setOpen(false)}>
          {children}
        </div>
      )}
    </div>
  );
}
function MenuItem({ children, danger, ...rest }) {
  return <button className={'ds-menu__item' + (danger ? ' ds-menu__item--danger' : '')} {...rest}>{children}</button>;
}

Object.assign(window, {
  Button, Card, CardHeader, CardTitle, CardDesc, CardContent, CardFooter,
  Badge, Field, Input, Textarea, Select, Tabs, Avatar, Dialog, Menu, MenuItem,
});
