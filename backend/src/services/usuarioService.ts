import { PrismaClient, Usuario, RolUsuario } from '@prisma/client'

const prisma = new PrismaClient()

export interface UsuarioSinPassword {
  id: number
  email: string
  nombre: string
  rol: RolUsuario
  activo: boolean
  verificado: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CrearUsuarioData {
  email: string
  nombre: string
  rol: RolUsuario
  password: string
}

export interface ActualizarUsuarioData {
  nombre?: string
  rol?: RolUsuario
  activo?: boolean
  verificado?: boolean
}

// Obtener todos los usuarios (sin contraseñas)
export const obtenerUsuarios = async (excludeUserId?: number): Promise<UsuarioSinPassword[]> => {
  try {
    const usuarios = await prisma.usuario.findMany({
      where: excludeUserId ? { id: { not: excludeUserId } } : undefined,
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
    return usuarios
  } catch (error) {
    console.error('Error al obtener usuarios:', error)
    throw new Error('No se pudieron obtener los usuarios')
  }
}

// Obtener usuario por ID (sin contraseña)
export const obtenerUsuarioPorId = async (id: number): Promise<UsuarioSinPassword | null> => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id },
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
    })
    return usuario
  } catch (error) {
    console.error('Error al obtener usuario por ID:', error)
    throw new Error('No se pudo obtener el usuario')
  }
}

// Obtener usuario por email (sin contraseña)
export const obtenerUsuarioPorEmail = async (email: string): Promise<UsuarioSinPassword | null> => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { email },
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
    })
    return usuario
  } catch (error) {
    console.error('Error al obtener usuario por email:', error)
    throw new Error('No se pudo obtener el usuario')
  }
}

// Crear nuevo usuario
export const crearUsuario = async (data: CrearUsuarioData): Promise<UsuarioSinPassword> => {
  try {
    // Verificar que no exista ya un usuario con ese email
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email: data.email },
    })

    if (usuarioExistente) {
      throw new Error('Ya existe un usuario con este email')
    }

    // Importar bcrypt para hashear la contraseña
    const bcrypt = require('bcryptjs')
    const hashedPassword = await bcrypt.hash(data.password, 10)

    const nuevoUsuario = await prisma.usuario.create({
      data: {
        email: data.email,
        nombre: data.nombre,
        rol: data.rol,
        password: hashedPassword,
        verificado: true, // Usuario creado por admin ya está verificado
        activo: true,
      },
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
    })

    return nuevoUsuario
  } catch (error) {
    console.error('Error al crear usuario:', error)
    throw error
  }
}

// Actualizar usuario
export const actualizarUsuario = async (id: number, data: ActualizarUsuarioData): Promise<UsuarioSinPassword> => {
  try {
    const usuario = await prisma.usuario.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
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
    })
    
    return usuario
  } catch (error) {
    console.error('Error al actualizar usuario:', error)
    throw new Error('No se pudo actualizar el usuario')
  }
}

// Eliminar usuario
export const eliminarUsuario = async (id: number): Promise<void> => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id },
    })

    if (!usuario) {
      throw new Error('Usuario no encontrado')
    }

    // Eliminar solicitudes de registro asociadas al email del usuario
    await prisma.solicitudRegistro.deleteMany({
      where: { email: usuario.email },
    })

    // Eliminar el usuario
    await prisma.usuario.delete({
      where: { id },
    })
  } catch (error) {
    console.error('Error al eliminar usuario:', error)
    throw error
  }
}

// Cambiar estado activo/inactivo del usuario
export const cambiarEstadoUsuario = async (id: number, activo: boolean): Promise<UsuarioSinPassword> => {
  try {
    const usuario = await prisma.usuario.update({
      where: { id },
      data: {
        activo,
        updatedAt: new Date(),
      },
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
    })
    
    return usuario
  } catch (error) {
    console.error('Error al cambiar estado del usuario:', error)
    throw new Error('No se pudo cambiar el estado del usuario')
  }
}

// Obtener estadísticas de usuarios
export const obtenerEstadisticasUsuarios = async () => {
  try {
    const totalUsuarios = await prisma.usuario.count()
    const usuariosActivos = await prisma.usuario.count({ where: { activo: true } })
    const usuariosVerificados = await prisma.usuario.count({ where: { verificado: true } })
    const usuariosPorRol = await prisma.usuario.groupBy({
      by: ['rol'],
      _count: { rol: true },
    })

    return {
      total: totalUsuarios,
      activos: usuariosActivos,
      verificados: usuariosVerificados,
      porRol: usuariosPorRol.map(item => ({
        rol: item.rol,
        cantidad: item._count.rol,
      })),
    }
  } catch (error) {
    console.error('Error al obtener estadísticas de usuarios:', error)
    throw new Error('No se pudieron obtener las estadísticas')
  }
}
