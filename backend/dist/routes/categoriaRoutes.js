"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const categoriaController_1 = require("../controllers/categoriaController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// Todas las rutas requieren autenticación
router.use(authMiddleware_1.authenticateToken);
// Rutas que permiten cualquier rol autenticado (leer)
router.get("/categorias", authMiddleware_1.requireAnyRole, categoriaController_1.getCategoriasHandler);
router.get("/categorias/todas", authMiddleware_1.requireAnyRole, categoriaController_1.getTodasLasCategoriasHandler);
// Rutas que requieren permisos de ADMIN (crear/editar/eliminar categorías)
router.post("/categorias", authMiddleware_1.requireAdmin, categoriaController_1.crearCategoriaHandler);
router.put("/categorias", authMiddleware_1.requireAdmin, categoriaController_1.actualizarCategoriaHandler);
router.delete("/categorias", authMiddleware_1.requireAdmin, categoriaController_1.eliminarCategoriaHandler);
exports.default = router;
