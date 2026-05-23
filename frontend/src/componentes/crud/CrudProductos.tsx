import { useState } from 'react';
import type { Producto } from '../../types';
import { useFetch, API, authFetch } from '../../utils';
import { EmptyState, SqlViewer } from '../ui';

export function CrudProductos() {
  const { data, sql, loading, refetch } = useFetch<Producto[]>(`${API}/productos`);
  const [modalObj, setModalObj] = useState<Partial<Producto> | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = modalObj?.id_producto ? 'PUT' : 'POST';
    const url = modalObj?.id_producto ? `${API}/productos/${modalObj.id_producto}` : `${API}/productos`;
    await authFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(modalObj) });
    setModalObj(null);
    refetch();
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Seguro que deseas eliminar este producto?')) {
      await authFetch(`${API}/productos/${id}`, { method: 'DELETE' });
      refetch();
    }
  };

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
                <td>{p.id_producto}</td>
                <td>{p.nombre_prod}</td>
                <td>{p.stock}</td>
                <td>{p.precio_prod}</td>
                <td>{p.id_categoria}</td>
                <td>{p.id_act_almacenista}</td>
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
  );
}
