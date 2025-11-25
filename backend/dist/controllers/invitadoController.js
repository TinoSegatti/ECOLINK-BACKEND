"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.crearUsuarioInvitado = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
const crearUsuarioInvitado = async (req, res) => {
    try {
        // Verificar clave secreta para seguridad
        const secretKey = req.headers['x-secret-key'] || req.body.secretKey;
        const expectedKey = process.env.INVITADO_SECRET_KEY || 'Ecolink2025-Invitado-Secret-Key';
        if (secretKey !== expectedKey) {
            res.status(401).json({
                error: 'No autorizado. Se requiere clave secreta válida.',
                hint: 'Agrega la variable INVITADO_SECRET_KEY en las variables de entorno'
            });
            return;
        }
        console.log('🔍 Verificando si el usuario invitado ya existe...');
        const usuarioExistente = await prisma.usuario.findUnique({
            where: { email: 'invitado@ecolink.com' },
        });
        if (usuarioExistente) {
            console.log('✅ El usuario invitado ya existe. Actualizando contraseña...');
            const hashedPassword = await bcryptjs_1.default.hash('Invitado2025', 10);
            const usuarioActualizado = await prisma.usuario.update({
                where: { email: 'invitado@ecolink.com' },
                data: {
                    password: hashedPassword,
                    activo: true,
                    verificado: true,
                    rol: client_1.RolUsuario.ADMIN,
                },
                select: {
                    id: true,
                    email: true,
                    nombre: true,
                    rol: true,
                    activo: true,
                    verificado: true,
                },
            });
            console.log('✅ Usuario invitado actualizado exitosamente');
            res.json({
                success: true,
                message: 'Usuario invitado actualizado exitosamente',
                usuario: {
                    email: usuarioActualizado.email,
                    nombre: usuarioActualizado.nombre,
                    rol: usuarioActualizado.rol,
                },
                credenciales: {
                    email: 'invitado@ecolink.com',
                    password: 'Invitado2025',
                },
            });
            return;
        }
        console.log('👤 Creando usuario invitado...');
        const hashedPassword = await bcryptjs_1.default.hash('Invitado2024!', 10);
        const invitado = await prisma.usuario.create({
            data: {
                email: 'invitado@ecolink.com',
                nombre: 'Usuario Invitado',
                password: hashedPassword,
                rol: client_1.RolUsuario.ADMIN,
                activo: true,
                verificado: true,
            },
            select: {
                id: true,
                email: true,
                nombre: true,
                rol: true,
                activo: true,
                verificado: true,
            },
        });
        console.log('✅ Usuario invitado creado exitosamente');
        res.json({
            success: true,
            message: 'Usuario invitado creado exitosamente',
            usuario: {
                email: invitado.email,
                nombre: invitado.nombre,
                rol: invitado.rol,
            },
            credenciales: {
                email: 'invitado@ecolink.com',
                password: 'Invitado2024!',
            },
            nota: 'Este usuario tiene restricciones para modificar/eliminar/crear usuarios',
        });
    }
    catch (error) {
        console.error('❌ Error al crear usuario invitado:', error);
        res.status(500).json({
            error: 'Error al crear usuario invitado',
            message: error.message,
        });
    }
    finally {
        await prisma.$disconnect();
    }
};
exports.crearUsuarioInvitado = crearUsuarioInvitado;
