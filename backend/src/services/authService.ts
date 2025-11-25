import { PrismaClient, type Usuario, type RolUsuario, type SolicitudRegistro } from "@prisma/client"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import crypto from "crypto"
import nodemailer from "nodemailer"

const prisma = new PrismaClient()

export interface LoginData {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  nombre: string
  rol: RolUsuario
}

export interface JWTPayload {
  userId: number
  email: string
  rol: RolUsuario
}

// Configurar nodemailer con validación mejorada y timeouts
const createTransport = () => {
  const port = Number.parseInt(process.env.SMTP_PORT || "587")
  const isSecure = port === 465
  const host = process.env.SMTP_HOST || "smtp.gmail.com"
  const isSendGrid = host.includes('sendgrid.net')

  // Usar tipo any para evitar problemas de tipado con TransportOptions
  const smtpConfig: any = {
    host: host,
    port: port,
    secure: isSecure, // true para puerto 465, false para otros puertos
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    // Configuración de timeouts optimizada
    connectionTimeout: isSendGrid ? 20000 : 30000, // SendGrid es más rápido
    socketTimeout: isSendGrid ? 20000 : 30000,
    greetingTimeout: isSendGrid ? 10000 : 15000,
    // Configuración TLS
    requireTLS: !isSecure, // Requerir TLS si no es conexión segura
    tls: {
      // Rechazar certificados no autorizados por seguridad
      rejectUnauthorized: true,
      // MinVersion para TLS 1.2 (más seguro y compatible)
      minVersion: 'TLSv1.2',
    },
    // Deshabilitar pool para evitar problemas de conexión persistente
    pool: false,
    // Configuración específica por servicio
    service: host.includes('gmail.com') ? 'gmail' : 
             host.includes('sendgrid.net') ? undefined : // SendGrid no necesita service
             undefined,
    // Deshabilitar keepalive para evitar problemas de conexión
    disableFileAccess: true,
    disableUrlAccess: true,
  }

  console.log("🔧 Configuración SMTP:", {
    host: smtpConfig.host,
    port: smtpConfig.port,
    user: smtpConfig.auth?.user,
    passConfigured: !!smtpConfig.auth?.pass,
    secure: smtpConfig.secure,
    connectionTimeout: smtpConfig.connectionTimeout,
    requireTLS: smtpConfig.requireTLS,
  })

  // Validar que todas las variables estén configuradas
  if (!smtpConfig.host || !smtpConfig.auth?.user || !smtpConfig.auth?.pass) {
    console.error("❌ Variables SMTP faltantes:")
    console.error("SMTP_HOST:", !!process.env.SMTP_HOST)
    console.error("SMTP_USER:", !!process.env.SMTP_USER)
    console.error("SMTP_PASS:", !!process.env.SMTP_PASS)
    throw new Error("Configuración SMTP incompleta. Verifica las variables de entorno.")
  }

  return nodemailer.createTransport(smtpConfig)
}

// Generar JWT
export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, process.env.JWT_SECRET || "fallback-secret", {
    expiresIn: "24h",
  })
}

// Verificar JWT
export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as JWTPayload
}

// Enviar email de verificación con manejo mejorado de errores
const enviarEmailVerificacion = async (email: string, nombre: string, token: string): Promise<void> => {
  try {
    console.log(`📧 Preparando email de verificación para: ${email}`);

    const transporter = createTransport();
    const verificationUrl = `${process.env.FRONTEND_URL || "https://ecolink-frontend-produccion.vercel.app"}/verificar-email?token=${token}`;

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
    }

    console.log(`📤 Enviando email a: ${email}`)
    await transporter.sendMail(mailOptions)
    console.log(`✅ Email de verificación enviado exitosamente a: ${email}`)
  } catch (error) {
    console.error("❌ Error detallado al enviar email:", error)

    // Si es un error de autenticación SMTP, dar más información
    if (error instanceof Error) {
      if (error.message.includes("Missing credentials") || error.message.includes("EAUTH")) {
        throw new Error("Error de configuración SMTP. Verifica las credenciales de email en las variables de entorno.")
      }
      throw new Error(`Error al enviar email: ${error.message}`)
    }

    throw new Error("Error desconocido al enviar email de verificación")
  }
}

// Login
export const loginUsuario = async (data: LoginData): Promise<{ usuario: Omit<Usuario, "password">; token: string }> => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { email: data.email },
    })

    if (!usuario) {
      throw new Error("Credenciales inválidas")
    }

    if (!usuario.activo) {
      throw new Error("Usuario desactivado")
    }

    if (!usuario.verificado) {
      throw new Error("Debes verificar tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada.")
    }

    const passwordValida = await bcrypt.compare(data.password, usuario.password)
    if (!passwordValida) {
      throw new Error("Credenciales inválidas")
    }

    const token = generateToken({
      userId: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
    })

    const { password, ...usuarioSinPassword } = usuario
    return { usuario: usuarioSinPassword, token }
  } catch (error: any) {
    console.error("Error en login:", error)
    throw error
  }
}

// Crear solicitud de registro
export const crearSolicitudRegistro = async (data: RegisterData): Promise<SolicitudRegistro> => {
  try {
    // Verificar que no exista ya un usuario con ese email
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email: data.email },
    })

    if (usuarioExistente) {
      throw new Error("Ya existe un usuario registrado con este email")
    }

    // Verificar que no exista YA NINGUNA solicitud con ese email (pendiente, aprobada o rechazada)
    const solicitudExistente = await prisma.solicitudRegistro.findUnique({
      where: { email: data.email },
    })

    if (solicitudExistente) {
      if (solicitudExistente.aprobada) {
        throw new Error("Ya existe una solicitud aprobada para este email. Contacta al administrador.")
      } else if (solicitudExistente.rechazada) {
        throw new Error("Ya existe una solicitud rechazada para este email. Contacta al administrador.")
      } else {
        throw new Error("Ya existe una solicitud pendiente para este email")
      }
    }

    // Generar token de verificación
    const tokenVerificacion = crypto.randomBytes(32).toString("hex")

    const solicitud = await prisma.solicitudRegistro.create({
      data: {
        email: data.email,
        nombre: data.nombre,
        rol: data.rol,
        tokenVerificacion,
      },
    })

    // ENVIAR EMAIL DE VERIFICACIÓN DE FORMA ASÍNCRONA (no bloquea el proceso)
    // Fire and forget: el email se envía en segundo plano sin bloquear la respuesta
    enviarEmailVerificacionSolicitud(data.email, data.nombre, tokenVerificacion)
      .then(() => {
        console.log(`✅ Email de verificación de solicitud enviado exitosamente a: ${data.email}`)
      })
      .catch((emailError) => {
        console.error("⚠️  Error al enviar email de verificación de solicitud (no crítico):", emailError)
        console.log("ℹ️  La solicitud se creó correctamente. El administrador puede aprobar la solicitud y el usuario puede verificar su email más tarde.")
        // El error de email NO afecta la creación de la solicitud
      })

    console.log(`✅ Solicitud de registro creada exitosamente (ID: ${solicitud.id})`)
    return solicitud
  } catch (error: any) {
    console.error("Error al crear solicitud:", error)
    throw error
  }
}

// Obtener solicitudes pendientes (solo para ADMIN)
export const obtenerSolicitudesPendientes = async (): Promise<SolicitudRegistro[]> => {
  try {
    console.log("🔍 Buscando solicitudes pendientes en la base de datos...")
    
    // Buscar todas las solicitudes para debug
    const todasLasSolicitudes = await prisma.solicitudRegistro.findMany({
      orderBy: { createdAt: "desc" },
    });
    console.log("📊 Total de solicitudes en BD:", todasLasSolicitudes.length);
    
    const solicitudes = await prisma.solicitudRegistro.findMany({
      where: {
        aprobada: false,
        rechazada: false,
      },
      orderBy: { createdAt: "desc" },
    })
    
    console.log("✅ Solicitudes pendientes encontradas:", solicitudes.length);
    console.log("📋 Detalles de solicitudes pendientes:", solicitudes.map(s => ({
      id: s.id,
      email: s.email,
      nombre: s.nombre,
      rol: s.rol,
      emailVerificado: s.emailVerificado,
      aprobada: s.aprobada,
      rechazada: s.rechazada,
      createdAt: s.createdAt
    })));
    
    return solicitudes
  } catch (error: any) {
    console.error("❌ Error al obtener solicitudes:", error)
    throw error
  }
}

// Aprobar solicitud (solo para ADMIN) - MODIFICADO PARA NUEVO FLUJO
export const aprobarSolicitud = async (solicitudId: number, adminId: number, password: string): Promise<Usuario> => {
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

    // VERIFICAR QUE EL EMAIL YA HAYA SIDO VERIFICADO
    if (!solicitud.emailVerificado) {
      throw new Error("El email de la solicitud debe estar verificado antes de aprobar");
    }

    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email: solicitud.email },
    });

    if (usuarioExistente) {
      throw new Error("Ya existe un usuario registrado con este email");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    console.log(`👤 Creando usuario para: ${solicitud.email}`);

    const resultado = await prisma.$transaction(async (tx) => {
      const nuevoUsuario = await tx.usuario.create({
        data: {
          email: solicitud.email,
          nombre: solicitud.nombre,
          rol: solicitud.rol,
          password: hashedPassword,
          verificado: true, // Ya está verificado por email
          tokenVerificacion: null, // No necesita token de verificación
          tokenExpiracion: null,
        },
      });

      console.log(`✅ Usuario creado en BD:`, {
        id: nuevoUsuario.id,
        email: nuevoUsuario.email,
        verificado: nuevoUsuario.verificado,
      });

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

    const { password: _, ...usuarioSinPassword } = resultado;
    return usuarioSinPassword as Usuario;
  } catch (error: any) {
    console.error("❌ Error al aprobar solicitud:", error);
    throw error;
  }
};

// Verificar email con token - CON LOGGING MEJORADO
export const verificarEmail = async (
  token: string,
): Promise<{ usuario: Omit<Usuario, "password">; message: string; token: string }> => {
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

    console.log(
      `👤 Usuario encontrado con token:`,
      usuario
        ? {
            id: usuario.id,
            email: usuario.email,
            verificado: usuario.verificado,
            tokenExpiracion: usuario.tokenExpiracion,
            tokenExpirado: usuario.tokenExpiracion ? new Date() > usuario.tokenExpiracion : "sin fecha",
          }
        : "No encontrado",
    );

    if (!usuario) {
      const usuarioYaVerificado = await prisma.usuario.findFirst({
        where: {
          tokenVerificacion: token,
          verificado: true,
        },
      });
      if (usuarioYaVerificado) {
        const jwtToken = generateToken({
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

    const jwtToken = generateToken({
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
  } catch (error: any) {
    console.error("❌ Error al verificar email:", error);
    throw error;
  }
};

// Reenviar email de verificación
export const reenviarVerificacion = async (email: string): Promise<{ message: string }> => {
  try {
    console.log(`🔄 Reenviando verificación para: ${email}`)

    const usuario = await prisma.usuario.findUnique({
      where: { email },
    })

    if (!usuario) {
      throw new Error("Usuario no encontrado")
    }

    if (usuario.verificado) {
      throw new Error("El usuario ya está verificado")
    }

    // Generar nuevo token
    const tokenVerificacion = crypto.randomBytes(32).toString("hex")
    const tokenExpiracion = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas

    console.log(`🔑 Nuevo token generado: ${tokenVerificacion}`)

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        tokenVerificacion,
        tokenExpiracion,
      },
    })

    // Enviar nuevo email
    await enviarEmailVerificacion(usuario.email, usuario.nombre, tokenVerificacion)

    return {
      message: "Email de verificación reenviado. Revisa tu bandeja de entrada.",
    }
  } catch (error: any) {
    console.error("Error al reenviar verificación:", error)
    throw error
  }
}

// Rechazar solicitud (solo para ADMIN)
export const rechazarSolicitud = async (solicitudId: number, adminId: number, motivo?: string): Promise<void> => {
  try {
    const solicitud = await prisma.solicitudRegistro.findUnique({
      where: { id: solicitudId },
    })

    if (!solicitud) {
      throw new Error("Solicitud no encontrada")
    }

    if (solicitud.aprobada || solicitud.rechazada) {
      throw new Error("Solicitud ya procesada")
    }

    await prisma.solicitudRegistro.update({
      where: { id: solicitudId },
      data: {
        rechazada: true,
        motivoRechazo: motivo,
        adminId,
      },
    })
  } catch (error: any) {
    console.error("Error al rechazar solicitud:", error)
    throw error
  }
}

// Obtener usuario por ID - MOVIDO A UsuarioService
// export const obtenerUsuarioPorId = async (id: number): Promise<Omit<Usuario, "password"> | null> => {
//   try {
//     const usuario = await prisma.usuario.findUnique({
//       where: { id },
//     })

//     if (!usuario) {
//       return null
//     }

//     const { password, ...usuarioSinPassword } = usuario
//     return usuarioSinPassword
//   } catch (error: any) {
//     console.error("Error al obtener usuario:", error)
//     throw error
//   }
// }
const enviarEmailRestablecimiento = async (email: string, nombre: string, token: string): Promise<void> => {
  try {
    console.log(`📧 Preparando email de restablecimiento para: ${email}`)
    const transporter = createTransport()
    const resetUrl = `${process.env.FRONTEND_URL || "https://ecolink-frontend-produccion.vercel.app"}/reset-password?token=${token}`

    console.log(`🔗 URL de restablecimiento generada: ${resetUrl}`)

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
    }

    console.log(`📤 Enviando email a: ${email}`)
    await transporter.sendMail(mailOptions)
    console.log(`✅ Email de restablecimiento enviado exitosamente a: ${email}`)
  } catch (error) {
    console.error("❌ Error al enviar email de restablecimiento:", error)
    throw new Error(`Error al enviar email: ${error instanceof Error ? error.message : "Error desconocido"}`)
  }
}

// Solicitar restablecimiento de contraseña
export const solicitarRestablecimientoContrasena = async (email: string): Promise<{ message: string }> => {
  try {
    console.log(`🔄 Procesando solicitud de restablecimiento para: ${email}`)

    const usuario = await prisma.usuario.findUnique({
      where: { email },
    })

    if (!usuario) {
      throw new Error("Usuario no encontrado")
    }

    if (!usuario.activo) {
      throw new Error("Usuario desactivado")
    }

    // Generar token de restablecimiento
    const tokenRestablecimiento = crypto.randomBytes(32).toString("hex")
    const tokenExpiracion = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

    console.log(`🔑 Token de restablecimiento generado: ${tokenRestablecimiento}`)

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        resetToken: tokenRestablecimiento,
        resetTokenExpiry: tokenExpiracion,
      },
    })

    // Enviar email
    await enviarEmailRestablecimiento(usuario.email, usuario.nombre, tokenRestablecimiento)

    return {
      message: "Enlace de restablecimiento enviado. Revisa tu bandeja de entrada.",
    }
  } catch (error: any) {
    console.error("Error al solicitar restablecimiento:", error)
    throw error
  }
}

// Confirmar restablecimiento de contraseña
export const confirmarRestablecimientoContrasena = async (
  token: string,
  newPassword: string,
): Promise<{ message: string }> => {
  try {
    console.log(`🔍 Verificando token de restablecimiento: ${token}`)

    const usuario = await prisma.usuario.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
    })

    if (!usuario) {
      throw new Error("Token de restablecimiento inválido o expirado")
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    })

    console.log(`✅ Contraseña restablecida para: ${usuario.email}`)

    return {
      message: "Contraseña restablecida exitosamente",
    }
  } catch (error: any) {
    console.error("Error al confirmar restablecimiento:", error)
    throw error
  }
}
// Actualizar perfil de usuario - MOVIDO A UsuarioService
// export const actualizarPerfilUsuario = async (
//   userId: number,
//   data: { nombre: string },
// ): Promise<Omit<Usuario, "password">> => {
//   try {
//     console.log("actualizarPerfilUsuario: Actualizando usuario ID:", userId, "con datos:", data)

//     const usuarioActualizado = await prisma.usuario.update({
//       where: { id: userId },
//       data: {
//         nombre: data.nombre,
//         updatedAt: new Date(),
//       },
//     })

//     console.log("Usuario actualizado en BD:", usuarioActualizado)
//     const { password, ...usuarioSinPassword } = usuarioActualizado
//     return usuarioSinPassword
//   } catch (error: any) {
//     console.error("Error al actualizar perfil en BD:", error)
//     throw error
//   }
// }

// NUEVA FUNCIÓN: Verificar email de solicitud (no de usuario)
export const verificarEmailSolicitud = async (
  token: string,
): Promise<{ solicitud: SolicitudRegistro; message: string }> => {
  try {
    console.log(`🔍 Verificando token de solicitud: ${token}`);

    // Buscar todas las solicitudes con este token para debug
    const todasLasSolicitudes = await prisma.solicitudRegistro.findMany({
      where: {
        tokenVerificacion: token,
      },
    });
    console.log(`🔍 Solicitudes encontradas con este token:`, todasLasSolicitudes.length);

    const solicitud = await prisma.solicitudRegistro.findFirst({
      where: {
        tokenVerificacion: token,
        aprobada: false,
        rechazada: false,
      },
    });

    if (!solicitud) {
      // Buscar si existe una solicitud con este token pero ya procesada
      const solicitudProcesada = await prisma.solicitudRegistro.findFirst({
        where: {
          tokenVerificacion: token,
        },
      });
      
      if (solicitudProcesada) {
        console.log(`❌ Solicitud encontrada pero ya procesada:`, {
          id: solicitudProcesada.id,
          email: solicitudProcesada.email,
          aprobada: solicitudProcesada.aprobada,
          rechazada: solicitudProcesada.rechazada,
          emailVerificado: solicitudProcesada.emailVerificado,
        });
        throw new Error("Solicitud ya procesada");
      } else {
        console.log(`❌ No se encontró solicitud con este token: ${token}`);
        throw new Error("Token de verificación inválido");
      }
    }

    console.log(`✅ Solicitud encontrada, marcando email como verificado`);

    const solicitudActualizada = await prisma.solicitudRegistro.update({
      where: { id: solicitud.id },
      data: {
        emailVerificado: true,
        // NO limpiar el tokenVerificacion aquí - se mantiene hasta que se apruebe/rechace la solicitud
      },
    });

    console.log(`✅ Email de solicitud verificado exitosamente:`, {
      id: solicitudActualizada.id,
      email: solicitudActualizada.email,
      emailVerificado: solicitudActualizada.emailVerificado,
    });

    return {
      solicitud: solicitudActualizada,
      message: "Email verificado exitosamente. Tu solicitud está pendiente de aprobación por el administrador.",
    };
  } catch (error: any) {
    console.error("❌ Error al verificar email de solicitud:", error);
    throw error;
  }
};

// NUEVA FUNCIÓN: Enviar email de verificación de solicitud con reintentos
const enviarEmailVerificacionSolicitud = async (email: string, nombre: string, token: string): Promise<void> => {
  const maxRetries = 3
  const retryDelay = 2000 // 2 segundos entre reintentos

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📧 Preparando email de verificación de solicitud para: ${email} (Intento ${attempt}/${maxRetries})`);

      const transporter = createTransport();
      
      // Verificar conexión antes de enviar con timeout más corto
      try {
        console.log(`🔍 Verificando conexión SMTP a ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}...`)
        const verifyPromise = transporter.verify()
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout en verificación SMTP (30s)')), 30000)
        )
        await Promise.race([verifyPromise, timeoutPromise])
        console.log(`✅ Conexión SMTP verificada exitosamente`)
      } catch (verifyError: any) {
        const errorMsg = verifyError.message || String(verifyError)
        console.error(`❌ Error al verificar conexión SMTP:`, errorMsg)
        console.error(`📋 Detalles del error:`, {
          code: verifyError.code,
          command: verifyError.command,
          response: verifyError.response,
          responseCode: verifyError.responseCode,
        })
        
        // Diagnóstico adicional
        if (errorMsg.includes('timeout') || errorMsg.includes('ETIMEDOUT')) {
          console.error(`⚠️  Posibles causas del timeout:`)
          console.error(`   1. Render puede estar bloqueando conexiones salientes a Gmail`)
          console.error(`   2. Gmail puede estar bloqueando la IP de Render`)
          console.error(`   3. Firewall o restricciones de red en Render`)
          console.error(`   4. El App Password de Gmail puede estar incorrecto o expirado`)
        }
        
        if (attempt < maxRetries) {
          console.log(`⏳ Reintentando en ${retryDelay}ms...`)
          await new Promise(resolve => setTimeout(resolve, retryDelay))
          continue
        }
        throw new Error(`No se pudo establecer conexión con el servidor SMTP: ${errorMsg}`)
      }

      const verificationUrl = `${process.env.FRONTEND_URL || "https://ecolink-frontend-produccion.vercel.app"}/verificar-solicitud?token=${token}`;

      console.log(`🔗 URL de verificación de solicitud generada: ${verificationUrl}`);

      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        subject: "Verificación de Solicitud de Registro - ECOLINK",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #7ac943;">¡Solicitud de Registro Recibida!</h2>
            <p>Hola <strong>${nombre}</strong>,</p>
            <p>Hemos recibido tu solicitud de registro en ECOLINK. Para continuar con el proceso, necesitas verificar tu dirección de correo electrónico.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background-color: #7ac943; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">
                Verificar mi Email
              </a>
            </div>
            <p><strong>Importante:</strong> Este enlace expirará en 24 horas por seguridad.</p>
            <p>Una vez verificado tu email, tu solicitud será revisada por un administrador quien te asignará una contraseña.</p>
            <p>Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:</p>
            <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">
              Si no solicitaste este registro, puedes ignorar este email.
            </p>
          </div>
        `,
      }

      console.log(`📤 Enviando email de verificación de solicitud a: ${email}`)
      await transporter.sendMail(mailOptions)
      console.log(`✅ Email de verificación de solicitud enviado exitosamente a: ${email}`)
      return // Éxito, salir de la función
    } catch (error) {
      console.error(`❌ Error detallado al enviar email de verificación de solicitud (Intento ${attempt}/${maxRetries}):`, error)

      // Si es el último intento, lanzar el error
      if (attempt === maxRetries) {
        if (error instanceof Error) {
          if (error.message.includes("Missing credentials") || error.message.includes("EAUTH")) {
            throw new Error("Error de configuración SMTP. Verifica las credenciales de email en las variables de entorno.")
          }
          if (error.message.includes("ETIMEDOUT") || error.message.includes("timeout")) {
            throw new Error(`Error de conexión SMTP: Timeout al conectar con el servidor. Verifica que el servidor SMTP esté accesible y que las variables de entorno estén correctamente configuradas.`)
          }
          throw new Error(`Error al enviar email: ${error.message}`)
        }
        throw new Error("Error desconocido al enviar email de verificación de solicitud")
      }

      // Esperar antes del siguiente intento
      console.log(`⏳ Reintentando en ${retryDelay}ms...`)
      await new Promise(resolve => setTimeout(resolve, retryDelay))
    }
  }
}
