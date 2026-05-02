SELECT 
    id_actor, 
    nombre_actor, 
    apellido_actor, 
    puesto_empleado, 
    rol_especifico, 
    nombre_supervisor 
FROM vista_directorio_empleados 
ORDER BY rol_especifico, nombre_actor;