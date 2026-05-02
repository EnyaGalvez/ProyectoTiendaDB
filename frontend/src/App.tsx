import { useState, useEffect, useCallback } from 'react'
import './App.css'

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3002/api'

// ─── Types ─────────────────────────────────────────────────────────────────────
interface Empleado { id_actor: number; nombre_actor: string; apellido_actor: string; puesto_empleado: string; rol_especifico: string; nombre_supervisor: string | null }
interface Producto { id_producto: number; nombre_prod: string; descripcion_prod: string; precio_prod: number; precio_compra_base: number; stock: number; ubicacion_bodega: string; id_categoria: number; id_act_almacenista: number; categoria?: string; proveedor_principal?: string; gestionado_por?: string }
interface Cliente { id_actor: number; nombre_actor: string; apellido_actor: string; nit_cliente: string; total_compras: number; total_gastado: string }
interface Categoria { id_categoria: number; nombre: string; descripcion: string }
interface ApiResponse<T> { data: T; sql: string }

const fmt = new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' })
const fmtCurrency = (v: string | number) => fmt.format(Number(v))
function stockColor(stock: number): string { if (stock > 50) return 'var(--accent-green)'; if (stock > 15) return 'var(--accent-amber)'; return 'var(--accent-red)' }
function rolBadge(rol: string) { const map: Record<string, string> = { Cajero: 'badge-blue', Almacenista: 'badge-purple', Gerente: 'badge-green' }; return map[rol] ?? 'badge-amber' }

// ─── Hooks & Utils ─────────────────────────────────────────────────────────────
function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null)
  const [sql, setSql] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json() as ApiResponse<T>
      setData(json.data); setSql(json.sql || '');
    } catch (e) { setError(e instanceof Error ? e.message : 'Error desconocido') }
    finally { setLoading(false) }
  }, [url])

  useEffect(() => { void fetchData() }, [fetchData])
  return { data, sql, loading, error, refetch: fetchData }
}

function SqlViewer({ sql }: { sql: string }) {
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

function TypewriterSqlViewer({ sql, speed = 20 }: { sql: string, speed?: number }) {
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

function RefreshBtn({ onClick, spinning }: { onClick: () => void; spinning: boolean }) {
  return (
    <button id="btn-refresh" className={`refresh-btn${spinning ? ' spinning' : ''}`} onClick={onClick} aria-label="Actualizar">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M23 4v6h-6M1 20v-6h6" /><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" /></svg> Actualizar
    </button>
  )
}

function EmptyState({ icon, msg }: { icon: string; msg: string }) { return <div className="state-box"><div className="state-box-icon">{icon}</div><p>{msg}</p></div> }

function KpiCard({ icon, label, value, sub, gradient, loading }: any) {
  return (
    <article className="kpi-card" style={{ '--card-gradient': gradient } as any}>
      <div className="kpi-header"><span className="kpi-icon">{icon}</span><span className="kpi-label">{label}</span></div>
      {loading ? <div className="kpi-skeleton" /> : <div className="kpi-value">{value}</div>}
      <div className="kpi-sub">{sub}</div>
    </article>
  )
}

// ─── Componentes de Tablas Base ────────────────────────────────────────────────
function TablaCatalogo() {
  const { data, sql, loading, error, refetch } = useFetch<Producto[]>(`${API}/catalogo`)
  const maxStock = data ? Math.max(...data.map(p => p.stock), 1) : 1
  return (
    <div className="table-wrapper">
      <div className="table-toolbar">
        <span className="table-title">Catálogo de Productos</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>{data && <span className="table-count">{data.length} productos</span>}<RefreshBtn onClick={refetch} spinning={loading} /></div>
      </div>
      <div className="table-scroll">
        {error ? <EmptyState icon="⚠️" msg={`Error: ${error}`} /> : loading && !data ? <EmptyState icon="⏳" msg="Cargando..." /> : !data?.length ? <EmptyState icon="📦" msg="No hay datos." /> : (
          <table>
            <thead><tr><th>Producto</th><th>Categoría</th><th>Stock</th><th>Precio</th><th>Proveedor</th><th>Almacenista</th></tr></thead>
            <tbody>
              {data.map((p, i) => (
                <tr key={i}><td style={{ fontWeight: 500 }}>{p.nombre_prod}</td><td><span className="badge badge-purple">{p.categoria}</span></td>
                  <td><div className="stock-bar-wrap"><div className="stock-bar"><div className="stock-bar-fill" style={{ width: `${Math.min((p.stock / maxStock) * 100, 100)}%`, background: stockColor(p.stock) }} /></div><span className="stock-num" style={{ color: stockColor(p.stock) }}>{p.stock}</span></div></td>
                  <td style={{ fontWeight: 600, color: 'var(--accent-green)' }}>{fmtCurrency(p.precio_prod)}</td><td className="td-secondary">{p.proveedor_principal}</td><td className="td-secondary">{p.gestionado_por}</td></tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {sql && <SqlViewer sql={sql} />}
    </div>
  )
}

function TablaClientes() {
  const { data, sql, loading, error, refetch } = useFetch<Cliente[]>(`${API}/clientes/mejores?monto=0`)
  return (
    <div className="table-wrapper">
      <div className="table-toolbar">
        <span className="table-title">Mejores Clientes</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>{data && <span className="table-count">{data.length} clientes</span>}<RefreshBtn onClick={refetch} spinning={loading} /></div>
      </div>
      <div className="table-scroll">
        {error ? <EmptyState icon="⚠️" msg={`Error: ${error}`} /> : loading && !data ? <EmptyState icon="⏳" msg="Cargando..." /> : !data?.length ? <EmptyState icon="👥" msg="No hay datos." /> : (
          <table>
            <thead><tr><th>#</th><th>Cliente</th><th>NIT</th><th>Compras</th><th>Total Gastado</th></tr></thead>
            <tbody>
              {data.map((c, i) => (
                <tr key={c.id_actor}><td className="td-secondary">{i + 1}</td><td style={{ fontWeight: 500 }}>{c.nombre_actor} {c.apellido_actor}</td><td className="td-secondary">{c.nit_cliente}</td>
                  <td><span className="badge badge-blue">{c.total_compras} compras</span></td><td style={{ fontWeight: 700, color: 'var(--accent-amber)' }}>{fmtCurrency(c.total_gastado)}</td></tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {sql && <SqlViewer sql={sql} />}
    </div>
  )
}

function TablaEmpleados() {
  const { data, sql, loading, error, refetch } = useFetch<Empleado[]>(`${API}/empleados`)
  return (
    <div className="table-wrapper">
      <div className="table-toolbar">
        <span className="table-title">Directorio de Empleados</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>{data && <span className="table-count">{data.length} empleados</span>}<RefreshBtn onClick={refetch} spinning={loading} /></div>
      </div>
      <div className="table-scroll">
        {error ? <EmptyState icon="⚠️" msg={`Error: ${error}`} /> : loading && !data ? <EmptyState icon="⏳" msg="Cargando..." /> : !data?.length ? <EmptyState icon="🏢" msg="No hay datos." /> : (
          <table>
            <thead><tr><th>ID</th><th>Empleado</th><th>Puesto</th><th>Rol</th><th>Supervisor</th></tr></thead>
            <tbody>
              {data.map(e => (
                <tr key={e.id_actor}><td className="td-secondary">#{e.id_actor}</td><td style={{ fontWeight: 500 }}>{e.nombre_actor} {e.apellido_actor}</td><td className="td-secondary">{e.puesto_empleado}</td>
                  <td><span className={`badge ${rolBadge(e.rol_especifico)}`}>{e.rol_especifico}</span></td><td className="td-secondary">{e.nombre_supervisor ?? '—'}</td></tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {sql && <SqlViewer sql={sql} />}
    </div>
  )
}

// CRUDS
function CrudCategorias() {
  const { data, sql, loading, refetch } = useFetch<Categoria[]>(`${API}/categorias`)
  const [modalObj, setModalObj] = useState<Partial<Categoria> | null>(null)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = modalObj?.id_categoria ? 'PUT' : 'POST';
    const url = modalObj?.id_categoria ? `${API}/categorias/${modalObj.id_categoria}` : `${API}/categorias`;
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(modalObj) });
    setModalObj(null);
    refetch();
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Seguro que deseas eliminar esta categoría?')) {
      await fetch(`${API}/categorias/${id}`, { method: 'DELETE' });
      refetch();
    }
  }

  return (
    <div className="table-wrapper" style={{ padding: 20 }}>
      <div className="crud-toolbar">
        <span className="table-title">Gestión de Categorías</span>
        <button className="btn-primary" onClick={() => setModalObj({})}>+ Nueva Categoría</button>
      </div>
      {loading ? <EmptyState icon="⏳" msg="Cargando..." /> :
        <table>
          <thead><tr><th>ID</th><th>Nombre</th><th>Descripción</th><th>Acciones</th></tr></thead>
          <tbody>
            {data?.map(c => (
              <tr key={c.id_categoria}>
                <td>{c.id_categoria}</td><td>{c.nombre}</td><td className="td-secondary">{c.descripcion}</td>
                <td>
                  <button className="btn-icon" onClick={() => setModalObj(c)}>✏️</button>
                  <button className="btn-icon" onClick={() => handleDelete(c.id_categoria)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      }
      {sql && <SqlViewer sql={sql} />}

      {modalObj && (
        <div className="modal-overlay">
          <form className="modal-content" onSubmit={handleSave}>
            <div className="modal-header"><div className="modal-title">{modalObj.id_categoria ? 'Editar Categoría' : 'Nueva Categoría'}</div></div>
            <div className="form-group"><label>Nombre</label><input required className="input-field" value={modalObj.nombre || ''} onChange={e => setModalObj({ ...modalObj, nombre: e.target.value })} /></div>
            <div className="form-group"><label>Descripción</label><input required className="input-field" value={modalObj.descripcion || ''} onChange={e => setModalObj({ ...modalObj, descripcion: e.target.value })} /></div>
            <div className="form-actions"><button type="button" className="btn-secondary" onClick={() => setModalObj(null)}>Cancelar</button><button type="submit" className="btn-primary">Guardar</button></div>
          </form>
        </div>
      )}
    </div>
  )
}

function CrudProductos() {
  const { data, sql, loading, refetch } = useFetch<Producto[]>(`${API}/productos`)
  const [modalObj, setModalObj] = useState<Partial<Producto> | null>(null)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = modalObj?.id_producto ? 'PUT' : 'POST';
    const url = modalObj?.id_producto ? `${API}/productos/${modalObj.id_producto}` : `${API}/productos`;
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(modalObj) });
    setModalObj(null);
    refetch();
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Seguro que deseas eliminar este producto?')) {
      await fetch(`${API}/productos/${id}`, { method: 'DELETE' });
      refetch();
    }
  }

  return (
    <div className="table-wrapper" style={{ padding: 20 }}>
      <div className="crud-toolbar">
        <span className="table-title">Gestión de Productos</span>
        <button className="btn-primary" onClick={() => setModalObj({})}>+ Nuevo Producto</button>
      </div>
      {loading ? <EmptyState icon="⏳" msg="Cargando..." /> :
        <table>
          <thead><tr><th>ID</th><th>Nombre</th><th>Stock</th><th>Precio</th><th>Categoría ID</th><th>Almacenista ID</th><th>Acciones</th></tr></thead>
          <tbody>
            {data?.map(p => (
              <tr key={p.id_producto}>
                <td>{p.id_producto}</td><td>{p.nombre_prod}</td><td>{p.stock}</td><td>{p.precio_prod}</td><td>{p.id_categoria}</td><td>{p.id_act_almacenista}</td>
                <td>
                  <button className="btn-icon" onClick={() => setModalObj(p)}>✏️</button>
                  <button className="btn-icon" onClick={() => handleDelete(p.id_producto)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      }
      {sql && <SqlViewer sql={sql} />}

      {modalObj && (
        <div className="modal-overlay">
          <form className="modal-content" onSubmit={handleSave} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header"><div className="modal-title">{modalObj.id_producto ? 'Editar Producto' : 'Nuevo Producto'}</div></div>
            <div className="form-group"><label>Nombre</label><input required className="input-field" value={modalObj.nombre_prod || ''} onChange={e => setModalObj({ ...modalObj, nombre_prod: e.target.value })} /></div>
            <div className="form-group"><label>Descripción</label><input className="input-field" value={modalObj.descripcion_prod || ''} onChange={e => setModalObj({ ...modalObj, descripcion_prod: e.target.value })} /></div>
            <div className="form-group"><label>Precio Venta</label><input required type="number" step="0.01" className="input-field" value={modalObj.precio_prod || ''} onChange={e => setModalObj({ ...modalObj, precio_prod: Number(e.target.value) })} /></div>
            <div className="form-group"><label>Precio Compra</label><input required type="number" step="0.01" className="input-field" value={modalObj.precio_compra_base || ''} onChange={e => setModalObj({ ...modalObj, precio_compra_base: Number(e.target.value) })} /></div>
            <div className="form-group"><label>Stock</label><input required type="number" className="input-field" value={modalObj.stock || ''} onChange={e => setModalObj({ ...modalObj, stock: Number(e.target.value) })} /></div>
            <div className="form-group"><label>Ubicación</label><input required className="input-field" value={modalObj.ubicacion_bodega || ''} onChange={e => setModalObj({ ...modalObj, ubicacion_bodega: e.target.value })} /></div>
            <div className="form-group"><label>ID Categoría</label><input required type="number" className="input-field" value={modalObj.id_categoria || ''} onChange={e => setModalObj({ ...modalObj, id_categoria: Number(e.target.value) })} /></div>
            <div className="form-group"><label>ID Almacenista</label><input required type="number" className="input-field" value={modalObj.id_act_almacenista || ''} onChange={e => setModalObj({ ...modalObj, id_act_almacenista: Number(e.target.value) })} /></div>
            <div className="form-actions"><button type="button" className="btn-secondary" onClick={() => setModalObj(null)}>Cancelar</button><button type="submit" className="btn-primary">Guardar</button></div>
          </form>
        </div>
      )}
    </div>
  )
}

// TRANSACCION
function TransaccionCajero() {
  const [logs, setLogs] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    nombre: 'Juan', apellido: 'Perez', correo: 'juan@test.com', tel: '123456', dir: 'Ciudad',
    num_empleado: 'EMP-999', puesto: 'Cajero', salario: 3000, nit: '1234-5', horario: 'Diurno',
    id_gerente: 5 // Asumimos que 5 es gerente válido en la BD inicial, poner 999 fallará
  });

  const ejecutarTx = async () => {
    setLoading(true); setLogs(''); setIsError(false);
    try {
      const res = await fetch(`${API}/transaccion/cajero`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actor: { nombre_actor: form.nombre, apellido_actor: form.apellido, correo_actor: form.correo, tel_actor: form.tel, dir_actor: form.dir },
          empleado: { num_empleado: form.num_empleado, puesto_empleado: form.puesto, salario_empleado: form.salario, nit_empleado: form.nit, horario_empleado: form.horario },
          cajero: { id_act_gerente: form.id_gerente }
        })
      });
      const data = await res.json();
      if (!res.ok) { setIsError(true); setLogs(data.logs || data.error); }
      else { setIsError(false); setLogs(data.logs); }
    } catch (e) { setIsError(true); setLogs(String(e)); }
    finally { setLoading(false); }
  }

  return (
    <div className="tx-container">
      <div className="tx-form">
        <h3 style={{ marginBottom: 16 }}>Formulario Alta de Cajero</h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 20 }}>
          Este formulario inserta en ACTOR_COMERCIAL, EMPLEADO y CAJERO usando una transacción explícita.
          Intenta cambiar el <strong>ID Gerente a 9999</strong> para forzar un error de Llave Foránea y visualizar el <strong>ROLLBACK</strong>.
        </p>
        <div className="form-group"><label>Nombre y Apellido</label><div style={{ display: 'flex', gap: 8 }}><input className="input-field" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} /><input className="input-field" value={form.apellido} onChange={e => setForm({ ...form, apellido: e.target.value })} /></div></div>
        <div className="form-group"><label>Número Empleado y NIT</label><div style={{ display: 'flex', gap: 8 }}><input className="input-field" value={form.num_empleado} onChange={e => setForm({ ...form, num_empleado: e.target.value })} /><input className="input-field" value={form.nit} onChange={e => setForm({ ...form, nit: e.target.value })} /></div></div>
        <div className="form-group"><label>ID Gerente Supervisor (ID Válido = 5 o 6 | Inválido = 9999)</label><input type="number" className="input-field" value={form.id_gerente} onChange={e => setForm({ ...form, id_gerente: Number(e.target.value) })} /></div>
        <button className="btn-primary" onClick={ejecutarTx} disabled={loading}>{loading ? 'Ejecutando...' : 'Ejecutar Transacción'}</button>
      </div>
        <div className={`tx-log-box ${logs ? (isError ? 'tx-log-error' : 'tx-log-success') : ''}`}>
          <h3 style={{ marginBottom: 16 }}>Logs de la Base de Datos</h3>
          {logs ? <TypewriterSqlViewer sql={logs} speed={10} /> : <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No hay logs. Ejecuta la transacción para ver el flujo BEGIN / COMMIT / ROLLBACK.</p>}
        </div>
      </div>
    )
}

// MAIN APP
type Tab = 'catalogo' | 'clientes' | 'empleados' | 'crud_cat' | 'crud_prod' | 'tx_cajero';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('catalogo')

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'catalogo', label: 'Dashboard Catálogo', icon: '📦' },
    { id: 'clientes', label: 'Dashboard Clientes', icon: '👥' },
    { id: 'empleados', label: 'Dashboard Empleados', icon: '🏢' },
    { id: 'crud_cat', label: 'CRUD Categorías', icon: '📁' },
    { id: 'crud_prod', label: 'CRUD Productos', icon: '🛒' },
    { id: 'tx_cajero', label: 'TX Registro Cajero', icon: '🔐' },
  ]

  return (
    <div className="dashboard">
      <header className="header">
        <div className="header-brand"><div className="header-icon">🏪</div><div><h1>TiendaDB</h1><span>Panel de administración y Control SQL</span></div></div>
        <div className="header-status"><div className="status-dot" />Conectado</div>
      </header>

      <main className="main">
        <section aria-label="Datos de la tienda">
          <p className="section-title">Explorar Datos y Operaciones</p>
          <div className="tabs-container">
            <div className="tabs" role="tablist" style={{ overflowX: 'auto' }}>
              {tabs.map(t => (
                <button key={t.id} role="tab" aria-selected={activeTab === t.id} className={`tab-btn${activeTab === t.id ? ' active' : ''}`} onClick={() => setActiveTab(t.id)}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            {activeTab === 'catalogo' && <TablaCatalogo />}
            {activeTab === 'clientes' && <TablaClientes />}
            {activeTab === 'empleados' && <TablaEmpleados />}
            {activeTab === 'crud_cat' && <CrudCategorias />}
            {activeTab === 'crud_prod' && <CrudProductos />}
            {activeTab === 'tx_cajero' && <TransaccionCajero />}
          </div>
        </section>
      </main>

      <footer className="footer">
        TiendaDB © {new Date().getFullYear()} · Bases de Datos — Proyecto 2
      </footer>
    </div>
  )
}
