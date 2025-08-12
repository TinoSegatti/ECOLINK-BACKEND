"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eliminarCategoria = exports.obtenerTodasLasCategorias = exports.actualizarCategoria = exports.crearCategoria = exports.obtenerCategoriasPorCampo = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const obtenerCategoriasPorCampo = async (campo) => {
    try {
        const categorias = await prisma.categoria.findMany({
            where: {
                campo,
                deleteAt: null, // Solo categorías no borradas
            },
            select: { valor: true, color: true },
        });
        return categorias;
    }
    catch (error) {
        console.error('Error al obtener categorías:', error);
        throw new Error(JSON.stringify([{
                field: 'general',
                message: 'No se pudo obtener las categorías',
            }]));
    }
};
exports.obtenerCategoriasPorCampo = obtenerCategoriasPorCampo;
const crearCategoria = async (campo, valor, color) => {
    try {
        return await prisma.categoria.create({
            data: { campo, valor, color, deleteAt: null },
        });
    }
    catch (error) {
        console.error('Error al crear categoría:', error);
        throw error;
    }
};
exports.crearCategoria = crearCategoria;
const actualizarCategoria = async (campo, oldValor, newValor, color) => {
    try {
        // Actualizar la categoría
        const categoriaActualizada = await prisma.categoria.update({
            where: {
                campo_valor: { campo, valor: oldValor },
                deleteAt: null, // Solo actualizar si no está borrada
            },
            data: { valor: newValor, color },
        });
        // Lista de campos gestionables en la tabla cliente
        const camposGestionables = [
            { campo: 'zona', clienteField: 'zona' },
            { campo: 'semana', clienteField: 'semana' },
            { campo: 'tipoCliente', clienteField: 'tipoCliente' },
            { campo: 'estadoTurno', clienteField: 'estadoTurno' },
            { campo: 'prioridad', clienteField: 'prioridad' },
            { campo: 'estado', clienteField: 'estado' },
            { campo: 'gestionComercial', clienteField: 'gestionComercial' },
        ];
        // Verificar si el campo es gestionable
        const campoConfig = camposGestionables.find((c) => c.campo === campo);
        if (campoConfig) {
            // Log para depuración
            console.log(`[ActualizarCategoria] Campo: ${campoConfig.clienteField}, oldValor: '${oldValor}', newValor: '${newValor}'`);
            const updateResult = await prisma.cliente.updateMany({
                where: {
                    [campoConfig.clienteField]: oldValor,
                },
                data: {
                    [campoConfig.clienteField]: newValor,
                },
            });
            console.log(`[ActualizarCategoria] Registros modificados:`, updateResult.count);
        }
        return categoriaActualizada;
    }
    catch (error) {
        // Captura de error de restricción única de Prisma
        if (error.code === 'P2002') {
            throw new Error(JSON.stringify([{
                    field: 'general',
                    message: `Ya existe una categoría con campo "${campo}" y valor "${newValor}"`,
                }]));
        }
        console.error('Error al actualizar categoría:', error);
        throw new Error(JSON.stringify([{
                field: 'general',
                message: 'No se pudo actualizar la categoría',
            }]));
    }
};
exports.actualizarCategoria = actualizarCategoria;
const obtenerTodasLasCategorias = async () => {
    try {
        const categorias = await prisma.categoria.findMany({
            where: {
                deleteAt: null, // Solo categorías no borradas
            },
            select: { campo: true, valor: true, color: true },
            orderBy: [
                { campo: 'asc' },
                { valor: 'asc' }
            ],
        });
        // Agrupar por campo
        const categoriasAgrupadas = {};
        categorias.forEach(categoria => {
            if (!categoriasAgrupadas[categoria.campo]) {
                categoriasAgrupadas[categoria.campo] = [];
            }
            categoriasAgrupadas[categoria.campo].push({
                valor: categoria.valor,
                color: categoria.color
            });
        });
        return categoriasAgrupadas;
    }
    catch (error) {
        console.error('Error al obtener todas las categorías:', error);
        throw new Error(JSON.stringify([{
                field: 'general',
                message: 'No se pudo obtener las categorías',
            }]));
    }
};
exports.obtenerTodasLasCategorias = obtenerTodasLasCategorias;
function relanzarErrorSiEsJson(error) {
    if (typeof error.message === 'string') {
        try {
            const parsed = JSON.parse(error.message);
            if (Array.isArray(parsed) && parsed[0]?.field && parsed[0]?.message) {
                console.log('[categoriaService] Relanzando error original:', error.message);
                return Promise.reject(error);
            }
        }
        catch (e) {
            console.log('[categoriaService] Error al intentar parsear error.message:', error.message, e);
        }
    }
    return null;
}
const eliminarCategoria = async (campo, valor, deleteAt) => {
    try {
        // Lista de campos gestionables en la tabla cliente
        const camposGestionables = [
            { campo: 'zona', clienteField: 'zona' },
            { campo: 'semana', clienteField: 'semana' },
            { campo: 'tipoCliente', clienteField: 'tipoCliente' },
            { campo: 'estadoTurno', clienteField: 'estadoTurno' },
            { campo: 'prioridad', clienteField: 'prioridad' },
            { campo: 'estado', clienteField: 'estado' },
            { campo: 'gestionComercial', clienteField: 'gestionComercial' },
        ];
        // Verificar si el campo es gestionable
        const campoConfig = camposGestionables.find((c) => c.campo === campo);
        if (!campoConfig) {
            throw new Error(JSON.stringify([{
                    field: 'campo',
                    message: 'El campo especificado no es gestionable',
                }]));
        }
        // Verificar si la categoría existe y está activa
        const categoriaExistente = await prisma.categoria.findFirst({
            where: { campo, valor, deleteAt: null },
        });
        if (!categoriaExistente) {
            throw new Error(JSON.stringify([{
                    field: 'general',
                    message: `La categoría con campo "${campo}" y valor "${valor}" no existe o ya está eliminada`,
                }]));
        }
        // Consultar si la categoría está en uso en la tabla cliente
        const clienteEnUso = await prisma.cliente.findFirst({
            where: {
                [campoConfig.clienteField]: valor,
            },
        });
        if (clienteEnUso) {
            throw new Error(JSON.stringify([{
                    field: 'general',
                    message: `No se puede eliminar la categoría "${valor}" porque está en uso por al menos un cliente.`,
                }]));
        }
        // Buscar un valor único agregando guiones ("-")
        let dashes = '';
        let newValor = valor;
        let attempt = 0;
        const maxAttempts = 100;
        while (attempt < maxAttempts) {
            // ¿Existe alguna categoría (activa o eliminada) con este valor?
            const categoriaConEsteValor = await prisma.categoria.findFirst({
                where: { campo, valor: newValor },
            });
            if (!categoriaConEsteValor) {
                break; // Valor único encontrado
            }
            dashes += '-';
            newValor = valor + dashes;
            attempt++;
        }
        if (attempt >= maxAttempts) {
            throw new Error(JSON.stringify([{
                    field: 'general',
                    message: `No se pudo encontrar un valor único para la categoría "${valor}" después de ${maxAttempts} intentos. Contacte al administrador.`,
                }]));
        }
        // Actualizar la categoría con el nuevo valor y deleteAt
        await prisma.categoria.update({
            where: { campo_valor: { campo, valor } },
            data: { valor: newValor, deleteAt },
        });
    }
    catch (error) {
        console.error('Error al marcar categoría como eliminada:', error);
        const relanzado = relanzarErrorSiEsJson(error);
        if (relanzado)
            return relanzado;
        // Error de restricción única de Prisma
        if (error.code === 'P2002') {
            console.log('[categoriaService] Error P2002, encapsulando error.');
            throw new Error(JSON.stringify([{
                    field: 'general',
                    message: `El valor "${valor}" ya existe en otra categoría.`,
                }]));
        }
        console.log('[categoriaService] Lanzando error genérico.');
        throw new Error(JSON.stringify([{
                field: 'general',
                message: 'No se pudo eliminar la categoría por un error inesperado.',
            }]));
    }
};
exports.eliminarCategoria = eliminarCategoria;
