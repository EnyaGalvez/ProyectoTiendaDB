/* Base de Datos: Tienda
 * Enya Gálvez - 24693
 * PostgreSQL
 */

/* Tabla ACTOR_COMERCIAL: Generalización que concentra los datos de contacto de todos los actores
 * comerciales. Su llave primaria (id_actor) es heredada por todas las
 * especializaciones como llave primaria y foránea simultáneamente.
 */
CREATE TABLE ACTOR_COMERCIAL (
    id_actor        SERIAL,
    nombre_actor    VARCHAR(100)    NOT NULL,
    apellido_actor  VARCHAR(100)    NOT NULL,
    correo_actor    VARCHAR(150),
    tel_actor       VARCHAR(20),
    dir_actor       VARCHAR(255),
    CONSTRAINT ACTOR_COMERCIAL PRIMARY KEY (id_actor)
);

/* Tabla PROVEEDOR: Especialización de ACTOR_COMERCIAL.
 * - Contiene los atributos propios del rol proveedor.
 * - El precio por producto específico vive en la tabla PROVEE.
 */
CREATE TABLE PROVEEDOR (
    id_actor INT NOT NULL,
    razon_social VARCHAR(200) NOT NULL,
    nif_proveedor VARCHAR(30) NOT NULL,
    moneda_pago VARCHAR(10) NOT NULL,
    certificacion VARCHAR(100),
    CONSTRAINT PROVEEDOR PRIMARY KEY (id_actor),
    CONSTRAINT PROV_ACTOR FOREIGN KEY (id_actor) REFERENCES ACTOR_COMERCIAL (id_actor)
);

/* Tabla CLIENTE: Especialización de ACTOR_COMERCIAL.
 * - Almacena el número de cliente y el NIT de facturación.
 * - El resto de datos personales se obtiene desde ACTOR_COMERCIAL.
 */
CREATE TABLE CLIENTE (
    id_actor INT NOT NULL,
    num_cliente VARCHAR(30) NOT NULL,
    nit_cliente VARCHAR(20) NOT NULL,
    CONSTRAINT CLIENTE PRIMARY KEY (id_actor),
    CONSTRAINT CLI_ACTOR FOREIGN KEY (id_actor) REFERENCES ACTOR_COMERCIAL (id_actor)
);

/* Tabla EMPLEADO: Especialización de ACTOR_COMERCIAL.
 * - Agrupa los atributos laborales comunes a cajeros, almacenistas y gerentes.
 */
CREATE TABLE EMPLEADO (
    id_actor INT NOT NULL,
    num_empleado VARCHAR(30) NOT NULL,
    puesto_empleado VARCHAR(100) NOT NULL,
    salario_empleado NUMERIC(10, 2) NOT NULL,
    nit_empleado VARCHAR(20) NOT NULL,
    horario_empleado VARCHAR(100),
    CONSTRAINT EMPLEADO PRIMARY KEY (id_actor),
    CONSTRAINT EMP_ACTOR FOREIGN KEY (id_actor) REFERENCES ACTOR_COMERCIAL (id_actor)
);

/* Tabla GERENTE: Especialización de EMPLEADO.
 * No agrega atributos propios; su distinción es semántica
 */
CREATE TABLE GERENTE (
    id_actor INT NOT NULL,
    CONSTRAINT GERENTE PRIMARY KEY (id_actor),
    CONSTRAINT GER_EMP FOREIGN KEY (id_actor) REFERENCES EMPLEADO (id_actor)
);

/* Tabla CAJERO: Especialización de EMPLEADO.
 * Registra al gerente que supervisa a este cajero.
 * La FK id_act_gerente resuelve la dependencia transitiva
 * id_venta → id_act_cajero → id_act_gerente que existía en FN0.
 */
CREATE TABLE CAJERO (
    id_actor INT NOT NULL,
    id_act_gerente  INT NOT NULL,
    CONSTRAINT CAJERO PRIMARY KEY (id_actor),
    CONSTRAINT CAJ_EMP FOREIGN KEY (id_actor) REFERENCES EMPLEADO (id_actor),
    CONSTRAINT CAJ_GER FOREIGN KEY (id_act_gerente) REFERENCES GERENTE (id_actor)
);

/* Tabla ALMACENISTA: especialización de EMPLEADO.
 * Registra al gerente responsable de este almacenista.
 */
CREATE TABLE ALMACENISTA (
    id_actor INT NOT NULL,
    id_act_gerente INT NOT NULL,
    CONSTRAINT ALMACENISTA PRIMARY KEY (id_actor),
    CONSTRAINT ALM_EMP FOREIGN KEY (id_actor) REFERENCES EMPLEADO (id_actor),
    CONSTRAINT ALM_GER FOREIGN KEY (id_act_gerente) REFERENCES GERENTE (id_actor)
);

/*
 * Tabla CATEGORIA: almacena las categorías de productos.
 */
CREATE TABLE CATEGORIA (
    id_categoria SERIAL,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255),
    CONSTRAINT CATEGORIA PRIMARY KEY (id_categoria)
);

/* Tabla PRODUCTO: almacena los productos disponibles en la tienda, con sus datos 
 * básicos y sus relaciones con categoría y almacenista responsable.
 */
CREATE TABLE PRODUCTO (
    id_producto SERIAL,
    nombre_prod VARCHAR(150) NOT NULL,
    descripcion_prod VARCHAR(255),
    precio_prod NUMERIC(10, 2) NOT NULL,
    precio_compra_base NUMERIC(10, 2) NOT NULL,
    stock INT NOT NULL,
    ubicacion_bodega VARCHAR(100),
    id_categoria INT NOT NULL,
    id_act_almacenista INT NOT NULL,
    CONSTRAINT PRODUCTO PRIMARY KEY (id_producto),
    CONSTRAINT PROD_CAT FOREIGN KEY (id_categoria) REFERENCES CATEGORIA (id_categoria),
    CONSTRAINT PROD_ALM FOREIGN KEY (id_act_almacenista) REFERENCES ALMACENISTA (id_actor)
);

/* Tabla VENTA: encabezado de la transacción comercial.
 */
CREATE TABLE VENTA (
    id_venta SERIAL,
    fecha_hora_venta TIMESTAMP NOT NULL,
    id_act_cliente INT NOT NULL,
    id_act_cajero INT NOT NULL,
    CONSTRAINT VENTA PRIMARY KEY (id_venta),
    CONSTRAINT VENTA_CLI FOREIGN KEY (id_act_cliente) REFERENCES CLIENTE (id_actor),
    CONSTRAINT VENTA_CAJ FOREIGN KEY (id_act_cajero) REFERENCES CAJERO (id_actor)
);

/* Tabla FACTURA: almacena el estado de la factura asociada a cada venta.
 */
CREATE TABLE FACTURA (
    id_factura SERIAL,
    estado VARCHAR(50) NOT NULL,
    id_venta INT NOT NULL,
    CONSTRAINT FACTURA PRIMARY KEY (id_factura),
    CONSTRAINT FACTURA_VENTA FOREIGN KEY (id_venta) REFERENCES VENTA (id_venta)
);

/*
 * Tabla PRESENTE_EN: resuelve la relación N:M entre VENTA y PRODUCTO.
 */
CREATE TABLE PRESENTE_EN (
    id_venta INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad_vendida INT NOT NULL,
    precio_unitario_venta NUMERIC(10, 2) NOT NULL,
    CONSTRAINT PRESENTE_EN PRIMARY KEY (id_venta, id_producto),
    CONSTRAINT PRESENTE_EN_VENTA FOREIGN KEY (id_venta) REFERENCES VENTA (id_venta),
    CONSTRAINT PRESENTE_EN_PROD FOREIGN KEY (id_producto) REFERENCES PRODUCTO (id_producto)
);

/*
 * Tabla PROVEE: resuelve la relación N:M entre PROVEEDOR y PRODUCTO.
 */
CREATE TABLE PROVEE (
    id_act_proveedor INT NOT NULL,
    id_producto INT NOT NULL,
    precio_compra_proveedor NUMERIC(10, 2) NOT NULL,
    moneda_cambio_proveedor VARCHAR(10) NOT NULL,
    CONSTRAINT PROVEE PRIMARY KEY (id_act_proveedor, id_producto),
    CONSTRAINT PROVEE_PROV FOREIGN KEY (id_act_proveedor) REFERENCES PROVEEDOR (id_actor),
    CONSTRAINT PROVEE_PROD FOREIGN KEY (id_producto) REFERENCES PRODUCTO (id_producto)
);