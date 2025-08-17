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

// Rutas específicas primero (sin parámetros)
router.get('/', authenticateToken, requireAdmin, obtenerUsuarios)
router.get('/estadisticas', authenticateToken, requireAdmin, obtenerEstadisticasUsuarios)

// Rutas con parámetros después
router.get('/:id', authenticateToken, requireAdmin, obtenerUsuarioPorId)
router.put('/:id', authenticateToken, requireAdmin, actualizarUsuario)
router.patch('/:id/estado', authenticateToken, requireAdmin, cambiarEstadoUsuario)
router.delete('/:id', authenticateToken, requireAdmin, eliminarUsuario)

// Rutas POST
router.post('/', authenticateToken, requireAdmin, crearUsuario)

export default router
