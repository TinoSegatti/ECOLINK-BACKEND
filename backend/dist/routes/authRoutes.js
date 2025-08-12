"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// C:\ECOLINK\crud-clientes - v2.1\backend\src\routes\authRoutes.ts
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// Rutas públicas
router.post("/auth/login", authController_1.loginHandler);
router.post("/auth/registro", authController_1.registroHandler);
router.get("/auth/verificar-email", authController_1.verificarEmailHandler);
router.post("/auth/reenviar-verificacion", authController_1.reenviarVerificacionHandler);
router.post("/auth/reset-password", authController_1.resetPasswordHandler); // NUEVA RUTA
router.post("/auth/reset-password/confirm", authController_1.confirmResetPasswordHandler); // NUEVA RUTA
// Rutas protegidas
router.get("/auth/perfil", authMiddleware_1.authenticateToken, authController_1.perfilHandler);
// Rutas solo para ADMIN
router.get("/auth/solicitudes", authMiddleware_1.authenticateToken, authMiddleware_1.requireAdmin, authController_1.obtenerSolicitudesHandler);
router.post("/auth/aprobar-solicitud", authMiddleware_1.authenticateToken, authMiddleware_1.requireAdmin, authController_1.aprobarSolicitudHandler);
router.post("/auth/rechazar-solicitud", authMiddleware_1.authenticateToken, authMiddleware_1.requireAdmin, authController_1.rechazarSolicitudHandler);
exports.default = router;
