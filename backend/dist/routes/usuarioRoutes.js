"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const usuarioController_1 = require("../controllers/usuarioController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// Obtener todos los usuarios (solo admin)
router.get('/', authMiddleware_1.authenticateToken, authMiddleware_1.requireAdmin, usuarioController_1.obtenerUsuarios);
// Obtener estadísticas de usuarios (solo admin)
router.get('/estadisticas', authMiddleware_1.authenticateToken, authMiddleware_1.requireAdmin, usuarioController_1.obtenerEstadisticasUsuarios);
// Obtener usuario por ID (solo admin)
router.get('/:id', authMiddleware_1.authenticateToken, authMiddleware_1.requireAdmin, usuarioController_1.obtenerUsuarioPorId);
// Crear nuevo usuario (solo admin)
router.post('/', authMiddleware_1.authenticateToken, authMiddleware_1.requireAdmin, usuarioController_1.crearUsuario);
// Actualizar usuario (solo admin)
router.put('/:id', authMiddleware_1.authenticateToken, authMiddleware_1.requireAdmin, usuarioController_1.actualizarUsuario);
// Cambiar estado activo/inactivo del usuario (solo admin)
router.patch('/:id/estado', authMiddleware_1.authenticateToken, authMiddleware_1.requireAdmin, usuarioController_1.cambiarEstadoUsuario);
// Eliminar usuario (solo admin)
router.delete('/:id', authMiddleware_1.authenticateToken, authMiddleware_1.requireAdmin, usuarioController_1.eliminarUsuario);
exports.default = router;
