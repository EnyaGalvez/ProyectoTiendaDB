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
  const { logout, userRole, username } = useAuth();

  const allTabs: { id: Tab; label: string; icon: string; roles: string[] }[] = [
    { id: 'catalogo', label: 'Dashboard Catálogo', icon: '📦', roles: ['Gerente', 'Cajero', 'Almacenista', 'Proveedor', 'Cliente'] },
    { id: 'clientes', label: 'Dashboard Clientes', icon: '👥', roles: ['Gerente', 'Cajero'] },
    { id: 'empleados', label: 'Dashboard Empleados', icon: '🏢', roles: ['Gerente'] },
    { id: 'crud_cat', label: 'CRUD Categorías', icon: '📁', roles: ['Gerente', 'Almacenista'] },
    { id: 'crud_prod', label: 'CRUD Productos', icon: '🛒', roles: ['Gerente', 'Almacenista'] },
    { id: 'crud_cli', label: 'CRUD Clientes', icon: '👤', roles: ['Gerente', 'Cajero'] },
    { id: 'crud_prov', label: 'CRUD Proveedores', icon: '🚚', roles: ['Gerente', 'Almacenista'] },
    { id: 'tx_cajero', label: 'TX Registro Cajero', icon: '🔐', roles: ['Gerente'] },
  ];

  const tabs = allTabs.filter(t => userRole && t.roles.includes(userRole));

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
        <div className="header-status" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: '1.2' }}>
            <span style={{ fontWeight: 600, fontSize: '1.05rem', color: '#fff' }}>{username || userRole}</span>
            <span style={{ fontSize: '0.85rem', color: '#e0e0e0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div className="status-dot" style={{ display: 'inline-block', width: '8px', height: '8px' }} /> Conectado
            </span>
          </div>
          <button
            onClick={logout}
            style={{
              padding: '0.4rem 1rem',
              background: 'transparent',
              color: '#ffe7e7ff',
              border: '1px solid rgba(169, 124, 124, 0.4)',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 500,
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = '#fff'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; }}
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
