import { Router } from "express"
import { testSMTPHandler } from "../controllers/diagnosticoController"

const router = Router()

// Ruta para diagnosticar conexión SMTP
// GET /api/diagnostico/smtp - Diagnóstico básico
// GET /api/diagnostico/smtp?sendTest=true - Diagnóstico completo con envío de email
router.get("/smtp", testSMTPHandler)

export default router

