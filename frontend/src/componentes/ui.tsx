import { useState, useEffect } from 'react';

export function SqlViewer({ sql }: { sql: string }) {
  if (!sql) return null;
  const highlighted = sql
    .replace(/\b(SELECT|FROM|JOIN|LEFT|RIGHT|INNER|WHERE|GROUP BY|HAVING|ORDER BY|ASC|DESC|LIMIT|OFFSET|AS|ON|AND|OR|IN|NOT|NULL|IS|COUNT|SUM|AVG|MAX|MIN|INSERT INTO|VALUES|UPDATE|SET|DELETE|BEGIN|COMMIT|ROLLBACK|RETURNING)\b/gi, '<span class="sql-keyword">$1</span>')
    .replace(/('.*?')/g, '<span class="sql-string">$1</span>');
  return (
    <div className="sql-viewer">
      <div className="sql-viewer-header">🔍 Consulta SQL Ejecutada</div>
      <pre dangerouslySetInnerHTML={{ __html: highlighted }} />
    </div>
  )
}

export function TypewriterSqlViewer({ sql, speed = 20 }: { sql: string, speed?: number }) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    if (!sql) {
      setDisplayedText('');
      return;
    }
    let i = 0;
    setDisplayedText('');
    const timer = setInterval(() => {
      setDisplayedText(prev => prev + sql.charAt(i));
      i++;
      if (i >= sql.length) clearInterval(timer);
    }, speed);
    return () => clearInterval(timer);
  }, [sql, speed]);

  if (!displayedText) return null;

  const highlighted = displayedText
    .replace(/\b(SELECT|FROM|JOIN|LEFT|RIGHT|INNER|WHERE|GROUP BY|HAVING|ORDER BY|ASC|DESC|LIMIT|OFFSET|AS|ON|AND|OR|IN|NOT|NULL|IS|COUNT|SUM|AVG|MAX|MIN|INSERT INTO|VALUES|UPDATE|SET|DELETE|BEGIN|COMMIT|ROLLBACK|RETURNING)\b/gi, '<span class="sql-keyword">$1</span>')
    .replace(/('.*?')/g, '<span class="sql-string">$1</span>');
  return (
    <div className="sql-viewer" style={{ fontFamily: 'Consolas, Monaco, monospace' }}>
      <div className="sql-viewer-header" style={{ color: 'var(--text-muted)' }}>
        <span className="status-dot" style={{ background: 'var(--accent-blue)', boxShadow: '0 0 8px var(--accent-blue)' }}></span>
        TERMINAL DE TRANSACCIÓN ACTIVA
      </div>
      <pre dangerouslySetInnerHTML={{ __html: highlighted + '<span class="cursor-blink">█</span>' }} />
    </div>
  )
}

export function RefreshBtn({ onClick, spinning }: { onClick: () => void; spinning: boolean }) {
  return (
    <button id="btn-refresh" className={`refresh-btn${spinning ? ' spinning' : ''}`} onClick={onClick} aria-label="Actualizar">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M23 4v6h-6M1 20v-6h6" /><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" /></svg> Actualizar
    </button>
  )
}

export function EmptyState({ icon, msg }: { icon: string; msg: string }) { 
  return (
    <div className="state-box">
      <div className="state-box-icon">{icon}</div>
      <p>{msg}</p>
    </div>
  ) 
}

export function KpiCard({ icon, label, value, sub, gradient, loading }: any) {
  return (
    <article className="kpi-card" style={{ '--card-gradient': gradient } as any}>
      <div className="kpi-header"><span className="kpi-icon">{icon}</span><span className="kpi-label">{label}</span></div>
      {loading ? <div className="kpi-skeleton" /> : <div className="kpi-value">{value}</div>}
      <div className="kpi-sub">{sub}</div>
    </article>
  )
}
