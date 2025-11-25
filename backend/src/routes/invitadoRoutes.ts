import express from 'express'
import { crearUsuarioInvitado } from '../controllers/invitadoController'

const router = express.Router()

// Ruta para crear/actualizar usuario invitado
// Requiere clave secreta en header o body para seguridad
router.post('/crear-invitado', crearUsuarioInvitado)

export default router


