-- 1. sp_registrar_venta
-- Registra una venta, sus detalles y descuenta el stock usando transacciones.
CREATE OR REPLACE PROCEDURE sp_registrar_venta(
    p_id_cliente INT,
    p_id_cajero INT,
    p_productos JSON,
    INOUT p_id_venta INT DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_producto RECORD;
    v_precio NUMERIC;
    v_stock_actual INT;
BEGIN
    -- Crear la venta
    INSERT INTO venta (fecha_hora_venta, id_act_cliente, id_act_cajero)
    VALUES (NOW(), p_id_cliente, p_id_cajero)
    RETURNING id_venta INTO p_id_venta;

    -- Crear la factura (estado inicial Pagada)
    INSERT INTO factura (estado, id_venta)
    VALUES ('Pagada', p_id_venta);

    -- Iterar sobre los productos
    FOR v_producto IN SELECT * FROM json_populate_recordset(null::record, p_productos) AS (id_producto INT, cantidad INT)
    LOOP
        -- Obtener precio y stock actual (y bloquear la fila)
        SELECT precio_prod, stock INTO v_precio, v_stock_actual
        FROM producto
        WHERE id_producto = v_producto.id_producto FOR UPDATE;

        IF v_stock_actual < v_producto.cantidad THEN
            RAISE EXCEPTION 'Stock insuficiente para el producto ID %', v_producto.id_producto;
        END IF;

        -- Insertar en presente_en
        INSERT INTO presente_en (id_venta, id_producto, cantidad_vendida, precio_unitario_venta)
        VALUES (p_id_venta, v_producto.id_producto, v_producto.cantidad, v_precio);

        -- Actualizar stock
        UPDATE producto
        SET stock = stock - v_producto.cantidad
        WHERE id_producto = v_producto.id_producto;
    END LOOP;

    -- El COMMIT automático se maneja al salir del bloque sin excepciones.
END;
$$;

-- 2. sp_actualizar_stock
-- Actualiza stock y lanza excepción si es menor a cero (IN/OUT params)
CREATE OR REPLACE PROCEDURE sp_actualizar_stock(
    p_id_producto INT,
    p_cantidad_cambio INT,
    INOUT p_nuevo_stock INT DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE producto
    SET stock = stock + p_cantidad_cambio
    WHERE id_producto = p_id_producto
    RETURNING stock INTO p_nuevo_stock;

    IF p_nuevo_stock < 0 THEN
        RAISE EXCEPTION 'El stock no puede ser negativo. Stock calculado: %', p_nuevo_stock;
    END IF;
END;
$$;

-- 3. sp_crear_proveedor_con_productos
-- Crea un proveedor y múltiples productos en batch.
CREATE OR REPLACE PROCEDURE sp_crear_proveedor_con_productos(
    p_proveedor JSON,
    p_productos JSON,
    INOUT p_id_proveedor INT DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_prod RECORD;
    v_id_prod INT;
BEGIN
    -- Insertar Actor Comercial
    INSERT INTO actor_comercial (nombre_actor, apellido_actor, correo_actor, tel_actor, dir_actor)
    VALUES (
        p_proveedor->>'nombre_actor', 
        p_proveedor->>'apellido_actor', 
        p_proveedor->>'correo_actor', 
        p_proveedor->>'tel_actor', 
        p_proveedor->>'dir_actor'
    ) RETURNING id_actor INTO p_id_proveedor;

    -- Insertar Proveedor
    INSERT INTO proveedor (id_actor, razon_social, nif_proveedor, moneda_pago, certificacion)
    VALUES (
        p_id_proveedor,
        p_proveedor->>'razon_social',
        p_proveedor->>'nif_proveedor',
        p_proveedor->>'moneda_pago',
        p_proveedor->>'certificacion'
    );

    -- Insertar Productos y la relación Provee
    FOR v_prod IN SELECT * FROM json_populate_recordset(null::record, p_productos) AS (
        nombre_prod VARCHAR, descripcion_prod VARCHAR, precio_prod NUMERIC,
        precio_compra_base NUMERIC, stock INT, ubicacion_bodega VARCHAR,
        id_categoria INT, id_act_almacenista INT
    )
    LOOP
        INSERT INTO producto (nombre_prod, descripcion_prod, precio_prod, precio_compra_base, stock, ubicacion_bodega, id_categoria, id_act_almacenista)
        VALUES (v_prod.nombre_prod, v_prod.descripcion_prod, v_prod.precio_prod, v_prod.precio_compra_base, v_prod.stock, v_prod.ubicacion_bodega, v_prod.id_categoria, v_prod.id_act_almacenista)
        RETURNING id_producto INTO v_id_prod;

        INSERT INTO provee (id_act_proveedor, id_producto, precio_compra_proveedor, moneda_cambio_proveedor)
        VALUES (p_id_proveedor, v_id_prod, v_prod.precio_compra_base, p_proveedor->>'moneda_pago');
    END LOOP;
END;
$$;

-- 4. sp_anular_venta
-- Revierte la venta, cambia estado de factura a 'Anulada' y restaura stock.
CREATE OR REPLACE PROCEDURE sp_anular_venta(
    p_id_venta INT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_detalle RECORD;
    v_estado VARCHAR;
BEGIN
    SELECT estado INTO v_estado FROM factura WHERE id_venta = p_id_venta FOR UPDATE;

    IF v_estado = 'Anulada' THEN
        RAISE EXCEPTION 'La venta ya se encuentra anulada.';
    END IF;

    UPDATE factura SET estado = 'Anulada' WHERE id_venta = p_id_venta;

    FOR v_detalle IN SELECT id_producto, cantidad_vendida FROM presente_en WHERE id_venta = p_id_venta
    LOOP
        UPDATE producto
        SET stock = stock + v_detalle.cantidad_vendida
        WHERE id_producto = v_detalle.id_producto;
    END LOOP;
END;
$$;

-- 5. sp_actualizar_precios_categoria
-- Procedimiento extra para cumplir los 5 SPs. Aplica un porcentaje de cambio.
CREATE OR REPLACE PROCEDURE sp_actualizar_precios_categoria(
    p_id_categoria INT,
    p_porcentaje_cambio NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE producto
    SET precio_prod = precio_prod * (1 + (p_porcentaje_cambio / 100))
    WHERE id_categoria = p_id_categoria;
END;
$$;

-- 6. fn_reporte_ventas_periodo
-- Función (para retornar tabla fácilmente a Prisma) de ventas en un periodo.
CREATE OR REPLACE FUNCTION fn_reporte_ventas_periodo(
    p_fecha_inicio TIMESTAMP,
    p_fecha_fin TIMESTAMP
)
RETURNS TABLE (
    fecha TIMESTAMP,
    cliente VARCHAR,
    cajero VARCHAR,
    total NUMERIC,
    estado VARCHAR
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        v.fecha_hora_venta AS fecha,
        (ac.nombre_actor || ' ' || ac.apellido_actor)::VARCHAR AS cliente,
        (acc.nombre_actor || ' ' || acc.apellido_actor)::VARCHAR AS cajero,
        COALESCE(SUM(pe.cantidad_vendida * pe.precio_unitario_venta), 0) AS total,
        f.estado::VARCHAR
    FROM venta v
    JOIN actor_comercial ac ON v.id_act_cliente = ac.id_actor
    JOIN actor_comercial acc ON v.id_act_cajero = acc.id_actor
    JOIN factura f ON v.id_venta = f.id_venta
    LEFT JOIN presente_en pe ON v.id_venta = pe.id_venta
    WHERE v.fecha_hora_venta BETWEEN p_fecha_inicio AND p_fecha_fin
    GROUP BY v.id_venta, ac.nombre_actor, ac.apellido_actor, acc.nombre_actor, acc.apellido_actor, f.estado
    ORDER BY v.fecha_hora_venta DESC;
END;
$$;

GRANT EXECUTE ON PROCEDURE sp_registrar_venta(INT, INT, JSON, INOUT INT) TO rol_gerente, rol_cajero;
GRANT EXECUTE ON PROCEDURE sp_actualizar_stock(INT, INT, INOUT INT) TO rol_gerente, rol_almacenista;
GRANT EXECUTE ON PROCEDURE sp_crear_proveedor_con_productos(JSON, JSON, INOUT INT) TO rol_gerente;
GRANT EXECUTE ON PROCEDURE sp_anular_venta(INT) TO rol_gerente;
GRANT EXECUTE ON PROCEDURE sp_actualizar_precios_categoria(INT, NUMERIC) TO rol_gerente;
GRANT EXECUTE ON FUNCTION fn_reporte_ventas_periodo(TIMESTAMP, TIMESTAMP) TO rol_gerente, rol_cajero;
