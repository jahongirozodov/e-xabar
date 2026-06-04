// charts.jsx — lightweight, theme-aware SVG charts (no external deps).
// LineChart (multi-series, smooth, crosshair tooltip) + DonutChart (severity).
const { useRef: cRef, useState: cState, useLayoutEffect } = React;

// measure container width responsively
function useWidth() {
  const ref = cRef(null);
  const [w, setW] = cState(0);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    setW(el.clientWidth);
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}

function smoothPath(pts) {
  if (pts.length < 2) return '';
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6, cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6, cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

// series: [{ name, color, data:[n], area?:bool }]
// xLabels: [{ i, label }]  (sparse ticks)
function LineChart({ series, xLabels = [], height = 260, yMax, yTicks = 4, unit = '' }) {
  const [ref, w] = useWidth();
  const [hover, setHover] = cState(null);
  const padL = 40, padR = 16, padT = 14, padB = 26;
  const n = series[0] ? series[0].data.length : 0;
  const max = yMax || Math.max(1, ...series.flatMap(s => s.data)) * 1.12;
  const plotW = Math.max(0, w - padL - padR);
  const plotH = height - padT - padB;
  const xAt = i => padL + (n <= 1 ? 0 : (i / (n - 1)) * plotW);
  const yAt = v => padT + plotH - (v / max) * plotH;

  const ready = w > 0 && n > 0;
  const grid = Array.from({ length: yTicks + 1 }, (_, k) => Math.round((max / yTicks) * k));

  function onMove(e) {
    if (!ready) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    let i = Math.round(((x - padL) / plotW) * (n - 1));
    i = Math.max(0, Math.min(n - 1, i));
    setHover(i);
  }

  return (
    <div ref={ref} className="exa-chart" style={{ position: 'relative' }}>
      {ready && (
        <svg width={w} height={height} style={{ display: 'block', overflow: 'visible' }}
          onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
          <defs>
            {series.map((s, si) => (
              <linearGradient key={si} id={'exa-fill-' + si} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" style={{ stopColor: s.color, stopOpacity: 0.22 }} />
                <stop offset="100%" style={{ stopColor: s.color, stopOpacity: 0 }} />
              </linearGradient>
            ))}
          </defs>

          {/* gridlines + y labels */}
          {grid.map((g, k) => (
            <g key={k}>
              <line x1={padL} x2={w - padR} y1={yAt(g)} y2={yAt(g)}
                style={{ stroke: 'var(--border)' }} strokeWidth="1" strokeDasharray={k === 0 ? '0' : '3 4'} />
              <text x={padL - 8} y={yAt(g) + 3} textAnchor="end" className="exa-axis">{g}</text>
            </g>
          ))}

          {/* x labels */}
          {xLabels.map(t => (
            <text key={t.i} x={xAt(t.i)} y={height - 8} textAnchor="middle" className="exa-axis">{t.label}</text>
          ))}

          {/* series */}
          {series.map((s, si) => {
            const pts = s.data.map((v, i) => ({ x: xAt(i), y: yAt(v) }));
            const line = smoothPath(pts);
            const area = s.area ? `${line} L ${pts[pts.length - 1].x} ${padT + plotH} L ${pts[0].x} ${padT + plotH} Z` : null;
            return (
              <g key={si}>
                {area && <path d={area} fill={`url(#exa-fill-${si})`} />}
                <path d={line} fill="none" style={{ stroke: s.color }} strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" />
              </g>
            );
          })}

          {/* crosshair */}
          {hover != null && (
            <g>
              <line x1={xAt(hover)} x2={xAt(hover)} y1={padT} y2={padT + plotH}
                style={{ stroke: 'var(--muted-foreground)' }} strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
              {series.map((s, si) => (
                <circle key={si} cx={xAt(hover)} cy={yAt(s.data[hover])} r="3.5"
                  style={{ fill: 'var(--card)', stroke: s.color }} strokeWidth="2" />
              ))}
            </g>
          )}
        </svg>
      )}

      {/* tooltip */}
      {ready && hover != null && (
        <div className="exa-tip" style={{
          left: Math.min(Math.max(xAt(hover), 70), w - 70), top: 6,
        }}>
          <div className="exa-tip__head">{xLabels.find(t => t.i === hover)?.label || `${hover + 1}-kun`}</div>
          {series.map((s, si) => (
            <div className="exa-tip__row" key={si}>
              <span className="exa-tip__dot" style={{ background: s.color }} />
              <span className="exa-tip__name">{s.name}</span>
              <span className="exa-tip__val">{s.data[hover]}{unit}</span>
            </div>
          ))}
        </div>
      )}

      <div className="exa-legend">
        {series.map((s, si) => (
          <span className="exa-legend__item" key={si}>
            <span className="exa-legend__sw" style={{ background: s.color }} />{s.name}
          </span>
        ))}
      </div>
    </div>
  );
}

// data: [{ label, value, color }]
function DonutChart({ data, size = 200, thickness = 26, centerLabel = 'Jami' }) {
  const [active, setActive] = cState(null);
  const total = data.reduce((a, d) => a + d.value, 0) || 1;
  const r = (size - thickness) / 2;
  const cx = size / 2, cy = size / 2;
  const C = 2 * Math.PI * r;
  let acc = 0;
  const segs = data.map(d => {
    const frac = d.value / total;
    const seg = { ...d, frac, offset: acc };
    acc += frac;
    return seg;
  });

  return (
    <div className="exa-donut">
      <div className="exa-donut__ring" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={cx} cy={cy} r={r} fill="none" style={{ stroke: 'var(--muted)' }} strokeWidth={thickness} opacity="0.5" />
          {segs.map((s, i) => {
            const len = s.frac * C;
            const isActive = active === i;
            return (
              <circle key={i} cx={cx} cy={cy} r={r} fill="none"
                style={{ stroke: s.color, transition: 'stroke-width .15s, opacity .15s', cursor: 'default' }}
                strokeWidth={isActive ? thickness + 4 : thickness}
                strokeDasharray={`${len - 2} ${C - len + 2}`}
                strokeDashoffset={-s.offset * C}
                opacity={active == null || isActive ? 1 : 0.35}
                strokeLinecap="butt"
                onMouseEnter={() => setActive(i)} onMouseLeave={() => setActive(null)} />
            );
          })}
        </svg>
        <div className="exa-donut__center">
          <div className="exa-donut__num">{active == null ? total : data[active].value}</div>
          <div className="exa-donut__lbl">{active == null ? centerLabel : data[active].label}</div>
        </div>
      </div>
      <div className="exa-donut__legend">
        {data.map((d, i) => (
          <div className={'exa-donut__row' + (active === i ? ' is-active' : '')} key={i}
            onMouseEnter={() => setActive(i)} onMouseLeave={() => setActive(null)}>
            <span className="exa-donut__sw" style={{ background: d.color }} />
            <span className="exa-donut__name">{d.label}</span>
            <span className="exa-donut__pct">{Math.round((d.value / total) * 100)}%</span>
            <span className="exa-donut__cnt">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { LineChart, DonutChart });
