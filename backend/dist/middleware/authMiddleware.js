"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAnyRole = exports.requireOperadorOrAdmin = exports.requireAdmin = exports.requireRole = exports.authenticateToken = void 0;
const authService_1 = require("../services/authService");
const client_1 = require("@prisma/client");
// Middleware de autenticación
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN
        console.log("authenticateToken: Token recibido:", !!token);
        if (!token) {
            console.log("authenticateToken: No hay token");
            res.status(401).json({
                errors: [{ field: "auth", message: "Token de acceso requerido" }],
            });
            return;
        }
        const decoded = (0, authService_1.verifyToken)(token);
        console.log("authenticateToken: Token decodificado:", decoded);
        // Verificar que el usuario aún existe y está activo
        const usuario = await (0, authService_1.obtenerUsuarioPorId)(decoded.userId);
        console.log("authenticateToken: Usuario encontrado:", !!usuario);
        if (!usuario || !usuario.activo) {
            console.log("authenticateToken: Usuario no válido o inactivo");
            res.status(401).json({
                errors: [{ field: "auth", message: "Token inválido o usuario desactivado" }],
            });
            return;
        }
        req.usuario = decoded;
        console.log("authenticateToken: Usuario autenticado exitosamente");
        next();
    }
    catch (error) {
        console.error("Error en autenticación:", error);
        res.status(401).json({
            errors: [{ field: "auth", message: "Token inválido" }],
        });
    }
};
exports.authenticateToken = authenticateToken;
// Middleware de autorización por roles
const requireRole = (rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.usuario) {
            res.status(401).json({
                errors: [{ field: "auth", message: "Usuario no autenticado" }],
            });
            return;
        }
        if (!rolesPermitidos.includes(req.usuario.rol)) {
            res.status(403).json({
                errors: [{ field: "auth", message: "No tienes permisos para realizar esta acción" }],
            });
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
// Middleware específicos para cada tipo de usuario
exports.requireAdmin = (0, exports.requireRole)([client_1.RolUsuario.ADMIN]);
exports.requireOperadorOrAdmin = (0, exports.requireRole)([client_1.RolUsuario.ADMIN, client_1.RolUsuario.OPERADOR]);
exports.requireAnyRole = (0, exports.requireRole)([client_1.RolUsuario.ADMIN, client_1.RolUsuario.OPERADOR, client_1.RolUsuario.LECTOR]);
