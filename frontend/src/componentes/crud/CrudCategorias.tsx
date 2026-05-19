import { useState } from 'react';
import type { Categoria } from '../../types';
import { API, useFetch } from '../../utils';
import { EmptyState, SqlViewer } from '../ui';

export function CrudCategorias() {
  const { data, sql, loading, refetch } = useFetch<Categoria[]>(`${API}/categorias`);
  const [modalObj, setModalObj] = useState<Partial<Categoria> | null>(null);

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
  };

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
                <td>{c.id_categoria}</td>
                <td>{c.nombre}</td>
                <td className="td-secondary">{c.descripcion}</td>
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
            <div className="form-group">
              <label>Nombre</label>
              <input required className="input-field" value={modalObj.nombre || ''} onChange={e => setModalObj({ ...modalObj, nombre: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Descripción</label>
              <input required className="input-field" value={modalObj.descripcion || ''} onChange={e => setModalObj({ ...modalObj, descripcion: e.target.value })} />
            </div>
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => setModalObj(null)}>Cancelar</button>
              <button type="submit" className="btn-primary">Guardar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
