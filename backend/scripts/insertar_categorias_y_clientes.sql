-- ============================================
-- SCRIPT PARA ELIMINAR Y RECREAR CATEGORÍAS
-- ============================================

-- Eliminar todos los registros de categoria
DELETE FROM categoria;

-- Resetear el autoincremento (opcional, para empezar desde 1)
ALTER TABLE categoria AUTO_INCREMENT = 1;

-- ============================================
-- INSERTAR CATEGORÍAS VÁLIDAS (sin deletedAt)
-- ============================================

-- ZONAS
INSERT INTO categoria (campo, valor, color, deleteAt) VALUES
('zona', '1A', 'FFFFFF', NULL),
('zona', '1C', 'FFFFFF', NULL),
('zona', '2A', 'FFFFFF', NULL),
('zona', '3B', 'FFFFFF', NULL),
('zona', '4A', 'FFFFFF', NULL),
('zona', '6A', 'FFFFFF', NULL),
('zona', '6B', 'FFFFFF', NULL),
('zona', '7A', 'FFFFFF', NULL),
('zona', '7C', 'FFFFFF', NULL),
('zona', '8A', 'FFFFFF', NULL),
('zona', '8C', '#ffffff', NULL),
('zona', '9B', 'FFFFFF', NULL),
('zona', '11A', '#ffffff', NULL),
('zona', '10AA', '#e821da', NULL),
('zona', 'SUR1', 'FFFFFF', NULL),
('zona', 'SUR2', 'FFFFFF', NULL),
('zona', 'Sur 3', '#ffffff', NULL);

-- SEMANAS
INSERT INTO categoria (campo, valor, color, deleteAt) VALUES
('semana', '1', NULL, NULL),
('semana', '2', NULL, NULL),
('semana', '3', NULL, NULL),
('semana', '4', NULL, NULL),
('semana', '11', NULL, NULL),
('semana', '22', NULL, NULL),
('semana', '33', NULL, NULL),
('semana', '44', NULL, NULL),
('semana', '0', NULL, NULL),
('semana', 'Fijo Semanal', '#02BD08', NULL),
('semana', 'Fijo Quincenal', '#02BD08', NULL);

-- TIPO CLIENTE
INSERT INTO categoria (campo, valor, color, deleteAt) VALUES
('tipoCliente', 'Fijo', '#ffffff', NULL),
('tipoCliente', 'Puntual', NULL, NULL),
('tipoCliente', 'Puntual+C', NULL, NULL),
('tipoCliente', 'Ecopunto', '#f5f5f5', NULL),
('tipoCliente', 'Empresa', '#02BD08', NULL),
('tipoCliente', 'Punto ECOLINK', '#02BD08', NULL),
('tipoCliente', 'COMPOST', '#FFA907', NULL),
('tipoCliente', 'Ecopunto + C', '#ffffff', NULL);

-- NUEVO
INSERT INTO categoria (campo, valor, color, deleteAt) VALUES
('nuevo', 'SI', NULL, NULL),
('nuevo', 'NO', NULL, NULL);

-- ESTADO TURNO
INSERT INTO categoria (campo, valor, color, deleteAt) VALUES
('estadoTurno', 'Enviado -', '#1bdb0a', NULL),
('estadoTurno', 'Confirmado', '#9b42ed', NULL),
('estadoTurno', 'Rechazada', '#ffffff', NULL);

-- PRIORIDAD
INSERT INTO categoria (campo, valor, color, deleteAt) VALUES
('prioridad', 'Pidio turno', '#c81215', NULL),
('prioridad', 'Rezagado', NULL, NULL),
('prioridad', 'Urgente', NULL, NULL),
('prioridad', 'Recoordinar', NULL, NULL),
('prioridad', 'no atendieron', '#ffffff', NULL),
('prioridad', 'todos', '#ffffff', NULL),
('prioridad', 'Nuevo', '#ffffff', NULL);

-- ESTADO
INSERT INTO categoria (campo, valor, color, deleteAt) VALUES
('estado', 'Reclamo deuda', NULL, NULL),
('estado', 'Moroso', NULL, NULL),
('estado', 'Conversando', NULL, NULL),
('estado', 'Baja', NULL, NULL),
('estado', 'Activo', NULL, NULL),
('estado', 'Inactivo', NULL, NULL);

-- GESTIÓN COMERCIAL
INSERT INTO categoria (campo, valor, color, deleteAt) VALUES
('gestionComercial', 'Ninguna', NULL, NULL),
('gestionComercial', 'Folleto', NULL, NULL),
('gestionComercial', 'Instragam', NULL, NULL),
('gestionComercial', 'Folleto + Instragam', NULL, NULL);

-- ============================================
-- ELIMINAR TODOS LOS CLIENTES EXISTENTES
-- ============================================

DELETE FROM cliente;

-- Resetear el autoincremento
ALTER TABLE cliente AUTO_INCREMENT = 1;

-- ============================================
-- INSERTAR 20 CLIENTES (5 EMPRESAS)
-- ============================================

-- CLIENTE 1: Fijo
INSERT INTO cliente (
  zona, nombre, barrio, direccion, localidad, telefono, tipoCliente, 
  detalleDireccion, horario, semana, observaciones, debe, fechaDeuda, 
  precio, ultimaRecoleccion, estadoTurno, prioridad, estado, gestionComercial
) VALUES (
  '1A', 'María González', 'Centro', 'San Martín 450', 'Córdoba Capital', 
  '+543514567890', 'Fijo', 'Casa de dos pisos', 'Solo por la mañana', 
  'Fijo Semanal', 'Casa blanca con portón verde, segundo piso, departamento B', 
  NULL, NULL, 8000.00, '15/01/2025', 'Confirmado', 'Ninguna', 'Activo', 'Folleto'
);

-- CLIENTE 2: Puntual
INSERT INTO cliente (
  zona, nombre, barrio, direccion, localidad, telefono, tipoCliente, 
  detalleDireccion, horario, semana, observaciones, debe, fechaDeuda, 
  precio, ultimaRecoleccion, estadoTurno, prioridad, estado, gestionComercial
) VALUES (
  '2A', 'Carlos Rodríguez', 'Nueva Córdoba', 'Belgrano 1234', 'Córdoba Capital', 
  '+543514567891', 'Puntual', 'Edificio moderno', 'De 9 a 17', 
  '2', 'Edificio azul, piso 3, departamento 5, timbre con nombre "Rodríguez"', 
  12000.00, '10/01/2025', 12000.00, '08/01/2025', 'Enviado -', 'Pidio turno', 'Reclamo deuda', 'Instragam'
);

-- CLIENTE 3: Ecopunto
INSERT INTO cliente (
  zona, nombre, barrio, direccion, localidad, telefono, tipoCliente, 
  detalleDireccion, horario, semana, observaciones, debe, fechaDeuda, 
  precio, ultimaRecoleccion, estadoTurno, prioridad, estado, gestionComercial
) VALUES (
  '3B', 'Ana Martínez', 'Güemes', 'Fructuoso Rivera 567', 'Córdoba Capital', 
  '+543514567892', 'Ecopunto', 'Casa antigua', 'Solo por la tarde', 
  '3', 'Casa de color beige con rejas negras, portón de madera', 
  NULL, NULL, 6000.00, '20/01/2025', 'Confirmado', 'Ninguna', 'Activo', 'Ninguna'
);

-- CLIENTE 4: Fijo+C
INSERT INTO cliente (
  zona, nombre, barrio, direccion, localidad, telefono, tipoCliente, 
  detalleDireccion, horario, semana, observaciones, debe, fechaDeuda, 
  precio, ultimaRecoleccion, estadoTurno, prioridad, estado, gestionComercial
) VALUES (
  '4A', 'Juan Pérez', 'Villa Allende', 'Av. Libertador 890', 'Villa Allende', 
  '+543514567893', 'Fijo', 'Casa con jardín', 'De 9 a 17', 
  'Fijo Quincenal', 'Casa roja con techo a dos aguas, jardín al frente con árboles', 
  NULL, NULL, 10000.00, '12/01/2025', 'Confirmado', 'Ninguna', 'Activo', 'Folleto + Instragam'
);

-- CLIENTE 5: Puntual+C
INSERT INTO cliente (
  zona, nombre, barrio, direccion, localidad, telefono, tipoCliente, 
  detalleDireccion, horario, semana, observaciones, debe, fechaDeuda, 
  precio, ultimaRecoleccion, estadoTurno, prioridad, estado, gestionComercial
) VALUES (
  '6A', 'Laura Fernández', 'Alberdi', 'Av. Colón 2345', 'Córdoba Capital', 
  '+543514567894', 'Puntual+C', 'Edificio residencial', 'Solo por la mañana', 
  '1', 'Edificio gris, piso 1, departamento A, puerta marrón', 
  15000.00, '08/01/2025', 15000.00, '06/01/2025', 'Enviado -', 'Urgente', 'Moroso', 'Folleto'
);

-- CLIENTE 6: COMPOST
INSERT INTO cliente (
  zona, nombre, barrio, direccion, localidad, telefono, tipoCliente, 
  detalleDireccion, horario, semana, observaciones, debe, fechaDeuda, 
  precio, ultimaRecoleccion, estadoTurno, prioridad, estado, gestionComercial
) VALUES (
  '6B', 'Roberto Sánchez', 'Jardín', 'Av. Vélez Sarsfield 678', 'Córdoba Capital', 
  '+543514567895', 'COMPOST', 'Casa moderna', 'Solo por la tarde', 
  '4', 'Casa blanca con detalles en negro, portón eléctrico, número 678 en azulejo', 
  NULL, NULL, 12000.00, '18/01/2025', 'Confirmado', 'Ninguna', 'Activo', 'Instragam'
);

-- CLIENTE 7: Punto ECOLINK
INSERT INTO cliente (
  zona, nombre, barrio, direccion, localidad, telefono, tipoCliente, 
  detalleDireccion, horario, semana, observaciones, debe, fechaDeuda, 
  precio, ultimaRecoleccion, estadoTurno, prioridad, estado, gestionComercial
) VALUES (
  '7A', 'Patricia López', 'Villa Belgrano', 'Av. Rafael Núñez 3456', 'Córdoba Capital', 
  '+543514567896', 'Punto ECOLINK', 'Casa con garaje', 'De 9 a 17', 
  'Fijo Semanal', 'Casa amarilla con garaje a la izquierda, vereda con árboles', 
  NULL, NULL, 15000.00, '14/01/2025', 'Confirmado', 'Ninguna', 'Activo', 'Folleto + Instragam'
);

-- CLIENTE 8: Ecopunto + C
INSERT INTO cliente (
  zona, nombre, barrio, direccion, localidad, telefono, tipoCliente, 
  detalleDireccion, horario, semana, observaciones, debe, fechaDeuda, 
  precio, ultimaRecoleccion, estadoTurno, prioridad, estado, gestionComercial
) VALUES (
  '7C', 'Miguel Torres', 'Barrio Jardín', 'Av. Fuerza Aérea 123', 'Córdoba Capital', 
  '+543514567897', 'Ecopunto + C', 'Casa de un piso', 'Solo por la mañana', 
  '2', 'Casa verde claro, portón de reja, número en placa metálica', 
  8000.00, '05/01/2025', 8000.00, '03/01/2025', 'Rechazada', 'Rezagado', 'Conversando', 'Ninguna'
);

-- CLIENTE 9: Fijo
INSERT INTO cliente (
  zona, nombre, barrio, direccion, localidad, telefono, tipoCliente, 
  detalleDireccion, horario, semana, observaciones, debe, fechaDeuda, 
  precio, ultimaRecoleccion, estadoTurno, prioridad, estado, gestionComercial
) VALUES (
  '8A', 'Sandra Morales', 'Villa Azalais', 'Av. Cárcano 789', 'Córdoba Capital', 
  '+543514567898', 'Fijo', 'Edificio antiguo', 'Solo por la tarde', 
  'Fijo Quincenal', 'Edificio de ladrillo visto, piso 2, departamento 3, balcón con plantas', 
  NULL, NULL, 9000.00, '16/01/2025', 'Confirmado', 'Ninguna', 'Activo', 'Folleto'
);

-- CLIENTE 10: Puntual
INSERT INTO cliente (
  zona, nombre, barrio, direccion, localidad, telefono, tipoCliente, 
  detalleDireccion, horario, semana, observaciones, debe, fechaDeuda, 
  precio, ultimaRecoleccion, estadoTurno, prioridad, estado, gestionComercial
) VALUES (
  '8C', 'Diego Ramírez', 'Barrio Norte', 'Av. Duarte Quirós 4567', 'Córdoba Capital', 
  '+543514567899', 'Puntual', 'Casa con quincho', 'De 9 a 17', 
  '3', 'Casa beige con quincho al fondo, portón de madera, rejas blancas', 
  11000.00, '12/01/2025', 11000.00, '10/01/2025', 'Enviado -', 'Pidio turno', 'Reclamo deuda', 'Instragam'
);

-- CLIENTE 11: EMPRESA 1
INSERT INTO cliente (
  zona, nombre, barrio, direccion, localidad, telefono, tipoCliente, 
  detalleDireccion, horario, semana, observaciones, debe, fechaDeuda, 
  precio, ultimaRecoleccion, contratacion, estadoTurno, prioridad, estado, 
  gestionComercial, CUIT, condicion, factura, pago, origenFacturacion, 
  nombreEmpresa, emailAdministracion, emailComercial, rubro, categoria
) VALUES (
  '9B', 'Contacto Empresa', 'Centro', 'Av. General Paz 1234', 'Córdoba Capital', 
  '+543514567900', 'Empresa', 'Edificio comercial', 'De 9 a 17', 
  'Fijo Semanal', 'Edificio de oficinas, piso 5, oficina 501, cartel "Servicios Ambientales S.A."', 
  NULL, NULL, 25000.00, '10/01/2025', '2024-01-15', 'Confirmado', 'Ninguna', 'Activo', 
  'Folleto + Instragam', '30-12345678-9', 'Responsable Inscripto', 'Factura A', 
  'Transferencia bancaria', 'Sistema interno', 'Servicios Ambientales S.A.', 
  'admin@serviciosambientales.com.ar', 'comercial@serviciosambientales.com.ar', 
  'Servicios ambientales', 'Grande'
);

-- CLIENTE 12: EMPRESA 2
INSERT INTO cliente (
  zona, nombre, barrio, direccion, localidad, telefono, tipoCliente, 
  detalleDireccion, horario, semana, observaciones, debe, fechaDeuda, 
  precio, ultimaRecoleccion, contratacion, estadoTurno, prioridad, estado, 
  gestionComercial, CUIT, condicion, factura, pago, origenFacturacion, 
  nombreEmpresa, emailAdministracion, emailComercial, rubro, categoria
) VALUES (
  '11A', 'Gerente General', 'Nueva Córdoba', 'Av. Humberto Primo 567', 'Córdoba Capital', 
  '+543514567901', 'Empresa', 'Edificio corporativo', 'De 9 a 17', 
  'Fijo Quincenal', 'Torre empresarial, piso 8, oficina 802, recepción con logo "EcoLogistics Córdoba"', 
  NULL, NULL, 28000.00, '08/01/2025', '2023-11-20', 'Confirmado', 'Ninguna', 'Activo', 
  'Folleto', '27-87654321-0', 'Responsable Inscripto', 'Factura B', 
  'Cheque', 'ERP corporativo', 'EcoLogistics Córdoba S.R.L.', 
  'administracion@ecologistics.com.ar', 'ventas@ecologistics.com.ar', 
  'Logística y transporte', 'Mediana'
);

-- CLIENTE 13: Fijo
INSERT INTO cliente (
  zona, nombre, barrio, direccion, localidad, telefono, tipoCliente, 
  detalleDireccion, horario, semana, observaciones, debe, fechaDeuda, 
  precio, ultimaRecoleccion, estadoTurno, prioridad, estado, gestionComercial
) VALUES (
  '10AA', 'Fernando Castro', 'Villa El Libertador', 'Av. Circunvalación 8901', 'Córdoba Capital', 
  '+543514567902', 'Fijo', 'Casa con patio', 'Solo por la mañana', 
  '1', 'Casa naranja con patio grande, portón de chapa, número en cartel', 
  NULL, NULL, 7500.00, '19/01/2025', 'Confirmado', 'Ninguna', 'Activo', 'Ninguna'
);

-- CLIENTE 14: Puntual
INSERT INTO cliente (
  zona, nombre, barrio, direccion, localidad, telefono, tipoCliente, 
  detalleDireccion, horario, semana, observaciones, debe, fechaDeuda, 
  precio, ultimaRecoleccion, estadoTurno, prioridad, estado, gestionComercial
) VALUES (
  'SUR1', 'Gabriela Herrera', 'Barrio Sur', 'Av. Malvinas Argentinas 234', 'Córdoba Capital', 
  '+543514567903', 'Puntual', 'Casa de material', 'Solo por la tarde', 
  '4', 'Casa gris con rejas negras, portón de metal, vereda con árboles frutales', 
  9500.00, '03/01/2025', 9500.00, '01/01/2025', 'Enviado -', 'Urgente', 'Moroso', 'Folleto'
);

-- CLIENTE 15: EMPRESA 3
INSERT INTO cliente (
  zona, nombre, barrio, direccion, localidad, telefono, tipoCliente, 
  detalleDireccion, horario, semana, observaciones, debe, fechaDeuda, 
  precio, ultimaRecoleccion, contratacion, estadoTurno, prioridad, estado, 
  gestionComercial, CUIT, condicion, factura, pago, origenFacturacion, 
  nombreEmpresa, emailAdministracion, emailComercial, rubro, categoria
) VALUES (
  'SUR2', 'Director Comercial', 'Barrio Industrial', 'Ruta 9 Km 12.5', 'Córdoba Capital', 
  '+543514567904', 'Empresa', 'Planta industrial', 'De 9 a 17', 
  'Fijo Semanal', 'Planta industrial, entrada principal, oficina administrativa, cartel "Reciclados del Sur S.A."', 
  NULL, NULL, 30000.00, '05/01/2025', '2024-03-10', 'Confirmado', 'Ninguna', 'Activo', 
  'Folleto + Instragam', '30-11223344-5', 'Responsable Inscripto', 'Factura A', 
  'Transferencia bancaria', 'Sistema de facturación', 'Reciclados del Sur S.A.', 
  'admin@recicladosdelsur.com.ar', 'comercial@recicladosdelsur.com.ar', 
  'Reciclaje industrial', 'Grande'
);

-- CLIENTE 16: COMPOST
INSERT INTO cliente (
  zona, nombre, barrio, direccion, localidad, telefono, tipoCliente, 
  detalleDireccion, horario, semana, observaciones, debe, fechaDeuda, 
  precio, ultimaRecoleccion, estadoTurno, prioridad, estado, gestionComercial
) VALUES (
  'SUR3', 'Luis Mendoza', 'Villa El Libertador', 'Av. Fuerza Aérea 5678', 'Córdoba Capital', 
  '+543514567905', 'COMPOST', 'Casa con galpón', 'De 9 a 17', 
  '2', 'Casa blanca con galpón al fondo, portón doble, número en placa de chapa', 
  NULL, NULL, 11000.00, '17/01/2025', 'Confirmado', 'Ninguna', 'Activo', 'Instragam'
);

-- CLIENTE 17: Ecopunto
INSERT INTO cliente (
  zona, nombre, barrio, direccion, localidad, telefono, tipoCliente, 
  detalleDireccion, horario, semana, observaciones, debe, fechaDeuda, 
  precio, ultimaRecoleccion, estadoTurno, prioridad, estado, gestionComercial
) VALUES (
  'Sur 3', 'Mónica Vega', 'Barrio San Vicente', 'Av. Colón 3456', 'Córdoba Capital', 
  '+543514567906', 'Ecopunto', 'Edificio nuevo', 'Solo por la mañana', 
  '3', 'Edificio moderno, piso 4, departamento 7, balcón con vista al parque', 
  NULL, NULL, 7000.00, '21/01/2025', 'Confirmado', 'Ninguna', 'Activo', 'Ninguna'
);

-- CLIENTE 18: EMPRESA 4
INSERT INTO cliente (
  zona, nombre, barrio, direccion, localidad, telefono, tipoCliente, 
  detalleDireccion, horario, semana, observaciones, debe, fechaDeuda, 
  precio, ultimaRecoleccion, contratacion, estadoTurno, prioridad, estado, 
  gestionComercial, CUIT, condicion, factura, pago, origenFacturacion, 
  nombreEmpresa, emailAdministracion, emailComercial, rubro, categoria
) VALUES (
  '1C', 'Jefe de Operaciones', 'Centro', 'San Jerónimo 789', 'Córdoba Capital', 
  '+543514567907', 'Empresa', 'Oficina comercial', 'De 9 a 17', 
  'Fijo Quincenal', 'Edificio de oficinas, piso 2, oficina 205, cartel "Gestión Ambiental Integral"', 
  NULL, NULL, 22000.00, '13/01/2025', '2024-02-28', 'Confirmado', 'Ninguna', 'Activo', 
  'Folleto', '20-99887766-3', 'Monotributista', 'Factura C', 
  'Efectivo', 'Sistema propio', 'Gestión Ambiental Integral', 
  'administracion@gai.com.ar', 'ventas@gai.com.ar', 
  'Consultoría ambiental', 'Pequeña'
);

-- CLIENTE 19: Fijo
INSERT INTO cliente (
  zona, nombre, barrio, direccion, localidad, telefono, tipoCliente, 
  detalleDireccion, horario, semana, observaciones, debe, fechaDeuda, 
  precio, ultimaRecoleccion, estadoTurno, prioridad, estado, gestionComercial
) VALUES (
  '1A', 'Ricardo Juárez', 'Villa Belgrano', 'Av. Rafael Núñez 1234', 'Córdoba Capital', 
  '+543514567908', 'Fijo', 'Casa con jardín', 'Solo por la tarde', 
  'Fijo Semanal', 'Casa verde con jardín delantero, portón de reja, número en azulejo blanco', 
  NULL, NULL, 8500.00, '11/01/2025', 'Confirmado', 'Ninguna', 'Activo', 'Folleto + Instragam'
);

-- CLIENTE 20: EMPRESA 5
INSERT INTO cliente (
  zona, nombre, barrio, direccion, localidad, telefono, tipoCliente, 
  detalleDireccion, horario, semana, observaciones, debe, fechaDeuda, 
  precio, ultimaRecoleccion, contratacion, estadoTurno, prioridad, estado, 
  gestionComercial, CUIT, condicion, factura, pago, origenFacturacion, 
  nombreEmpresa, emailAdministracion, emailComercial, rubro, categoria
) VALUES (
  '2A', 'Coordinadora General', 'Nueva Córdoba', 'Belgrano 890', 'Córdoba Capital', 
  '+543514567909', 'Empresa', 'Edificio moderno', 'De 9 a 17', 
  'Fijo Semanal', 'Torre de oficinas, piso 10, oficina 1001, recepción con logo "EcoSolutions Córdoba"', 
  NULL, NULL, 27000.00, '09/01/2025', '2023-12-05', 'Confirmado', 'Ninguna', 'Activo', 
  'Folleto + Instragam', '30-55667788-1', 'Responsable Inscripto', 'Factura A', 
  'Transferencia bancaria', 'Sistema ERP', 'EcoSolutions Córdoba S.A.', 
  'admin@ecosolutions.com.ar', 'comercial@ecosolutions.com.ar', 
  'Tecnología ambiental', 'Mediana'
);

