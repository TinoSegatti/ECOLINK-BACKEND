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

// IMPORTANTE: Las rutas específicas DEBEN ir ANTES que las genéricas con parámetros
// Rutas específicas primero
router.get('/', obtenerUsuarios)
router.get('/estadisticas', obtenerEstadisticasUsuarios)

// Rutas con parámetros después
router.get('/:id', obtenerUsuarioPorId)
router.put('/:id', actualizarUsuario)
router.patch('/:id/estado', cambiarEstadoUsuario)
router.delete('/:id', eliminarUsuario)

// Rutas POST (sin parámetros) pueden ir en cualquier lugar
router.post('/', crearUsuario)

export default router
