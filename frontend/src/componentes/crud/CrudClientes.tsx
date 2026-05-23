import { useState } from 'react';
import type { ClienteCrud } from '../../types';
import { useFetch, API, authFetch } from '../../utils';
import { EmptyState, SqlViewer } from '../ui';

export function CrudClientes() {
  const { data, sql, loading, refetch } = useFetch<ClienteCrud[]>(`${API}/clientes-crud`);
  const [modalObj, setModalObj] = useState<Partial<ClienteCrud> | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = modalObj?.id_actor ? 'PUT' : 'POST';
    const url = modalObj?.id_actor ? `${API}/clientes-crud/${modalObj.id_actor}` : `${API}/clientes-crud`;

    await authFetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(modalObj)
    });
    setModalObj(null);
    refetch();
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Seguro que deseas eliminar este cliente? Se eliminará tanto el registro de Cliente como el de Actor Comercial.')) {
      await authFetch(`${API}/clientes-crud/${id}`, { method: 'DELETE' });
      refetch();
    }
  };

  return (
    <div className="table-wrapper" style={{ padding: 20 }}>
      <div className="crud-toolbar">
        <span className="table-title">Gestión de Clientes (Generalización Actor Comercial)</span>
        <button className="btn-primary" onClick={() => setModalObj({
          nombre_actor: '',
          apellido_actor: '',
          correo_actor: '',
          tel_actor: '',
          dir_actor: '',
          num_cliente: '',
          nit_cliente: ''
        })}>+ Nuevo Cliente</button>
      </div>
      {loading ? <EmptyState icon="⏳" msg="Cargando..." /> :
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>ID Actor</th>
                <th>Nombre Completo</th>
                <th>Código Cliente</th>
                <th>NIT</th>
                <th>Correo</th>
                <th>Teléfono</th>
                <th>Dirección</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data && data.length > 0 ? (
                data.map(c => (
                  <tr key={c.id_actor}>
                    <td>{c.id_actor}</td>
                    <td>{c.nombre_actor} {c.apellido_actor}</td>
                    <td><span className="badge badge-purple">{c.num_cliente}</span></td>
                    <td>{c.nit_cliente}</td>
                    <td className="td-secondary">{c.correo_actor || 'N/A'}</td>
                    <td className="td-secondary">{c.tel_actor || 'N/A'}</td>
                    <td className="td-secondary" style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.dir_actor || 'N/A'}
                    </td>
                    <td>
                      <button className="btn-icon" onClick={() => setModalObj(c)}>✏️</button>
                      <button className="btn-icon" onClick={() => handleDelete(c.id_actor!)}>🗑️</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '20px' }}>
                    No hay clientes registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      }
      {sql && <SqlViewer sql={sql} />}

      {modalObj && (
        <div className="modal-overlay">
          <form className="modal-content" onSubmit={handleSave} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <div className="modal-title">{modalObj.id_actor ? 'Editar Cliente' : 'Nuevo Cliente'}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label>Nombre</label>
                <input required className="input-field" value={modalObj.nombre_actor || ''} onChange={e => setModalObj({ ...modalObj, nombre_actor: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Apellido</label>
                <input required className="input-field" value={modalObj.apellido_actor || ''} onChange={e => setModalObj({ ...modalObj, apellido_actor: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Código Cliente</label>
                <input required className="input-field" value={modalObj.num_cliente || ''} onChange={e => setModalObj({ ...modalObj, num_cliente: e.target.value })} />
              </div>
              <div className="form-group">
                <label>NIT Cliente</label>
                <input required className="input-field" value={modalObj.nit_cliente || ''} onChange={e => setModalObj({ ...modalObj, nit_cliente: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Correo</label>
                <input type="email" className="input-field" value={modalObj.correo_actor || ''} onChange={e => setModalObj({ ...modalObj, correo_actor: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Teléfono</label>
                <input className="input-field" value={modalObj.tel_actor || ''} onChange={e => setModalObj({ ...modalObj, tel_actor: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label>Dirección</label>
              <input className="input-field" value={modalObj.dir_actor || ''} onChange={e => setModalObj({ ...modalObj, dir_actor: e.target.value })} />
            </div>
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => setModalObj(null)}>Cancelar</button>
              <button type="submit" className="btn-primary">Guardar Cliente</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
