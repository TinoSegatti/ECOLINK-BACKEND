import type { Request, Response, NextFunction } from "express"

// Middleware de debug temporal para inspeccionar tokens
export const debugToken = (req: Request, res: Response, next: NextFunction): void => {
  console.log("🔍 DEBUG TOKEN - Headers completos:")
  console.log("Authorization:", req.headers.authorization)
  
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(" ")[1]
    console.log("🔍 DEBUG TOKEN - Token extraído:", token ? token.substring(0, 20) + "..." : "NO TOKEN")
    
    try {
      // Intentar decodificar el token sin verificar (solo para debug)
      const jwt = require('jsonwebtoken')
      const decoded = jwt.decode(token)
      console.log("🔍 DEBUG TOKEN - Token decodificado (sin verificar):", decoded)
      console.log("🔍 DEBUG TOKEN - Tipo de userId:", typeof decoded?.userId, "Valor:", decoded?.userId)
    } catch (error) {
      console.log("🔍 DEBUG TOKEN - Error al decodificar token:", error)
    }
  }
  
  next()
}
