export interface Empleado {
  id_actor: number;
  nombre_actor: string;
  apellido_actor: string;
  puesto_empleado: string;
  rol_especifico: string;
  nombre_supervisor: string | null;
}

export interface Producto {
  id_producto: number;
  nombre_prod: string;
  descripcion_prod: string;
  precio_prod: number;
  precio_compra_base: number;
  stock: number;
  ubicacion_bodega: string;
  id_categoria: number;
  id_act_almacenista: number;
  categoria?: string;
  proveedor_principal?: string;
  gestionado_por?: string;
}

export interface Cliente {
  id_actor: number;
  nombre_actor: string;
  apellido_actor: string;
  nit_cliente: string;
  total_compras: number;
  total_gastado: string;
}

export interface Categoria {
  id_categoria: number;
  nombre: string;
  descripcion: string;
}

export interface ApiResponse<T> {
  data: T;
  sql: string;
}
