import { pool } from '../config/database';
import { getSqlQuery } from '../utils/sqlReader';

export class TiendaService {

    async obtenerDirectorioEmpleados() {
        const query = getSqlQuery('directorioEmpleados');
        const result = await pool.query(query);
        return result.rows;
    }

    async obtenerMejoresClientes(montoMinimo: number = 1000) {
        const query = getSqlQuery('mejoresClientes');
        const result = await pool.query(query, [montoMinimo]);
        return result.rows;
    }

    async obtenerCatalogoDetallado() {
        const query = getSqlQuery('catalogoDetallado');
        const result = await pool.query(query);
        return result.rows;
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
}