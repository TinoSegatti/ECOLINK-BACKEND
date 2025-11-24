import type { Request, Response } from "express"
import {
  loginUsuario,
  crearSolicitudRegistro,
  obtenerSolicitudesPendientes,
  aprobarSolicitud,
  rechazarSolicitud,
  verificarEmail,
  reenviarVerificacion,
  verificarEmailSolicitud, // NUEVA IMPORTACIÓN
} from "../services/authService"
import { solicitarRestablecimientoContrasena, confirmarRestablecimientoContrasena } from "../services/authService"
import { RolUsuario } from "@prisma/client"

export const loginHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      res.status(400).json({
        errors: [{ field: "general", message: "Email y contraseña son requeridos" }],
      })
      return
    }

    const resultado = await loginUsuario({ email, password })
    res.json(resultado)
  } catch (error: any) {
    console.error("Error en login:", error)
    if (
      error.message === "Credenciales inválidas" ||
      error.message === "Usuario desactivado" ||
      error.message.includes("verificar tu correo electrónico")
    ) {
      res.status(401).json({
        errors: [{ field: "general", message: error.message }],
      })
      return
    }
    res.status(500).json({
      errors: [{ field: "general", message: "Error interno del servidor" }],
    })
  }
}

export const registroHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, nombre, rol } = req.body

    if (!email || !nombre || !rol) {
      res.status(400).json({
        errors: [{ field: "general", message: "Email, nombre y rol son requeridos" }],
      })
      return
    }

    if (!Object.values(RolUsuario).includes(rol)) {
      res.status(400).json({
        errors: [{ field: "rol", message: "Rol inválido" }],
      })
      return
    }

    if (rol === RolUsuario.ADMIN) {
      res.status(400).json({
        errors: [{ field: "rol", message: "No se puede solicitar registro como ADMIN" }],
      })
      return
    }

    const solicitud = await crearSolicitudRegistro({ email, nombre, rol })
    res.status(201).json({
      message: "Solicitud de registro creada exitosamente. Revisa tu correo electrónico para verificar tu email. Una vez verificado, espera la aprobación del administrador.",
      solicitudId: solicitud.id,
      email: solicitud.email,
      nota: "Si no recibes el email de verificación, contacta al administrador para que pueda aprobar tu solicitud manualmente.",
    })
  } catch (error: any) {
    console.error("Error en registro:", error)
    if (
      error.message === "Ya existe un usuario registrado con este email" ||
      error.message === "Ya existe una solicitud pendiente para este email"
    ) {
      res.status(409).json({
        errors: [{ field: "email", message: error.message }],
      })
      return
    }
    res.status(500).json({
      errors: [{ field: "general", message: "Error interno del servidor" }],
    })
  }
}

export const verificarEmailHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== "string") {
      res.status(400).json({
        errors: [{ field: "token", message: "Token de verificación requerido" }],
      });
      return;
    }

    const resultado = await verificarEmail(token);
    res.json(resultado);
  } catch (error: any) {
    console.error("Error al verificar email:", error);
    if (
      error.message === "Token de verificación inválido o expirado" ||
      error.message === "El token de verificación ha expirado" ||
      error.message === "El correo ya ha sido verificado"
    ) {
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

export const reenviarVerificacionHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body

    if (!email) {
      res.status(400).json({
        errors: [{ field: "email", message: "Email es requerido" }],
      })
      return
    }

    const resultado = await reenviarVerificacion(email)
    res.json(resultado)
  } catch (error: any) {
    console.error("Error al reenviar verificación:", error)
    if (error.message === "Usuario no encontrado" || error.message === "El usuario ya está verificado") {
      res.status(400).json({
        errors: [{ field: "email", message: error.message }],
      })
      return
    }
    res.status(500).json({
      errors: [{ field: "general", message: "Error interno del servidor" }],
    })
  }
}

export const obtenerSolicitudesHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("🔍 obtenerSolicitudesHandler: Usuario autenticado:", (req as any).usuario)
    
    const solicitudes = await obtenerSolicitudesPendientes()
    console.log("📊 Solicitudes obtenidas del servicio:", solicitudes.length)
    
    // Log de la respuesta que se envía al frontend
    console.log("📤 Enviando respuesta al frontend:", {
      status: 200,
      count: solicitudes.length,
      data: solicitudes.map(s => ({
        id: s.id,
        email: s.email,
        nombre: s.nombre,
        rol: s.rol,
        emailVerificado: s.emailVerificado
      }))
    });
    
    res.json(solicitudes)
  } catch (error: any) {
    console.error("❌ Error al obtener solicitudes:", error)
    res.status(500).json({
      errors: [{ field: "general", message: "Error interno del servidor" }],
    })
  }
}

export const aprobarSolicitudHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { solicitudId, password } = req.body
    const adminId = (req as any).usuario.userId

    if (!solicitudId || !password) {
      res.status(400).json({
        errors: [{ field: "general", message: "ID de solicitud y contraseña son requeridos" }],
      })
      return
    }

    const usuario = await aprobarSolicitud(solicitudId, adminId, password)
    res.json({
      message: "Solicitud aprobada exitosamente. El usuario ya puede iniciar sesión con su email y la contraseña asignada.",
      usuario,
    })
  } catch (error: any) {
    console.error("Error al aprobar solicitud:", error)
    if (
      error.message === "Solicitud no encontrada" ||
      error.message === "Solicitud ya procesada" ||
      error.message === "Ya existe un usuario registrado con este email" ||
      error.message === "El email de la solicitud debe estar verificado antes de aprobar" // NUEVO ERROR
    ) {
      res.status(400).json({
        errors: [{ field: "general", message: error.message }],
      })
      return
    }
    res.status(500).json({
      errors: [{ field: "general", message: "Error interno del servidor" }],
    })
  }
}

export const rechazarSolicitudHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { solicitudId, motivo } = req.body
    const adminId = (req as any).usuario.userId

    if (!solicitudId) {
      res.status(400).json({
        errors: [{ field: "general", message: "ID de solicitud es requerido" }],
      })
      return
    }

    await rechazarSolicitud(solicitudId, adminId, motivo)
    res.json({
      message: "Solicitud rechazada exitosamente",
    })
  } catch (error: any) {
    console.error("Error al rechazar solicitud:", error)
    if (error.message === "Solicitud no encontrada" || error.message === "Solicitud ya procesada") {
      res.status(404).json({
        errors: [{ field: "general", message: error.message }],
      })
      return
    }
    res.status(500).json({
      errors: [{ field: "general", message: "Error interno del servidor" }],
    })
  }
}

export const perfilHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const usuario = (req as any).usuario
    res.json(usuario)
  } catch (error: any) {
    console.error("Error al obtener perfil:", error)
    res.status(500).json({
      errors: [{ field: "general", message: "Error interno del servidor" }],
    })
  }
}

export const resetPasswordHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body

    if (!email) {
      res.status(400).json({
        errors: [{ field: "email", message: "Email es requerido" }],
      })
      return
    }

    const resultado = await solicitarRestablecimientoContrasena(email)
    res.json(resultado)
  } catch (error: any) {
    console.error("Error al solicitar restablecimiento:", error)
    if (error.message === "Usuario no encontrado" || error.message === "Usuario desactivado") {
      res.status(400).json({
        errors: [{ field: "email", message: error.message }],
      })
      return
    }
    res.status(500).json({
      errors: [{ field: "general", message: "Error interno del servidor" }],
    })
  }
}

export const confirmResetPasswordHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, password } = req.body

    if (!token || !password) {
      res.status(400).json({
        errors: [{ field: "general", message: "Token y contraseña son requeridos" }],
      })
      return
    }

    const resultado = await confirmarRestablecimientoContrasena(token, password)
    res.json(resultado)
  } catch (error: any) {
    console.error("Error al confirmar restablecimiento:", error)
    if (error.message === "Token de restablecimiento inválido o expirado") {
      res.status(400).json({
        errors: [{ field: "token", message: error.message }],
      })
      return
    }
    res.status(500).json({
      errors: [{ field: "general", message: "Error interno del servidor" }],
    })
  }
}

// NUEVO CONTROLADOR: Verificar email de solicitud
export const verificarSolicitudHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== "string") {
      res.status(400).json({
        errors: [{ field: "token", message: "Token de verificación requerido" }],
      });
      return;
    }

    const resultado = await verificarEmailSolicitud(token);
    res.json(resultado);
  } catch (error: any) {
    console.error("Error al verificar email de solicitud:", error);
    if (
      error.message === "Token de verificación inválido o solicitud ya procesada"
    ) {
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


