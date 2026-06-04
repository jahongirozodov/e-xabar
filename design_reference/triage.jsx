// triage.jsx — Triage kanban doskasi (drag & drop bilan).
// findings.jsx dan FINDINGS, SevBadge, Confidence, Drawer ni qayta ishlatadi.
const { useState: tState, useMemo: tMemo } = React;

const COLS = [
  { id: 'queue',    label: 'Navbatda',            tone: 'l',   icon: 'inbox',        hint: "Ko'rib chiqishni kutmoqda" },
  { id: 'review',   label: 'Tekshirilmoqda',      tone: 'h',   icon: 'eye',          hint: 'Mutaxassis tahlil qilmoqda' },
  { id: 'applicable', label: 'Tasdiqlangan',      tone: 'c',   icon: 'shield-alert', hint: 'Haqiqiy zaiflik' },
  { id: 'not_app',  label: 'Tegishli emas',       tone: 'mute', icon: 'ban',         hint: 'False positive' },
  { id: 'accepted', label: 'Xavf qabul qilingan', tone: 'info', icon: 'shield-check', hint: 'Kompensatsion nazorat' },
];
const TONE_VAR = { c: 'var(--sev-c)', h: 'var(--sev-h)', m: 'var(--sev-m)', l: 'var(--sev-l)', info: 'var(--kev)', mute: 'var(--muted-foreground)' };

// initial column assignment from finding status
const STATUS_TO_COL = {
  NEW: 'queue', PENDING_REVIEW: 'review', APPLICABLE: 'applicable',
  NOTIFIED: 'applicable', IN_PROGRESS: 'applicable', PATCHED: 'applicable',
  NOT_APPLICABLE: 'not_app', ACCEPTED_RISK: 'accepted',
};

function Triage({ toast }) {
  const SRC = window.ExaFINDINGS || [];
  const SevBadge = window.ExaSevBadge, Confidence = window.ExaConfidence, Drawer = window.ExaDrawer;
  const [cards, setCards] = tState(() => SRC.map(f => ({ ...f, col: STATUS_TO_COL[f.status] || 'queue' })));
  const [drag, setDrag] = tState(null);     // dragged card id
  const [over, setOver] = tState(null);     // column being dragged over
  const [open, setOpen] = tState(null);
  const [q, setQ] = tState('');

  const filtered = q
    ? cards.filter(c => (c.cve + c.title + c.asset.name + c.asset.owner).toLowerCase().includes(q.toLowerCase()))
    : cards;
  const byCol = tMemo(() => {
    const m = {}; COLS.forEach(c => m[c.id] = []);
    filtered.forEach(c => { (m[c.col] || m.queue).push(c); });
    return m;
  }, [filtered]);

  function drop(colId) {
    if (!drag) return;
    const card = cards.find(c => c.id === drag);
    if (card && card.col !== colId) {
      setCards(cs => cs.map(c => c.id === drag ? { ...c, col: colId } : c));
      const col = COLS.find(c => c.id === colId);
      toast({ title: 'Triage yangilandi', desc: `${card.cve} → ${col.label}`, variant: colId === 'not_app' ? 'destructive' : undefined });
    }
    setDrag(null); setOver(null);
  }

  return (
    <div className="ds-stack">
      <div className="exa-toolbar">
        <div className="ds-search ds-search--inline">
          <Icon name="search" size={15} style={{ color: 'var(--muted-foreground)' }} />
          <input placeholder="Topilma qidirish..." value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <div className="exa-toolbar__right">
          <span className="exa-tri-hint"><Icon name="list-checks" size={14} /> Kartani ustunlar orasida torting</span>
          <Button variant="outline" size="sm"><Icon name="radar" size={15} /> Avtomatik triage</Button>
        </div>
      </div>

      <div className="exa-board">
        {COLS.map(col => (
          <div key={col.id}
            className={'exa-col' + (over === col.id ? ' is-over' : '')}
            onDragOver={e => { e.preventDefault(); if (over !== col.id) setOver(col.id); }}
            onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) setOver(o => o === col.id ? null : o); }}
            onDrop={() => drop(col.id)}>
            <div className="exa-col__head">
              <span className="exa-col__dot" style={{ background: TONE_VAR[col.tone] }} />
              <span className="exa-col__label">{col.label}</span>
              <span className="exa-col__count">{byCol[col.id].length}</span>
            </div>
            <div className="exa-col__hint">{col.hint}</div>
            <div className="exa-col__body">
              {byCol[col.id].map(c => (
                <div key={c.id}
                  className={'exa-tcard' + (drag === c.id ? ' is-dragging' : '')}
                  draggable
                  onDragStart={() => setDrag(c.id)}
                  onDragEnd={() => { setDrag(null); setOver(null); }}
                  onClick={() => setOpen(c)}>
                  <div className="exa-tcard__top">
                    <span className="exa-tcard__cve">{c.cve}</span>
                    {c.kev && <span className="exa-kev">KEV</span>}
                  </div>
                  <div className="exa-tcard__title">{c.title}</div>
                  <div className="exa-tcard__asset"><Icon name="package" size={12} /> {c.asset.name} <span className="exa-asset__ver">{c.asset.ver}</span></div>
                  <div className="exa-tcard__conf"><Confidence v={c.conf} /></div>
                  <div className="exa-tcard__foot">
                    <SevBadge sev={c.sev} />
                    <span className="exa-tcard__meta">
                      <span className="exa-tcard__owner" title={c.asset.owner}>{c.asset.owner.split(' ').map(s => s[0]).join('').slice(0, 2)}</span>
                      <span className="exa-tcard__age">{c.age} kun</span>
                    </span>
                  </div>
                </div>
              ))}
              {byCol[col.id].length === 0 && <div className="exa-col__empty">Bo'sh</div>}
            </div>
          </div>
        ))}
      </div>

      {Drawer && <Drawer f={open} onClose={() => setOpen(null)} toast={toast} />}
    </div>
  );
}

window.Triage = Triage;
