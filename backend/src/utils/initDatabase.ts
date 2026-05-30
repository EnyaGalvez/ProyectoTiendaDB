import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { prisma } from '../prisma.js';
import { PrismaClient } from '@prisma/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function initializeDatabaseIfEmpty() {
    try {
        console.log('[DB Init] Verificando estado de la base de datos con Prisma...');
        
        try {
            await prisma.$queryRawUnsafe('SELECT 1');
        } catch (connError: any) {
            console.log('[DB Init] Error conectando con Prisma, intentando fix temporal con usuario "postgres" o "proy2"...');
            
            const tempPrisma = new PrismaClient({
                datasourceUrl: 'postgresql://postgres:secret@db:5432/tienda_db'
            });
            try {
                await tempPrisma.$executeRawUnsafe(`
                    DO $$ 
                    BEGIN
                      IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'proy3') THEN
                        CREATE ROLE proy3 WITH LOGIN SUPERUSER PASSWORD 'secret';
                      END IF;
                    END
                    $$;
                `);
                console.log('[DB Init] Rol proy3 creado exitosamente con postgres.');
            } catch (e) {
                console.log('[DB Init] No se pudo crear el rol con postgres, intentando con proy2...');
                const tempPrisma2 = new PrismaClient({
                    datasourceUrl: 'postgresql://proy2:secret@db:5432/tienda_db'
                });
                await tempPrisma2.$executeRawUnsafe(`
                    DO $$ 
                    BEGIN
                      IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'proy3') THEN
                        CREATE ROLE proy3 WITH LOGIN SUPERUSER PASSWORD 'secret';
                      ELSE
                        ALTER ROLE proy3 WITH LOGIN SUPERUSER PASSWORD 'secret';
                      END IF;
                    END
                    $$;
                `);
                console.log('[DB Init] Rol proy3 creado/actualizado con proy2.');
                await tempPrisma2.$disconnect();
            } finally {
                await tempPrisma.$disconnect();
            }
        }

        const result: any = await prisma.$queryRawUnsafe(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public'
                AND table_name = 'actor_comercial'
            );
        `);

        if (!result[0].exists) {
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
                await prisma.$executeRawUnsafe(ddl);

                console.log('[DB Init] Ejecutando scriptTienda.sql (datos iniciales)...');
                await prisma.$executeRawUnsafe(script);

                if (roles) {
                    console.log('[DB Init] Ejecutando roles.sql...');
                    await prisma.$executeRawUnsafe(roles);
                }

                console.log('[DB Init] Base de datos inicializada correctamente sin Stored Procedures (la lógica se maneja por Prisma).');
            } else {
                console.warn('[DB Init] No se encontraron los archivos SQL en', dbPath);
            }
        } else {
            console.log('[DB Init] Las tablas ya existen. No se requiere inicialización.');
        }

        console.log('[DB Init] Asegurando contraseñas correctas para usuarios de prueba...');
        await prisma.$executeRawUnsafe(`
            INSERT INTO usuario (id_actor, username, password_hash, rol) VALUES
            (1, 'gerente1', '$2b$10$gLBWYZ1L/ACEyi1RK.N0LO6kqYZ4bv//bk386Tu4SVhkde1/gJvYi', 'Gerente'),
            (26, 'cajero1', '$2b$10$gLBWYZ1L/ACEyi1RK.N0LO6kqYZ4bv//bk386Tu4SVhkde1/gJvYi', 'Cajero'),
            (51, 'almacenista1', '$2b$10$gLBWYZ1L/ACEyi1RK.N0LO6kqYZ4bv//bk386Tu4SVhkde1/gJvYi', 'Almacenista'),
            (101, 'proveedor1', '$2b$10$gLBWYZ1L/ACEyi1RK.N0LO6kqYZ4bv//bk386Tu4SVhkde1/gJvYi', 'Proveedor'),
            (76, 'cliente1', '$2b$10$gLBWYZ1L/ACEyi1RK.N0LO6kqYZ4bv//bk386Tu4SVhkde1/gJvYi', 'Cliente')
            ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash;
        `);
        console.log('[DB Init] Contraseñas verificadas/actualizadas.');

    } catch (error) {
        console.error('[DB Init] Error durante la inicialización:', error);
    }
}
