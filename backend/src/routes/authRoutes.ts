// C:\ECOLINK\crud-clientes - v2.1\backend\src\routes\authRoutes.ts
import express from "express"
import {
  loginHandler,
  registroHandler,
  verificarEmailHandler,
  reenviarVerificacionHandler,
  obtenerSolicitudesHandler,
  aprobarSolicitudHandler,
  rechazarSolicitudHandler,
  perfilHandler,
  resetPasswordHandler,
  confirmResetPasswordHandler,
} from "../controllers/authController"
import { authenticateToken, requireAdmin } from "../middleware/authMiddleware"

const router = express.Router()

// Rutas públicas
router.post("/auth/login", loginHandler)
router.post("/auth/registro", registroHandler)
router.get("/auth/verificar-email", verificarEmailHandler)
router.post("/auth/reenviar-verificacion", reenviarVerificacionHandler)
router.post("/auth/reset-password", resetPasswordHandler) // NUEVA RUTA
router.post("/auth/reset-password/confirm", confirmResetPasswordHandler) // NUEVA RUTA

// Rutas protegidas
router.get("/auth/perfil", authenticateToken, perfilHandler)

// Rutas solo para ADMIN
router.get("/auth/solicitudes", authenticateToken, requireAdmin, obtenerSolicitudesHandler)
router.post("/auth/aprobar-solicitud", authenticateToken, requireAdmin, aprobarSolicitudHandler)
router.post("/auth/rechazar-solicitud", authenticateToken, requireAdmin, rechazarSolicitudHandler)

export default router