SELECT 
    a.id_actor,
    a.nombre_actor, 
    a.apellido_actor, 
    c.nit_cliente,
    COUNT(DISTINCT v.id_venta) AS total_compras,
    SUM(pe.cantidad_vendida * pe.precio_unitario_venta) AS total_gastado
FROM ACTOR_COMERCIAL a
INNER JOIN CLIENTE c ON a.id_actor = c.id_actor
INNER JOIN VENTA v ON c.id_actor = v.id_act_cliente
INNER JOIN PRESENTE_EN pe ON v.id_venta = pe.id_venta
GROUP BY a.id_actor, a.nombre_actor, a.apellido_actor, c.nit_cliente
HAVING SUM(pe.cantidad_vendida * pe.precio_unitario_venta) > $1
ORDER BY total_gastado DESC;