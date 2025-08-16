import express from 'express'
import { 
  obtenerUsuarios, 
  obtenerUsuarioPorId,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  cambiarEstadoUsuario,
  obtenerEstadisticasUsuarios
} from '../controllers/usuarioController'
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware'

const router = express.Router()

// Obtener todos los usuarios (solo admin)
router.get('/', authenticateToken, requireAdmin, obtenerUsuarios)

// Obtener estadísticas de usuarios (solo admin)
router.get('/estadisticas', authenticateToken, requireAdmin, obtenerEstadisticasUsuarios)

// Obtener usuario por ID (solo admin)
router.get('/:id', authenticateToken, requireAdmin, obtenerUsuarioPorId)

// Crear nuevo usuario (solo admin)
router.post('/', authenticateToken, requireAdmin, crearUsuario)

// Actualizar usuario (solo admin)
router.put('/:id', authenticateToken, requireAdmin, actualizarUsuario)

// Cambiar estado activo/inactivo del usuario (solo admin)
router.patch('/:id/estado', authenticateToken, requireAdmin, cambiarEstadoUsuario)

// Eliminar usuario (solo admin)
router.delete('/:id', authenticateToken, requireAdmin, eliminarUsuario)

export default router
