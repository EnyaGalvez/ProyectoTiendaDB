import { useState, useEffect, useCallback } from 'react'
import './App.css'

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3002/api'

// ─── Types ─────────────────────────────────────────────────────────────────────
interface Empleado {
  id_actor: number
  nombre_actor: string
  apellido_actor: string
  puesto_empleado: string
  rol_especifico: string
  nombre_supervisor: string | null
}

interface Producto {
  nombre_prod: string
  categoria: string
  stock: number
  precio_prod: string
  proveedor_principal: string
  gestionado_por: string
}

interface Cliente {
  id_actor: number
  nombre_actor: string
  apellido_actor: string
  nit_cliente: string
  total_compras: number
  total_gastado: string
}

const fmt = new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' })
const fmtCurrency = (v: string | number) => fmt.format(Number(v))

function stockColor(stock: number): string {
  if (stock > 50) return 'var(--accent-green)'
  if (stock > 15) return 'var(--accent-amber)'
  return 'var(--accent-red)'
}

function rolBadge(rol: string) {
  const map: Record<string, string> = {
    Cajero: 'badge-blue',
    Almacenista: 'badge-purple',
    Gerente: 'badge-green',
  }
  return map[rol] ?? 'badge-amber'
}

function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json() as T
      setData(json)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [url])

  useEffect(() => { void fetchData() }, [fetchData])
  return { data, loading, error, refetch: fetchData }
}

function RefreshBtn({ onClick, spinning }: { onClick: () => void; spinning: boolean }) {
  return (
    <button id="btn-refresh" className={`refresh-btn${spinning ? ' spinning' : ''}`} onClick={onClick} aria-label="Actualizar datos">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M23 4v6h-6M1 20v-6h6" />
        <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
      </svg>
      Actualizar
    </button>
  )
}

function EmptyState({ icon, msg }: { icon: string; msg: string }) {
  return (
    <div className="state-box">
      <div className="state-box-icon">{icon}</div>
      <p>{msg}</p>
    </div>
  )
}

function KpiCard({
  icon, label, value, sub, gradient, loading,
}: {
  icon: string; label: string; value: string; sub: string;
  gradient: string; loading: boolean;
}) {
  return (
    <article className="kpi-card" style={{ '--card-gradient': gradient } as React.CSSProperties}>
      <div className="kpi-header">
        <span className="kpi-icon">{icon}</span>
        <span className="kpi-label">{label}</span>
      </div>
      {loading
        ? <div className="kpi-skeleton" />
        : <div className="kpi-value">{value}</div>}
      <div className="kpi-sub">{sub}</div>
    </article>
  )
}

function TablaCatalogo() {
  const { data, loading, error, refetch } = useFetch<Producto[]>(`${API}/catalogo`)
  const maxStock = data ? Math.max(...data.map(p => p.stock), 1) : 1

  return (
    <div className="table-wrapper">
      <div className="table-toolbar">
        <span className="table-title">Catálogo de Productos</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {data && <span className="table-count">{data.length} productos</span>}
          <RefreshBtn onClick={refetch} spinning={loading} />
        </div>
      </div>
      <div className="table-scroll">
        {error
          ? <EmptyState icon="⚠️" msg={`No se pudo cargar el catálogo: ${error}`} />
          : loading && !data
            ? <EmptyState icon="⏳" msg="Cargando productos..." />
            : !data?.length
              ? <EmptyState icon="📦" msg="No hay productos registrados." />
              : (
                <table>
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Categoría</th>
                      <th>Stock</th>
                      <th>Precio</th>
                      <th>Proveedor</th>
                      <th>Almacenista</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((p, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 500 }}>{p.nombre_prod}</td>
                        <td><span className="badge badge-purple">{p.categoria}</span></td>
                        <td>
                          <div className="stock-bar-wrap">
                            <div className="stock-bar">
                              <div
                                className="stock-bar-fill"
                                style={{
                                  width: `${Math.min((p.stock / maxStock) * 100, 100)}%`,
                                  background: stockColor(p.stock),
                                }}
                              />
                            </div>
                            <span className="stock-num" style={{ color: stockColor(p.stock) }}>
                              {p.stock}
                            </span>
                          </div>
                        </td>
                        <td style={{ fontWeight: 600, color: 'var(--accent-green)' }}>
                          {fmtCurrency(p.precio_prod)}
                        </td>
                        <td className="td-secondary">{p.proveedor_principal}</td>
                        <td className="td-secondary">{p.gestionado_por}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
      </div>
    </div>
  )
}

function TablaClientes() {
  const { data, loading, error, refetch } = useFetch<Cliente[]>(`${API}/clientes/mejores?monto=0`)

  return (
    <div className="table-wrapper">
      <div className="table-toolbar">
        <span className="table-title">Mejores Clientes</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {data && <span className="table-count">{data.length} clientes</span>}
          <RefreshBtn onClick={refetch} spinning={loading} />
        </div>
      </div>
      <div className="table-scroll">
        {error
          ? <EmptyState icon="⚠️" msg={`No se pudo cargar clientes: ${error}`} />
          : loading && !data
            ? <EmptyState icon="⏳" msg="Cargando clientes..." />
            : !data?.length
              ? <EmptyState icon="👥" msg="No hay clientes con compras registradas." />
              : (
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Cliente</th>
                      <th>NIT</th>
                      <th>Compras</th>
                      <th>Total Gastado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((c, i) => (
                      <tr key={c.id_actor}>
                        <td className="td-secondary">{i + 1}</td>
                        <td style={{ fontWeight: 500 }}>{c.nombre_actor} {c.apellido_actor}</td>
                        <td className="td-secondary">{c.nit_cliente}</td>
                        <td>
                          <span className="badge badge-blue">{c.total_compras} compras</span>
                        </td>
                        <td style={{ fontWeight: 700, color: 'var(--accent-amber)' }}>
                          {fmtCurrency(c.total_gastado)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
      </div>
    </div>
  )
}

function TablaEmpleados() {
  const { data, loading, error, refetch } = useFetch<Empleado[]>(`${API}/empleados`)

  return (
    <div className="table-wrapper">
      <div className="table-toolbar">
        <span className="table-title">Directorio de Empleados</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {data && <span className="table-count">{data.length} empleados</span>}
          <RefreshBtn onClick={refetch} spinning={loading} />
        </div>
      </div>
      <div className="table-scroll">
        {error
          ? <EmptyState icon="⚠️" msg={`No se pudo cargar empleados: ${error}`} />
          : loading && !data
            ? <EmptyState icon="⏳" msg="Cargando empleados..." />
            : !data?.length
              ? <EmptyState icon="🏢" msg="No hay empleados registrados." />
              : (
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Empleado</th>
                      <th>Puesto</th>
                      <th>Rol</th>
                      <th>Supervisor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map(e => (
                      <tr key={e.id_actor}>
                        <td className="td-secondary">#{e.id_actor}</td>
                        <td style={{ fontWeight: 500 }}>{e.nombre_actor} {e.apellido_actor}</td>
                        <td className="td-secondary">{e.puesto_empleado}</td>
                        <td>
                          <span className={`badge ${rolBadge(e.rol_especifico)}`}>
                            {e.rol_especifico}
                          </span>
                        </td>
                        <td className="td-secondary">{e.nombre_supervisor ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
      </div>
    </div>
  )
}

type Tab = 'catalogo' | 'clientes' | 'empleados'

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('catalogo')

  const catalogo = useFetch<Producto[]>(`${API}/catalogo`)
  const clientes = useFetch<Cliente[]>(`${API}/clientes/mejores?monto=0`)
  const empleados = useFetch<Empleado[]>(`${API}/empleados`)

  const totalInv = catalogo.data
    ? catalogo.data.reduce((s, p) => s + p.stock * Number(p.precio_prod), 0)
    : 0

  const tabs: { id: Tab; label: string; icon: string; count?: number }[] = [
    { id: 'catalogo', label: 'Catálogo', icon: '📦', count: catalogo.data?.length },
    { id: 'clientes', label: 'Clientes', icon: '👥', count: clientes.data?.length },
    { id: 'empleados', label: 'Empleados', icon: '🏢', count: empleados.data?.length },
  ]

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="header">
        <div className="header-brand">
          <div className="header-icon">🏪</div>
          <div>
            <h1>TiendaDB</h1>
            <span>Panel de administración</span>
          </div>
        </div>
        <div className="header-status">
          <div className="status-dot" />
          Conectado
        </div>
      </header>

      {/* Main */}
      <main className="main">
        {/* KPIs */}
        <section aria-label="Indicadores clave">
          <p className="section-title">Resumen General</p>
          <div className="kpi-grid">
            <KpiCard
              icon="📦"
              label="Productos"
              value={catalogo.data ? String(catalogo.data.length) : '—'}
              sub="en catálogo"
              gradient="var(--gradient-blue)"
              loading={catalogo.loading}
            />
            <KpiCard
              icon="💰"
              label="Inventario"
              value={catalogo.data ? fmtCurrency(totalInv) : '—'}
              sub="valor estimado en stock"
              gradient="var(--gradient-green)"
              loading={catalogo.loading}
            />
            <KpiCard
              icon="👥"
              label="Clientes"
              value={clientes.data ? String(clientes.data.length) : '—'}
              sub="con compras registradas"
              gradient="var(--gradient-amber)"
              loading={clientes.loading}
            />
            <KpiCard
              icon="🏢"
              label="Empleados"
              value={empleados.data ? String(empleados.data.length) : '—'}
              sub="en el directorio"
              gradient="var(--gradient-purple)"
              loading={empleados.loading}
            />
          </div>
        </section>

        <section aria-label="Datos de la tienda">
          <p className="section-title">Explorar Datos</p>
          <div className="tabs-container">
            <div className="tabs" role="tablist">
              {tabs.map(t => (
                <button
                  key={t.id}
                  id={`tab-${t.id}`}
                  role="tab"
                  aria-selected={activeTab === t.id}
                  className={`tab-btn${activeTab === t.id ? ' active' : ''}`}
                  onClick={() => setActiveTab(t.id)}
                >
                  {t.icon} {t.label}
                  {t.count !== undefined && (
                    <span className="tab-badge">{t.count}</span>
                  )}
                </button>
              ))}
            </div>

            {activeTab === 'catalogo' && <TablaCatalogo />}
            {activeTab === 'clientes' && <TablaClientes />}
            {activeTab === 'empleados' && <TablaEmpleados />}
          </div>
        </section>
      </main>

      <footer className="footer">
        TiendaDB © {new Date().getFullYear()} · Bases de Datos — Proyecto 2
      </footer>
    </div>
  )
}
