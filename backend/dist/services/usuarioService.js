"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.obtenerEstadisticasUsuarios = exports.cambiarEstadoUsuario = exports.eliminarUsuario = exports.actualizarUsuario = exports.crearUsuario = exports.obtenerUsuarioPorEmail = exports.obtenerUsuarioPorId = exports.obtenerUsuarios = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Obtener todos los usuarios (sin contraseñas)
const obtenerUsuarios = async () => {
    try {
        const usuarios = await prisma.usuario.findMany({
            select: {
                id: true,
                email: true,
                nombre: true,
                rol: true,
                activo: true,
                verificado: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return usuarios;
    }
    catch (error) {
        console.error('Error al obtener usuarios:', error);
        throw new Error('No se pudieron obtener los usuarios');
    }
};
exports.obtenerUsuarios = obtenerUsuarios;
// Obtener usuario por ID (sin contraseña)
const obtenerUsuarioPorId = async (id) => {
    try {
        const usuario = await prisma.usuario.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                nombre: true,
                rol: true,
                activo: true,
                verificado: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        return usuario;
    }
    catch (error) {
        console.error('Error al obtener usuario por ID:', error);
        throw new Error('No se pudo obtener el usuario');
    }
};
exports.obtenerUsuarioPorId = obtenerUsuarioPorId;
// Obtener usuario por email (sin contraseña)
const obtenerUsuarioPorEmail = async (email) => {
    try {
        const usuario = await prisma.usuario.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                nombre: true,
                rol: true,
                activo: true,
                verificado: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        return usuario;
    }
    catch (error) {
        console.error('Error al obtener usuario por email:', error);
        throw new Error('No se pudo obtener el usuario');
    }
};
exports.obtenerUsuarioPorEmail = obtenerUsuarioPorEmail;
// Crear nuevo usuario
const crearUsuario = async (data) => {
    try {
        // Verificar que no exista ya un usuario con ese email
        const usuarioExistente = await prisma.usuario.findUnique({
            where: { email: data.email },
        });
        if (usuarioExistente) {
            throw new Error('Ya existe un usuario con este email');
        }
        // Importar bcrypt para hashear la contraseña
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const nuevoUsuario = await prisma.usuario.create({
            data: {
                email: data.email,
                nombre: data.nombre,
                rol: data.rol,
                password: hashedPassword,
                verificado: true, // Usuario creado por admin ya está verificado
                activo: true,
            },
            select: {
                id: true,
                email: true,
                nombre: true,
                rol: true,
                activo: true,
                verificado: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        return nuevoUsuario;
    }
    catch (error) {
        console.error('Error al crear usuario:', error);
        throw error;
    }
};
exports.crearUsuario = crearUsuario;
// Actualizar usuario
const actualizarUsuario = async (id, data) => {
    try {
        const usuario = await prisma.usuario.update({
            where: { id },
            data: {
                ...data,
                updatedAt: new Date(),
            },
            select: {
                id: true,
                email: true,
                nombre: true,
                rol: true,
                activo: true,
                verificado: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        return usuario;
    }
    catch (error) {
        console.error('Error al actualizar usuario:', error);
        throw new Error('No se pudo actualizar el usuario');
    }
};
exports.actualizarUsuario = actualizarUsuario;
// Eliminar usuario
const eliminarUsuario = async (id) => {
    try {
        const usuario = await prisma.usuario.findUnique({
            where: { id },
        });
        if (!usuario) {
            throw new Error('Usuario no encontrado');
        }
        // Eliminar solicitudes de registro asociadas al email del usuario
        await prisma.solicitudRegistro.deleteMany({
            where: { email: usuario.email },
        });
        // Eliminar el usuario
        await prisma.usuario.delete({
            where: { id },
        });
    }
    catch (error) {
        console.error('Error al eliminar usuario:', error);
        throw error;
    }
};
exports.eliminarUsuario = eliminarUsuario;
// Cambiar estado activo/inactivo del usuario
const cambiarEstadoUsuario = async (id, activo) => {
    try {
        const usuario = await prisma.usuario.update({
            where: { id },
            data: {
                activo,
                updatedAt: new Date(),
            },
            select: {
                id: true,
                email: true,
                nombre: true,
                rol: true,
                activo: true,
                verificado: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        return usuario;
    }
    catch (error) {
        console.error('Error al cambiar estado del usuario:', error);
        throw new Error('No se pudo cambiar el estado del usuario');
    }
};
exports.cambiarEstadoUsuario = cambiarEstadoUsuario;
// Obtener estadísticas de usuarios
const obtenerEstadisticasUsuarios = async () => {
    try {
        const totalUsuarios = await prisma.usuario.count();
        const usuariosActivos = await prisma.usuario.count({ where: { activo: true } });
        const usuariosVerificados = await prisma.usuario.count({ where: { verificado: true } });
        const usuariosPorRol = await prisma.usuario.groupBy({
            by: ['rol'],
            _count: { rol: true },
        });
        return {
            total: totalUsuarios,
            activos: usuariosActivos,
            verificados: usuariosVerificados,
            porRol: usuariosPorRol.map(item => ({
                rol: item.rol,
                cantidad: item._count.rol,
            })),
        };
    }
    catch (error) {
        console.error('Error al obtener estadísticas de usuarios:', error);
        throw new Error('No se pudieron obtener las estadísticas');
    }
};
exports.obtenerEstadisticasUsuarios = obtenerEstadisticasUsuarios;
