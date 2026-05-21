import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { TiendaService } from './services/TiendaService.js';
import { initializeDatabaseIfEmpty } from './utils/initDatabase.js';
import { prisma } from './prisma.js';

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

app.get('/api/prisma-health', async (_req, res) => {
    try {
        // Hacemos un count simple en la tabla producto usando Prisma
        const productCount = await prisma.producto.count();
        res.json({ status: 'ok', prisma: 'connected', productCount, timestamp: new Date().toISOString() });
    } catch (error) {
        console.error('[GET /api/prisma-health]', error);
        res.status(500).json({ error: 'Error conectando a Prisma.' });
    }
});

// Rutas de la Tienda
app.get('/api/empleados', async (_req, res) => {
    try {
        const result = await tiendaService.obtenerDirectorioEmpleados();
        res.json(result);
    } catch (error) {
        console.error('[GET /api/empleados]', error);
        res.status(500).json({ error: 'Error al obtener el directorio de empleados.' });
    }
});

app.get('/api/catalogo', async (_req, res) => {
    try {
        const result = await tiendaService.obtenerCatalogoDetallado();
        res.json(result);
    } catch (error) {
        console.error('[GET /api/catalogo]', error);
        res.status(500).json({ error: 'Error al obtener el catálogo.' });
    }
});

app.get('/api/clientes/mejores', async (req, res) => {
    try {
        const queryMonto = parseFloat(req.query['monto'] as string);
        const monto = isNaN(queryMonto) ? 1000 : queryMonto;
        const result = await tiendaService.obtenerMejoresClientes(monto);
        res.json(result);
    } catch (error) {
        console.error('[GET /api/clientes/mejores]', error);
        res.status(500).json({ error: 'Error al obtener los mejores clientes.' });
    }
});

app.post('/api/ventas', async (req, res) => {
    try {
        const { idCliente, idCajero, productos } = req.body as {
            idCliente: number;
            idCajero: number;
            productos: { idProducto: number; cantidad: number; precioUnitario: number }[];
        };

        if (!idCliente || !idCajero || !Array.isArray(productos) || productos.length === 0) {
            res.status(400).json({ error: 'Faltan datos requeridos: idCliente, idCajero y productos.' });
            return;
        }

        const resultado = await tiendaService.procesarTransaccionVenta(idCliente, idCajero, productos);
        res.status(201).json(resultado);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error desconocido.';
        console.error('[POST /api/ventas]', error);
        res.status(500).json({ error: message });
    }
});

// CRUD CATEGORIAS
app.get('/api/categorias', async (_req, res) => {
    try {
        const result = await tiendaService.getCategorias();
        res.json(result);
    } catch(e) {
        res.status(500).json({ error: 'Error al obtener categorias' });
    }
});
app.post('/api/categorias', async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;
        const result = await tiendaService.createCategoria(nombre, descripcion);
        res.json(result);
    } catch(e) {
        res.status(500).json({ error: 'Error al crear categoria' });
    }
});
app.put('/api/categorias/:id', async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;
        const result = await tiendaService.updateCategoria(Number(req.params.id), nombre, descripcion);
        res.json(result);
    } catch(e) {
        res.status(500).json({ error: 'Error al actualizar categoria' });
    }
});
app.delete('/api/categorias/:id', async (req, res) => {
    try {
        const result = await tiendaService.deleteCategoria(Number(req.params.id));
        res.json(result);
    } catch(e) {
        res.status(500).json({ error: 'Error al borrar categoria' });
    }
});

// CRUD PRODUCTOS
app.get('/api/productos', async (_req, res) => {
    try {
        const result = await tiendaService.getProductos();
        res.json(result);
    } catch(e) {
        res.status(500).json({ error: 'Error al obtener productos' });
    }
});
app.post('/api/productos', async (req, res) => {
    try {
        const result = await tiendaService.createProducto(req.body);
        res.json(result);
    } catch(e) {
        res.status(500).json({ error: 'Error al crear producto' });
    }
});
app.put('/api/productos/:id', async (req, res) => {
    try {
        const result = await tiendaService.updateProducto(Number(req.params.id), req.body);
        res.json(result);
    } catch(e) {
        res.status(500).json({ error: 'Error al actualizar producto' });
    }
});
app.delete('/api/productos/:id', async (req, res) => {
    try {
        const result = await tiendaService.deleteProducto(Number(req.params.id));
        res.json(result);
    } catch(e) {
        res.status(500).json({ error: 'Error al borrar producto' });
    }
});

// CRUD CLIENTES
app.get('/api/clientes-crud', async (_req, res) => {
    try {
        const result = await tiendaService.getClientesCrud();
        res.json(result);
    } catch(e) {
        console.error('[GET /api/clientes-crud]', e);
        res.status(500).json({ error: 'Error al obtener clientes' });
    }
});
app.post('/api/clientes-crud', async (req, res) => {
    try {
        const result = await tiendaService.createClienteCrud(req.body);
        res.json(result);
    } catch(e) {
        console.error('[POST /api/clientes-crud]', e);
        res.status(500).json({ error: 'Error al crear cliente' });
    }
});
app.put('/api/clientes-crud/:id', async (req, res) => {
    try {
        const result = await tiendaService.updateClienteCrud(Number(req.params.id), req.body);
        res.json(result);
    } catch(e) {
        console.error('[PUT /api/clientes-crud]', e);
        res.status(500).json({ error: 'Error al actualizar cliente' });
    }
});
app.delete('/api/clientes-crud/:id', async (req, res) => {
    try {
        const result = await tiendaService.deleteClienteCrud(Number(req.params.id));
        res.json(result);
    } catch(e) {
        console.error('[DELETE /api/clientes-crud]', e);
        res.status(500).json({ error: 'Error al borrar cliente' });
    }
});

// CRUD PROVEEDORES
app.get('/api/proveedores-crud', async (_req, res) => {
    try {
        const result = await tiendaService.getProveedoresCrud();
        res.json(result);
    } catch(e) {
        console.error('[GET /api/proveedores-crud]', e);
        res.status(500).json({ error: 'Error al obtener proveedores' });
    }
});
app.post('/api/proveedores-crud', async (req, res) => {
    try {
        const result = await tiendaService.createProveedorCrud(req.body);
        res.json(result);
    } catch(e) {
        console.error('[POST /api/proveedores-crud]', e);
        res.status(500).json({ error: 'Error al crear proveedor' });
    }
});
app.put('/api/proveedores-crud/:id', async (req, res) => {
    try {
        const result = await tiendaService.updateProveedorCrud(Number(req.params.id), req.body);
        res.json(result);
    } catch(e) {
        console.error('[PUT /api/proveedores-crud]', e);
        res.status(500).json({ error: 'Error al actualizar proveedor' });
    }
});
app.delete('/api/proveedores-crud/:id', async (req, res) => {
    try {
        const result = await tiendaService.deleteProveedorCrud(Number(req.params.id));
        res.json(result);
    } catch(e) {
        console.error('[DELETE /api/proveedores-crud]', e);
        res.status(500).json({ error: 'Error al borrar proveedor' });
    }
});

// TRANSACCION CAJERO
app.post('/api/transaccion/cajero', async (req, res) => {
    try {
        const { actor, empleado, cajero } = req.body;
        const result = await tiendaService.registrarCajeroTransaccion(actor, empleado, cajero);
        res.json(result);
    } catch(error: any) {
        console.error('[POST /api/transaccion/cajero] ROLLBACK', error);
        res.status(500).json(error); // Devuelve logs del rollback
    }
});

// 404
app.use((_req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada.' });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
