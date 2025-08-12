"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eliminarCliente = exports.obtenerClientePorId = exports.obtenerClientes = exports.actualizarCliente = exports.crearCliente = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Función auxiliar para obtener o crear la categoría "NUEVO" para prioridad
const obtenerOCrearPrioridadNuevo = async () => {
    try {
        // Buscar si ya existe la categoría "NUEVO" para prioridad
        const categoriaExistente = await prisma.categoria.findFirst({
            where: {
                campo: 'prioridad',
                valor: 'NUEVO',
                deleteAt: null,
            },
        });
        if (categoriaExistente) {
            return 'NUEVO';
        }
        // Si no existe, crear la categoría "NUEVO"
        await prisma.categoria.create({
            data: {
                campo: 'prioridad',
                valor: 'NUEVO',
                color: null,
                deleteAt: null,
            },
        });
        return 'NUEVO';
    }
    catch (error) {
        console.error('Error al obtener o crear categoría NUEVO para prioridad:', error);
        // Si hay error, retornar "NUEVO" de todas formas para que el cliente se cree
        return 'NUEVO';
    }
};
const crearCliente = async (data) => {
    try {
        // Verificar si el teléfono ya existe
        const clienteExistente = await prisma.cliente.findFirst({
            where: { telefono: data.telefono },
        });
        if (clienteExistente) {
            throw new Error('El número de teléfono ya está registrado');
        }
        // Obtener o crear la categoría "NUEVO" para prioridad
        const prioridadPorDefecto = await obtenerOCrearPrioridadNuevo();
        return await prisma.cliente.create({
            data: {
                zona: data.zona,
                nombre: data.nombre,
                barrio: data.barrio,
                direccion: data.direccion,
                localidad: data.localidad ?? null,
                telefono: data.telefono,
                tipoCliente: data.tipoCliente,
                detalleDireccion: data.detalleDireccion,
                semana: data.semana,
                horario: data.horario,
                observaciones: data.observaciones,
                debe: data.debe,
                fechaDeuda: data.fechaDeuda,
                precio: data.precio,
                ultimaRecoleccion: data.ultimaRecoleccion,
                contratacion: data.contratacion,
                //nuevo: true, // Siempre true por defecto
                estadoTurno: data.estadoTurno,
                prioridad: data.prioridad ?? prioridadPorDefecto, // Usar el valor proporcionado o "NUEVO" por defecto
                estado: data.estado,
                gestionComercial: data.gestionComercial,
                CUIT: data.CUIT,
                condicion: data.condicion,
                factura: data.factura,
                pago: data.pago,
                origenFacturacion: data.origenFacturacion,
                nombreEmpresa: data.nombreEmpresa,
                emailAdministracion: data.emailAdministracion,
                emailComercial: data.emailComercial,
                rubro: data.rubro,
                categoria: data.categoria,
            },
        });
    }
    catch (error) {
        console.error('Error al crear cliente:', error);
        throw new Error(error.message || 'No se pudo crear el cliente');
    }
};
exports.crearCliente = crearCliente;
const actualizarCliente = async (id, data) => {
    try {
        // Si se está actualizando el teléfono, verificar si ya existe
        if (data.telefono) {
            const clienteExistente = await prisma.cliente.findFirst({
                where: {
                    telefono: data.telefono,
                    id: { not: id }, // Excluir el cliente actual
                },
            });
            if (clienteExistente) {
                throw new Error('El número de teléfono ya está registrado');
            }
        }
        return await prisma.cliente.update({
            where: { id },
            data: {
                zona: data.zona,
                nombre: data.nombre,
                barrio: data.barrio,
                direccion: data.direccion,
                localidad: data.localidad ?? null,
                telefono: data.telefono,
                tipoCliente: data.tipoCliente,
                detalleDireccion: data.detalleDireccion,
                semana: data.semana,
                horario: data.horario,
                observaciones: data.observaciones,
                debe: data.debe,
                fechaDeuda: data.fechaDeuda,
                precio: data.precio,
                ultimaRecoleccion: data.ultimaRecoleccion,
                contratacion: data.contratacion,
                estadoTurno: data.estadoTurno,
                prioridad: data.prioridad,
                estado: data.estado,
                gestionComercial: data.gestionComercial,
                CUIT: data.CUIT,
                condicion: data.condicion,
                factura: data.factura,
                pago: data.pago,
                origenFacturacion: data.origenFacturacion,
                nombreEmpresa: data.nombreEmpresa,
                emailAdministracion: data.emailAdministracion,
                emailComercial: data.emailComercial,
                rubro: data.rubro,
                categoria: data.categoria,
            },
        });
    }
    catch (error) {
        console.error('Error al actualizar cliente:', error);
        throw new Error(error.message || 'No se pudo actualizar el cliente');
    }
};
exports.actualizarCliente = actualizarCliente;
const obtenerClientes = async () => {
    try {
        return await prisma.cliente.findMany();
    }
    catch (error) {
        console.error('Error al obtener clientes:', error);
        throw new Error('No se pudo obtener la lista de clientes');
    }
};
exports.obtenerClientes = obtenerClientes;
const obtenerClientePorId = async (id) => {
    try {
        return await prisma.cliente.findUnique({ where: { id } });
    }
    catch (error) {
        console.error('Error al obtener cliente por ID:', error);
        throw new Error('No se pudo encontrar el cliente');
    }
};
exports.obtenerClientePorId = obtenerClientePorId;
const eliminarCliente = async (id) => {
    try {
        await prisma.cliente.delete({ where: { id } });
    }
    catch (error) {
        console.error('Error al eliminar cliente:', error);
        throw new Error('No se pudo eliminar el cliente');
    }
};
exports.eliminarCliente = eliminarCliente;
