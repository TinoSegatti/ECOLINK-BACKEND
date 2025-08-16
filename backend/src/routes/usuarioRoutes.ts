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

// Aplicar autenticación y autorización a todas las rutas
router.use(authenticateToken, requireAdmin)

// Rutas de usuarios
router.get('/', obtenerUsuarios)
router.get('/estadisticas', obtenerEstadisticasUsuarios)
router.post('/', crearUsuario)
router.get('/:id', obtenerUsuarioPorId)
router.put('/:id', actualizarUsuario)
router.patch('/:id/estado', cambiarEstadoUsuario)
router.delete('/:id', eliminarUsuario)

export default router
