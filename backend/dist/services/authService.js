"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.actualizarPerfilUsuario = exports.confirmarRestablecimientoContrasena = exports.solicitarRestablecimientoContrasena = exports.obtenerUsuarioPorId = exports.rechazarSolicitud = exports.reenviarVerificacion = exports.verificarEmail = exports.aprobarSolicitud = exports.obtenerSolicitudesPendientes = exports.crearSolicitudRegistro = exports.loginUsuario = exports.verifyToken = exports.generateToken = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const prisma = new client_1.PrismaClient();
// Configurar nodemailer con validación mejorada
const createTransport = () => {
    const smtpConfig = {
        host: process.env.SMTP_HOST,
        port: Number.parseInt(process.env.SMTP_PORT || "587"),
        secure: false, // true para puerto 465, false para otros puertos
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    };
    console.log("🔧 Configuración SMTP:", {
        host: smtpConfig.host,
        port: smtpConfig.port,
        user: smtpConfig.auth.user,
        passConfigured: !!smtpConfig.auth.pass,
    });
    // Validar que todas las variables estén configuradas
    if (!smtpConfig.host || !smtpConfig.auth.user || !smtpConfig.auth.pass) {
        console.error("❌ Variables SMTP faltantes:");
        console.error("SMTP_HOST:", !!process.env.SMTP_HOST);
        console.error("SMTP_USER:", !!process.env.SMTP_USER);
        console.error("SMTP_PASS:", !!process.env.SMTP_PASS);
        throw new Error("Configuración SMTP incompleta. Verifica las variables de entorno.");
    }
    return nodemailer_1.default.createTransport(smtpConfig);
};
// Generar JWT
const generateToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET || "fallback-secret", {
        expiresIn: "24h",
    });
};
exports.generateToken = generateToken;
// Verificar JWT
const verifyToken = (token) => {
    return jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "fallback-secret");
};
exports.verifyToken = verifyToken;
// Enviar email de verificación con manejo mejorado de errores
const enviarEmailVerificacion = async (email, nombre, token) => {
    try {
        console.log(`📧 Preparando email de verificación para: ${email}`);
        const transporter = createTransport();
        const verificationUrl = `${process.env.FRONTEND_URL || "http://localhost:3001"}/verificar-email?token=${token}`;
        console.log(`🔗 URL de verificación generada: ${verificationUrl}`);
        const mailOptions = {
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: email,
            subject: "Verificación de cuenta - ECOLINK",
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #7ac943;">¡Bienvenido a ECOLINK!</h2>
          <p>Hola <strong>${nombre}</strong>,</p>
          <p>Tu solicitud de registro ha sido aprobada. Para completar el proceso y activar tu cuenta, necesitas verificar tu dirección de correo electrónico.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #7ac943; color: white; padding: 12px 30Limites de caracteres alcanzados.
              Verificar mi cuenta
            </a>
          </div>
          <p><strong>Importante:</strong> Este enlace expirará en 24 horas por seguridad.</p>
          <p>Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:</p>
          <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            Si no solicitaste esta cuenta, puedes ignorar este email.
          </p>
        </div>
      `,
        };
        console.log(`📤 Enviando email a: ${email}`);
        await transporter.sendMail(mailOptions);
        console.log(`✅ Email de verificación enviado exitosamente a: ${email}`);
    }
    catch (error) {
        console.error("❌ Error detallado al enviar email:", error);
        // Si es un error de autenticación SMTP, dar más información
        if (error instanceof Error) {
            if (error.message.includes("Missing credentials") || error.message.includes("EAUTH")) {
                throw new Error("Error de configuración SMTP. Verifica las credenciales de email en las variables de entorno.");
            }
            throw new Error(`Error al enviar email: ${error.message}`);
        }
        throw new Error("Error desconocido al enviar email de verificación");
    }
};
// Login
const loginUsuario = async (data) => {
    try {
        const usuario = await prisma.usuario.findUnique({
            where: { email: data.email },
        });
        if (!usuario) {
            throw new Error("Credenciales inválidas");
        }
        if (!usuario.activo) {
            throw new Error("Usuario desactivado");
        }
        if (!usuario.verificado) {
            throw new Error("Debes verificar tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada.");
        }
        const passwordValida = await bcryptjs_1.default.compare(data.password, usuario.password);
        if (!passwordValida) {
            throw new Error("Credenciales inválidas");
        }
        const token = (0, exports.generateToken)({
            userId: usuario.id,
            email: usuario.email,
            rol: usuario.rol,
        });
        const { password, ...usuarioSinPassword } = usuario;
        return { usuario: usuarioSinPassword, token };
    }
    catch (error) {
        console.error("Error en login:", error);
        throw error;
    }
};
exports.loginUsuario = loginUsuario;
// Crear solicitud de registro
const crearSolicitudRegistro = async (data) => {
    try {
        // Verificar que no exista ya un usuario con ese email
        const usuarioExistente = await prisma.usuario.findUnique({
            where: { email: data.email },
        });
        if (usuarioExistente) {
            throw new Error("Ya existe un usuario registrado con este email");
        }
        // Verificar que no exista ya una solicitud pendiente
        const solicitudExistente = await prisma.solicitudRegistro.findFirst({
            where: {
                email: data.email,
                aprobada: false,
                rechazada: false,
            },
        });
        if (solicitudExistente) {
            throw new Error("Ya existe una solicitud pendiente para este email");
        }
        // Generar token de verificación
        const tokenVerificacion = crypto_1.default.randomBytes(32).toString("hex");
        const solicitud = await prisma.solicitudRegistro.create({
            data: {
                email: data.email,
                nombre: data.nombre,
                rol: data.rol,
                tokenVerificacion,
            },
        });
        return solicitud;
    }
    catch (error) {
        console.error("Error al crear solicitud:", error);
        throw error;
    }
};
exports.crearSolicitudRegistro = crearSolicitudRegistro;
// Obtener solicitudes pendientes (solo para ADMIN)
const obtenerSolicitudesPendientes = async () => {
    try {
        console.log("Buscando solicitudes pendientes en la base de datos...");
        const solicitudes = await prisma.solicitudRegistro.findMany({
            where: {
                aprobada: false,
                rechazada: false,
            },
            orderBy: { createdAt: "desc" },
        });
        console.log("Solicitudes encontradas:", solicitudes.length);
        return solicitudes;
    }
    catch (error) {
        console.error("Error al obtener solicitudes:", error);
        throw error;
    }
};
exports.obtenerSolicitudesPendientes = obtenerSolicitudesPendientes;
// Aprobar solicitud (solo para ADMIN) - CON MANEJO MEJORADO DE ERRORES
const aprobarSolicitud = async (solicitudId, adminId, password) => {
    try {
        console.log(`🔍 Buscando solicitud ID: ${solicitudId}`);
        const solicitud = await prisma.solicitudRegistro.findUnique({
            where: { id: solicitudId },
        });
        if (!solicitud) {
            throw new Error("Solicitud no encontrada");
        }
        console.log(`📋 Solicitud encontrada:`, {
            id: solicitud.id,
            email: solicitud.email,
            aprobada: solicitud.aprobada,
            rechazada: solicitud.rechazada,
        });
        if (solicitud.aprobada || solicitud.rechazada) {
            throw new Error("Solicitud ya procesada");
        }
        const usuarioExistente = await prisma.usuario.findUnique({
            where: { email: solicitud.email },
        });
        if (usuarioExistente) {
            throw new Error("Ya existe un usuario registrado con este email");
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const tokenVerificacion = crypto_1.default.randomBytes(32).toString("hex");
        const tokenExpiracion = new Date(Date.now() + 24 * 60 * 60 * 1000);
        console.log(`🔑 Token de verificación generado: ${tokenVerificacion}`);
        console.log(`⏰ Token expira en: ${tokenExpiracion}`);
        console.log(`👤 Creando usuario para: ${solicitud.email}`);
        const resultado = await prisma.$transaction(async (tx) => {
            const nuevoUsuario = await tx.usuario.create({
                data: {
                    email: solicitud.email,
                    nombre: solicitud.nombre,
                    rol: solicitud.rol,
                    password: hashedPassword,
                    verificado: false,
                    tokenVerificacion,
                    tokenExpiracion,
                },
            });
            console.log(`✅ Usuario creado en BD:`, {
                id: nuevoUsuario.id,
                email: nuevoUsuario.email,
                verificado: nuevoUsuario.verificado,
                tokenVerificacion: nuevoUsuario.tokenVerificacion,
                tokenExpiracion: nuevoUsuario.tokenExpiracion,
            });
            // Verificar que el token se guardó correctamente
            const usuarioGuardado = await tx.usuario.findUnique({
                where: { id: nuevoUsuario.id },
                select: { tokenVerificacion: true },
            });
            console.log(`🔍 Token almacenado en BD: ${usuarioGuardado?.tokenVerificacion}`);
            await tx.solicitudRegistro.update({
                where: { id: solicitudId },
                data: {
                    aprobada: true,
                    adminId,
                },
            });
            return nuevoUsuario;
        });
        console.log(`✅ Usuario creado exitosamente: ${resultado.email}`);
        // Enviar email de verificación
        try {
            await enviarEmailVerificacion(resultado.email, resultado.nombre, tokenVerificacion);
            console.log(`📧 Email de verificación enviado exitosamente`);
        }
        catch (emailError) {
            console.error("❌ Error al enviar email, pero usuario ya fue creado:", emailError);
            throw new Error(`Usuario creado pero falló el envío del email: ${emailError instanceof Error ? emailError.message : "Error desconocido"}`);
        }
        const { password: _, ...usuarioSinPassword } = resultado;
        return usuarioSinPassword;
    }
    catch (error) {
        console.error("❌ Error al aprobar solicitud:", error);
        throw error;
    }
};
exports.aprobarSolicitud = aprobarSolicitud;
// Verificar email con token - CON LOGGING MEJORADO
const verificarEmail = async (token) => {
    try {
        console.log(`🔍 Verificando token: ${token}`);
        const todosLosUsuarios = await prisma.usuario.findMany({
            where: {
                verificado: false,
                tokenVerificacion: {
                    not: null,
                },
            },
            select: {
                id: true,
                email: true,
                tokenVerificacion: true,
                tokenExpiracion: true,
                verificado: true,
            },
        });
        console.log(`📊 Usuarios no verificados en BD:`, todosLosUsuarios);
        const usuario = await prisma.usuario.findFirst({
            where: {
                tokenVerificacion: token,
                verificado: false,
            },
        });
        console.log(`👤 Usuario encontrado con token:`, usuario
            ? {
                id: usuario.id,
                email: usuario.email,
                verificado: usuario.verificado,
                tokenExpiracion: usuario.tokenExpiracion,
                tokenExpirado: usuario.tokenExpiracion ? new Date() > usuario.tokenExpiracion : "sin fecha",
            }
            : "No encontrado");
        if (!usuario) {
            const usuarioYaVerificado = await prisma.usuario.findFirst({
                where: {
                    tokenVerificacion: token,
                    verificado: true,
                },
            });
            if (usuarioYaVerificado) {
                const jwtToken = (0, exports.generateToken)({
                    userId: usuarioYaVerificado.id,
                    email: usuarioYaVerificado.email,
                    rol: usuarioYaVerificado.rol,
                });
                const { password, ...usuarioSinPassword } = usuarioYaVerificado;
                return {
                    usuario: usuarioSinPassword,
                    message: "El correo ya ha sido verificado. Sesión iniciada.",
                    token: jwtToken,
                };
            }
            console.error(`❌ No se encontró usuario con token: ${token}`);
            throw new Error("Token de verificación inválido o expirado");
        }
        if (usuario.tokenExpiracion && new Date() > usuario.tokenExpiracion) {
            console.error(`⏰ Token expirado. Expiraba en: ${usuario.tokenExpiracion}, ahora es: ${new Date()}`);
            throw new Error("El token de verificación ha expirado");
        }
        console.log(`✅ Token válido, actualizando usuario como verificado`);
        const usuarioVerificado = await prisma.usuario.update({
            where: { id: usuario.id },
            data: {
                verificado: true,
                tokenVerificacion: null,
                tokenExpiracion: null,
            },
        });
        console.log(`✅ Usuario verificado exitosamente:`, {
            id: usuarioVerificado.id,
            email: usuarioVerificado.email,
            verificado: usuarioVerificado.verificado,
        });
        const jwtToken = (0, exports.generateToken)({
            userId: usuarioVerificado.id,
            email: usuarioVerificado.email,
            rol: usuarioVerificado.rol,
        });
        const { password, ...usuarioSinPassword } = usuarioVerificado;
        return {
            usuario: usuarioSinPassword,
            message: "Email verificado exitosamente. Sesión iniciada.",
            token: jwtToken,
        };
    }
    catch (error) {
        console.error("❌ Error al verificar email:", error);
        throw error;
    }
};
exports.verificarEmail = verificarEmail;
// Reenviar email de verificación
const reenviarVerificacion = async (email) => {
    try {
        console.log(`🔄 Reenviando verificación para: ${email}`);
        const usuario = await prisma.usuario.findUnique({
            where: { email },
        });
        if (!usuario) {
            throw new Error("Usuario no encontrado");
        }
        if (usuario.verificado) {
            throw new Error("El usuario ya está verificado");
        }
        // Generar nuevo token
        const tokenVerificacion = crypto_1.default.randomBytes(32).toString("hex");
        const tokenExpiracion = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas
        console.log(`🔑 Nuevo token generado: ${tokenVerificacion}`);
        await prisma.usuario.update({
            where: { id: usuario.id },
            data: {
                tokenVerificacion,
                tokenExpiracion,
            },
        });
        // Enviar nuevo email
        await enviarEmailVerificacion(usuario.email, usuario.nombre, tokenVerificacion);
        return {
            message: "Email de verificación reenviado. Revisa tu bandeja de entrada.",
        };
    }
    catch (error) {
        console.error("Error al reenviar verificación:", error);
        throw error;
    }
};
exports.reenviarVerificacion = reenviarVerificacion;
// Rechazar solicitud (solo para ADMIN)
const rechazarSolicitud = async (solicitudId, adminId, motivo) => {
    try {
        const solicitud = await prisma.solicitudRegistro.findUnique({
            where: { id: solicitudId },
        });
        if (!solicitud) {
            throw new Error("Solicitud no encontrada");
        }
        if (solicitud.aprobada || solicitud.rechazada) {
            throw new Error("Solicitud ya procesada");
        }
        await prisma.solicitudRegistro.update({
            where: { id: solicitudId },
            data: {
                rechazada: true,
                motivoRechazo: motivo,
                adminId,
            },
        });
    }
    catch (error) {
        console.error("Error al rechazar solicitud:", error);
        throw error;
    }
};
exports.rechazarSolicitud = rechazarSolicitud;
// Obtener usuario por ID
const obtenerUsuarioPorId = async (id) => {
    try {
        const usuario = await prisma.usuario.findUnique({
            where: { id },
        });
        if (!usuario) {
            return null;
        }
        const { password, ...usuarioSinPassword } = usuario;
        return usuarioSinPassword;
    }
    catch (error) {
        console.error("Error al obtener usuario:", error);
        throw error;
    }
};
exports.obtenerUsuarioPorId = obtenerUsuarioPorId;
const enviarEmailRestablecimiento = async (email, nombre, token) => {
    try {
        console.log(`📧 Preparando email de restablecimiento para: ${email}`);
        const transporter = createTransport();
        const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3001"}/reset-password?token=${token}`;
        console.log(`🔗 URL de restablecimiento generada: ${resetUrl}`);
        const mailOptions = {
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: email,
            subject: "Restablecimiento de Contraseña - ECOLINK",
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #7ac943;">Restablecimiento de Contraseña</h2>
          <p>Hola <strong>${nombre}</strong>,</p>
          <p>Hemos recibido una solicitud para restablecer tu contraseña. Haz clic en el siguiente botón para establecer una nueva contraseña:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #7ac943; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">
              Restablecer Contraseña
            </a>
          </div>
          <p><strong>Importante:</strong> Este enlace expirará en 1 hora por seguridad.</p>
          <p>Si no solicitaste este cambio, puedes ignorar este email.</p>
          <p>Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
        </div>
      `,
        };
        console.log(`📤 Enviando email a: ${email}`);
        await transporter.sendMail(mailOptions);
        console.log(`✅ Email de restablecimiento enviado exitosamente a: ${email}`);
    }
    catch (error) {
        console.error("❌ Error al enviar email de restablecimiento:", error);
        throw new Error(`Error al enviar email: ${error instanceof Error ? error.message : "Error desconocido"}`);
    }
};
// Solicitar restablecimiento de contraseña
const solicitarRestablecimientoContrasena = async (email) => {
    try {
        console.log(`🔄 Procesando solicitud de restablecimiento para: ${email}`);
        const usuario = await prisma.usuario.findUnique({
            where: { email },
        });
        if (!usuario) {
            throw new Error("Usuario no encontrado");
        }
        if (!usuario.activo) {
            throw new Error("Usuario desactivado");
        }
        // Generar token de restablecimiento
        const tokenRestablecimiento = crypto_1.default.randomBytes(32).toString("hex");
        const tokenExpiracion = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
        console.log(`🔑 Token de restablecimiento generado: ${tokenRestablecimiento}`);
        await prisma.usuario.update({
            where: { id: usuario.id },
            data: {
                resetToken: tokenRestablecimiento,
                resetTokenExpiry: tokenExpiracion,
            },
        });
        // Enviar email
        await enviarEmailRestablecimiento(usuario.email, usuario.nombre, tokenRestablecimiento);
        return {
            message: "Enlace de restablecimiento enviado. Revisa tu bandeja de entrada.",
        };
    }
    catch (error) {
        console.error("Error al solicitar restablecimiento:", error);
        throw error;
    }
};
exports.solicitarRestablecimientoContrasena = solicitarRestablecimientoContrasena;
// Confirmar restablecimiento de contraseña
const confirmarRestablecimientoContrasena = async (token, newPassword) => {
    try {
        console.log(`🔍 Verificando token de restablecimiento: ${token}`);
        const usuario = await prisma.usuario.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: { gt: new Date() },
            },
        });
        if (!usuario) {
            throw new Error("Token de restablecimiento inválido o expirado");
        }
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        await prisma.usuario.update({
            where: { id: usuario.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null,
            },
        });
        console.log(`✅ Contraseña restablecida para: ${usuario.email}`);
        return {
            message: "Contraseña restablecida exitosamente",
        };
    }
    catch (error) {
        console.error("Error al confirmar restablecimiento:", error);
        throw error;
    }
};
exports.confirmarRestablecimientoContrasena = confirmarRestablecimientoContrasena;
// Actualizar perfil de usuario
const actualizarPerfilUsuario = async (userId, data) => {
    try {
        console.log("actualizarPerfilUsuario: Actualizando usuario ID:", userId, "con datos:", data);
        const usuarioActualizado = await prisma.usuario.update({
            where: { id: userId },
            data: {
                nombre: data.nombre,
                updatedAt: new Date(),
            },
        });
        console.log("Usuario actualizado en BD:", usuarioActualizado);
        const { password, ...usuarioSinPassword } = usuarioActualizado;
        return usuarioSinPassword;
    }
    catch (error) {
        console.error("Error al actualizar perfil en BD:", error);
        throw error;
    }
};
exports.actualizarPerfilUsuario = actualizarPerfilUsuario;
