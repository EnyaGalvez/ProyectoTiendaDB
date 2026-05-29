import { pool } from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function initializeDatabaseIfEmpty() {
    try {
        console.log('[DB Init] Verificando estado de la base de datos...');
        const result = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public'
                AND table_name = 'actor_comercial'
            );
        `);

        if (!result.rows[0].exists) {
            console.log('[DB Init] La base de datos está vacía. Ejecutando scripts de inicialización...');
            
            // Path a la carpeta /backend/db
            const dbPath = path.join(__dirname, '../../db');
            
            const ddlPath = path.join(dbPath, 'ddlTienda.sql');
            const scriptPath = path.join(dbPath, 'scriptTienda.sql');
            const rolesPath = path.join(dbPath, 'roles.sql');

            if (fs.existsSync(ddlPath) && fs.existsSync(scriptPath)) {
                const ddl = fs.readFileSync(ddlPath, 'utf8');
                const script = fs.readFileSync(scriptPath, 'utf8');
                let roles = '';
                if (fs.existsSync(rolesPath)) {
                    roles = fs.readFileSync(rolesPath, 'utf8');
                }

                console.log('[DB Init] Ejecutando ddlTienda.sql...');
                await pool.query(ddl);

                console.log('[DB Init] Ejecutando scriptTienda.sql (datos iniciales)...');
                await pool.query(script);

                if (roles) {
                    console.log('[DB Init] Ejecutando roles.sql...');
                    await pool.query(roles);
                }

                const spPath = path.join(dbPath, 'stored_procedures.sql');
                if (fs.existsSync(spPath)) {
                    console.log('[DB Init] Ejecutando stored_procedures.sql...');
                    const spScript = fs.readFileSync(spPath, 'utf8');
                    await pool.query(spScript);
                }

                console.log('[DB Init] Base de datos inicializada correctamente.');
            } else {
                console.warn('[DB Init] No se encontraron los archivos SQL en', dbPath);
            }
        } else {
            console.log('[DB Init] Las tablas ya existen. No se requiere inicialización.');
        }
    } catch (error) {
        console.error('[DB Init] Error durante la inicialización:', error);
    }
}
