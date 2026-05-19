import { pool } from '../config/database.js';
import { getSqlQuery } from '../utils/sqlReader.js';

export class TiendaService {

    async obtenerDirectorioEmpleados() {
        const query = getSqlQuery('directorioEmpleados');
        const result = await pool.query(query);
        return { data: result.rows, sql: query };
    }

    async obtenerMejoresClientes(montoMinimo: number = 1000) {
        const query = getSqlQuery('mejoresClientes');
        const result = await pool.query(query, [montoMinimo]);
        return { data: result.rows, sql: query };
    }

    async obtenerCatalogoDetallado() {
        const query = getSqlQuery('catalogoDetallado');
        const result = await pool.query(query);
        return { data: result.rows, sql: query };
    }

    // CRUD Categoria
    async getCategorias() {
        const sql = `SELECT * FROM CATEGORIA ORDER BY id_categoria ASC;`;
        const result = await pool.query(sql);
        return { data: result.rows, sql };
    }

    async createCategoria(nombre: string, descripcion: string) {
        const sql = `INSERT INTO CATEGORIA (nombre, descripcion) VALUES ($1, $2) RETURNING *;`;
        const result = await pool.query(sql, [nombre, descripcion]);
        return { data: result.rows[0], sql };
    }

    async updateCategoria(id: number, nombre: string, descripcion: string) {
        const sql = `UPDATE CATEGORIA SET nombre = $1, descripcion = $2 WHERE id_categoria = $3 RETURNING *;`;
        const result = await pool.query(sql, [nombre, descripcion, id]);
        return { data: result.rows[0], sql };
    }

    async deleteCategoria(id: number) {
        const sql = `DELETE FROM CATEGORIA WHERE id_categoria = $1 RETURNING *;`;
        const result = await pool.query(sql, [id]);
        return { data: result.rows[0], sql };
    }

    // CRUD Producto
    async getProductos() {
        const sql = `SELECT * FROM PRODUCTO ORDER BY id_producto ASC;`;
        const result = await pool.query(sql);
        return { data: result.rows, sql };
    }

    async createProducto(prod: any) {
        const sql = `INSERT INTO PRODUCTO (nombre_prod, descripcion_prod, precio_prod, precio_compra_base, stock, ubicacion_bodega, id_categoria, id_act_almacenista) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;`;
        const params = [prod.nombre_prod, prod.descripcion_prod, prod.precio_prod, prod.precio_compra_base, prod.stock, prod.ubicacion_bodega, prod.id_categoria, prod.id_act_almacenista];
        const result = await pool.query(sql, params);
        return { data: result.rows[0], sql };
    }

    async updateProducto(id: number, prod: any) {
        const sql = `UPDATE PRODUCTO SET nombre_prod=$1, descripcion_prod=$2, precio_prod=$3, precio_compra_base=$4, stock=$5, ubicacion_bodega=$6, id_categoria=$7, id_act_almacenista=$8 WHERE id_producto=$9 RETURNING *;`;
        const params = [prod.nombre_prod, prod.descripcion_prod, prod.precio_prod, prod.precio_compra_base, prod.stock, prod.ubicacion_bodega, prod.id_categoria, prod.id_act_almacenista, id];
        const result = await pool.query(sql, params);
        return { data: result.rows[0], sql };
    }

    async deleteProducto(id: number) {
        const sql = `DELETE FROM PRODUCTO WHERE id_producto = $1 RETURNING *;`;
        const result = await pool.query(sql, [id]);
        return { data: result.rows[0], sql };
    }

    // Transacción Explícita (Registro de Cajero)
    async registrarCajeroTransaccion(actor: any, emp: any, cajero: any) {
        const client = await pool.connect();
        const logs: string[] = [];

        try {
            logs.push('BEGIN;');
            await client.query('BEGIN');

            const sqlActor = `INSERT INTO ACTOR_COMERCIAL (nombre_actor, apellido_actor, correo_actor, tel_actor, dir_actor) VALUES ($1, $2, $3, $4, $5) RETURNING id_actor;`;
            logs.push(`-- Insertar Actor Comercial\n` + sqlActor.replace('$1', `'${actor.nombre_actor}'`));
            const resActor = await client.query(sqlActor, [actor.nombre_actor, actor.apellido_actor, actor.correo_actor, actor.tel_actor, actor.dir_actor]);
            const idActor = resActor.rows[0].id_actor;

            const sqlEmp = `INSERT INTO EMPLEADO (id_actor, num_empleado, puesto_empleado, salario_empleado, nit_empleado, horario_empleado) VALUES ($1, $2, $3, $4, $5, $6);`;
            logs.push(`-- Insertar Empleado\n` + sqlEmp.replace('$1', idActor));
            await client.query(sqlEmp, [idActor, emp.num_empleado, emp.puesto_empleado, emp.salario_empleado, emp.nit_empleado, emp.horario_empleado]);

            const sqlCajero = `INSERT INTO CAJERO (id_actor, id_act_gerente) VALUES ($1, $2);`;
            logs.push(`-- Insertar Cajero\n` + sqlCajero.replace('$1', idActor).replace('$2', cajero.id_act_gerente));
            await client.query(sqlCajero, [idActor, cajero.id_act_gerente]);

            logs.push('COMMIT;');
            await client.query('COMMIT');
            return { exito: true, logs: logs.join('\n\n'), id_actor: idActor };
        } catch (error) {
            logs.push('-- ERROR DETECTADO, EJECUTANDO ROLLBACK: ' + (error instanceof Error ? error.message : String(error)));
            logs.push('ROLLBACK;');
            await client.query('ROLLBACK');
            throw { exito: false, logs: logs.join('\n\n'), error: error instanceof Error ? error.message : 'Error desconocido' };
        } finally {
            client.release();
        }
    }

    async procesarTransaccionVenta(idCliente: number, idCajero: number, productos: any[]) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const resVenta = await client.query(
                `INSERT INTO VENTA (fecha_hora_venta, id_act_cliente, id_act_cajero) VALUES (NOW(), $1, $2) RETURNING id_venta;`,
                [idCliente, idCajero]
            );
            const idVenta = resVenta.rows[0].id_venta;

            await client.query(`INSERT INTO FACTURA (estado, id_venta) VALUES ('Pagada', $1);`, [idVenta]);

            for (const item of productos) {
                await client.query(
                    `INSERT INTO PRESENTE_EN (id_venta, id_producto, cantidad_vendida, precio_unitario_venta) VALUES ($1, $2, $3, $4);`,
                    [idVenta, item.idProducto, item.cantidad, item.precioUnitario]
                );

                const resStock = await client.query(
                    `UPDATE PRODUCTO SET stock = stock - $1 WHERE id_producto = $2 AND stock >= $1;`,
                    [item.cantidad, item.idProducto]
                );

                if (resStock.rowCount === 0) {
                    throw new Error(`Stock insuficiente para el producto ID: ${item.idProducto}`);
                }
            }

            await client.query('COMMIT');
            return { exito: true, idVenta };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    // CRUD Clientes (Transaccional)
    async getClientesCrud() {
        const sql = `SELECT 
            c.id_actor, 
            c.num_cliente, 
            c.nit_cliente, 
            ac.nombre_actor, 
            ac.apellido_actor, 
            ac.correo_actor, 
            ac.tel_actor, 
            ac.dir_actor
        FROM CLIENTE c
        JOIN ACTOR_COMERCIAL ac ON c.id_actor = ac.id_actor
        ORDER BY c.id_actor ASC;`;
        const result = await pool.query(sql);
        return { data: result.rows, sql };
    }

    async createClienteCrud(cliente: any) {
        const client = await pool.connect();
        const queriesExecuted: string[] = [];
        try {
            await client.query('BEGIN');
            queriesExecuted.push('BEGIN;');

            const sqlActor = `INSERT INTO ACTOR_COMERCIAL (nombre_actor, apellido_actor, correo_actor, tel_actor, dir_actor) VALUES ($1, $2, $3, $4, $5) RETURNING id_actor;`;
            queriesExecuted.push(sqlActor);
            const resActor = await client.query(sqlActor, [cliente.nombre_actor, cliente.apellido_actor, cliente.correo_actor, cliente.tel_actor, cliente.dir_actor]);
            const idActor = resActor.rows[0].id_actor;

            const sqlCliente = `INSERT INTO CLIENTE (id_actor, num_cliente, nit_cliente) VALUES ($1, $2, $3) RETURNING *;`;
            queriesExecuted.push(sqlCliente);
            await client.query(sqlCliente, [idActor, cliente.num_cliente, cliente.nit_cliente]);

            await client.query('COMMIT');
            queriesExecuted.push('COMMIT;');

            return {
                data: { id_actor: idActor, ...cliente },
                sql: queriesExecuted.join('\n\n')
            };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async updateClienteCrud(id: number, cliente: any) {
        const client = await pool.connect();
        const queriesExecuted: string[] = [];
        try {
            await client.query('BEGIN');
            queriesExecuted.push('BEGIN;');

            const sqlActor = `UPDATE ACTOR_COMERCIAL SET nombre_actor = $1, apellido_actor = $2, correo_actor = $3, tel_actor = $4, dir_actor = $5 WHERE id_actor = $6;`;
            queriesExecuted.push(sqlActor);
            await client.query(sqlActor, [cliente.nombre_actor, cliente.apellido_actor, cliente.correo_actor, cliente.tel_actor, cliente.dir_actor, id]);

            const sqlCliente = `UPDATE CLIENTE SET num_cliente = $1, nit_cliente = $2 WHERE id_actor = $3 RETURNING *;`;
            queriesExecuted.push(sqlCliente);
            await client.query(sqlCliente, [cliente.num_cliente, cliente.nit_cliente, id]);

            await client.query('COMMIT');
            queriesExecuted.push('COMMIT;');

            return {
                data: { id_actor: id, ...cliente },
                sql: queriesExecuted.join('\n\n')
            };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async deleteClienteCrud(id: number) {
        const client = await pool.connect();
        const queriesExecuted: string[] = [];
        try {
            await client.query('BEGIN');
            queriesExecuted.push('BEGIN;');

            const sqlCliente = `DELETE FROM CLIENTE WHERE id_actor = $1;`;
            queriesExecuted.push(sqlCliente);
            await client.query(sqlCliente, [id]);

            const sqlActor = `DELETE FROM ACTOR_COMERCIAL WHERE id_actor = $1 RETURNING *;`;
            queriesExecuted.push(sqlActor);
            const result = await client.query(sqlActor, [id]);

            await client.query('COMMIT');
            queriesExecuted.push('COMMIT;');

            return {
                data: result.rows[0],
                sql: queriesExecuted.join('\n\n')
            };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    // CRUD Proveedores (Transaccional)
    async getProveedoresCrud() {
        const sql = `SELECT p.id_actor, p.razon_social, p.nif_proveedor, p.moneda_pago, p.certificacion, ac.nombre_actor, ac.apellido_actor, ac.correo_actor, ac.tel_actor, ac.dir_actor
FROM PROVEEDOR p
JOIN ACTOR_COMERCIAL ac ON p.id_actor = ac.id_actor
ORDER BY p.id_actor ASC;`;
        const result = await pool.query(sql);
        return { data: result.rows, sql };
    }

    async createProveedorCrud(prov: any) {
        const client = await pool.connect();
        const queriesExecuted: string[] = [];
        try {
            await client.query('BEGIN');
            queriesExecuted.push('BEGIN;');

            const sqlActor = `INSERT INTO ACTOR_COMERCIAL (nombre_actor, apellido_actor, correo_actor, tel_actor, dir_actor) VALUES ($1, $2, $3, $4, $5) RETURNING id_actor;`;
            queriesExecuted.push(sqlActor);
            const resActor = await client.query(sqlActor, [prov.nombre_actor, prov.apellido_actor, prov.correo_actor, prov.tel_actor, prov.dir_actor]);
            const idActor = resActor.rows[0].id_actor;

            const sqlProv = `INSERT INTO PROVEEDOR (id_actor, razon_social, nif_proveedor, moneda_pago, certificacion) VALUES ($1, $2, $3, $4, $5) RETURNING *;`;
            queriesExecuted.push(sqlProv);
            await client.query(sqlProv, [idActor, prov.razon_social, prov.nif_proveedor, prov.moneda_pago, prov.certificacion]);

            await client.query('COMMIT');
            queriesExecuted.push('COMMIT;');

            return {
                data: { id_actor: idActor, ...prov },
                sql: queriesExecuted.join('\n\n')
            };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async updateProveedorCrud(id: number, prov: any) {
        const client = await pool.connect();
        const queriesExecuted: string[] = [];
        try {
            await client.query('BEGIN');
            queriesExecuted.push('BEGIN;');

            const sqlActor = `UPDATE ACTOR_COMERCIAL SET nombre_actor = $1, apellido_actor = $2, correo_actor = $3, tel_actor = $4, dir_actor = $5 WHERE id_actor = $6;`;
            queriesExecuted.push(sqlActor);
            await client.query(sqlActor, [prov.nombre_actor, prov.apellido_actor, prov.correo_actor, prov.tel_actor, prov.dir_actor, id]);

            const sqlProv = `UPDATE PROVEEDOR SET razon_social = $1, nif_proveedor = $2, moneda_pago = $3, certificacion = $4 WHERE id_actor = $5 RETURNING *;`;
            queriesExecuted.push(sqlProv);
            await client.query(sqlProv, [prov.razon_social, prov.nif_proveedor, prov.moneda_pago, prov.certificacion, id]);

            await client.query('COMMIT');
            queriesExecuted.push('COMMIT;');

            return {
                data: { id_actor: id, ...prov },
                sql: queriesExecuted.join('\n\n')
            };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async deleteProveedorCrud(id: number) {
        const client = await pool.connect();
        const queriesExecuted: string[] = [];
        try {
            await client.query('BEGIN');
            queriesExecuted.push('BEGIN;');

            const sqlProv = `DELETE FROM PROVEEDOR WHERE id_actor = $1;`;
            queriesExecuted.push(sqlProv);
            await client.query(sqlProv, [id]);

            const sqlActor = `DELETE FROM ACTOR_COMERCIAL WHERE id_actor = $1 RETURNING *;`;
            queriesExecuted.push(sqlActor);
            const result = await client.query(sqlActor, [id]);

            await client.query('COMMIT');
            queriesExecuted.push('COMMIT;');

            return {
                data: result.rows[0],
                sql: queriesExecuted.join('\n\n')
            };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}