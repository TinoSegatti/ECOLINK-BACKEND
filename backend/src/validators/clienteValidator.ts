import { z } from 'zod';

export const createClienteSchema = z.object({
  zona: z.string().min(1, 'La zona es obligatoria'),
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  barrio: z.string().min(1, 'El barrio es obligatorio'),
  direccion: z.string().min(1, 'La dirección es obligatoria'),
  localidad: z.string().nullable(),
  telefono: z
    .string()
    .min(1, 'El teléfono es obligatorio')
    .regex(/^\+\d{2,15}$/, {
      message: 'El teléfono debe comenzar con "+" y contener entre 2 y 15 dígitos numéricos',
    }),
  tipoCliente: z.string().min(1, 'El tipo de cliente es obligatorio'),
  detalleDireccion: z.string().nullable(),
  semana: z.string().nullable(),
  observaciones: z.string().nullable(),
  debe: z.number().nullable(),
  fechaDeuda: z.string().nullable(),
  precio: z.number().nullable(),
  ultimaRecoleccion: z.string().nullable(),
  contratacion: z
    .string()
    .nullable()
    .refine(
      (value) =>
        value === null ||
        /^\d{2}\/\d{2}\/\d{4}$/.test(value) &&
        !isNaN(Date.parse(value.split('/').reverse().join('-'))),
      { message: 'La contratación debe tener el formato dd/MM/aaaa y ser una fecha válida' }
    ),
  estadoTurno: z.string().nullable(),
  prioridad: z.string().nullable(),
  estado: z.string().nullable(),
  gestionComercial: z.string().nullable(),
  CUIT: z
    .string()
    .nullable()
    .refine(
      (value) => !value || /^\d{2}-\d{8}-\d{1}$/.test(value),
      { message: 'El CUIT debe tener el formato 12-12345678-1' }
    ),
  condicion: z.string().nullable(),
  factura: z.string().nullable(),
  pago: z.string().nullable(),
  origenFacturacion: z.string().nullable(),
  nombreEmpresa: z.string().nullable(),
  emailAdministracion: z.string().email('El email de administración no es válido').nullable(),
  emailComercial: z.string().email('El email comercial no es válido').nullable(),
  rubro: z.string().nullable(),
  categoria: z.string().nullable(),
  horario: z.string().nullable(),
});

export const updateClienteSchema = z.object({
  zona: z.string().min(1, 'La zona es obligatoria').optional(),
  nombre: z.string().min(1, 'El nombre es obligatorio').optional(),
  barrio: z.string().min(1, 'El barrio es obligatorio').optional(),
  direccion: z.string().min(1, 'La dirección es obligatoria').optional(),
  localidad: z.string().nullable().optional(),
  telefono: z
    .string()
    .min(1, 'El teléfono es obligatorio')
    .regex(/^\+\d{2,15}$/, {
      message: 'El teléfono debe comenzar con "+" y contener entre 2 y 15 dígitos numéricos',
    })
    .optional(),
  tipoCliente: z.string().min(1, 'El tipo de cliente es obligatorio').optional(),
  detalleDireccion: z.string().nullable().optional(),
  semana: z.string().nullable().optional(),
  observaciones: z.string().nullable().optional(),
  debe: z.number().nullable().optional(),
  fechaDeuda: z.string().nullable().optional(),
  precio: z.number().nullable().optional(),
  ultimaRecoleccion: z.string().nullable().optional(),
  contratacion: z
    .string()
    .nullable()
    .refine(
      (value) =>
        value === null ||
        /^\d{2}\/\d{2}\/\d{4}$/.test(value) &&
        !isNaN(Date.parse(value.split('/').reverse().join('-'))),
      { message: 'La contratación debe tener el formato dd/MM/aaaa y ser una fecha válida' }
    )
    .optional(),
  estadoTurno: z.string().nullable().optional(),
  prioridad: z.string().nullable().optional(),
  estado: z.string().nullable().optional(),
  gestionComercial: z.string().nullable().optional(),
  CUIT: z
    .string()
    .nullable()
    .refine(
      (value) => !value || /^\d{2}-\d{8}-\d{1}$/.test(value),
      { message: 'El CUIT debe tener el formato 12-12345678-1' }
    )
    .optional(),
  condicion: z.string().nullable().optional(),
  factura: z.string().nullable().optional(),
  pago: z.string().nullable().optional(),
  origenFacturacion: z.string().nullable().optional(),
  nombreEmpresa: z.string().nullable().optional(),
  emailAdministracion: z.string().email('El email de administración no es válido').nullable().optional(),
  emailComercial: z.string().email('El email comercial no es válido').nullable().optional(),
  rubro: z.string().nullable().optional(),
  categoria: z.string().nullable().optional(),
  horario: z.string().nullable().optional(),
});

export type CreateClienteInput = z.infer<typeof createClienteSchema>;
export type UpdateClienteInput = z.infer<typeof updateClienteSchema>;