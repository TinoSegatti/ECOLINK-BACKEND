import express from 'express'
import { obtenerUsuarios, eliminarUsuario } from '../controllers/usuarioController'
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware'

const router = express.Router()

// Obtener todos los usuarios (solo admin)
router.get('/', authenticateToken, requireAdmin, obtenerUsuarios)

// Eliminar usuario (solo admin)
router.delete('/:id', authenticateToken, requireAdmin, eliminarUsuario)

export default router
