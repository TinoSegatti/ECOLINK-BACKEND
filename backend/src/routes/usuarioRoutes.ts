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

// Rutas con parámetros después (asegurar que :id sea un número válido)
router.get('/:id(\\d+)', obtenerUsuarioPorId)
router.put('/:id(\\d+)', actualizarUsuario)
router.patch('/:id(\\d+)/estado', cambiarEstadoUsuario)
router.delete('/:id(\\d+)', eliminarUsuario)

// Rutas POST (sin parámetros) pueden ir en cualquier lugar
router.post('/', crearUsuario)

export default router
