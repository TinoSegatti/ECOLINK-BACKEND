"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const usuarioController_1 = require("../controllers/usuarioController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// Rutas específicas primero (sin parámetros)
router.get('/', authMiddleware_1.authenticateToken, authMiddleware_1.requireAdmin, usuarioController_1.obtenerUsuarios);
router.get('/estadisticas', authMiddleware_1.authenticateToken, authMiddleware_1.requireAdmin, usuarioController_1.obtenerEstadisticasUsuarios);
// Rutas con parámetros después
router.get('/:id', authMiddleware_1.authenticateToken, authMiddleware_1.requireAdmin, usuarioController_1.obtenerUsuarioPorId);
router.put('/:id', authMiddleware_1.authenticateToken, authMiddleware_1.requireAdmin, usuarioController_1.actualizarUsuario);
router.patch('/:id/estado', authMiddleware_1.authenticateToken, authMiddleware_1.requireAdmin, usuarioController_1.cambiarEstadoUsuario);
router.delete('/:id', authMiddleware_1.authenticateToken, authMiddleware_1.requireAdmin, usuarioController_1.eliminarUsuario);
// Rutas POST
router.post('/', authMiddleware_1.authenticateToken, authMiddleware_1.requireAdmin, usuarioController_1.crearUsuario);
exports.default = router;
