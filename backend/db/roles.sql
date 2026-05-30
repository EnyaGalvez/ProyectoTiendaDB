-- backend/db/roles.sql
-- Creación de roles de base de datos
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'proy3') THEN
    CREATE ROLE proy3 WITH LOGIN SUPERUSER PASSWORD 'secret';
  ELSE
    ALTER ROLE proy3 WITH LOGIN SUPERUSER PASSWORD 'secret';
  END IF;
  
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'rol_gerente') THEN
    CREATE ROLE rol_gerente NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'rol_cajero') THEN
    CREATE ROLE rol_cajero NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'rol_almacenista') THEN
    CREATE ROLE rol_almacenista NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'rol_proveedor') THEN
    CREATE ROLE rol_proveedor NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'rol_cliente') THEN
    CREATE ROLE rol_cliente NOLOGIN;
  END IF;
END
$$;

GRANT USAGE ON SCHEMA public TO rol_gerente, rol_cajero, rol_almacenista, rol_proveedor, rol_cliente;

-- Revocar acceso por defecto en public (opcional dependiendo de la estrictez)
-- REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC;

-- === ROL GERENTE ===
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO rol_gerente;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO rol_gerente;

-- === ROL CAJERO ===
GRANT SELECT ON categoria, producto, cliente, actor_comercial, empleado, gerente, cajero, almacenista, venta, factura, presente_en, proveedor, provee TO rol_cajero;
GRANT INSERT, UPDATE ON venta, factura, presente_en, cliente, actor_comercial, producto TO rol_cajero;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO rol_cajero;

-- === ROL ALMACENISTA ===
GRANT SELECT ON categoria, producto, cliente, actor_comercial, empleado, gerente, cajero, almacenista, venta, factura, presente_en, proveedor, provee TO rol_almacenista;
GRANT INSERT, UPDATE, DELETE ON producto, categoria, actor_comercial, proveedor, provee TO rol_almacenista;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO rol_almacenista;

-- === ROL PROVEEDOR ===
CREATE OR REPLACE VIEW vista_productos_proveedor AS
SELECT p.id_producto, p.nombre_prod, p.descripcion_prod, p.precio_prod, p.stock, c.nombre as categoria, pr.id_act_proveedor
FROM producto p
JOIN categoria c ON p.id_categoria = c.id_categoria
JOIN provee pr ON p.id_producto = pr.id_producto;

GRANT SELECT ON vista_productos_proveedor TO rol_proveedor;
GRANT SELECT ON categoria, producto, provee TO rol_proveedor;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO rol_proveedor;

-- === ROL CLIENTE ===
GRANT SELECT ON categoria, producto TO rol_cliente;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO rol_cliente;

-- Revocar acceso a tabla de credenciales por seguridad
REVOKE ALL ON usuario FROM rol_cajero, rol_almacenista, rol_proveedor, rol_cliente;
