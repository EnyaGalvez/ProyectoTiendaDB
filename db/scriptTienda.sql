/* SCRIPT DE DATOS DE PRUEBA - TIENDA
 * Enya Gálvez - 24693
 * PostgreSQL
*/

-- 1. ACTOR_COMERCIAL (125 registros: 1-25 Gerentes, 26-50 Cajeros, 51-75 Almacenistas, 76-100 Clientes, 101-125 Proveedores)
INSERT INTO ACTOR_COMERCIAL (id_actor, nombre_actor, apellido_actor, correo_actor, tel_actor, dir_actor) VALUES

-- Gerentes (1-25)
(1, 'Carlos', 'Méndez', 'cmendez@tienda.gt', '4123-0001', 'Zona 10, Ciudad'), (2, 'Ana', 'Juárez', 'ajuarez@tienda.gt', '4123-0002', 'Zona 14, Ciudad'),
(3, 'Luis', 'Herrera', 'lherrera@tienda.gt', '4123-0003', 'Zona 15, Ciudad'), (4, 'María', 'López', 'mlopez@tienda.gt', '4123-0004', 'Zona 9, Ciudad'),
(5, 'Jorge', 'García', 'jgarcia@tienda.gt', '4123-0005', 'Zona 16, Ciudad'), (6, 'Lucía', 'Pérez', 'lperez@tienda.gt', '4123-0006', 'Zona 13, Ciudad'),
(7, 'Miguel', 'Ramírez', 'mramirez@tienda.gt', '4123-0007', 'Zona 10, Ciudad'), (8, 'Sofía', 'Fernández', 'sfernandez@tienda.gt', '4123-0008', 'Zona 14, Ciudad'),
(9, 'Diego', 'Castillo', 'dcastillo@tienda.gt', '4123-0009', 'Zona 15, Ciudad'), (10, 'Elena', 'Morales', 'emorales@tienda.gt', '4123-0010', 'Zona 11, Ciudad'),
(11, 'Andrés', 'Reyes', 'areyes@tienda.gt', '4123-0011', 'Zona 1, Ciudad'), (12, 'Carmen', 'Ortiz', 'cortiz@tienda.gt', '4123-0012', 'Zona 2, Ciudad'),
(13, 'Daniel', 'Gómez', 'dgomez@tienda.gt', '4123-0013', 'Zona 3, Ciudad'), (14, 'Laura', 'Díaz', 'ldiaz@tienda.gt', '4123-0014', 'Zona 4, Ciudad'),
(15, 'Hugo', 'Vásquez', 'hvasquez@tienda.gt', '4123-0015', 'Zona 5, Ciudad'), (16, 'Patricia', 'Cruz', 'pcruz@tienda.gt', '4123-0016', 'Zona 6, Ciudad'),
(17, 'Ricardo', 'Ruiz', 'rruiz@tienda.gt', '4123-0017', 'Zona 7, Ciudad'), (18, 'Isabel', 'Flores', 'iflores@tienda.gt', '4123-0018', 'Zona 8, Ciudad'),
(19, 'Javier', 'Alvarado', 'jalvarado@tienda.gt', '4123-0019', 'Zona 12, Ciudad'), (20, 'Rosa', 'Molina', 'rmolina@tienda.gt', '4123-0020', 'Zona 17, Ciudad'),
(21, 'Mario', 'Rojas', 'mrojas@tienda.gt', '4123-0021', 'Zona 18, Ciudad'), (22, 'Teresa', 'Aguilar', 'taguilar@tienda.gt', '4123-0022', 'Zona 21, Ciudad'),
(23, 'Héctor', 'Salazar', 'hsalazar@tienda.gt', '4123-0023', 'Mixco'), (24, 'Silvia', 'Guzmán', 'sguzman@tienda.gt', '4123-0024', 'Villa Nueva'),
(25, 'Oscar', 'Escobar', 'oescobar@tienda.gt', '4123-0025', 'San Miguel Petapa'),

-- Cajeros (26-50)
(26, 'Brenda', 'Osoy', 'bosoy@tienda.gt', '5523-0001', 'Zona 1, Ciudad'), (27, 'Kevin', 'Tum', 'ktum@tienda.gt', '5523-0002', 'Zona 2, Ciudad'),
(28, 'Sara', 'Choc', 'schoc@tienda.gt', '5523-0003', 'Zona 3, Ciudad'), (29, 'Edgar', 'Pop', 'epop@tienda.gt', '5523-0004', 'Zona 4, Ciudad'),
(30, 'Cinthia', 'Ixcoy', 'cixcoy@tienda.gt', '5523-0005', 'Zona 5, Ciudad'), (31, 'Julio', 'Cotzajay', 'jcotzajay@tienda.gt', '5523-0006', 'Zona 6, Ciudad'),
(32, 'Marta', 'Patzán', 'mpatzan@tienda.gt', '5523-0007', 'Zona 7, Ciudad'), (33, 'Edwin', 'Canel', 'ecanel@tienda.gt', '5523-0008', 'Zona 8, Ciudad'),
(34, 'Karen', 'Cutzal', 'kcutzal@tienda.gt', '5523-0009', 'Zona 9, Ciudad'), (35, 'Pablo', 'Tuyuc', 'ptuyuc@tienda.gt', '5523-0010', 'Zona 10, Ciudad'),
(36, 'Lilian', 'Pirir', 'lpirir@tienda.gt', '5523-0011', 'Zona 11, Ciudad'), (37, 'Víctor', 'Sipac', 'vsipac@tienda.gt', '5523-0012', 'Zona 12, Ciudad'),
(38, 'Rocío', 'Xon', 'rxon@tienda.gt', '5523-0013', 'Zona 13, Ciudad'), (39, 'David', 'Boj', 'dboj@tienda.gt', '5523-0014', 'Zona 14, Ciudad'),
(40, 'Gladys', 'Toj', 'gtoj@tienda.gt', '5523-0015', 'Zona 15, Ciudad'), (41, 'Sergio', 'Caal', 'scaal@tienda.gt', '5523-0016', 'Zona 16, Ciudad'),
(42, 'Dora', 'Cojulun', 'dcojulun@tienda.gt', '5523-0017', 'Zona 17, Ciudad'), (43, 'Josué', 'Mucú', 'jmucu@tienda.gt', '5523-0018', 'Zona 18, Ciudad'),
(44, 'Vivian', 'Pac', 'vpac@tienda.gt', '5523-0019', 'Zona 21, Ciudad'), (45, 'Erick', 'Tun', 'etun@tienda.gt', '5523-0020', 'Mixco'),
(46, 'Alba', 'Chajón', 'achajon@tienda.gt', '5523-0021', 'Villa Nueva'), (47, 'Nelson', 'Yoc', 'nyoc@tienda.gt', '5523-0022', 'San Miguel Petapa'),
(48, 'Vilma', 'Tiu', 'vtiu@tienda.gt', '5523-0023', 'Amatitlán'), (49, 'César', 'Puz', 'cpuz@tienda.gt', '5523-0024', 'Santa Catarina Pinula'),
(50, 'Miriam', 'Quej', 'mquej@tienda.gt', '5523-0025', 'Fraijanes'),

-- Almacenistas (51-75)
(51, 'Tomás', 'López', 'tlopez@tienda.gt', '3214-0001', 'Zona 1, Ciudad'), (52, 'Pedro', 'García', 'pgarcia@tienda.gt', '3214-0002', 'Zona 5, Ciudad'),
(53, 'René', 'Martínez', 'rmartinez@tienda.gt', '3214-0003', 'Zona 7, Ciudad'), (54, 'Juan', 'Rodríguez', 'jrodriguez@tienda.gt', '3214-0004', 'Zona 18, Ciudad'),
(55, 'Esteban', 'Pérez', 'eperez@tienda.gt', '3214-0005', 'Mixco'), (56, 'Saúl', 'Gómez', 'sgomez@tienda.gt', '3214-0006', 'Villa Nueva'),
(57, 'Marcos', 'Fernández', 'mfernandez@tienda.gt', '3214-0007', 'San Lucas'), (58, 'Felipe', 'Morales', 'fmorales@tienda.gt', '3214-0008', 'Zona 11, Ciudad'),
(59, 'Rigoberto', 'Cruz', 'rcruz@tienda.gt', '3214-0009', 'Zona 12, Ciudad'), (60, 'Efraín', 'Reyes', 'ereyes@tienda.gt', '3214-0010', 'Zona 21, Ciudad'),
(61, 'Adolfo', 'Gutiérrez', 'agutierrez@tienda.gt', '3214-0011', 'Villa Canales'), (62, 'Ramiro', 'Aguilar', 'raguilar@tienda.gt', '3214-0012', 'Amatitlán'),
(63, 'Armando', 'Mendoza', 'amendoza@tienda.gt', '3214-0013', 'Zona 6, Ciudad'), (64, 'Raúl', 'Castillo', 'rcastillo@tienda.gt', '3214-0014', 'Zona 2, Ciudad'),
(65, 'Gustavo', 'Ruiz', 'gruiz@tienda.gt', '3214-0015', 'Zona 3, Ciudad'), (66, 'Ángel', 'Salazar', 'asalazar@tienda.gt', '3214-0016', 'Zona 4, Ciudad'),
(67, 'Roberto', 'Herrera', 'rherrera@tienda.gt', '3214-0017', 'Zona 8, Ciudad'), (68, 'Leonel', 'Soto', 'lsoto@tienda.gt', '3214-0018', 'Zona 9, Ciudad'),
(69, 'Byron', 'Estrada', 'bestrada@tienda.gt', '3214-0019', 'Zona 13, Ciudad'), (70, 'Julio', 'Vargas', 'jvargas@tienda.gt', '3214-0020', 'Zona 14, Ciudad'),
(71, 'Otto', 'Castro', 'ocastro@tienda.gt', '3214-0021', 'Zona 15, Ciudad'), (72, 'Humberto', 'Molina', 'hmolina@tienda.gt', '3214-0022', 'Zona 16, Ciudad'),
(73, 'Boris', 'Ortega', 'bortega@tienda.gt', '3214-0023', 'Zona 17, Ciudad'), (74, 'Fernando', 'Delgado', 'fdelgado@tienda.gt', '3214-0024', 'Zona 10, Ciudad'),
(75, 'Gerardo', 'Ramos', 'gramos@tienda.gt', '3214-0025', 'Santa Catarina Pinula'),

-- Clientes (76-100)
(76, 'Luisa', 'Méndez', 'lmendez@mail.com', '4444-1001', 'Zona 1, Ciudad'), (77, 'Andrea', 'Samayoa', 'asamayoa@mail.com', '4444-1002', 'Zona 2, Ciudad'),
(78, 'Valeria', 'Orellana', 'vorellana@mail.com', '4444-1003', 'Zona 3, Ciudad'), (79, 'Paola', 'Lemus', 'plemus@mail.com', '4444-1004', 'Zona 4, Ciudad'),
(80, 'Diana', 'Zúñiga', 'dzuniga@mail.com', '4444-1005', 'Zona 5, Ciudad'), (81, 'Mónica', 'Palacios', 'mpalacios@mail.com', '4444-1006', 'Zona 6, Ciudad'),
(82, 'Karla', 'Pineda', 'kpineda@mail.com', '4444-1007', 'Zona 7, Ciudad'), (83, 'Alejandra', 'Chávez', 'achavez@mail.com', '4444-1008', 'Zona 8, Ciudad'),
(84, 'Natalia', 'Cordero', 'ncordero@mail.com', '4444-1009', 'Zona 9, Ciudad'), (85, 'Fabiola', 'Navarro', 'fnavarro@mail.com', '4444-1010', 'Zona 10, Ciudad'),
(86, 'Camila', 'Mejía', 'cmejia@mail.com', '4444-1011', 'Zona 11, Ciudad'), (87, 'Daniela', 'Sánchez', 'dsanchez@mail.com', '4444-1012', 'Zona 12, Ciudad'),
(88, 'Gabriela', 'Ramírez', 'gramirez@mail.com', '4444-1013', 'Zona 13, Ciudad'), (89, 'Verónica', 'Duarte', 'vduarte@mail.com', '4444-1014', 'Zona 14, Ciudad'),
(90, 'Lorena', 'Escobar', 'lescobar@mail.com', '4444-1015', 'Zona 15, Ciudad'), (91, 'Alicia', 'Valdez', 'avaldez@mail.com', '4444-1016', 'Zona 16, Ciudad'),
(92, 'Susana', 'Montes', 'smontes@mail.com', '4444-1017', 'Zona 17, Ciudad'), (93, 'Beatriz', 'Guerra', 'bguerra@mail.com', '4444-1018', 'Zona 18, Ciudad'),
(94, 'Raquel', 'Paz', 'rpaz@mail.com', '4444-1019', 'Zona 21, Ciudad'), (95, 'Gloria', 'Franco', 'gfranco@mail.com', '4444-1020', 'Mixco'),
(96, 'Rebeca', 'Salinas', 'rsalinas@mail.com', '4444-1021', 'Villa Nueva'), (97, 'Jimena', 'Ríos', 'jrios@mail.com', '4444-1022', 'San Miguel Petapa'),
(98, 'Ximena', 'León', 'xleon@mail.com', '4444-1023', 'Amatitlán'), (99, 'Sofía', 'Arriaga', 'sarriaga@mail.com', '4444-1024', 'Santa Catarina Pinula'),
(100, 'Tania', 'Figueroa', 'tfigueroa@mail.com', '4444-1025', 'Fraijanes'),

-- Proveedores (101-125)
(101, 'Distribuidora', 'Génesis', 'contacto@genesis.gt', '2222-1001', 'Zona 12, Ciudad'), (102, 'Importadora', 'Oriente', 'ventas@oriente.gt', '2222-1002', 'Zona 4, Ciudad'),
(103, 'Lácteos', 'La Pradera', 'info@lapradera.gt', '2222-1003', 'Carretera a El Salvador'), (104, 'Carnes', 'San Juan', 'pedidos@sanjuan.gt', '2222-1004', 'Zona 7, Ciudad'),
(105, 'Bebidas', 'El Manantial', 'ventas@elmanantial.gt', '2222-1005', 'Zona 11, Ciudad'), (106, 'Abarrotes', 'Del Centro', 'admin@delcentro.gt', '2222-1006', 'Zona 1, Ciudad'),
(107, 'Granos', 'Básicos GT', 'info@granosgt.gt', '2222-1007', 'Terminal, Zona 4'), (108, 'Panificadora', 'El Sol', 'ventas@elsol.gt', '2222-1008', 'Zona 5, Ciudad'),
(109, 'Higiene', 'Total', 'contacto@higienetotal.gt', '2222-1009', 'Zona 9, Ciudad'), (110, 'Limpieza', 'Brillante', 'ventas@brillante.gt', '2222-1010', 'Zona 10, Ciudad'),
(111, 'Cosméticos', 'Bella', 'info@bella.gt', '2222-1011', 'Zona 14, Ciudad'), (112, 'Papelera', 'Nacional', 'pedidos@papelera.gt', '2222-1012', 'Mixco'),
(113, 'Embutidos', 'Premium', 'ventas@embutidospremium.gt', '2222-1013', 'Villa Nueva'), (114, 'Salsas', 'y Aderezos', 'info@salsas.gt', '2222-1014', 'Zona 2, Ciudad'),
(115, 'Snacks', 'Crujientes', 'ventas@snacks.gt', '2222-1015', 'Zona 3, Ciudad'), (116, 'Dulces', 'Alegría', 'pedidos@alegria.gt', '2222-1016', 'Zona 6, Ciudad'),
(117, 'Galletas', 'Tostadas', 'info@tostadas.gt', '2222-1017', 'Zona 8, Ciudad'), (118, 'Cereales', 'Mañaneros', 'ventas@cereales.gt', '2222-1018', 'Zona 13, Ciudad'),
(119, 'Jugos', 'Naturales', 'contacto@jugos.gt', '2222-1019', 'Zona 15, Ciudad'), (120, 'Café', 'De Altura', 'info@cafealtura.gt', '2222-1020', 'Antigua Guatemala'),
(121, 'Té', 'Herbal', 'ventas@teherbal.gt', '2222-1021', 'Zona 16, Ciudad'), (122, 'Especias', 'El Sabor', 'pedidos@elsabor.gt', '2222-1022', 'Zona 17, Ciudad'),
(123, 'Enlatados', 'Prácticos', 'info@enlatados.gt', '2222-1023', 'Zona 18, Ciudad'), (124, 'Mascotas', 'Felices', 'ventas@mascotas.gt', '2222-1024', 'Zona 21, Ciudad'),
(125, 'Hogar', 'y Vida', 'contacto@hogar.gt', '2222-1025', 'San Miguel Petapa');

-- Sincronizar secuencia de ACTOR_COMERCIAL debido a inserts explícitos
SELECT setval('actor_comercial_id_actor_seq', (SELECT MAX(id_actor) FROM ACTOR_COMERCIAL));

-- 2. EMPLEADO (75 registros: 1-75)
INSERT INTO EMPLEADO (id_actor, num_empleado, puesto_empleado, salario_empleado, nit_empleado, horario_empleado) VALUES
-- Gerentes
(1, 'EMP-G01', 'Gerente General', 15000.00, '1000001-1', '08:00 - 17:00'), (2, 'EMP-G02', 'Gerente Operaciones', 14500.00, '1000002-2', '08:00 - 17:00'),
(3, 'EMP-G03', 'Gerente Ventas', 14000.00, '1000003-3', '08:00 - 17:00'), (4, 'EMP-G04', 'Gerente Logística', 14000.00, '1000004-4', '08:00 - 17:00'),
(5, 'EMP-G05', 'Gerente Turno', 12000.00, '1000005-5', '06:00 - 14:00'), (6, 'EMP-G06', 'Gerente Turno', 12000.00, '1000006-6', '14:00 - 22:00'),
(7, 'EMP-G07', 'Gerente Zona A', 13000.00, '1000007-7', '08:00 - 17:00'), (8, 'EMP-G08', 'Gerente Zona B', 13000.00, '1000008-8', '08:00 - 17:00'),
(9, 'EMP-G09', 'Gerente Zona C', 13000.00, '1000009-9', '08:00 - 17:00'), (10, 'EMP-G10', 'Gerente Bodega', 12500.00, '1000010-0', '07:00 - 16:00'),
(11, 'EMP-G11', 'Gerente Administrativo', 13500.00, '1000011-1', '08:00 - 17:00'), (12, 'EMP-G12', 'Gerente Finanzas', 15000.00, '1000012-2', '08:00 - 17:00'),
(13, 'EMP-G13', 'Gerente RRHH', 13000.00, '1000013-3', '08:00 - 17:00'), (14, 'EMP-G14', 'Gerente Marketing', 12500.00, '1000014-4', '08:00 - 17:00'),
(15, 'EMP-G15', 'Gerente TI', 16000.00, '1000015-5', '08:00 - 17:00'), (16, 'EMP-G16', 'Subgerente General', 13000.00, '1000016-6', '08:00 - 17:00'),
(17, 'EMP-G17', 'Subgerente Ventas', 11500.00, '1000017-7', '08:00 - 17:00'), (18, 'EMP-G18', 'Subgerente Logística', 11500.00, '1000018-8', '08:00 - 17:00'),
(19, 'EMP-G19', 'Gerente Auditoría', 14000.00, '1000019-9', '08:00 - 17:00'), (20, 'EMP-G20', 'Gerente Calidad', 12000.00, '1000020-0', '08:00 - 17:00'),
(21, 'EMP-G21', 'Gerente Expansión', 14500.00, '1000021-1', '08:00 - 17:00'), (22, 'EMP-G22', 'Gerente Compras', 13500.00, '1000022-2', '08:00 - 17:00'),
(23, 'EMP-G23', 'Subgerente Compras', 11000.00, '1000023-3', '08:00 - 17:00'), (24, 'EMP-G24', 'Gerente Mantenimiento', 12000.00, '1000024-4', '08:00 - 17:00'),
(25, 'EMP-G25', 'Gerente Seguridad', 11500.00, '1000025-5', '08:00 - 17:00'),
-- Cajeros
(26, 'EMP-C01', 'Cajero Jefe', 4500.00, '2000001-1', '06:00 - 14:00'), (27, 'EMP-C02', 'Cajero Senior', 4000.00, '2000002-2', '06:00 - 14:00'),
(28, 'EMP-C03', 'Cajero Junior', 3500.00, '2000003-3', '06:00 - 14:00'), (29, 'EMP-C04', 'Cajero Junior', 3500.00, '2000004-4', '06:00 - 14:00'),
(30, 'EMP-C05', 'Cajero Especial', 3800.00, '2000005-5', '06:00 - 14:00'), (31, 'EMP-C06', 'Cajero Jefe', 4500.00, '2000006-6', '14:00 - 22:00'),
(32, 'EMP-C07', 'Cajero Senior', 4000.00, '2000007-7', '14:00 - 22:00'), (33, 'EMP-C08', 'Cajero Junior', 3500.00, '2000008-8', '14:00 - 22:00'),
(34, 'EMP-C09', 'Cajero Junior', 3500.00, '2000009-9', '14:00 - 22:00'), (35, 'EMP-C10', 'Cajero Especial', 3800.00, '2000010-0', '14:00 - 22:00'),
(36, 'EMP-C11', 'Cajero Fines', 2500.00, '2000011-1', 'Fines de Semana'), (37, 'EMP-C12', 'Cajero Fines', 2500.00, '2000012-2', 'Fines de Semana'),
(38, 'EMP-C13', 'Cajero Apoyo', 3500.00, '2000013-3', 'Rotativo'), (39, 'EMP-C14', 'Cajero Apoyo', 3500.00, '2000014-4', 'Rotativo'),
(40, 'EMP-C15', 'Cajero Senior', 4000.00, '2000015-5', 'Rotativo'), (41, 'EMP-C16', 'Cajero Junior', 3500.00, '2000016-6', '06:00 - 14:00'),
(42, 'EMP-C17', 'Cajero Junior', 3500.00, '2000017-7', '06:00 - 14:00'), (43, 'EMP-C18', 'Cajero Junior', 3500.00, '2000018-8', '06:00 - 14:00'),
(44, 'EMP-C19', 'Cajero Junior', 3500.00, '2000019-9', '14:00 - 22:00'), (45, 'EMP-C20', 'Cajero Junior', 3500.00, '2000020-0', '14:00 - 22:00'),
(46, 'EMP-C21', 'Cajero Junior', 3500.00, '2000021-1', '14:00 - 22:00'), (47, 'EMP-C22', 'Cajero Especial', 3800.00, '2000022-2', 'Rotativo'),
(48, 'EMP-C23', 'Cajero Especial', 3800.00, '2000023-3', 'Rotativo'), (49, 'EMP-C24', 'Cajero Jefe', 4500.00, '2000024-4', 'Rotativo'),
(50, 'EMP-C25', 'Cajero Fines', 2500.00, '2000025-5', 'Fines de Semana'),
-- Almacenistas
(51, 'EMP-A01', 'Almacenista Jefe', 5500.00, '3000001-1', '07:00 - 16:00'), (52, 'EMP-A02', 'Almacenista Senior', 4500.00, '3000002-2', '07:00 - 16:00'),
(53, 'EMP-A03', 'Almacenista Junior', 3800.00, '3000003-3', '07:00 - 16:00'), (54, 'EMP-A04', 'Almacenista Junior', 3800.00, '3000004-4', '07:00 - 16:00'),
(55, 'EMP-A05', 'Operario Bodega', 3600.00, '3000005-5', '07:00 - 16:00'), (56, 'EMP-A06', 'Almacenista Jefe', 5500.00, '3000006-6', '14:00 - 22:00'),
(57, 'EMP-A07', 'Almacenista Senior', 4500.00, '3000007-7', '14:00 - 22:00'), (58, 'EMP-A08', 'Almacenista Junior', 3800.00, '3000008-8', '14:00 - 22:00'),
(59, 'EMP-A09', 'Almacenista Junior', 3800.00, '3000009-9', '14:00 - 22:00'), (60, 'EMP-A10', 'Operario Bodega', 3600.00, '3000010-0', '14:00 - 22:00'),
(61, 'EMP-A11', 'Auxiliar Bodega', 3500.00, '3000011-1', 'Rotativo'), (62, 'EMP-A12', 'Auxiliar Bodega', 3500.00, '3000012-2', 'Rotativo'),
(63, 'EMP-A13', 'Auxiliar Bodega', 3500.00, '3000013-3', 'Rotativo'), (64, 'EMP-A14', 'Montacargas', 4200.00, '3000014-4', '07:00 - 16:00'),
(65, 'EMP-A15', 'Montacargas', 4200.00, '3000015-5', '14:00 - 22:00'), (66, 'EMP-A16', 'Recibidor', 4000.00, '3000016-6', '07:00 - 16:00'),
(67, 'EMP-A17', 'Recibidor', 4000.00, '3000017-7', '14:00 - 22:00'), (68, 'EMP-A18', 'Despachador', 4000.00, '3000018-8', '07:00 - 16:00'),
(69, 'EMP-A19', 'Despachador', 4000.00, '3000019-9', '14:00 - 22:00'), (70, 'EMP-A20', 'Inventarios', 4800.00, '3000020-0', '08:00 - 17:00'),
(71, 'EMP-A21', 'Inventarios', 4800.00, '3000021-1', '08:00 - 17:00'), (72, 'EMP-A22', 'Almacenista Frío', 4200.00, '3000022-2', '07:00 - 16:00'),
(73, 'EMP-A23', 'Almacenista Frío', 4200.00, '3000023-3', '14:00 - 22:00'), (74, 'EMP-A24', 'Almacenista Devoluciones', 3800.00, '3000024-4', '08:00 - 17:00'),
(75, 'EMP-A25', 'Auxiliar Carga', 3500.00, '3000025-5', 'Rotativo');

-- 3. GERENTE (25 registros: 1-25)
INSERT INTO GERENTE (id_actor) VALUES
(1), (2), (3), (4), (5), (6), (7), (8), (9), (10), (11), (12), (13), (14), (15), (16), (17), (18), (19), (20), (21), (22), (23), (24), (25);

-- 4. CAJERO (25 registros: 26-50. Asignados al gerente 3 [Ventas] y 5, 6 [Turnos])
INSERT INTO CAJERO (id_actor, id_act_gerente) VALUES
(26, 3), (27, 3), (28, 5), (29, 5), (30, 5), (31, 6), (32, 6), (33, 6), (34, 5), (35, 6),
(36, 5), (37, 6), (38, 3), (39, 3), (40, 5), (41, 5), (42, 5), (43, 6), (44, 6), (45, 6),
(46, 3), (47, 5), (48, 6), (49, 3), (50, 3);

-- 5. ALMACENISTA (25 registros: 51-75. Asignados al gerente 4 [Logística] y 10 [Bodega])
INSERT INTO ALMACENISTA (id_actor, id_act_gerente) VALUES
(51, 10), (52, 10), (53, 10), (54, 10), (55, 10), (56, 4), (57, 4), (58, 4), (59, 4), (60, 4),
(61, 10), (62, 10), (63, 10), (64, 10), (65, 4), (66, 4), (67, 4), (68, 10), (69, 4), (70, 4),
(71, 10), (72, 10), (73, 4), (74, 10), (75, 4);

-- 6. CLIENTE (25 registros: 76-100)
INSERT INTO CLIENTE (id_actor, num_cliente, nit_cliente) VALUES
(76, 'CLI-001', '5000001-1'), (77, 'CLI-002', '5000002-2'), (78, 'CLI-003', '5000003-3'), (79, 'CLI-004', '5000004-4'), (80, 'CLI-005', 'CF'),
(81, 'CLI-006', '5000006-6'), (82, 'CLI-007', '5000007-7'), (83, 'CLI-008', 'CF'), (84, 'CLI-009', '5000009-9'), (85, 'CLI-010', '5000010-0'),
(86, 'CLI-011', '5000011-1'), (87, 'CLI-012', '5000012-2'), (88, 'CLI-013', '5000013-3'), (89, 'CLI-014', '5000014-4'), (90, 'CLI-015', 'CF'),
(91, 'CLI-016', '5000016-6'), (92, 'CLI-017', '5000017-7'), (93, 'CLI-018', '5000018-8'), (94, 'CLI-019', '5000019-9'), (95, 'CLI-020', 'CF'),
(96, 'CLI-021', '5000021-1'), (97, 'CLI-022', '5000022-2'), (98, 'CLI-023', 'CF'), (99, 'CLI-024', '5000024-4'), (100, 'CLI-025', '5000025-5');

-- 7. PROVEEDOR (25 registros: 101-125)
INSERT INTO PROVEEDOR (id_actor, razon_social, nif_proveedor, moneda_pago, certificacion) VALUES
(101, 'Distribuidora Génesis S.A.', '6000001-1', 'GTQ', 'ISO 9001'), (102, 'Importadora Oriente S.A.', '6000002-2', 'USD', 'ISO 9001'),
(103, 'Lácteos La Pradera S.A.', '6000003-3', 'GTQ', 'HACCP'), (104, 'Carnes San Juan Ltda.', '6000004-4', 'GTQ', 'HACCP'),
(105, 'Bebidas El Manantial S.A.', '6000005-5', 'GTQ', 'ISO 22000'), (106, 'Abarrotes Del Centro', '6000006-6', 'GTQ', 'N/A'),
(107, 'Granos Básicos GT', '6000007-7', 'GTQ', 'BPM'), (108, 'Panificadora El Sol', '6000008-8', 'GTQ', 'N/A'),
(109, 'Higiene Total S.A.', '6000009-9', 'GTQ', 'ISO 14001'), (110, 'Limpieza Brillante', '6000010-0', 'GTQ', 'ISO 9001'),
(111, 'Cosméticos Bella', '6000011-1', 'USD', 'FDA Approved'), (112, 'Papelera Nacional', '6000012-2', 'GTQ', 'FSC'),
(113, 'Embutidos Premium S.A.', '6000013-3', 'GTQ', 'HACCP'), (114, 'Salsas y Aderezos Ltda.', '6000014-4', 'GTQ', 'BPM'),
(115, 'Snacks Crujientes', '6000015-5', 'GTQ', 'N/A'), (116, 'Dulces Alegría', '6000016-6', 'GTQ', 'N/A'),
(117, 'Galletas Tostadas S.A.', '6000017-7', 'GTQ', 'BPM'), (118, 'Cereales Mañaneros', '6000018-8', 'USD', 'ISO 22000'),
(119, 'Jugos Naturales GT', '6000019-9', 'GTQ', 'HACCP'), (120, 'Café De Altura Export', '6000020-0', 'USD', 'Fairtrade'),
(121, 'Té Herbal S.A.', '6000021-1', 'GTQ', 'Orgánico'), (122, 'Especias El Sabor', '6000022-2', 'GTQ', 'BPM'),
(123, 'Enlatados Prácticos', '6000023-3', 'USD', 'ISO 9001'), (124, 'Mascotas Felices', '6000024-4', 'GTQ', 'N/A'),
(125, 'Hogar y Vida S.A.', '6000025-5', 'GTQ', 'N/A');

-- 8. CATEGORIA (25 registros)
INSERT INTO CATEGORIA (nombre, descripcion) VALUES
('Lácteos', 'Leche, quesos, yogurts y derivados'), ('Carnes', 'Res, cerdo, pollo y embutidos'),
('Bebidas', 'Gaseosas, jugos, aguas y energizantes'), ('Abarrotes', 'Cereales, granos, pastas y salsas'),
('Panadería', 'Pan fresco, empacado y repostería'), ('Snacks', 'Frituras, semillas y galletas'),
('Dulces', 'Chocolates, caramelos y gomas'), ('Limpieza', 'Detergentes, desinfectantes y escobas'),
('Higiene Personal', 'Jabones, shampoo, cremas y desodorantes'), ('Cosméticos', 'Maquillaje y cuidado de la piel'),
('Mascotas', 'Alimento y accesorios para animales'), ('Congelados', 'Helados, comidas listas y vegetales fríos'),
('Frutas', 'Frutas frescas de temporada'), ('Verduras', 'Vegetales frescos e ingredientes'),
('Bebés', 'Pañales, fórmulas y cuidado infantil'), ('Licores', 'Cervezas, vinos y destilados'),
('Hogar', 'Plásticos, organizadores y desechables'), ('Farmacia', 'Medicamentos OTC y primeros auxilios'),
('Papelería', 'Cuadernos, lapiceros y útiles'), ('Ferretería', 'Herramientas básicas y focos'),
('Automotriz', 'Aceites, aromatizantes y limpieza auto'), ('Jardinería', 'Tierra, semillas y macetas'),
('Electrónica', 'Baterías, cables y cargadores'), ('Ropa Básica', 'Calcetines, playeras e interiores'),
('Especias', 'Condimentos, sal y saborizantes');

-- 9. PRODUCTO (25 registros vinculados a categorías y almacenistas [51-75])
INSERT INTO PRODUCTO (nombre_prod, descripcion_prod, precio_prod, precio_compra_base, stock, ubicacion_bodega, id_categoria, id_act_almacenista) VALUES
('Leche Entera 1L', 'Caja de leche UHT', 12.50, 9.00, 150, 'Pasillo 1A', 1, 51),
('Libra Carne Molida', 'Carne de res premium', 35.00, 25.00, 40, 'Cuarto Frío 1', 2, 72),
('Gaseosa Cola 2.5L', 'Refresco de cola oscuro', 15.00, 11.50, 200, 'Pasillo 2B', 3, 52),
('Arroz Blanco 1lb', 'Arroz pregraneado', 6.00, 4.25, 300, 'Pasillo 3A', 4, 53),
('Pan Integral', 'Bolsa de pan de rodaja', 18.00, 13.00, 60, 'Pasillo 4A', 5, 54),
('Nachos Queso 150g', 'Bolsita de nachos', 8.50, 5.00, 120, 'Pasillo 5B', 6, 55),
('Barra Chocolate', 'Chocolate con leche 50g', 5.00, 3.00, 250, 'Caja Principal', 7, 56),
('Detergente Polvo 1kg', 'Para ropa blanca y color', 18.50, 12.00, 100, 'Pasillo 6A', 8, 57),
('Jabón Baño', 'Paquete de 3 unidades', 15.00, 10.00, 80, 'Pasillo 7A', 9, 58),
('Crema Corporal', 'Humectante 400ml', 45.00, 30.00, 40, 'Pasillo 7B', 10, 59),
('Concentrado Perro 5lb', 'Sabor carne y pollo', 45.00, 32.00, 50, 'Pasillo 8A', 11, 60),
('Helado Vainilla 1L', 'Bote familiar', 35.00, 22.00, 30, 'Congelador 2', 12, 73),
('Manzana Gala', 'Precio por libra', 12.00, 8.00, 100, 'Área Frescos', 13, 61),
('Cebolla Blanca', 'Precio por libra', 6.50, 4.00, 80, 'Área Frescos', 14, 62),
('Pañales Etapa 3', 'Bolsa de 40 unidades', 120.00, 95.00, 40, 'Pasillo 9A', 15, 63),
('Cerveza Lata 350ml', 'Pack de 6', 42.00, 32.00, 150, 'Pasillo 10', 16, 64),
('Bolsas Basura', 'Paquete de 10 unidades', 15.00, 9.00, 90, 'Pasillo 6B', 17, 65),
('Paracetamol 500mg', 'Caja de 20 tabletas', 20.00, 12.00, 100, 'Farmacia', 18, 66),
('Cuaderno Espiral', '100 hojas líneas', 12.00, 7.50, 200, 'Pasillo 11A', 19, 67),
('Foco LED 9W', 'Luz blanca', 25.00, 15.00, 80, 'Pasillo 12A', 20, 68),
('Silicona Auto', 'Spray limpiador', 35.00, 22.00, 30, 'Pasillo 12B', 21, 69),
('Tierra Negra 5lb', 'Abono para jardín', 15.00, 9.00, 40, 'Pasillo 13', 22, 70),
('Cable USB-C', 'Carga rápida 1m', 45.00, 20.00, 60, 'Pasillo 14', 23, 71),
('Calcetines Algodón', 'Paquete de 3 pares', 35.00, 20.00, 50, 'Pasillo 15', 24, 74),
('Sal Refinada 1lb', 'Bolsa básica', 3.50, 2.00, 200, 'Pasillo 3B', 25, 75);

-- 10. VENTA (25 registros vinculando a Clientes [76-100] y Cajeros [26-50])
INSERT INTO VENTA (fecha_hora_venta, id_act_cliente, id_act_cajero) VALUES
('2026-05-01 08:30:00', 76, 26), ('2026-05-01 08:45:00', 77, 27), ('2026-05-01 09:15:00', 78, 28), ('2026-05-01 09:30:00', 79, 29),
('2026-05-01 10:00:00', 80, 30), ('2026-05-01 10:20:00', 81, 31), ('2026-05-01 11:05:00', 82, 32), ('2026-05-01 11:45:00', 83, 33),
('2026-05-01 12:10:00', 84, 34), ('2026-05-01 12:50:00', 85, 35), ('2026-05-01 13:20:00', 86, 36), ('2026-05-01 14:00:00', 87, 37),
('2026-05-01 14:30:00', 88, 38), ('2026-05-01 15:15:00', 89, 39), ('2026-05-01 15:45:00', 90, 40), ('2026-05-01 16:10:00', 91, 41),
('2026-05-01 16:50:00', 92, 42), ('2026-05-01 17:25:00', 93, 43), ('2026-05-01 18:00:00', 94, 44), ('2026-05-01 18:35:00', 95, 45),
('2026-05-01 19:10:00', 96, 46), ('2026-05-01 19:40:00', 97, 47), ('2026-05-01 20:05:00', 98, 48), ('2026-05-01 20:45:00', 99, 49),
('2026-05-01 21:20:00', 100, 50);

-- 11. FACTURA (25 registros vinculados 1:1 a Venta)
INSERT INTO FACTURA (estado, id_venta) VALUES
('Pagada', 1), ('Pagada', 2), ('Pagada', 3), ('Anulada', 4), ('Pagada', 5), ('Pagada', 6), ('Pagada', 7), ('Pagada', 8),
('Pagada', 9), ('Anulada', 10), ('Pagada', 11), ('Pagada', 12), ('Pagada', 13), ('Pagada', 14), ('Pagada', 15), ('Pagada', 16),
('Pagada', 17), ('Pagada', 18), ('Anulada', 19), ('Pagada', 20), ('Pagada', 21), ('Pagada', 22), ('Pagada', 23), ('Pagada', 24),
('Pagada', 25);

-- 12. PRESENTE_EN (25 registros: Detalle de Venta M:N Producto)
INSERT INTO PRESENTE_EN (id_venta, id_producto, cantidad_vendida, precio_unitario_venta) VALUES
(1, 1, 2, 12.50), (2, 2, 1, 35.00), (3, 3, 3, 15.00), (4, 4, 1, 6.00), (5, 5, 2, 18.00),
(6, 6, 4, 8.50), (7, 7, 5, 5.00), (8, 8, 1, 18.50), (9, 9, 2, 15.00), (10, 10, 1, 45.00),
(11, 11, 1, 45.00), (12, 12, 2, 35.00), (13, 13, 3, 12.00), (14, 14, 2, 6.50), (15, 15, 1, 120.00),
(16, 16, 2, 42.00), (17, 17, 1, 15.00), (18, 18, 1, 20.00), (19, 19, 5, 12.00), (20, 20, 2, 25.00),
(21, 21, 1, 35.00), (22, 22, 3, 15.00), (23, 23, 1, 45.00), (24, 24, 2, 35.00), (25, 25, 4, 3.50);

-- 13. PROVEE (25 registros: Proveedores [101-125] surten Productos [1-25])
INSERT INTO PROVEE (id_act_proveedor, id_producto, precio_compra_proveedor, moneda_cambio_proveedor) VALUES
(103, 1, 8.50, 'GTQ'), (104, 2, 24.00, 'GTQ'), (105, 3, 11.00, 'GTQ'), (107, 4, 4.00, 'GTQ'), (108, 5, 12.50, 'GTQ'),
(115, 6, 4.80, 'GTQ'), (116, 7, 2.90, 'GTQ'), (109, 8, 11.50, 'GTQ'), (110, 9, 9.50, 'GTQ'), (111, 10, 4.00, 'USD'),
(124, 11, 31.00, 'GTQ'), (103, 12, 21.00, 'GTQ'), (101, 13, 7.50, 'GTQ'), (101, 14, 3.80, 'GTQ'), (102, 15, 12.00, 'USD'),
(105, 16, 31.00, 'GTQ'), (112, 17, 8.50, 'GTQ'), (106, 18, 11.00, 'GTQ'), (112, 19, 7.00, 'GTQ'), (102, 20, 1.80, 'USD'),
(125, 21, 21.00, 'GTQ'), (125, 22, 8.50, 'GTQ'), (102, 23, 2.50, 'USD'), (102, 24, 2.40, 'USD'), (107, 25, 1.90, 'GTQ');