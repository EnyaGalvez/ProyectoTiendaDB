import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { TiendaService } from './services/TiendaService.js';

const app = express();
const PORT = process.env['PORT'] ?? '3002';
const tiendaService = new TiendaService();

app.use(cors({ // Middleware
    origin: process.env['FRONTEND_URL'] ?? '*',
    methods: ['GET', 'POST'],
}));
app.use(express.json());

app.get('/api/health', (_req, res) => { // Health Check
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rutas de la Tienda
app.get('/api/empleados', async (_req, res) => {
    try {
        const empleados = await tiendaService.obtenerDirectorioEmpleados();
        res.json(empleados);
    } catch (error) {
        console.error('[GET /api/empleados]', error);
        res.status(500).json({ error: 'Error al obtener el directorio de empleados.' });
    }
});

app.get('/api/catalogo', async (_req, res) => {
    try {
        const catalogo = await tiendaService.obtenerCatalogoDetallado();
        res.json(catalogo);
    } catch (error) {
        console.error('[GET /api/catalogo]', error);
        res.status(500).json({ error: 'Error al obtener el catálogo.' });
    }
});

app.get('/api/clientes/mejores', async (req, res) => {
    try {
        const monto = parseFloat(req.query['monto'] as string) || 1000;
        const clientes = await tiendaService.obtenerMejoresClientes(monto);
        res.json(clientes);
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

// 404
app.use((_req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada.' });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`   → GET  /api/health`);
    console.log(`   → GET  /api/empleados`);
    console.log(`   → GET  /api/catalogo`);
    console.log(`   → GET  /api/clientes/mejores?monto=<número>`);
    console.log(`   → POST /api/ventas`);
});
