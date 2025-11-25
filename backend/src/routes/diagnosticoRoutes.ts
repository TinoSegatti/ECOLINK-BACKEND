import { Router, Request, Response, NextFunction } from "express"
import { testSMTPHandler } from "../controllers/diagnosticoController"

const router = Router()

// Middleware de logging para diagnóstico
router.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`🔍 [DIAGNOSTICO] Ruta accedida: ${req.method} ${req.path}`)
  console.log(`🔍 [DIAGNOSTICO] Query params:`, req.query)
  next()
})

// Ruta para diagnosticar conexión SMTP (PÚBLICA - NO requiere autenticación)
// GET /api/diagnostico/smtp - Diagnóstico básico
// GET /api/diagnostico/smtp?sendTest=true - Diagnóstico completo con envío de email
router.get("/smtp", testSMTPHandler)

export default router

