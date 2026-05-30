# Proyecto 3 Bases de Datos - TiendaDB
Enya Gálvez - 24693

Este proyecto consiste en un sistema de gestión de tienda con un frontend en React (Vite) y un backend en Node.js (Express) conectado a una base de datos PostgreSQL.

## Requisitos
- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Instrucciones para levantar el proyecto desde 0

1. **Clonar el repositorio** (si no lo has hecho):
   ```bash
   git clone <url-del-repo>
   cd proyecto2
   ```

2. **Configurar variables de entorno**:
   Copia el archivo de ejemplo y asegúrate de que los valores sean correctos:
   ```bash
   cp .env.example .env
   ```

3. **Levantar los contenedores**:
   Ejecuta el siguiente comando en la raíz del proyecto:
   ```bash
   docker compose up
   ```

4. **Acceder a la aplicación**:
   - **Frontend**: [http://localhost:5174](http://localhost:5174) (o el puerto que hayas configurado en `FRONTEND_PORT` dentro de tu `.env`).
   - **Backend Health**: [http://localhost:3002/api/health](http://localhost:3002/api/health) (o usando el puerto configurado en `PORT`).

## Estructura del Proyecto
- `/frontend`: Aplicación React con Vite y Dashboard administrativo.
- `/backend`: API REST en Express con servicios para la gestión de la tienda.
- `/backend/db`: Scripts SQL para la creación del esquema e inserción de datos iniciales.

## Cómo Modificar los Puertos (Importante)
Si tienes conflictos de puertos con otros proyectos o contenedores y necesitas cambiarlos, **solo debes modificar el archivo `.env`**. No modifiques los Dockerfiles ni el archivo `docker-compose.yml`.

- **Para cambiar el puerto del frontend**: Modifica la variable `FRONTEND_PORT` en tu `.env` (por ejemplo: `FRONTEND_PORT=8080`). El contenedor internamente siempre usa el puerto 80 gracias a Nginx.
- **Para cambiar el puerto del backend**: Modifica la variable `PORT` en tu `.env`. **¡Atención!** Si cambias el `PORT` del backend, también debes actualizar la variable `VITE_API_URL` en tu `.env` para que el frontend sepa dónde conectarse. Por ejemplo, si usas `PORT=4000`, debes poner `VITE_API_URL=http://localhost:4000/api`.

## Sistema de Usuarios y Roles (RBAC)
El proyecto incluye un sistema de seguridad de mínimo privilegio basado en autenticación JWT desde el backend y protegido a nivel de roles en PostgreSQL.

### Usuarios creados
Para iniciar sesión en el frontend, puedes utilizar cualquiera de los siguientes usuarios. Todos tienen la contraseña `secret`:

| Usuario         | Rol           | Acceso y Privilegios |
|-----------------|---------------|----------------------|
| `gerente1`      | Gerente       | Acceso total al sistema, reportes y dashboards gerenciales (superuser). |
| `cajero1`       | Cajero        | Puede procesar ventas, gestionar clientes y ver catálogo. |
| `almacenista1`  | Almacenista   | Puede gestionar inventarios, productos, categorías y ver proveedores. |
| `proveedor1`    | Proveedor     | Visibilidad únicamente de sus productos provistos. |
| `cliente1`      | Cliente       | Visibilidad del catálogo general de productos de la tienda. |

## Arquitectura

### 1. Stored Procedures / Consultas Complejas
Previo a la migración total a Prisma, la lógica fuerte de la base de datos se encapsuló en Stored Procedures y scripts SQL crudos. Estas operaciones ahora han sido traducidas a métodos equivalentes en Prisma:
- **`procesar_venta` (ahora `procesarTransaccionVenta`)**: Valida disponibilidad de inventario, registra la compra, inserta los detalles y emite la factura actualizando el stock.
- **`catalogo_detallado`**: Extrae la información de los productos, incluyendo datos tabulares vinculados a su proveedor y almacenista encargado.
- **`mejores_clientes`**: Agrupa y suma el total de ventas por cliente, ordenándolos para reportes gerenciales.
- **`directorio_empleados`**: Recopila y cruza datos para mostrar empleados según su cargo específico (Cajero, Almacenista o Gerente).

### 2. Transacciones (ACID)
El sistema hace un uso intensivo de transacciones atómicas para proteger la integridad de los datos, orquestadas mediante las *Interactive Transactions* de Prisma (`$transaction`):
- **Transacción de Venta (`procesarTransaccionVenta`)**: Garantiza que si falla la inserción de un producto en el detalle (`presente_en`) o la creación de la `factura`, se realice un *rollback* completo y no se descuente el inventario de manera errónea.
- **Transacciones de Seguridad por Rol (`runWithRole`)**: Cada llamada al servicio envuelve la ejecución en una transacción donde el primer paso es establecer la identidad de PostgreSQL (`SET LOCAL ROLE <rol>`), asegurando que las operaciones siguientes hereden únicamente los permisos de ese rol.

### Integración con Prisma ORM
Prisma ahora es el encargado de:
- Ejecutar consultas relacionales tipadas (`findMany`, `include`).
- Orquestar transacciones seguras en memoria (`$transaction`).
- Aplicar de forma dinámica las políticas de seguridad de PostgreSQL inyectando el rol del usuario conectado mediante `SET LOCAL ROLE`, asegurando el Principio de Mínimo Privilegio.

Enlace al repositorio: [https://github.com/EnyaGalvez/ProyectoTiendaDB.git](https://github.com/EnyaGalvez/ProyectoTiendaDB.git)
