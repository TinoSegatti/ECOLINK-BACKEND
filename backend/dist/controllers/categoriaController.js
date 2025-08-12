"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTodasLasCategoriasHandler = exports.eliminarCategoriaHandler = exports.actualizarCategoriaHandler = exports.crearCategoriaHandler = exports.getCategoriasHandler = void 0;
const categoriaService_1 = require("../services/categoriaService");
// Validador para colores hexadecimales
const isValidHexColor = (color) => {
    return /^#[0-9A-Fa-f]{6}$/.test(color);
};
// Validador para formato de fecha dd/mm/aaaa
const isValidDateFormat = (date) => {
    return /^\d{2}\/\d{2}\/\d{4}$/.test(date);
};
const getCategoriasHandler = async (req, res, next) => {
    const { campo } = req.query;
    if (!campo || typeof campo !== 'string') {
        res.status(400).json({ errors: [{ field: 'campo', message: 'El campo es requerido' }] });
        return;
    }
    try {
        const opciones = await (0, categoriaService_1.obtenerCategoriasPorCampo)(campo);
        res.json({ options: opciones });
    }
    catch (error) {
        next(error);
    }
};
exports.getCategoriasHandler = getCategoriasHandler;
const crearCategoriaHandler = async (req, res, next) => {
    const { campo, valor, color } = req.body;
    if (!campo || !valor) {
        res.status(400).json({ errors: [{ field: 'general', message: 'Campo y valor son requeridos' }] });
        return;
    }
    if (color && !isValidHexColor(color)) {
        res.status(400).json({ errors: [{ field: 'color', message: 'El color debe ser un valor hexadecimal válido (ej. #FF0000)' }] });
        return;
    }
    try {
        const nuevaCategoria = await (0, categoriaService_1.crearCategoria)(campo, valor, color);
        res.status(201).json(nuevaCategoria);
    }
    catch (error) {
        if (error.code === 'P2002') {
            res.status(409).json({ errors: [{ field: 'general', message: `Ya existe una categoría con campo "${campo}" y valor "${valor}"` }] });
            return;
        }
        next(error);
    }
};
exports.crearCategoriaHandler = crearCategoriaHandler;
const actualizarCategoriaHandler = async (req, res, next) => {
    const { campo, oldValor, newValor, color } = req.body;
    if (!campo || !oldValor || !newValor) {
        res.status(400).json({ errors: [{ field: 'general', message: 'Campo, valor antiguo y nuevo valor son requeridos' }] });
        return;
    }
    if (color && !isValidHexColor(color)) {
        res.status(400).json({ errors: [{ field: 'color', message: 'El color debe ser un valor hexadecimal válido (ej. #FF0000)' }] });
        return;
    }
    try {
        const categoriaActualizada = await (0, categoriaService_1.actualizarCategoria)(campo, oldValor, newValor, color);
        res.json(categoriaActualizada);
    }
    catch (error) {
        if (error.message === 'Ya existe una categoría con ese valor para este campo') {
            res.status(409).json({ errors: [{ field: 'general', message: error.message }] });
            return;
        }
        next(error);
    }
};
exports.actualizarCategoriaHandler = actualizarCategoriaHandler;
const eliminarCategoriaHandler = async (req, res, next) => {
    const { campo, valor, deleteAt } = req.body;
    if (!campo || !valor || !deleteAt) {
        res.status(400).json({
            errors: [{ field: 'general', message: 'Campo, valor y deleteAt son requeridos' }],
        });
        return;
    }
    if (!isValidDateFormat(deleteAt)) {
        res.status(400).json({
            errors: [{ field: 'deleteAt', message: 'La fecha debe estar en formato dd/mm/aaaa' }],
        });
        return;
    }
    try {
        await (0, categoriaService_1.eliminarCategoria)(campo, valor, deleteAt);
        res.status(204).send();
    }
    catch (error) {
        let parsedError;
        try {
            parsedError = JSON.parse(error.message);
            if (Array.isArray(parsedError)) {
                const msg = parsedError[0]?.message || '';
                console.log('[categoriaController] Error parseado:', parsedError);
                console.log('[categoriaController] Mensaje detectado:', msg);
                if (msg.toLowerCase().includes('en uso')) {
                    console.log('[categoriaController] Respondiendo 409 por "en uso"');
                    res.status(409).json({ errors: parsedError });
                    return;
                }
                if (msg.includes('no es gestionable')) {
                    console.log('[categoriaController] Respondiendo 400 por "no es gestionable"');
                    res.status(400).json({ errors: parsedError });
                    return;
                }
                if (msg.includes('no existe')) {
                    console.log('[categoriaController] Respondiendo 404 por "no existe"');
                    res.status(404).json({ errors: parsedError });
                    return;
                }
                // Otros errores personalizados
                console.log('[categoriaController] Respondiendo 409 por error personalizado');
                res.status(409).json({ errors: parsedError });
                return;
            }
        }
        catch (e) {
            console.log('[categoriaController] Error al intentar parsear error.message:', error.message, e);
            // No es JSON, sigue con el flujo normal
        }
        // Error genérico
        console.log('[categoriaController] Respondiendo 500 por error genérico');
        res.status(500).json({
            errors: [{ field: 'general', message: 'Error al eliminar la categoría' }],
        });
    }
};
exports.eliminarCategoriaHandler = eliminarCategoriaHandler;
const getTodasLasCategoriasHandler = async (req, res, next) => {
    try {
        const categoriasAgrupadas = await (0, categoriaService_1.obtenerTodasLasCategorias)();
        res.json({ categorias: categoriasAgrupadas });
    }
    catch (error) {
        next(error);
    }
};
exports.getTodasLasCategoriasHandler = getTodasLasCategoriasHandler;
