import { Request, Response } from 'express'
import * as usuarioService from '../services/usuarioService'

export const obtenerUsuarios = async (req: Request, res: Response) => {
  try {
    const usuarios = await usuarioService.obtenerUsuarios()
    res.json(usuarios)
  } catch (error) {
    console.error('Error al obtener usuarios:', error)
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
    const { id } = req.params
    const usuarioId = parseInt(id)

    if (isNaN(usuarioId)) {
      res.status(400).json({ error: 'ID de usuario inválido' })
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
    const estadisticas = await usuarioService.obtenerEstadisticasUsuarios()
    res.json(estadisticas)
  } catch (error) {
    console.error('Error al obtener estadísticas de usuarios:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}
