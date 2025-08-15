import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const obtenerUsuarios = async (req: Request, res: Response) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        email: true,
        nombre: true,
        rol: true,
        activo: true,
        verificado: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    res.json(usuarios)
  } catch (error) {
    console.error('Error al obtener usuarios:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
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

    // Verificar que el usuario existe
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
    })

    if (!usuario) {
      res.status(404).json({ error: 'Usuario no encontrado' })
      return
    }

    // Eliminar solicitudes de registro asociadas al email del usuario
    await prisma.solicitudRegistro.deleteMany({
      where: { email: usuario.email },
    })

    // Eliminar el usuario
    await prisma.usuario.delete({
      where: { id: usuarioId },
    })

    res.json({ message: 'Usuario eliminado exitosamente' })
  } catch (error) {
    console.error('Error al eliminar usuario:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}
