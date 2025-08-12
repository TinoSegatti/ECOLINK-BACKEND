"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmResetPasswordHandler = exports.resetPasswordHandler = exports.perfilHandler = exports.rechazarSolicitudHandler = exports.aprobarSolicitudHandler = exports.obtenerSolicitudesHandler = exports.reenviarVerificacionHandler = exports.verificarEmailHandler = exports.registroHandler = exports.loginHandler = void 0;
const authService_1 = require("../services/authService");
const authService_2 = require("../services/authService");
const client_1 = require("@prisma/client");
const loginHandler = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({
                errors: [{ field: "general", message: "Email y contraseña son requeridos" }],
            });
            return;
        }
        const resultado = await (0, authService_1.loginUsuario)({ email, password });
        res.json(resultado);
    }
    catch (error) {
        console.error("Error en login:", error);
        if (error.message === "Credenciales inválidas" ||
            error.message === "Usuario desactivado" ||
            error.message.includes("verificar tu correo electrónico")) {
            res.status(401).json({
                errors: [{ field: "general", message: error.message }],
            });
            return;
        }
        res.status(500).json({
            errors: [{ field: "general", message: "Error interno del servidor" }],
        });
    }
};
exports.loginHandler = loginHandler;
const registroHandler = async (req, res) => {
    try {
        const { email, nombre, rol } = req.body;
        if (!email || !nombre || !rol) {
            res.status(400).json({
                errors: [{ field: "general", message: "Email, nombre y rol son requeridos" }],
            });
            return;
        }
        if (!Object.values(client_1.RolUsuario).includes(rol)) {
            res.status(400).json({
                errors: [{ field: "rol", message: "Rol inválido" }],
            });
            return;
        }
        if (rol === client_1.RolUsuario.ADMIN) {
            res.status(400).json({
                errors: [{ field: "rol", message: "No se puede solicitar registro como ADMIN" }],
            });
            return;
        }
        const solicitud = await (0, authService_1.crearSolicitudRegistro)({ email, nombre, rol });
        res.status(201).json({
            message: "Solicitud de registro creada. Espera la aprobación del administrador.",
            solicitudId: solicitud.id,
        });
    }
    catch (error) {
        console.error("Error en registro:", error);
        if (error.message === "Ya existe un usuario registrado con este email" ||
            error.message === "Ya existe una solicitud pendiente para este email") {
            res.status(409).json({
                errors: [{ field: "email", message: error.message }],
            });
            return;
        }
        res.status(500).json({
            errors: [{ field: "general", message: "Error interno del servidor" }],
        });
    }
};
exports.registroHandler = registroHandler;
const verificarEmailHandler = async (req, res) => {
    try {
        const { token } = req.query;
        if (!token || typeof token !== "string") {
            res.status(400).json({
                errors: [{ field: "token", message: "Token de verificación requerido" }],
            });
            return;
        }
        const resultado = await (0, authService_1.verificarEmail)(token);
        res.json(resultado);
    }
    catch (error) {
        console.error("Error al verificar email:", error);
        if (error.message === "Token de verificación inválido o expirado" ||
            error.message === "El token de verificación ha expirado" ||
            error.message === "El correo ya ha sido verificado") {
            res.status(400).json({
                errors: [{ field: "token", message: error.message }],
            });
            return;
        }
        res.status(500).json({
            errors: [{ field: "general", message: "Error interno del servidor" }],
        });
    }
};
exports.verificarEmailHandler = verificarEmailHandler;
const reenviarVerificacionHandler = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({
                errors: [{ field: "email", message: "Email es requerido" }],
            });
            return;
        }
        const resultado = await (0, authService_1.reenviarVerificacion)(email);
        res.json(resultado);
    }
    catch (error) {
        console.error("Error al reenviar verificación:", error);
        if (error.message === "Usuario no encontrado" || error.message === "El usuario ya está verificado") {
            res.status(400).json({
                errors: [{ field: "email", message: error.message }],
            });
            return;
        }
        res.status(500).json({
            errors: [{ field: "general", message: "Error interno del servidor" }],
        });
    }
};
exports.reenviarVerificacionHandler = reenviarVerificacionHandler;
const obtenerSolicitudesHandler = async (req, res) => {
    try {
        console.log("obtenerSolicitudesHandler: Usuario autenticado:", req.usuario);
        const solicitudes = await (0, authService_1.obtenerSolicitudesPendientes)();
        console.log("Solicitudes encontradas:", solicitudes.length);
        res.json(solicitudes);
    }
    catch (error) {
        console.error("Error al obtener solicitudes:", error);
        res.status(500).json({
            errors: [{ field: "general", message: "Error interno del servidor" }],
        });
    }
};
exports.obtenerSolicitudesHandler = obtenerSolicitudesHandler;
const aprobarSolicitudHandler = async (req, res) => {
    try {
        const { solicitudId, password } = req.body;
        const adminId = req.usuario.userId;
        if (!solicitudId || !password) {
            res.status(400).json({
                errors: [{ field: "general", message: "ID de solicitud y contraseña son requeridos" }],
            });
            return;
        }
        const usuario = await (0, authService_1.aprobarSolicitud)(solicitudId, adminId, password);
        res.json({
            message: "Solicitud aprobada exitosamente. Se ha enviado un email de verificación al usuario.",
            usuario,
        });
    }
    catch (error) {
        console.error("Error al aprobar solicitud:", error);
        if (error.message === "Solicitud no encontrada" ||
            error.message === "Solicitud ya procesada" ||
            error.message === "Ya existe un usuario registrado con este email") {
            res.status(400).json({
                errors: [{ field: "general", message: error.message }],
            });
            return;
        }
        res.status(500).json({
            errors: [{ field: "general", message: "Error interno del servidor" }],
        });
    }
};
exports.aprobarSolicitudHandler = aprobarSolicitudHandler;
const rechazarSolicitudHandler = async (req, res) => {
    try {
        const { solicitudId, motivo } = req.body;
        const adminId = req.usuario.userId;
        if (!solicitudId) {
            res.status(400).json({
                errors: [{ field: "general", message: "ID de solicitud es requerido" }],
            });
            return;
        }
        await (0, authService_1.rechazarSolicitud)(solicitudId, adminId, motivo);
        res.json({
            message: "Solicitud rechazada exitosamente",
        });
    }
    catch (error) {
        console.error("Error al rechazar solicitud:", error);
        if (error.message === "Solicitud no encontrada" || error.message === "Solicitud ya procesada") {
            res.status(404).json({
                errors: [{ field: "general", message: error.message }],
            });
            return;
        }
        res.status(500).json({
            errors: [{ field: "general", message: "Error interno del servidor" }],
        });
    }
};
exports.rechazarSolicitudHandler = rechazarSolicitudHandler;
const perfilHandler = async (req, res) => {
    try {
        const usuario = req.usuario;
        res.json(usuario);
    }
    catch (error) {
        console.error("Error al obtener perfil:", error);
        res.status(500).json({
            errors: [{ field: "general", message: "Error interno del servidor" }],
        });
    }
};
exports.perfilHandler = perfilHandler;
const resetPasswordHandler = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({
                errors: [{ field: "email", message: "Email es requerido" }],
            });
            return;
        }
        const resultado = await (0, authService_2.solicitarRestablecimientoContrasena)(email);
        res.json(resultado);
    }
    catch (error) {
        console.error("Error al solicitar restablecimiento:", error);
        if (error.message === "Usuario no encontrado" || error.message === "Usuario desactivado") {
            res.status(400).json({
                errors: [{ field: "email", message: error.message }],
            });
            return;
        }
        res.status(500).json({
            errors: [{ field: "general", message: "Error interno del servidor" }],
        });
    }
};
exports.resetPasswordHandler = resetPasswordHandler;
const confirmResetPasswordHandler = async (req, res) => {
    try {
        const { token, password } = req.body;
        if (!token || !password) {
            res.status(400).json({
                errors: [{ field: "general", message: "Token y contraseña son requeridos" }],
            });
            return;
        }
        const resultado = await (0, authService_2.confirmarRestablecimientoContrasena)(token, password);
        res.json(resultado);
    }
    catch (error) {
        console.error("Error al confirmar restablecimiento:", error);
        if (error.message === "Token de restablecimiento inválido o expirado") {
            res.status(400).json({
                errors: [{ field: "token", message: error.message }],
            });
            return;
        }
        res.status(500).json({
            errors: [{ field: "general", message: "Error interno del servidor" }],
        });
    }
};
exports.confirmResetPasswordHandler = confirmResetPasswordHandler;
