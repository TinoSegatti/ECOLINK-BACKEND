"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eliminarClienteHandler = exports.obtenerClientePorIdHandler = exports.obtenerClientesHandler = exports.actualizarClienteHandler = exports.crearClienteHandler = void 0;
const clienteService_1 = require("../services/clienteService");
const clienteValidator_1 = require("../validators/clienteValidator");
const zod_1 = require("zod");
const crearClienteHandler = async (req, res) => {
    try {
        const validatedData = clienteValidator_1.createClienteSchema.parse(req.body);
        const nuevoCliente = await (0, clienteService_1.crearCliente)(validatedData);
        res.status(201).json(nuevoCliente);
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            const errors = error.errors.map(e => ({
                field: e.path.join('.'),
                message: e.message,
            }));
            res.status(400).json({ errors });
            return;
        }
        if (error.message === 'El número de teléfono ya está registrado') {
            res.status(409).json({
                errors: [{ field: 'telefono', message: 'El número de teléfono ya está registrado' }],
            });
            return;
        }
        console.error('Error al crear el cliente:', error);
        res.status(500).json({ error: 'Error al crear el cliente' });
    }
};
exports.crearClienteHandler = crearClienteHandler;
const actualizarClienteHandler = async (req, res) => {
    const { id } = req.params;
    if (isNaN(Number(id))) {
        res.status(400).json({ error: 'ID debe ser un número válido' });
        return;
    }
    try {
        const validatedData = clienteValidator_1.updateClienteSchema.parse(req.body);
        const clienteActualizado = await (0, clienteService_1.actualizarCliente)(Number(id), validatedData);
        res.status(200).json(clienteActualizado);
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            const errors = error.errors.map(e => ({
                field: e.path.join('.'),
                message: e.message,
            }));
            res.status(400).json({ errors });
            return;
        }
        if (error.message === 'El número de teléfono ya está registrado') {
            res.status(409).json({
                errors: [{ field: 'telefono', message: 'El número de teléfono ya está registrado' }],
            });
            return;
        }
        console.error('Error al actualizar el cliente:', error);
        res.status(500).json({ error: 'Error al actualizar el cliente' });
    }
};
exports.actualizarClienteHandler = actualizarClienteHandler;
const obtenerClientesHandler = async (_req, res) => {
    try {
        const clientes = await (0, clienteService_1.obtenerClientes)();
        res.status(200).json(clientes);
    }
    catch (error) {
        console.error('Error al obtener clientes:', error);
        res.status(500).json({ error: 'Error al obtener clientes' });
    }
};
exports.obtenerClientesHandler = obtenerClientesHandler;
const obtenerClientePorIdHandler = async (req, res) => {
    const { id } = req.params;
    if (isNaN(Number(id))) {
        res.status(400).json({ error: 'ID debe ser un número válido' });
        return;
    }
    try {
        const cliente = await (0, clienteService_1.obtenerClientePorId)(Number(id));
        if (!cliente) {
            res.status(404).json({ error: 'Cliente no encontrado' });
            return;
        }
        res.status(200).json(cliente);
    }
    catch (error) {
        console.error('Error al obtener el cliente:', error);
        res.status(500).json({ error: 'Error al obtener el cliente' });
    }
};
exports.obtenerClientePorIdHandler = obtenerClientePorIdHandler;
const eliminarClienteHandler = async (req, res) => {
    const { id } = req.params;
    if (isNaN(Number(id))) {
        res.status(400).json({ error: 'ID debe ser un número válido' });
        return;
    }
    try {
        await (0, clienteService_1.eliminarCliente)(Number(id));
        res.status(204).send();
    }
    catch (error) {
        console.error('Error al eliminar el cliente:', error);
        res.status(500).json({ error: 'Error al eliminar el cliente' });
    }
};
exports.eliminarClienteHandler = eliminarClienteHandler;
