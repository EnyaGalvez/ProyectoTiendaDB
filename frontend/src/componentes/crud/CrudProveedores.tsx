import { useState } from 'react';
import type { Proveedor } from '../../types';
import { useFetch, API, authFetch } from '../../utils';
import { EmptyState, SqlViewer } from '../ui';

export function CrudProveedores() {
  const { data, sql, loading, refetch } = useFetch<Proveedor[]>(`${API}/proveedores-crud`);
  const [modalObj, setModalObj] = useState<Partial<Proveedor> | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = modalObj?.id_actor ? 'PUT' : 'POST';
    const url = modalObj?.id_actor ? `${API}/proveedores-crud/${modalObj.id_actor}` : `${API}/proveedores-crud`;

    await authFetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(modalObj)
    });
    setModalObj(null);
    refetch();
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Seguro que deseas eliminar este proveedor? Se eliminará tanto el registro de Proveedor como el de Actor Comercial.')) {
      await authFetch(`${API}/proveedores-crud/${id}`, { method: 'DELETE' });
      refetch();
    }
  };

  return (
    <div className="table-wrapper" style={{ padding: 20 }}>
      <div className="crud-toolbar">
        <span className="table-title">Gestión de Proveedores (Especialización Actor Comercial)</span>
        <button className="btn-primary" onClick={() => setModalObj({
          nombre_actor: '',
          apellido_actor: '',
          correo_actor: '',
          tel_actor: '',
          dir_actor: '',
          razon_social: '',
          nif_proveedor: '',
          moneda_pago: 'GTQ',
          certificacion: ''
        })}>+ Nuevo Proveedor</button>
      </div>
      {loading ? <EmptyState icon="⏳" msg="Cargando..." /> :
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>ID Actor</th>
                <th>Nombre Representante</th>
                <th>Razón Social</th>
                <th>NIT / NIF</th>
                <th>Moneda</th>
                <th>Certificación</th>
                <th>Correo</th>
                <th>Teléfono</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data && data.length > 0 ? (
                data.map(p => (
                  <tr key={p.id_actor}>
                    <td>{p.id_actor}</td>
                    <td>{p.nombre_actor} {p.apellido_actor}</td>
                    <td><span className="badge badge-blue">{p.razon_social}</span></td>
                    <td>{p.nif_proveedor}</td>
                    <td><span className="badge badge-amber">{p.moneda_pago}</span></td>
                    <td className="td-secondary">{p.certificacion || 'Ninguna'}</td>
                    <td className="td-secondary">{p.correo_actor || 'N/A'}</td>
                    <td className="td-secondary">{p.tel_actor || 'N/A'}</td>
                    <td>
                      <button className="btn-icon" onClick={() => setModalObj(p)}>✏️</button>
                      <button className="btn-icon" onClick={() => handleDelete(p.id_actor!)}>🗑️</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '20px' }}>
                    No hay proveedores registrados
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
              <div className="modal-title">{modalObj.id_actor ? 'Editar Proveedor' : 'Nuevo Proveedor'}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label>Nombre Representante</label>
                <input required className="input-field" value={modalObj.nombre_actor || ''} onChange={e => setModalObj({ ...modalObj, nombre_actor: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Apellido Representante</label>
                <input required className="input-field" value={modalObj.apellido_actor || ''} onChange={e => setModalObj({ ...modalObj, apellido_actor: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Razón Social</label>
                <input required className="input-field" value={modalObj.razon_social || ''} onChange={e => setModalObj({ ...modalObj, razon_social: e.target.value })} />
              </div>
              <div className="form-group">
                <label>NIF / NIT Proveedor</label>
                <input required className="input-field" value={modalObj.nif_proveedor || ''} onChange={e => setModalObj({ ...modalObj, nif_proveedor: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Moneda de Pago</label>
                <input required className="input-field" value={modalObj.moneda_pago || ''} onChange={e => setModalObj({ ...modalObj, moneda_pago: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Certificación</label>
                <input className="input-field" value={modalObj.certificacion || ''} onChange={e => setModalObj({ ...modalObj, certificacion: e.target.value })} />
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
              <button type="submit" className="btn-primary">Guardar Proveedor</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
