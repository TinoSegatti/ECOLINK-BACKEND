import type { Request, Response, NextFunction } from "express"
import { verifyToken, obtenerUsuarioPorId } from "../services/authService"
import { RolUsuario } from "@prisma/client"

// Extender el tipo Request para incluir usuario
declare global {
  namespace Express {
    interface Request {
      usuario?: {
        userId: number
        email: string
        rol: RolUsuario
      }
    }
  }
}

// Middleware de autenticación
export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(" ")[1] // Bearer TOKEN

    console.log("authenticateToken: Token recibido:", !!token)

    if (!token) {
      console.log("authenticateToken: No hay token")
      res.status(401).json({
        errors: [{ field: "auth", message: "Token de acceso requerido" }],
      })
      return
    }

    const decoded = verifyToken(token)
    console.log("authenticateToken: Token decodificado:", decoded)

    // Verificar que el usuario aún existe y está activo
    const usuario = await obtenerUsuarioPorId(decoded.userId)
    console.log("authenticateToken: Usuario encontrado:", !!usuario)

    if (!usuario || !usuario.activo) {
      console.log("authenticateToken: Usuario no válido o inactivo")
      res.status(401).json({
        errors: [{ field: "auth", message: "Token inválido o usuario desactivado" }],
      })
      return
    }

    req.usuario = decoded
    console.log("authenticateToken: Usuario autenticado exitosamente")
    next()
  } catch (error: any) {
    console.error("Error en autenticación:", error)
    res.status(401).json({
      errors: [{ field: "auth", message: "Token inválido" }],
    })
  }
}

// Middleware de autorización por roles
export const requireRole = (rolesPermitidos: RolUsuario[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.usuario) {
      res.status(401).json({
        errors: [{ field: "auth", message: "Usuario no autenticado" }],
      })
      return
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      res.status(403).json({
        errors: [{ field: "auth", message: "No tienes permisos para realizar esta acción" }],
      })
      return
    }

    next()
  }
}

// Middleware específicos para cada tipo de usuario
export const requireAdmin = requireRole([RolUsuario.ADMIN])
export const requireOperadorOrAdmin = requireRole([RolUsuario.ADMIN, RolUsuario.OPERADOR])
export const requireAnyRole = requireRole([RolUsuario.ADMIN, RolUsuario.OPERADOR, RolUsuario.LECTOR])
