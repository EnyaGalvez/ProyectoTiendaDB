import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { TiendaService } from './services/TiendaService.js';
import { initializeDatabaseIfEmpty } from './utils/initDatabase.js';
import { prisma } from './prisma.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env['JWT_SECRET'] ?? 'supersecretkey_change_me';

// Polyfill para serializar BigInt a String en JSON.stringify (necesario para count() de Prisma)
(BigInt.prototype as any).toJSON = function () {
    return this.toString();
};

const app = express();
const PORT = process.env['PORT'] ?? '3002';
const tiendaService = new TiendaService();

// Inicializar la base de datos si está vacía
initializeDatabaseIfEmpty();

app.use(cors({ // Middleware
    origin: process.env['FRONTEND_URL'] ?? '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(express.json());

app.get('/api/health', (_req, res) => { // Health Check
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/prisma-health', async (req, res) => {
    try {
        // Hacemos un count simple en la tabla producto usando Prisma
        const productCount = await prisma.producto.count();
        res.json({ status: 'ok', prisma: 'connected', productCount, timestamp: new Date().toISOString() });
    } catch (error) {
        console.error('[GET /api/prisma-health]', error);
        res.status(500).json({ error: 'Error conectando a Prisma.' });
    }
});

// Middleware de Autorización RBAC
const verifyToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token no proporcionado o inválido' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        (req as any).user = decoded;
        next();
    } catch (e) {
        return res.status(401).json({ error: 'Token expirado o inválido' });
    }
};

const requireRole = (allowedRoles: string[]) => {
    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const user = (req as any).user;
        if (!user || !allowedRoles.includes(user.rol)) {
            return res.status(403).json({ error: 'Acceso denegado: Privilegios insuficientes' });
        }
        next();
    };
};

// Rutas de Auth
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await prisma.usuario.findUnique({ where: { username } });
        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        const validPass = bcrypt.compareSync(password, user.password_hash);
        if (!validPass) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        const token = jwt.sign(
            { id_actor: user.id_actor, rol: user.rol, username: user.username },
            JWT_SECRET,
            { expiresIn: '8h' }
        );
        res.json({ token, rol: user.rol, username: user.username });
    } catch (error) {
        res.status(500).json({ error: 'Error en el servidor al autenticar' });
    }
});

// Rutas de la Tienda (Protegidas)
app.get('/api/empleados', verifyToken, requireRole(['Gerente']), async (req, res) => {
    try {
        const rol = (req as any).user.rol;
        const result = await tiendaService.runWithRole(rol, async (tx) => {
            return await tiendaService.obtenerDirectorioEmpleados(tx);
        });
        res.json(result);
    } catch (error) {
        console.error('[GET /api/empleados]', error);
        res.status(500).json({ error: 'Error al obtener el directorio de empleados.' });
    }
});

app.get('/api/catalogo', verifyToken, async (req, res) => {
    try {
        const rol = (req as any).user.rol;
        const result = await tiendaService.runWithRole(rol, async (tx) => {
            return await tiendaService.obtenerCatalogoDetallado((req as any).user, tx);
        });
        res.json(result);
    } catch (error) {
        console.error('[GET /api/catalogo]', error);
        res.status(500).json({ error: 'Error al obtener el catálogo.' });
    }
});

app.get('/api/clientes/mejores', verifyToken, requireRole(['Gerente', 'Cajero']), async (req, res) => {
    try {
        const rol = (req as any).user.rol;
        const queryMonto = parseFloat(req.query['monto'] as string);
        const monto = isNaN(queryMonto) ? 1000 : queryMonto;
        const result = await tiendaService.runWithRole(rol, async (tx) => {
            return await tiendaService.obtenerMejoresClientes(monto, tx);
        });
        res.json(result);
    } catch (error) {
        console.error('[GET /api/clientes/mejores]', error);
        res.status(500).json({ error: 'Error al obtener los mejores clientes.' });
    }
});

app.post('/api/ventas', verifyToken, requireRole(['Gerente', 'Cajero']), async (req, res) => {
    try {
        const rol = (req as any).user.rol;
        const { idCliente, idCajero, productos } = req.body as {
            idCliente: number;
            idCajero: number;
            productos: { idProducto: number; cantidad: number; precioUnitario: number }[];
        };

        if (!idCliente || !idCajero || !Array.isArray(productos) || productos.length === 0) {
            res.status(400).json({ error: 'Faltan datos requeridos: idCliente, idCajero y productos.' });
            return;
        }

        const resultado = await tiendaService.runWithRole(rol, async (tx) => {
            return await tiendaService.procesarTransaccionVenta(idCliente, idCajero, productos, tx);
        });
        res.status(201).json(resultado);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error desconocido.';
        console.error('[POST /api/ventas]', error);
        res.status(500).json({ error: message });
    }
});

// CRUD CATEGORIAS
app.get('/api/categorias', verifyToken, requireRole(['Gerente', 'Almacenista', 'Cajero', 'Cliente', 'Proveedor']), async (req, res) => {
    try {
        const rol = (req as any).user.rol;
        const result = await tiendaService.runWithRole(rol, async (tx) => {
            return await tiendaService.getCategorias(tx);
        });
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: 'Error al obtener categorias' });
    }
});
app.post('/api/categorias', verifyToken, requireRole(['Gerente', 'Almacenista']), async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;
        const rol = (req as any).user.rol;
        const result = await tiendaService.runWithRole(rol, async (tx) => {
            return await tiendaService.createCategoria(nombre, descripcion, tx);
        });
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: 'Error al crear categoria' });
    }
});
app.put('/api/categorias/:id', verifyToken, requireRole(['Gerente', 'Almacenista']), async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;
        const rol = (req as any).user.rol;
        const result = await tiendaService.runWithRole(rol, async (tx) => {
            return await tiendaService.updateCategoria(Number(req.params.id), nombre, descripcion, tx);
        });
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: 'Error al actualizar categoria' });
    }
});
app.delete('/api/categorias/:id', verifyToken, requireRole(['Gerente', 'Almacenista']), async (req, res) => {
    try {
        const rol = (req as any).user.rol;
        const result = await tiendaService.runWithRole(rol, async (tx) => {
            return await tiendaService.deleteCategoria(Number(req.params.id), tx);
        });
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: 'Error al borrar categoria' });
    }
});

// CRUD PRODUCTOS
app.get('/api/productos', verifyToken, requireRole(['Gerente', 'Almacenista', 'Cajero', 'Cliente', 'Proveedor']), async (req, res) => {
    try {
        const rol = (req as any).user.rol;
        const result = await tiendaService.runWithRole(rol, async (tx) => {
            return await tiendaService.getProductos((req as any).user, tx);
        });
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: 'Error al obtener productos' });
    }
});
app.post('/api/productos', verifyToken, requireRole(['Gerente', 'Almacenista']), async (req, res) => {
    try {
        const rol = (req as any).user.rol;
        const result = await tiendaService.runWithRole(rol, async (tx) => {
            return await tiendaService.createProducto(req.body, tx);
        });
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: 'Error al crear producto' });
    }
});
app.put('/api/productos/:id', verifyToken, requireRole(['Gerente', 'Almacenista']), async (req, res) => {
    try {
        const rol = (req as any).user.rol;
        const result = await tiendaService.runWithRole(rol, async (tx) => {
            return await tiendaService.updateProducto(Number(req.params.id), req.body, tx);
        });
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: 'Error al actualizar producto' });
    }
});
app.delete('/api/productos/:id', verifyToken, requireRole(['Gerente', 'Almacenista']), async (req, res) => {
    try {
        const rol = (req as any).user.rol;
        const result = await tiendaService.runWithRole(rol, async (tx) => {
            return await tiendaService.deleteProducto(Number(req.params.id), tx);
        });
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: 'Error al borrar producto' });
    }
});

// CRUD CLIENTES
app.get('/api/clientes-crud', verifyToken, requireRole(['Gerente', 'Cajero']), async (req, res) => {
    try {
        const rol = (req as any).user.rol;
        const result = await tiendaService.runWithRole(rol, async (tx) => {
            return await tiendaService.getClientesCrud(tx);
        });
        res.json(result);
    } catch (e) {
        console.error('[GET /api/clientes-crud]', e);
        res.status(500).json({ error: 'Error al obtener clientes' });
    }
});
app.post('/api/clientes-crud', verifyToken, requireRole(['Gerente', 'Cajero']), async (req, res) => {
    try {
        const rol = (req as any).user.rol;
        const result = await tiendaService.runWithRole(rol, async (tx) => {
            return await tiendaService.createClienteCrud(req.body, tx);
        });
        res.json(result);
    } catch (e) {
        console.error('[POST /api/clientes-crud]', e);
        res.status(500).json({ error: 'Error al crear cliente' });
    }
});
app.put('/api/clientes-crud/:id', verifyToken, requireRole(['Gerente', 'Cajero']), async (req, res) => {
    try {
        const rol = (req as any).user.rol;
        const result = await tiendaService.runWithRole(rol, async (tx) => {
            return await tiendaService.updateClienteCrud(Number(req.params.id), req.body, tx);
        });
        res.json(result);
    } catch (e) {
        console.error('[PUT /api/clientes-crud]', e);
        res.status(500).json({ error: 'Error al actualizar cliente' });
    }
});
app.delete('/api/clientes-crud/:id', verifyToken, requireRole(['Gerente', 'Cajero']), async (req, res) => {
    try {
        const rol = (req as any).user.rol;
        const result = await tiendaService.runWithRole(rol, async (tx) => {
            return await tiendaService.deleteClienteCrud(Number(req.params.id), tx);
        });
        res.json(result);
    } catch (e) {
        console.error('[DELETE /api/clientes-crud]', e);
        res.status(500).json({ error: 'Error al borrar cliente' });
    }
});

// CRUD PROVEEDORES
app.get('/api/proveedores-crud', verifyToken, requireRole(['Gerente', 'Almacenista']), async (req, res) => {
    try {
        const rol = (req as any).user.rol;
        const result = await tiendaService.runWithRole(rol, async (tx) => {
            return await tiendaService.getProveedoresCrud(tx);
        });
        res.json(result);
    } catch (e) {
        console.error('[GET /api/proveedores-crud]', e);
        res.status(500).json({ error: 'Error al obtener proveedores' });
    }
});
app.post('/api/proveedores-crud', verifyToken, requireRole(['Gerente', 'Almacenista']), async (req, res) => {
    try {
        const rol = (req as any).user.rol;
        const result = await tiendaService.runWithRole(rol, async (tx) => {
            return await tiendaService.createProveedorCrud(req.body, tx);
        });
        res.json(result);
    } catch (e) {
        console.error('[POST /api/proveedores-crud]', e);
        res.status(500).json({ error: 'Error al crear proveedor' });
    }
});
app.put('/api/proveedores-crud/:id', verifyToken, requireRole(['Gerente', 'Almacenista']), async (req, res) => {
    try {
        const rol = (req as any).user.rol;
        const result = await tiendaService.runWithRole(rol, async (tx) => {
            return await tiendaService.updateProveedorCrud(Number(req.params.id), req.body, tx);
        });
        res.json(result);
    } catch (e) {
        console.error('[PUT /api/proveedores-crud]', e);
        res.status(500).json({ error: 'Error al actualizar proveedor' });
    }
});
app.delete('/api/proveedores-crud/:id', verifyToken, requireRole(['Gerente', 'Almacenista']), async (req, res) => {
    try {
        const rol = (req as any).user.rol;
        const result = await tiendaService.runWithRole(rol, async (tx) => {
            return await tiendaService.deleteProveedorCrud(Number(req.params.id), tx);
        });
        res.json(result);
    } catch (e) {
        console.error('[DELETE /api/proveedores-crud]', e);
        res.status(500).json({ error: 'Error al borrar proveedor' });
    }
});

// TRANSACCION CAJERO
app.post('/api/transaccion/cajero', verifyToken, requireRole(['Gerente']), async (req, res) => {
    try {
        const { actor, empleado, cajero } = req.body;
        const rol = (req as any).user.rol;
        const result = await tiendaService.runWithRole(rol, async (tx) => {
            return await tiendaService.registrarCajeroTransaccion(actor, empleado, cajero, tx);
        });
        res.json(result);
    } catch (error: any) {
        console.error('[POST /api/transaccion/cajero] ROLLBACK', error);
        res.status(500).json(error); // Devuelve logs del rollback
    }
});

// STORED PROCEDURES ENDPOINTS
app.put('/api/productos/:id/stock', verifyToken, requireRole(['Gerente', 'Almacenista']), async (req, res) => {
    try {
        const { cantidadCambio } = req.body;
        const rol = (req as any).user.rol;
        const result = await tiendaService.runWithRole(rol, async (tx) => {
            return await tiendaService.actualizarStockSP(Number(req.params.id), Number(cantidadCambio), tx);
        });
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Error al actualizar stock' });
    }
});

app.post('/api/proveedores/batch', verifyToken, requireRole(['Gerente']), async (req, res) => {
    try {
        const { proveedor, productos } = req.body;
        const rol = (req as any).user.rol;
        const result = await tiendaService.runWithRole(rol, async (tx) => {
            return await tiendaService.crearProveedorConProductosSP(proveedor, productos, tx);
        });
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Error al crear proveedor en batch' });
    }
});

app.post('/api/ventas/:id/anular', verifyToken, requireRole(['Gerente']), async (req, res) => {
    try {
        const rol = (req as any).user.rol;
        const result = await tiendaService.runWithRole(rol, async (tx) => {
            return await tiendaService.anularVentaSP(Number(req.params.id), tx);
        });
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Error al anular venta' });
    }
});

app.get('/api/reportes/ventas', verifyToken, requireRole(['Gerente', 'Cajero']), async (req, res) => {
    try {
        const { inicio, fin } = req.query;
        if (!inicio || !fin) return res.status(400).json({ error: 'Faltan parámetros inicio o fin' });
        const rol = (req as any).user.rol;
        const result = await tiendaService.runWithRole(rol, async (tx) => {
            return await tiendaService.obtenerReporteVentasSP(inicio as string, fin as string, tx);
        });
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Error al generar reporte de ventas' });
    }
});

// 404
app.use((_req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada.' });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
