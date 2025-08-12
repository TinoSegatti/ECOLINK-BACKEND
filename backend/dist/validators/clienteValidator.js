"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateClienteSchema = exports.createClienteSchema = void 0;
const zod_1 = require("zod");
exports.createClienteSchema = zod_1.z.object({
    zona: zod_1.z.string().min(1, 'La zona es obligatoria'),
    nombre: zod_1.z.string().min(1, 'El nombre es obligatorio'),
    barrio: zod_1.z.string().min(1, 'El barrio es obligatorio'),
    direccion: zod_1.z.string().min(1, 'La dirección es obligatoria'),
    localidad: zod_1.z.string().nullable(),
    telefono: zod_1.z
        .string()
        .min(1, 'El teléfono es obligatorio')
        .regex(/^\+\d{2,15}$/, {
        message: 'El teléfono debe comenzar con "+" y contener entre 2 y 15 dígitos numéricos',
    }),
    tipoCliente: zod_1.z.string().min(1, 'El tipo de cliente es obligatorio'),
    detalleDireccion: zod_1.z.string().nullable(),
    semana: zod_1.z.string().nullable(),
    observaciones: zod_1.z.string().nullable(),
    debe: zod_1.z.number().nullable(),
    fechaDeuda: zod_1.z.string().nullable(),
    precio: zod_1.z.number().nullable(),
    ultimaRecoleccion: zod_1.z.string().nullable(),
    contratacion: zod_1.z
        .string()
        .nullable()
        .refine((value) => value === null ||
        /^\d{2}\/\d{2}\/\d{4}$/.test(value) &&
            !isNaN(Date.parse(value.split('/').reverse().join('-'))), { message: 'La contratación debe tener el formato dd/MM/aaaa y ser una fecha válida' }),
    estadoTurno: zod_1.z.string().nullable(),
    prioridad: zod_1.z.string().nullable(),
    estado: zod_1.z.string().nullable(),
    gestionComercial: zod_1.z.string().nullable(),
    CUIT: zod_1.z
        .string()
        .nullable()
        .refine((value) => !value || /^\d{2}-\d{8}-\d{1}$/.test(value), { message: 'El CUIT debe tener el formato 12-12345678-1' }),
    condicion: zod_1.z.string().nullable(),
    factura: zod_1.z.string().nullable(),
    pago: zod_1.z.string().nullable(),
    origenFacturacion: zod_1.z.string().nullable(),
    nombreEmpresa: zod_1.z.string().nullable(),
    emailAdministracion: zod_1.z.string().email('El email de administración no es válido').nullable(),
    emailComercial: zod_1.z.string().email('El email comercial no es válido').nullable(),
    rubro: zod_1.z.string().nullable(),
    categoria: zod_1.z.string().nullable(),
    horario: zod_1.z.string().nullable(),
});
exports.updateClienteSchema = zod_1.z.object({
    zona: zod_1.z.string().min(1, 'La zona es obligatoria').optional(),
    nombre: zod_1.z.string().min(1, 'El nombre es obligatorio').optional(),
    barrio: zod_1.z.string().min(1, 'El barrio es obligatorio').optional(),
    direccion: zod_1.z.string().min(1, 'La dirección es obligatoria').optional(),
    localidad: zod_1.z.string().nullable().optional(),
    telefono: zod_1.z
        .string()
        .min(1, 'El teléfono es obligatorio')
        .regex(/^\+\d{2,15}$/, {
        message: 'El teléfono debe comenzar con "+" y contener entre 2 y 15 dígitos numéricos',
    })
        .optional(),
    tipoCliente: zod_1.z.string().min(1, 'El tipo de cliente es obligatorio').optional(),
    detalleDireccion: zod_1.z.string().nullable().optional(),
    semana: zod_1.z.string().nullable().optional(),
    observaciones: zod_1.z.string().nullable().optional(),
    debe: zod_1.z.number().nullable().optional(),
    fechaDeuda: zod_1.z.string().nullable().optional(),
    precio: zod_1.z.number().nullable().optional(),
    ultimaRecoleccion: zod_1.z.string().nullable().optional(),
    contratacion: zod_1.z
        .string()
        .nullable()
        .refine((value) => value === null ||
        /^\d{2}\/\d{2}\/\d{4}$/.test(value) &&
            !isNaN(Date.parse(value.split('/').reverse().join('-'))), { message: 'La contratación debe tener el formato dd/MM/aaaa y ser una fecha válida' })
        .optional(),
    estadoTurno: zod_1.z.string().nullable().optional(),
    prioridad: zod_1.z.string().nullable().optional(),
    estado: zod_1.z.string().nullable().optional(),
    gestionComercial: zod_1.z.string().nullable().optional(),
    CUIT: zod_1.z
        .string()
        .nullable()
        .refine((value) => !value || /^\d{2}-\d{8}-\d{1}$/.test(value), { message: 'El CUIT debe tener el formato 12-12345678-1' })
        .optional(),
    condicion: zod_1.z.string().nullable().optional(),
    factura: zod_1.z.string().nullable().optional(),
    pago: zod_1.z.string().nullable().optional(),
    origenFacturacion: zod_1.z.string().nullable().optional(),
    nombreEmpresa: zod_1.z.string().nullable().optional(),
    emailAdministracion: zod_1.z.string().email('El email de administración no es válido').nullable().optional(),
    emailComercial: zod_1.z.string().email('El email comercial no es válido').nullable().optional(),
    rubro: zod_1.z.string().nullable().optional(),
    categoria: zod_1.z.string().nullable().optional(),
    horario: zod_1.z.string().nullable().optional(),
});
