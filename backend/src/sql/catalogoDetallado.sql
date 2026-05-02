SELECT 
    p.nombre_prod, 
    cat.nombre AS categoria, 
    p.stock,
    p.precio_prod,
    prov.razon_social AS proveedor_principal,
    alm_actor.nombre_actor || ' ' || alm_actor.apellido_actor AS gestionado_por
FROM PRODUCTO p
INNER JOIN CATEGORIA cat ON p.id_categoria = cat.id_categoria
INNER JOIN ALMACENISTA alm ON p.id_act_almacenista = alm.id_actor
INNER JOIN ACTOR_COMERCIAL alm_actor ON alm.id_actor = alm_actor.id_actor
INNER JOIN PROVEE pr ON p.id_producto = pr.id_producto
INNER JOIN PROVEEDOR prov ON pr.id_act_proveedor = prov.id_actor
ORDER BY cat.nombre, p.nombre_prod;