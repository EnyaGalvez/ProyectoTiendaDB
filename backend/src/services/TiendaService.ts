import { prisma } from '../prisma.js';
import { getSqlQuery } from '../utils/sqlReader.js';

export class TiendaService {

    async obtenerDirectorioEmpleados() {
        const query = getSqlQuery('directorioEmpleados');
        const result: any = await prisma.$queryRawUnsafe(query);
        return { data: result, sql: `prisma.$queryRawUnsafe(getSqlQuery('directorioEmpleados'))` };
    }

    async obtenerMejoresClientes(montoMinimo: number = 1000) {
        const query = getSqlQuery('mejoresClientes');
        const result: any = await prisma.$queryRawUnsafe(query, montoMinimo);
        return { data: result, sql: `prisma.$queryRawUnsafe(getSqlQuery('mejoresClientes'), ${montoMinimo})` };
    }

    async obtenerCatalogoDetallado() {
        const query = getSqlQuery('catalogoDetallado');
        const result: any = await prisma.$queryRawUnsafe(query);
        return { data: result, sql: `prisma.$queryRawUnsafe(getSqlQuery('catalogoDetallado'))` };
    }

    // CRUD Categoria
    async getCategorias() {
        const categorias = await prisma.categoria.findMany({
            orderBy: { id_categoria: 'asc' }
        });
        const sql = `prisma.categoria.findMany({ orderBy: { id_categoria: 'asc' } })`;
        return { data: categorias, sql };
    }

    async createCategoria(nombre: string, descripcion: string) {
        const categoria = await prisma.categoria.create({
            data: { nombre, descripcion }
        });
        const sql = `prisma.categoria.create({ data: { nombre: '${nombre}', descripcion: '${descripcion}' } })`;
        return { data: categoria, sql };
    }

    async updateCategoria(id: number, nombre: string, descripcion: string) {
        const categoria = await prisma.categoria.update({
            where: { id_categoria: id },
            data: { nombre, descripcion }
        });
        const sql = `prisma.categoria.update({ where: { id_categoria: ${id} }, data: { nombre: '${nombre}', ... } })`;
        return { data: categoria, sql };
    }

    async deleteCategoria(id: number) {
        const categoria = await prisma.categoria.delete({
            where: { id_categoria: id }
        });
        const sql = `prisma.categoria.delete({ where: { id_categoria: ${id} } })`;
        return { data: categoria, sql };
    }

    // CRUD Producto
    async getProductos() {
        const productos = await prisma.producto.findMany({
            orderBy: { id_producto: 'asc' }
        });
        const sql = `prisma.producto.findMany({ orderBy: { id_producto: 'asc' } })`;
        return { data: productos, sql };
    }

    async createProducto(prod: any) {
        const producto = await prisma.producto.create({
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
        const sql = `prisma.producto.create({ data: { nombre_prod: '${prod.nombre_prod}', ... } })`;
        return { data: producto, sql };
    }

    async updateProducto(id: number, prod: any) {
        const producto = await prisma.producto.update({
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
        const sql = `prisma.producto.update({ where: { id_producto: ${id} }, data: { ... } })`;
        return { data: producto, sql };
    }

    async deleteProducto(id: number) {
        const producto = await prisma.producto.delete({
            where: { id_producto: id }
        });
        const sql = `prisma.producto.delete({ where: { id_producto: ${id} } })`;
        return { data: producto, sql };
    }

    // Transacción Explícita (Registro de Cajero)
    async registrarCajeroTransaccion(actor: any, emp: any, cajero: any) {
        const logs: string[] = [];
        try {
            logs.push('// Iniciando Transacción Prisma');
            
            const result = await prisma.$transaction(async (tx) => {
                logs.push(`prisma.actor_comercial.create({ data: { nombre_actor: '${actor.nombre_actor}', ... } })`);
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
                return newActor.id_actor;
            });
            
            logs.push('// Transacción Prisma Exitosa');
            return { exito: true, logs: logs.join('\n\n'), id_actor: result };
        } catch (error) {
            logs.push('// ERROR DETECTADO, ROLLBACK AUTOMÁTICO DE PRISMA: ' + (error instanceof Error ? error.message : String(error)));
            throw { exito: false, logs: logs.join('\n\n'), error: error instanceof Error ? error.message : 'Error desconocido' };
        }
    }

    async procesarTransaccionVenta(idCliente: number, idCajero: number, productos: any[]) {
        try {
            const result = await prisma.$transaction(async (tx) => {
                const newVenta = await tx.venta.create({
                    data: {
                        fecha_hora_venta: new Date(),
                        id_act_cliente: idCliente,
                        id_act_cajero: idCajero,
                        factura: {
                            create: {
                                estado: 'Pagada'
                            }
                        }
                    }
                });

                for (const item of productos) {
                    await tx.presente_en.create({
                        data: {
                            id_venta: newVenta.id_venta,
                            id_producto: item.idProducto,
                            cantidad_vendida: item.cantidad,
                            precio_unitario_venta: item.precioUnitario
                        }
                    });

                    const resStock = await tx.producto.updateMany({
                        where: {
                            id_producto: item.idProducto,
                            stock: { gte: item.cantidad }
                        },
                        data: {
                            stock: { decrement: item.cantidad }
                        }
                    });

                    if (resStock.count === 0) {
                        throw new Error(`Stock insuficiente para el producto ID: ${item.idProducto}`);
                    }
                }
                
                return newVenta.id_venta;
            });

            return { exito: true, idVenta: result };
        } catch (error) {
            throw error;
        }
    }

    // CRUD Clientes (Transaccional)
    async getClientesCrud() {
        const clientes = await prisma.cliente.findMany({
            include: { actor_comercial: true },
            orderBy: { id_actor: 'asc' }
        });
        
        const data = clientes.map(c => ({
            id_actor: c.id_actor,
            num_cliente: c.num_cliente,
            nit_cliente: c.nit_cliente,
            nombre_actor: c.actor_comercial.nombre_actor,
            apellido_actor: c.actor_comercial.apellido_actor,
            correo_actor: c.actor_comercial.correo_actor,
            tel_actor: c.actor_comercial.tel_actor,
            dir_actor: c.actor_comercial.dir_actor
        }));

        const sql = `prisma.cliente.findMany({ include: { actor_comercial: true }, orderBy: { id_actor: 'asc' } })`;
        return { data, sql };
    }

    async createClienteCrud(cliente: any) {
        const queriesExecuted: string[] = ['// Usando Creación Anidada de Prisma'];
        try {
            const sqlPrisma = `prisma.actor_comercial.create({ data: { nombre_actor, ... , cliente: { create: { num_cliente, nit_cliente } } } })`;
            queriesExecuted.push(sqlPrisma);
            
            const newActor = await prisma.actor_comercial.create({
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

    async updateClienteCrud(id: number, cliente: any) {
        const queriesExecuted: string[] = ['// Actualizando Cliente y su Actor Comercial asociado'];
        try {
            const sqlPrisma = `prisma.cliente.update({ where: { id_actor: ${id} }, data: { num_cliente, nit_cliente, actor_comercial: { update: { ... } } } })`;
            queriesExecuted.push(sqlPrisma);

            await prisma.cliente.update({
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

    async deleteClienteCrud(id: number) {
        const queriesExecuted: string[] = ['// Eliminando Cliente y Actor Comercial (Transaccional)'];
        try {
            const sqlPrisma = `prisma.$transaction([ prisma.cliente.delete({ where: { id_actor: ${id} } }), prisma.actor_comercial.delete({ where: { id_actor: ${id} } }) ])`;
            queriesExecuted.push(sqlPrisma);

            const [, actorResult] = await prisma.$transaction([
                prisma.cliente.delete({ where: { id_actor: id } }),
                prisma.actor_comercial.delete({ where: { id_actor: id } })
            ]);

            return {
                data: actorResult,
                sql: queriesExecuted.join('\n\n')
            };
        } catch (error) {
            throw error;
        }
    }

    // CRUD Proveedores (Transaccional)
    async getProveedoresCrud() {
        const proveedores = await prisma.proveedor.findMany({
            include: { actor_comercial: true },
            orderBy: { id_actor: 'asc' }
        });
        
        const data = proveedores.map(p => ({
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

        const sql = `prisma.proveedor.findMany({ include: { actor_comercial: true }, orderBy: { id_actor: 'asc' } })`;
        return { data, sql };
    }

    async createProveedorCrud(prov: any) {
        const queriesExecuted: string[] = ['// Usando Creación Anidada de Prisma'];
        try {
            const sqlPrisma = `prisma.actor_comercial.create({ data: { nombre_actor, ... , proveedor: { create: { razon_social, nif_proveedor, moneda_pago, certificacion } } } })`;
            queriesExecuted.push(sqlPrisma);
            
            const newActor = await prisma.actor_comercial.create({
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

    async updateProveedorCrud(id: number, prov: any) {
        const queriesExecuted: string[] = ['// Actualizando Proveedor y su Actor Comercial asociado'];
        try {
            const sqlPrisma = `prisma.proveedor.update({ where: { id_actor: ${id} }, data: { razon_social, nif_proveedor, moneda_pago, certificacion, actor_comercial: { update: { ... } } } })`;
            queriesExecuted.push(sqlPrisma);

            await prisma.proveedor.update({
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

    async deleteProveedorCrud(id: number) {
        const queriesExecuted: string[] = ['// Eliminando Proveedor y Actor Comercial (Transaccional)'];
        try {
            const sqlPrisma = `prisma.$transaction([ prisma.proveedor.delete({ where: { id_actor: ${id} } }), prisma.actor_comercial.delete({ where: { id_actor: ${id} } }) ])`;
            queriesExecuted.push(sqlPrisma);

            const [, actorResult] = await prisma.$transaction([
                prisma.proveedor.delete({ where: { id_actor: id } }),
                prisma.actor_comercial.delete({ where: { id_actor: id } })
            ]);

            return {
                data: actorResult,
                sql: queriesExecuted.join('\n\n')
            };
        } catch (error) {
            throw error;
        }
    }
}