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
import { debugToken } from '../middleware/debugMiddleware'

const router = express.Router()

// Middleware de debug temporal (remover después de resolver el problema)
router.use(debugToken)

// Obtener todos los usuarios (solo admin)
router.get('/', authenticateToken, requireAdmin, obtenerUsuarios)

// Obtener estadísticas de usuarios (solo admin) - DEBE IR ANTES QUE /:id
router.get('/estadisticas', authenticateToken, requireAdmin, obtenerEstadisticasUsuarios)

// Crear nuevo usuario (solo admin)
router.post('/', authenticateToken, requireAdmin, crearUsuario)

// Obtener usuario por ID (solo admin) - DEBE IR DESPUÉS DE LAS RUTAS ESPECÍFICAS
router.get('/:id', authenticateToken, requireAdmin, obtenerUsuarioPorId)

// Actualizar usuario (solo admin)
router.put('/:id', authenticateToken, requireAdmin, actualizarUsuario)

// Cambiar estado activo/inactivo del usuario (solo admin)
router.patch('/:id/estado', authenticateToken, requireAdmin, cambiarEstadoUsuario)

// Eliminar usuario (solo admin)
router.delete('/:id', authenticateToken, requireAdmin, eliminarUsuario)

export default router
