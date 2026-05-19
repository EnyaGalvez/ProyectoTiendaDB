import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { TablaCatalogo } from '../componentes/tablas/TablaCatalogo';
import { TablaClientes } from '../componentes/tablas/TablaClientes';
import { TablaEmpleados } from '../componentes/tablas/TablaEmpleados';
import { CrudCategorias } from '../componentes/crud/CrudCategorias';
import { CrudProductos } from '../componentes/crud/CrudProductos';
import { CrudClientes } from '../componentes/crud/CrudClientes';
import { CrudProveedores } from '../componentes/crud/CrudProveedores';
import { TransaccionCajero } from '../componentes/transacciones/TransaccionCajero';
import carrito from '../assets/carrito-de-compras-celeste.png';

type Tab = 'catalogo' | 'clientes' | 'empleados' | 'crud_cat' | 'crud_prod' | 'crud_cli' | 'crud_prov' | 'tx_cajero';

export function Inicio() {
  const [activeTab, setActiveTab] = useState<Tab>('catalogo');
  const { logout } = useAuth();

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'catalogo', label: 'Dashboard Catálogo', icon: '📦' },
    { id: 'clientes', label: 'Dashboard Clientes', icon: '👥' },
    { id: 'empleados', label: 'Dashboard Empleados', icon: '🏢' },
    { id: 'crud_cat', label: 'CRUD Categorías', icon: '📁' },
    { id: 'crud_prod', label: 'CRUD Productos', icon: '🛒' },
    { id: 'crud_cli', label: 'CRUD Clientes', icon: '👤' },
    { id: 'crud_prov', label: 'CRUD Proveedores', icon: '🚚' },
    { id: 'tx_cajero', label: 'TX Registro Cajero', icon: '🔐' },
  ];

  return (
    <div className="dashboard">
      <header className="header">
        <div className="header-brand">
          <img src={carrito} alt="Logo de la tiendita" className="logo de la tiendita" />
          <div>
            <h1>La Tiendita en Línea</h1>
            <h2>Panel de administración y control</h2>
          </div>
        </div>
        <div className="header-status" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div><div className="status-dot" style={{ display: 'inline-block' }} /> Conectado</div>
          <button
            onClick={logout}
            style={{ padding: '0.3rem 0.8rem', background: '#a6105bff', color: '#ffffffff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }}
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="main">
        <section aria-label="Datos de la tienda">
          <p className="section-title">Explorar Datos y Operaciones</p>
          <div className="tabs-container">
            <div className="tabs" role="tablist" style={{ overflowX: 'auto' }}>
              {tabs.map(t => (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={activeTab === t.id}
                  className={`tab-btn${activeTab === t.id ? ' active' : ''}`}
                  onClick={() => setActiveTab(t.id)}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            {activeTab === 'catalogo' && <TablaCatalogo />}
            {activeTab === 'clientes' && <TablaClientes />}
            {activeTab === 'empleados' && <TablaEmpleados />}
            {activeTab === 'crud_cat' && <CrudCategorias />}
            {activeTab === 'crud_prod' && <CrudProductos />}
            {activeTab === 'crud_cli' && <CrudClientes />}
            {activeTab === 'crud_prov' && <CrudProveedores />}
            {activeTab === 'tx_cajero' && <TransaccionCajero />}
          </div>
        </section>
      </main>

      <footer className="footer">
        TiendaDB © {new Date().getFullYear()} · Bases de Datos — Proyecto 2
      </footer>
    </div>
  );
}
