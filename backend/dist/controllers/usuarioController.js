"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.obtenerEstadisticasUsuarios = exports.cambiarEstadoUsuario = exports.eliminarUsuario = exports.actualizarUsuario = exports.crearUsuario = exports.obtenerUsuarioPorId = exports.obtenerUsuarios = void 0;
const usuarioService = __importStar(require("../services/usuarioService"));
const obtenerUsuarios = async (req, res) => {
    try {
        console.log('🔍 obtenerUsuarios: Iniciando...');
        const excludeId = req.usuario?.userId;
        const usuarios = await usuarioService.obtenerUsuarios(excludeId);
        console.log('🔍 obtenerUsuarios: Usuarios obtenidos:', usuarios.length);
        res.json(usuarios);
    }
    catch (error) {
        console.error('❌ Error al obtener usuarios:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
exports.obtenerUsuarios = obtenerUsuarios;
const obtenerUsuarioPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const usuarioId = parseInt(id);
        if (isNaN(usuarioId)) {
            res.status(400).json({ error: 'ID de usuario inválido' });
            return;
        }
        const usuario = await usuarioService.obtenerUsuarioPorId(usuarioId);
        if (!usuario) {
            res.status(404).json({ error: 'Usuario no encontrado' });
            return;
        }
        res.json(usuario);
    }
    catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
exports.obtenerUsuarioPorId = obtenerUsuarioPorId;
const crearUsuario = async (req, res) => {
    try {
        // Verificar si el usuario es el invitado
        const currentUserEmail = req.usuario?.email;
        if (currentUserEmail === 'invitado@ecolink.com') {
            res.status(403).json({ error: 'El usuario invitado no puede crear nuevos usuarios' });
            return;
        }
        const { email, nombre, rol, password } = req.body;
        if (!email || !nombre || !rol || !password) {
            res.status(400).json({ error: 'Todos los campos son requeridos' });
            return;
        }
        const nuevoUsuario = await usuarioService.crearUsuario({
            email,
            nombre,
            rol,
            password,
        });
        res.status(201).json(nuevoUsuario);
    }
    catch (error) {
        console.error('Error al crear usuario:', error);
        if (error.message.includes('Ya existe')) {
            res.status(409).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
};
exports.crearUsuario = crearUsuario;
const actualizarUsuario = async (req, res) => {
    try {
        // Verificar si el usuario es el invitado
        const currentUserEmail = req.usuario?.email;
        if (currentUserEmail === 'invitado@ecolink.com') {
            res.status(403).json({ error: 'El usuario invitado no puede modificar usuarios' });
            return;
        }
        const { id } = req.params;
        const usuarioId = parseInt(id);
        const datosActualizacion = req.body;
        if (isNaN(usuarioId)) {
            res.status(400).json({ error: 'ID de usuario inválido' });
            return;
        }
        const usuarioActualizado = await usuarioService.actualizarUsuario(usuarioId, datosActualizacion);
        res.json(usuarioActualizado);
    }
    catch (error) {
        console.error('Error al actualizar usuario:', error);
        if (error.message.includes('no encontrado')) {
            res.status(404).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
};
exports.actualizarUsuario = actualizarUsuario;
const eliminarUsuario = async (req, res) => {
    try {
        // Verificar si el usuario es el invitado
        const currentUserEmail = req.usuario?.email;
        if (currentUserEmail === 'invitado@ecolink.com') {
            res.status(403).json({ error: 'El usuario invitado no puede eliminar usuarios' });
            return;
        }
        const { id } = req.params;
        const usuarioId = parseInt(id);
        if (isNaN(usuarioId)) {
            res.status(400).json({ error: 'ID de usuario inválido' });
            return;
        }
        // Evitar que un usuario elimine su propia cuenta
        const currentUserId = req.usuario?.userId;
        if (currentUserId && currentUserId === usuarioId) {
            res.status(400).json({ error: 'No puedes eliminar tu propia cuenta mientras la sesión está activa' });
            return;
        }
        await usuarioService.eliminarUsuario(usuarioId);
        res.json({ message: 'Usuario eliminado exitosamente' });
    }
    catch (error) {
        console.error('Error al eliminar usuario:', error);
        if (error.message.includes('no encontrado')) {
            res.status(404).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
};
exports.eliminarUsuario = eliminarUsuario;
const cambiarEstadoUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { activo } = req.body;
        const usuarioId = parseInt(id);
        if (isNaN(usuarioId)) {
            res.status(400).json({ error: 'ID de usuario inválido' });
            return;
        }
        if (typeof activo !== 'boolean') {
            res.status(400).json({ error: 'El campo activo debe ser un booleano' });
            return;
        }
        const usuarioActualizado = await usuarioService.cambiarEstadoUsuario(usuarioId, activo);
        res.json(usuarioActualizado);
    }
    catch (error) {
        console.error('Error al cambiar estado del usuario:', error);
        if (error.message.includes('no encontrado')) {
            res.status(404).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
};
exports.cambiarEstadoUsuario = cambiarEstadoUsuario;
const obtenerEstadisticasUsuarios = async (req, res) => {
    try {
        console.log('🔍 obtenerEstadisticasUsuarios: Iniciando...');
        const estadisticas = await usuarioService.obtenerEstadisticasUsuarios();
        console.log('🔍 obtenerEstadisticasUsuarios: Estadísticas obtenidas:', estadisticas);
        res.json(estadisticas);
    }
    catch (error) {
        console.error('❌ Error al obtener estadísticas de usuarios:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
exports.obtenerEstadisticasUsuarios = obtenerEstadisticasUsuarios;
