import type { Empleado } from '../../types';
import { API, rolBadge, useFetch } from '../../utils';
import { RefreshBtn, EmptyState, SqlViewer } from '../ui';

export function TablaEmpleados() {
  const { data, sql, loading, error, refetch } = useFetch<Empleado[]>(`${API}/empleados`);

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
        {error ? <EmptyState icon="⚠️" msg={`Error: ${error}`} /> : loading && !data ? <EmptyState icon="⏳" msg="Cargando..." /> : !data?.length ? <EmptyState icon="🏢" msg="No hay datos." /> : (
          <table>
            <thead><tr><th>ID</th><th>Empleado</th><th>Puesto</th><th>Rol</th><th>Supervisor</th></tr></thead>
            <tbody>
              {data.map(e => (
                <tr key={e.id_actor}>
                  <td className="td-secondary">#{e.id_actor}</td>
                  <td style={{ fontWeight: 500 }}>{e.nombre_actor} {e.apellido_actor}</td>
                  <td className="td-secondary">{e.puesto_empleado}</td>
                  <td><span className={`badge ${rolBadge(e.rol_especifico)}`}>{e.rol_especifico}</span></td>
                  <td className="td-secondary">{e.nombre_supervisor ?? '—'}</td>
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
