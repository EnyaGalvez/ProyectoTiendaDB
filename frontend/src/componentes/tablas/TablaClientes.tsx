import type { Cliente } from '../../types';
import { API, fmtCurrency, useFetch } from '../../utils';
import { RefreshBtn, EmptyState, SqlViewer } from '../ui';

export function TablaClientes() {
  const { data, sql, loading, error, refetch } = useFetch<Cliente[]>(`${API}/clientes/mejores?monto=0`);
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
        {error ? <EmptyState icon="⚠️" msg={`Error: ${error}`} /> : loading && !data ? <EmptyState icon="⏳" msg="Cargando..." /> : !data?.length ? <EmptyState icon="👥" msg="No hay datos." /> : (
          <table>
            <thead><tr><th>#</th><th>Cliente</th><th>NIT</th><th>Compras</th><th>Total Gastado</th></tr></thead>
            <tbody>
              {data.map((c, i) => (
                <tr key={c.id_actor}>
                  <td className="td-secondary">{i + 1}</td>
                  <td style={{ fontWeight: 500 }}>{c.nombre_actor} {c.apellido_actor}</td>
                  <td className="td-secondary">{c.nit_cliente}</td>
                  <td><span className="badge badge-blue">{c.total_compras} compras</span></td>
                  <td style={{ fontWeight: 700, color: 'var(--accent-amber)' }}>{fmtCurrency(c.total_gastado)}</td>
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
