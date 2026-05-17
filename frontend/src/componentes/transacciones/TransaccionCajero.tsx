import { useState } from 'react';
import { API } from '../../utils';
import { TypewriterSqlViewer } from '../ui';

export function TransaccionCajero() {
  const [logs, setLogs] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    nombre: 'Juan', apellido: 'Perez', correo: 'juan@test.com', tel: '123456', dir: 'Ciudad',
    num_empleado: 'EMP-999', puesto: 'Cajero', salario: 3000, nit: '1234-5', horario: 'Diurno',
    id_gerente: 5 // Asumimos que 5 es gerente válido en la BD inicial, poner 999 fallará
  });

  const ejecutarTx = async () => {
    setLoading(true); setLogs(''); setIsError(false);
    try {
      const res = await fetch(`${API}/transaccion/cajero`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actor: { nombre_actor: form.nombre, apellido_actor: form.apellido, correo_actor: form.correo, tel_actor: form.tel, dir_actor: form.dir },
          empleado: { num_empleado: form.num_empleado, puesto_empleado: form.puesto, salario_empleado: form.salario, nit_empleado: form.nit, horario_empleado: form.horario },
          cajero: { id_act_gerente: form.id_gerente }
        })
      });
      const data = await res.json();
      if (!res.ok) { setIsError(true); setLogs(data.logs || data.error); }
      else { setIsError(false); setLogs(data.logs); }
    } catch (e) { setIsError(true); setLogs(String(e)); }
    finally { setLoading(false); }
  };

  return (
    <div className="tx-container">
      <div className="tx-form">
        <h3 style={{ marginBottom: 16 }}>Formulario Alta de Cajero</h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 20 }}>
          Este formulario inserta en ACTOR_COMERCIAL, EMPLEADO y CAJERO usando una transacción explícita.
          Intenta cambiar el <strong>ID Gerente a 9999</strong> para forzar un error de Llave Foránea y visualizar el <strong>ROLLBACK</strong>.
        </p>
        <div className="form-group">
          <label>Nombre y Apellido</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="input-field" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
            <input className="input-field" value={form.apellido} onChange={e => setForm({ ...form, apellido: e.target.value })} />
          </div>
        </div>
        <div className="form-group">
          <label>Número Empleado y NIT</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="input-field" value={form.num_empleado} onChange={e => setForm({ ...form, num_empleado: e.target.value })} />
            <input className="input-field" value={form.nit} onChange={e => setForm({ ...form, nit: e.target.value })} />
          </div>
        </div>
        <div className="form-group">
          <label>ID Gerente Supervisor (ID Válido = 5 o 6 | Inválido = 9999)</label>
          <input type="number" className="input-field" value={form.id_gerente} onChange={e => setForm({ ...form, id_gerente: Number(e.target.value) })} />
        </div>
        <button className="btn-primary" onClick={ejecutarTx} disabled={loading}>{loading ? 'Ejecutando...' : 'Ejecutar Transacción'}</button>
      </div>
      <div className={`tx-log-box ${logs ? (isError ? 'tx-log-error' : 'tx-log-success') : ''}`}>
        <h3 style={{ marginBottom: 16 }}>Logs de la Base de Datos</h3>
        {logs ? <TypewriterSqlViewer sql={logs} speed={10} /> : <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No hay logs. Ejecuta la transacción para ver el flujo BEGIN / COMMIT / ROLLBACK.</p>}
      </div>
    </div>
  );
}
