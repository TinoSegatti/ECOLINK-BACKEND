import { Request, Response } from 'express'
import * as usuarioService from '../services/usuarioService'

export const obtenerUsuarios = async (req: Request, res: Response) => {
  try {
    console.log('🔍 obtenerUsuarios: Iniciando...')
    const excludeId = (req as any).usuario?.userId as number | undefined
    const usuarios = await usuarioService.obtenerUsuarios(excludeId)
    console.log('🔍 obtenerUsuarios: Usuarios obtenidos:', usuarios.length)
    res.json(usuarios)
  } catch (error) {
    console.error('❌ Error al obtener usuarios:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

export const obtenerUsuarioPorId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const usuarioId = parseInt(id)

    if (isNaN(usuarioId)) {
      res.status(400).json({ error: 'ID de usuario inválido' })
      return
    }

    const usuario = await usuarioService.obtenerUsuarioPorId(usuarioId)

    if (!usuario) {
      res.status(404).json({ error: 'Usuario no encontrado' })
      return
    }

    res.json(usuario)
  } catch (error) {
    console.error('Error al obtener usuario:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

export const crearUsuario = async (req: Request, res: Response) => {
  try {
    // Verificar si el usuario es el invitado
    const currentUserEmail = (req as any).usuario?.email
    if (currentUserEmail === 'invitado@ecolink.com') {
      res.status(403).json({ error: 'El usuario invitado no puede crear nuevos usuarios' })
      return
    }

    const { email, nombre, rol, password } = req.body

    if (!email || !nombre || !rol || !password) {
      res.status(400).json({ error: 'Todos los campos son requeridos' })
      return
    }

    const nuevoUsuario = await usuarioService.crearUsuario({
      email,
      nombre,
      rol,
      password,
    })

    res.status(201).json(nuevoUsuario)
  } catch (error: any) {
    console.error('Error al crear usuario:', error)
    if (error.message.includes('Ya existe')) {
      res.status(409).json({ error: error.message })
    } else {
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  }
}

export const actualizarUsuario = async (req: Request, res: Response) => {
  try {
    // Verificar si el usuario es el invitado
    const currentUserEmail = (req as any).usuario?.email
    if (currentUserEmail === 'invitado@ecolink.com') {
      res.status(403).json({ error: 'El usuario invitado no puede modificar usuarios' })
      return
    }

    const { id } = req.params
    const usuarioId = parseInt(id)
    const datosActualizacion = req.body

    if (isNaN(usuarioId)) {
      res.status(400).json({ error: 'ID de usuario inválido' })
      return
    }

    const usuarioActualizado = await usuarioService.actualizarUsuario(usuarioId, datosActualizacion)
    res.json(usuarioActualizado)
  } catch (error: any) {
    console.error('Error al actualizar usuario:', error)
    if (error.message.includes('no encontrado')) {
      res.status(404).json({ error: error.message })
    } else {
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  }
}

export const eliminarUsuario = async (req: Request, res: Response) => {
  try {
    // Verificar si el usuario es el invitado
    const currentUserEmail = (req as any).usuario?.email
    if (currentUserEmail === 'invitado@ecolink.com') {
      res.status(403).json({ error: 'El usuario invitado no puede eliminar usuarios' })
      return
    }

    const { id } = req.params
    const usuarioId = parseInt(id)

    if (isNaN(usuarioId)) {
      res.status(400).json({ error: 'ID de usuario inválido' })
      return
    }

    // Evitar que un usuario elimine su propia cuenta
    const currentUserId = (req as any).usuario?.userId as number | undefined
    if (currentUserId && currentUserId === usuarioId) {
      res.status(400).json({ error: 'No puedes eliminar tu propia cuenta mientras la sesión está activa' })
      return
    }

    await usuarioService.eliminarUsuario(usuarioId)
    res.json({ message: 'Usuario eliminado exitosamente' })
  } catch (error: any) {
    console.error('Error al eliminar usuario:', error)
    if (error.message.includes('no encontrado')) {
      res.status(404).json({ error: error.message })
    } else {
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  }
}

export const cambiarEstadoUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { activo } = req.body
    const usuarioId = parseInt(id)

    if (isNaN(usuarioId)) {
      res.status(400).json({ error: 'ID de usuario inválido' })
      return
    }

    if (typeof activo !== 'boolean') {
      res.status(400).json({ error: 'El campo activo debe ser un booleano' })
      return
    }

    const usuarioActualizado = await usuarioService.cambiarEstadoUsuario(usuarioId, activo)
    res.json(usuarioActualizado)
  } catch (error: any) {
    console.error('Error al cambiar estado del usuario:', error)
    if (error.message.includes('no encontrado')) {
      res.status(404).json({ error: error.message })
    } else {
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  }
}

export const obtenerEstadisticasUsuarios = async (req: Request, res: Response) => {
  try {
    console.log('🔍 obtenerEstadisticasUsuarios: Iniciando...')
    const estadisticas = await usuarioService.obtenerEstadisticasUsuarios()
    console.log('🔍 obtenerEstadisticasUsuarios: Estadísticas obtenidas:', estadisticas)
    res.json(estadisticas)
  } catch (error) {
    console.error('❌ Error al obtener estadísticas de usuarios:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}
