import type { Producto } from '../../types';
import { API, stockColor, fmtCurrency, useFetch } from '../../utils';
import { RefreshBtn, EmptyState, SqlViewer } from '../ui';

export function TablaCatalogo() {
  const { data, sql, loading, error, refetch } = useFetch<Producto[]>(`${API}/catalogo`);
  const maxStock = data ? Math.max(...data.map(p => p.stock), 1) : 1;

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
        {error ? <EmptyState icon="⚠️" msg={`Error: ${error}`} /> : loading && !data ? <EmptyState icon="⏳" msg="Cargando..." /> : !data?.length ? <EmptyState icon="📦" msg="No hay datos." /> : (
          <table>
            <thead><tr><th>Producto</th><th>Categoría</th><th>Stock</th><th>Precio</th><th>Proveedor</th><th>Almacenista</th></tr></thead>
            <tbody>
              {data.map((p, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 500 }}>{p.nombre_prod}</td>
                  <td><span className="badge badge-purple">{p.categoria}</span></td>
                  <td>
                    <div className="stock-bar-wrap">
                      <div className="stock-bar">
                        <div className="stock-bar-fill" style={{ width: `${Math.min((p.stock / maxStock) * 100, 100)}%`, background: stockColor(p.stock) }} />
                      </div>
                      <span className="stock-num" style={{ color: stockColor(p.stock) }}>{p.stock}</span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--accent-green)' }}>{fmtCurrency(p.precio_prod)}</td>
                  <td className="td-secondary">{p.proveedor_principal}</td>
                  <td className="td-secondary">{p.gestionado_por}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {sql && <SqlViewer sql={sql} />}
    </div>
  );
}
