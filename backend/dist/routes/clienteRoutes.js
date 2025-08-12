"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const clienteController_1 = require("../controllers/clienteController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// Todas las rutas requieren autenticación
router.use(authMiddleware_1.authenticateToken);
// Rutas que requieren permisos de OPERADOR o ADMIN (crear/editar)
router.post("/clientes", authMiddleware_1.requireOperadorOrAdmin, clienteController_1.crearClienteHandler);
router.put("/clientes/:id", authMiddleware_1.requireOperadorOrAdmin, clienteController_1.actualizarClienteHandler);
router.delete("/clientes/:id", authMiddleware_1.requireOperadorOrAdmin, clienteController_1.eliminarClienteHandler);
// Rutas que permiten cualquier rol autenticado (leer)
router.get("/clientes", authMiddleware_1.requireAnyRole, clienteController_1.obtenerClientesHandler);
router.get("/clientes/:id", authMiddleware_1.requireAnyRole, clienteController_1.obtenerClientePorIdHandler);
exports.default = router;
