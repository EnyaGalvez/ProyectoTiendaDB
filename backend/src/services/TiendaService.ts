import { prisma } from '../prisma.js';

export class TiendaService {

    async runWithRole<T>(rol: string, operation: (tx: any) => Promise<T>): Promise<T> {
        return await prisma.$transaction(async (tx) => {
            const roleName = `rol_${rol.toLowerCase()}`;
            await tx.$executeRawUnsafe(`SET LOCAL ROLE ${roleName}`);
            return await operation(tx);
        });
    }

    async obtenerDirectorioEmpleados(tx: any = prisma) {
        const logs: string[] = ['// Usando Prisma ORM para obtener directorio de empleados'];
        const empleados = await tx.empleado.findMany({
            include: {
                actor_comercial: true,
                gerente: true,
                cajero: true,
                almacenista: true
            },
            orderBy: { actor_comercial: { nombre_actor: 'asc' } }
        });

        const data = await Promise.all(empleados.map(async (e: any) => {
            let rol_especifico = 'Empleado';
            let supervisorId = null;
            if (e.gerente) { rol_especifico = 'Gerente'; }
            else if (e.cajero) { rol_especifico = 'Cajero'; supervisorId = e.cajero.id_act_gerente; }
            else if (e.almacenista) { rol_especifico = 'Almacenista'; supervisorId = e.almacenista.id_act_gerente; }

            let nombre_supervisor = 'N/A';
            if (supervisorId) {
                const sup = await tx.actor_comercial.findUnique({ where: { id_actor: supervisorId } });
                if (sup) nombre_supervisor = `${sup.nombre_actor} ${sup.apellido_actor}`;
            }

            return {
                id_actor: e.id_actor,
                nombre_actor: e.actor_comercial.nombre_actor,
                apellido_actor: e.actor_comercial.apellido_actor,
                puesto_empleado: e.puesto_empleado,
                rol_especifico,
                nombre_supervisor
            };
        }));
        
        return { data, sql: logs.join('\n') };
    }

    async obtenerMejoresClientes(montoMinimo: number = 1000, tx: any = prisma) {
        const sql = `tx.$queryRaw(SELECT ... HAVING ... > ${montoMinimo})`;
        const result: any[] = await tx.$queryRaw`
            SELECT 
                a.id_actor,
                a.nombre_actor, 
                a.apellido_actor, 
                c.nit_cliente,
                COUNT(DISTINCT v.id_venta)::int AS total_compras,
                SUM(pe.cantidad_vendida * pe.precio_unitario_venta)::numeric AS total_gastado
            FROM actor_comercial a
            INNER JOIN cliente c ON a.id_actor = c.id_actor
            INNER JOIN venta v ON c.id_actor = v.id_act_cliente
            INNER JOIN presente_en pe ON v.id_venta = pe.id_venta
            GROUP BY a.id_actor, a.nombre_actor, a.apellido_actor, c.nit_cliente
            HAVING SUM(pe.cantidad_vendida * pe.precio_unitario_venta) > ${montoMinimo}
            ORDER BY total_gastado DESC;
        `;
        return { data: result, sql };
    }

    async obtenerCatalogoDetallado(user: any, tx: any = prisma) {
        const logs: string[] = ['// Usando Prisma ORM para obtener catálogo detallado'];
        let data: any[] = [];

        if (user.rol === 'Proveedor') {
            const result: any[] = await tx.$queryRaw`SELECT * FROM vista_productos_proveedor WHERE id_act_proveedor = ${user.id_actor}`;
            data = result.map(p => ({
                nombre_prod: p.nombre_prod,
                categoria: p.categoria,
                stock: p.stock,
                precio_prod: p.precio_prod,
                proveedor_principal: 'Tú',
                gestionado_por: 'Confidencial'
            }));
            logs.push('// Vista de Proveedor utilizada');
        } else if (user.rol === 'Cliente') {
            const productos = await tx.producto.findMany({
                include: { categoria: true },
                orderBy: [ { categoria: { nombre: 'asc' } }, { nombre_prod: 'asc' } ]
            });
            data = productos.map((p: any) => ({
                nombre_prod: p.nombre_prod,
                categoria: p.categoria.nombre,
                stock: p.stock,
                precio_prod: p.precio_prod,
                proveedor_principal: 'N/A',
                gestionado_por: 'N/A'
            }));
            logs.push('// Vista simplificada para Cliente');
        } else {
            const productos = await tx.producto.findMany({
                include: {
                    categoria: true,
                    almacenista: { include: { empleado: { include: { actor_comercial: true } } } },
                    provee: { include: { proveedor: { include: { actor_comercial: true } } } }
                },
                orderBy: [ { categoria: { nombre: 'asc' } }, { nombre_prod: 'asc' } ]
            });
            data = productos.map((p: any) => ({
                nombre_prod: p.nombre_prod,
                categoria: p.categoria.nombre,
                stock: p.stock,
                precio_prod: p.precio_prod,
                proveedor_principal: p.provee[0]?.proveedor.razon_social || 'N/A',
                gestionado_por: p.almacenista.empleado.actor_comercial.nombre_actor + ' ' + p.almacenista.empleado.actor_comercial.apellido_actor
            }));
        }

        return { data, sql: logs.join('\n') };
    }

    // CRUD Categoria
    async getCategorias(tx: any = prisma) {
        const categorias = await tx.categoria.findMany({
            orderBy: { id_categoria: 'asc' }
        });
        const sql = `tx.categoria.findMany({ orderBy: { id_categoria: 'asc' } })`;
        return { data: categorias, sql };
    }

    async createCategoria(nombre: string, descripcion: string, tx: any = prisma) {
        const categoria = await tx.categoria.create({
            data: { nombre, descripcion }
        });
        const sql = `tx.categoria.create({ data: { nombre: '${nombre}', descripcion: '${descripcion}' } })`;
        return { data: categoria, sql };
    }

    async updateCategoria(id: number, nombre: string, descripcion: string, tx: any = prisma) {
        const categoria = await tx.categoria.update({
            where: { id_categoria: id },
            data: { nombre, descripcion }
        });
        const sql = `tx.categoria.update({ where: { id_categoria: ${id} }, data: { nombre: '${nombre}', ... } })`;
        return { data: categoria, sql };
    }

    async deleteCategoria(id: number, tx: any = prisma) {
        const categoria = await tx.categoria.delete({
            where: { id_categoria: id }
        });
        const sql = `tx.categoria.delete({ where: { id_categoria: ${id} } })`;
        return { data: categoria, sql };
    }

    // CRUD Producto
    async getProductos(user: any, tx: any = prisma) {
        let productos;
        if (user.rol === 'Proveedor') {
            productos = await tx.producto.findMany({
                where: { provee: { some: { id_act_proveedor: user.id_actor } } },
                orderBy: { id_producto: 'asc' }
            });
        } else {
            productos = await tx.producto.findMany({
                orderBy: { id_producto: 'asc' }
            });
        }
        const sql = `tx.producto.findMany(...)`;
        return { data: productos, sql };
    }

    async createProducto(prod: any, tx: any = prisma) {
        const producto = await tx.producto.create({
            data: {
                nombre_prod: prod.nombre_prod,
                descripcion_prod: prod.descripcion_prod,
                precio_prod: prod.precio_prod,
                precio_compra_base: prod.precio_compra_base,
                stock: prod.stock,
                ubicacion_bodega: prod.ubicacion_bodega,
                id_categoria: prod.id_categoria,
                id_act_almacenista: prod.id_act_almacenista
            }
        });
        const sql = `tx.producto.create({ data: { nombre_prod: '${prod.nombre_prod}', ... } })`;
        return { data: producto, sql };
    }

    async updateProducto(id: number, prod: any, tx: any = prisma) {
        const producto = await tx.producto.update({
            where: { id_producto: id },
            data: {
                nombre_prod: prod.nombre_prod,
                descripcion_prod: prod.descripcion_prod,
                precio_prod: prod.precio_prod,
                precio_compra_base: prod.precio_compra_base,
                stock: prod.stock,
                ubicacion_bodega: prod.ubicacion_bodega,
                id_categoria: prod.id_categoria,
                id_act_almacenista: prod.id_act_almacenista
            }
        });
        const sql = `tx.producto.update({ where: { id_producto: ${id} }, data: { ... } })`;
        return { data: producto, sql };
    }

    async deleteProducto(id: number, tx: any = prisma) {
        const producto = await tx.producto.delete({
            where: { id_producto: id }
        });
        const sql = `tx.producto.delete({ where: { id_producto: ${id} } })`;
        return { data: producto, sql };
    }

    // Transacción Explícita (Registro de Cajero)
    async registrarCajeroTransaccion(actor: any, emp: any, cajero: any, tx: any = prisma) {
        const logs: string[] = [];
        try {
            logs.push('// Iniciando Transacción Prisma');

            logs.push(`tx.actor_comercial.create({ data: { nombre_actor: '${actor.nombre_actor}', ... } })`);
            const newActor = await tx.actor_comercial.create({
                data: {
                    nombre_actor: actor.nombre_actor,
                    apellido_actor: actor.apellido_actor,
                    correo_actor: actor.correo_actor,
                    tel_actor: actor.tel_actor,
                    dir_actor: actor.dir_actor,
                    empleado: {
                        create: {
                            num_empleado: emp.num_empleado,
                            puesto_empleado: emp.puesto_empleado,
                            salario_empleado: emp.salario_empleado,
                            nit_empleado: emp.nit_empleado,
                            horario_empleado: emp.horario_empleado,
                            cajero: {
                                create: {
                                    id_act_gerente: cajero.id_act_gerente
                                }
                            }
                        }
                    }
                }
            });
            const result = newActor.id_actor;

            logs.push('// Transacción Prisma Exitosa');
            return { exito: true, logs: logs.join('\n\n'), id_actor: result };
        } catch (error) {
            logs.push('// ERROR DETECTADO, ROLLBACK AUTOMÁTICO DE PRISMA: ' + (error instanceof Error ? error.message : String(error)));
            throw { exito: false, logs: logs.join('\n\n'), error: error instanceof Error ? error.message : 'Error desconocido' };
        }
    }

    async procesarTransaccionVenta(idCliente: number, idCajero: number, productos: any[], tx: any = prisma) {
        try {
            const logs: string[] = ['// Procesando venta con Prisma ORM (Transacción)'];
            
            const nuevaVenta = await tx.venta.create({
                data: {
                    fecha_hora_venta: new Date(),
                    id_act_cliente: idCliente,
                    id_act_cajero: idCajero
                }
            });
            logs.push(`tx.venta.create({ id_act_cliente: ${idCliente} }) => id: ${nuevaVenta.id_venta}`);

            await tx.factura.create({
                data: { estado: 'Pagada', id_venta: nuevaVenta.id_venta }
            });
            logs.push(`tx.factura.create({ estado: 'Pagada' })`);

            for (const prod of productos) {
                const productoDb = await tx.producto.findUnique({ where: { id_producto: prod.idProducto } });
                
                if (!productoDb) throw new Error(`Producto ${prod.idProducto} no encontrado`);
                if (productoDb.stock < prod.cantidad) throw new Error(`Stock insuficiente para el producto ID ${prod.idProducto}`);

                await tx.presente_en.create({
                    data: {
                        id_venta: nuevaVenta.id_venta,
                        id_producto: prod.idProducto,
                        cantidad_vendida: prod.cantidad,
                        precio_unitario_venta: productoDb.precio_prod
                    }
                });

                await tx.producto.update({
                    where: { id_producto: prod.idProducto },
                    data: { stock: { decrement: prod.cantidad } }
                });
            }

            return { exito: true, idVenta: nuevaVenta.id_venta, logs: logs.join('\n\n') };
        } catch (error) {
            console.error('[TiendaService] Error en procesarTransaccionVenta:', error);
            throw error;
        }
    }

    async actualizarStockSP(idProducto: number, cantidadCambio: number, tx: any = prisma) {
        try {
            const productoDb = await tx.producto.findUnique({ where: { id_producto: idProducto } });
            if (!productoDb) throw new Error(`Producto no encontrado`);
            
            const nuevoStock = productoDb.stock + cantidadCambio;
            if (nuevoStock < 0) throw new Error(`El stock no puede ser negativo. Stock calculado: ${nuevoStock}`);

            await tx.producto.update({
                where: { id_producto: idProducto },
                data: { stock: nuevoStock }
            });

            const sql = `tx.producto.update({ data: { stock: ${nuevoStock} } })`;
            return { exito: true, nuevoStock, sql };
        } catch (error) {
            throw error;
        }
    }

    async crearProveedorConProductosSP(proveedor: any, productos: any[], tx: any = prisma) {
        try {
            const logs: string[] = ['// Prisma ORM: Creando proveedor y productos en batch'];
            const newActor = await tx.actor_comercial.create({
                data: {
                    nombre_actor: proveedor.nombre_actor,
                    apellido_actor: proveedor.apellido_actor,
                    correo_actor: proveedor.correo_actor,
                    tel_actor: proveedor.tel_actor,
                    dir_actor: proveedor.dir_actor,
                    proveedor: {
                        create: {
                            razon_social: proveedor.razon_social,
                            nif_proveedor: proveedor.nif_proveedor,
                            moneda_pago: proveedor.moneda_pago,
                            certificacion: proveedor.certificacion
                        }
                    }
                }
            });
            const idProveedor = newActor.id_actor;

            for (const prod of productos) {
                const nuevoProducto = await tx.producto.create({
                    data: {
                        nombre_prod: prod.nombre_prod,
                        descripcion_prod: prod.descripcion_prod,
                        precio_prod: prod.precio_prod,
                        precio_compra_base: prod.precio_compra_base,
                        stock: prod.stock,
                        ubicacion_bodega: prod.ubicacion_bodega,
                        id_categoria: prod.id_categoria,
                        id_act_almacenista: prod.id_act_almacenista
                    }
                });

                await tx.provee.create({
                    data: {
                        id_act_proveedor: idProveedor,
                        id_producto: nuevoProducto.id_producto,
                        precio_compra_proveedor: prod.precio_compra_base,
                        moneda_cambio_proveedor: proveedor.moneda_pago
                    }
                });
            }

            return { exito: true, idProveedor, sql: logs.join('\n') };
        } catch (error) {
            throw error;
        }
    }

    async anularVentaSP(idVenta: number, tx: any = prisma) {
        try {
            const logs: string[] = ['// Prisma ORM: Anular Venta'];
            const facturas = await tx.factura.findMany({ where: { id_venta: idVenta } });
            
            if (facturas.length > 0 && facturas[0].estado === 'Anulada') {
                throw new Error('La venta ya se encuentra anulada.');
            }

            await tx.factura.updateMany({
                where: { id_venta: idVenta },
                data: { estado: 'Anulada' }
            });

            const detalles = await tx.presente_en.findMany({ where: { id_venta: idVenta } });

            for (const det of detalles) {
                await tx.producto.update({
                    where: { id_producto: det.id_producto },
                    data: { stock: { increment: det.cantidad_vendida } }
                });
            }

            return { exito: true, sql: logs.join('\n') };
        } catch (error) {
            throw error;
        }
    }

    async obtenerReporteVentasSP(fechaInicio: string, fechaFin: string, tx: any = prisma) {
        try {
            const fInicio = new Date(fechaInicio);
            const fFin = new Date(fechaFin);

            const ventas = await tx.venta.findMany({
                where: { fecha_hora_venta: { gte: fInicio, lte: fFin } },
                include: {
                    cliente: { include: { actor_comercial: true } },
                    cajero: { include: { empleado: { include: { actor_comercial: true } } } },
                    factura: true,
                    presente_en: true
                },
                orderBy: { fecha_hora_venta: 'desc' }
            });

            const data = ventas.map((v: any) => {
                const total = v.presente_en.reduce((acc: number, item: any) => acc + (Number(item.cantidad_vendida) * Number(item.precio_unitario_venta)), 0);
                return {
                    fecha: v.fecha_hora_venta,
                    cliente: v.cliente.actor_comercial.nombre_actor + ' ' + v.cliente.actor_comercial.apellido_actor,
                    cajero: v.cajero.empleado.actor_comercial.nombre_actor + ' ' + v.cajero.empleado.actor_comercial.apellido_actor,
                    total: total,
                    estado: v.factura[0]?.estado || 'Desconocido'
                };
            });

            const sql = `tx.venta.findMany({ where: { fecha_hora_venta: { gte, lte } } })`;
            return { data, sql };
        } catch (error) {
            throw error;
        }
    }

    // CRUD Clientes (Transaccional)
    async getClientesCrud(tx: any = prisma) {
        const clientes = await tx.cliente.findMany({
            include: { actor_comercial: true },
            orderBy: { id_actor: 'asc' }
        });

        const data = clientes.map((c: any) => ({
            id_actor: c.id_actor,
            num_cliente: c.num_cliente,
            nit_cliente: c.nit_cliente,
            nombre_actor: c.actor_comercial.nombre_actor,
            apellido_actor: c.actor_comercial.apellido_actor,
            correo_actor: c.actor_comercial.correo_actor,
            tel_actor: c.actor_comercial.tel_actor,
            dir_actor: c.actor_comercial.dir_actor
        }));

        const sql = `tx.cliente.findMany({ include: { actor_comercial: true }, orderBy: { id_actor: 'asc' } })`;
        return { data, sql };
    }

    async createClienteCrud(cliente: any, tx: any = prisma) {
        const queriesExecuted: string[] = ['// Usando Creación Anidada de Prisma'];
        try {
            const sqlPrisma = `tx.actor_comercial.create({ data: { nombre_actor, ... , cliente: { create: { num_cliente, nit_cliente } } } })`;
            queriesExecuted.push(sqlPrisma);

            const newActor = await tx.actor_comercial.create({
                data: {
                    nombre_actor: cliente.nombre_actor,
                    apellido_actor: cliente.apellido_actor,
                    correo_actor: cliente.correo_actor,
                    tel_actor: cliente.tel_actor,
                    dir_actor: cliente.dir_actor,
                    cliente: {
                        create: {
                            num_cliente: cliente.num_cliente,
                            nit_cliente: cliente.nit_cliente
                        }
                    }
                },
                include: { cliente: true }
            });

            return {
                data: { id_actor: newActor.id_actor, ...cliente },
                sql: queriesExecuted.join('\n\n')
            };
        } catch (error) {
            throw error;
        }
    }

    async updateClienteCrud(id: number, cliente: any, tx: any = prisma) {
        const queriesExecuted: string[] = ['// Actualizando Cliente y su Actor Comercial asociado'];
        try {
            const sqlPrisma = `tx.cliente.update({ where: { id_actor: ${id} }, data: { num_cliente, nit_cliente, actor_comercial: { update: { ... } } } })`;
            queriesExecuted.push(sqlPrisma);

            await tx.cliente.update({
                where: { id_actor: id },
                data: {
                    num_cliente: cliente.num_cliente,
                    nit_cliente: cliente.nit_cliente,
                    actor_comercial: {
                        update: {
                            nombre_actor: cliente.nombre_actor,
                            apellido_actor: cliente.apellido_actor,
                            correo_actor: cliente.correo_actor,
                            tel_actor: cliente.tel_actor,
                            dir_actor: cliente.dir_actor
                        }
                    }
                }
            });

            return {
                data: { id_actor: id, ...cliente },
                sql: queriesExecuted.join('\n\n')
            };
        } catch (error) {
            throw error;
        }
    }

    async deleteClienteCrud(id: number, tx: any = prisma) {
        const queriesExecuted: string[] = ['// Eliminando Cliente y Actor Comercial (Transaccional)'];
        try {
            const sqlPrisma = `// Sequential deletes since we are in a transaction\ntx.cliente.delete({ where: { id_actor: ${id} } });\ntx.actor_comercial.delete({ where: { id_actor: ${id} } });`;
            queriesExecuted.push(sqlPrisma);

            await tx.cliente.delete({ where: { id_actor: id } });
            const actorResult = await tx.actor_comercial.delete({ where: { id_actor: id } });

            return {
                data: actorResult,
                sql: queriesExecuted.join('\n\n')
            };
        } catch (error) {
            throw error;
        }
    }

    // CRUD Proveedores (Transaccional)
    async getProveedoresCrud(tx: any = prisma) {
        const proveedores = await tx.proveedor.findMany({
            include: { actor_comercial: true },
            orderBy: { id_actor: 'asc' }
        });

        const data = proveedores.map((p: any) => ({
            id_actor: p.id_actor,
            razon_social: p.razon_social,
            nif_proveedor: p.nif_proveedor,
            moneda_pago: p.moneda_pago,
            certificacion: p.certificacion,
            nombre_actor: p.actor_comercial.nombre_actor,
            apellido_actor: p.actor_comercial.apellido_actor,
            correo_actor: p.actor_comercial.correo_actor,
            tel_actor: p.actor_comercial.tel_actor,
            dir_actor: p.actor_comercial.dir_actor
        }));

        const sql = `tx.proveedor.findMany({ include: { actor_comercial: true }, orderBy: { id_actor: 'asc' } })`;
        return { data, sql };
    }

    async createProveedorCrud(prov: any, tx: any = prisma) {
        const queriesExecuted: string[] = ['// Usando Creación Anidada de Prisma'];
        try {
            const sqlPrisma = `tx.actor_comercial.create({ data: { nombre_actor, ... , proveedor: { create: { razon_social, nif_proveedor, moneda_pago, certificacion } } } })`;
            queriesExecuted.push(sqlPrisma);

            const newActor = await tx.actor_comercial.create({
                data: {
                    nombre_actor: prov.nombre_actor,
                    apellido_actor: prov.apellido_actor,
                    correo_actor: prov.correo_actor,
                    tel_actor: prov.tel_actor,
                    dir_actor: prov.dir_actor,
                    proveedor: {
                        create: {
                            razon_social: prov.razon_social,
                            nif_proveedor: prov.nif_proveedor,
                            moneda_pago: prov.moneda_pago,
                            certificacion: prov.certificacion
                        }
                    }
                },
                include: { proveedor: true }
            });

            return {
                data: { id_actor: newActor.id_actor, ...prov },
                sql: queriesExecuted.join('\n\n')
            };
        } catch (error) {
            throw error;
        }
    }

    async updateProveedorCrud(id: number, prov: any, tx: any = prisma) {
        const queriesExecuted: string[] = ['// Actualizando Proveedor y su Actor Comercial asociado'];
        try {
            const sqlPrisma = `tx.proveedor.update({ where: { id_actor: ${id} }, data: { razon_social, nif_proveedor, moneda_pago, certificacion, actor_comercial: { update: { ... } } } })`;
            queriesExecuted.push(sqlPrisma);

            await tx.proveedor.update({
                where: { id_actor: id },
                data: {
                    razon_social: prov.razon_social,
                    nif_proveedor: prov.nif_proveedor,
                    moneda_pago: prov.moneda_pago,
                    certificacion: prov.certificacion,
                    actor_comercial: {
                        update: {
                            nombre_actor: prov.nombre_actor,
                            apellido_actor: prov.apellido_actor,
                            correo_actor: prov.correo_actor,
                            tel_actor: prov.tel_actor,
                            dir_actor: prov.dir_actor
                        }
                    }
                }
            });

            return {
                data: { id_actor: id, ...prov },
                sql: queriesExecuted.join('\n\n')
            };
        } catch (error) {
            throw error;
        }
    }

    async deleteProveedorCrud(id: number, tx: any = prisma) {
        const queriesExecuted: string[] = ['// Eliminando Proveedor y Actor Comercial (Transaccional)'];
        try {
            const sqlPrisma = `// Sequential deletes inside transaction\ntx.proveedor.delete({ where: { id_actor: ${id} } });\ntx.actor_comercial.delete({ where: { id_actor: ${id} } });`;
            queriesExecuted.push(sqlPrisma);

            await tx.proveedor.delete({ where: { id_actor: id } });
            const actorResult = await tx.actor_comercial.delete({ where: { id_actor: id } });

            return {
                data: actorResult,
                sql: queriesExecuted.join('\n\n')
            };
        } catch (error) {
            throw error;
        }
    }
}
