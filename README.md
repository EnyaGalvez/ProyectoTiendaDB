# Proyecto 2 Bases de Datos - TiendaDB
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

Enlace al repositorio: [https://github.com/EnyaGalvez/ProyectoTiendaDB.git](https://github.com/EnyaGalvez/ProyectoTiendaDB.git)
