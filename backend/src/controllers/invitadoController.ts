import { Request, Response } from 'express'
import { PrismaClient, RolUsuario } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export const crearUsuarioInvitado = async (req: Request, res: Response) => {
  try {
    // Verificar clave secreta para seguridad
    const secretKey = req.headers['x-secret-key'] || req.body.secretKey
    const expectedKey = process.env.INVITADO_SECRET_KEY || 'Ecolink2025-Invitado-Secret-Key'

    if (secretKey !== expectedKey) {
      res.status(401).json({ 
        error: 'No autorizado. Se requiere clave secreta válida.',
        hint: 'Agrega la variable INVITADO_SECRET_KEY en las variables de entorno'
      })
      return
    }

    console.log('🔍 Verificando si el usuario invitado ya existe...')
    
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email: 'invitado@ecolink.com' },
    })

    if (usuarioExistente) {
      console.log('✅ El usuario invitado ya existe. Actualizando contraseña...')
      
      const hashedPassword = await bcrypt.hash('Invitado2024!', 10)
      
      const usuarioActualizado = await prisma.usuario.update({
        where: { email: 'invitado@ecolink.com' },
        data: {
          password: hashedPassword,
          activo: true,
          verificado: true,
          rol: RolUsuario.ADMIN,
        },
        select: {
          id: true,
          email: true,
          nombre: true,
          rol: true,
          activo: true,
          verificado: true,
        },
      })
      
      console.log('✅ Usuario invitado actualizado exitosamente')
      
      res.json({
        success: true,
        message: 'Usuario invitado actualizado exitosamente',
        usuario: {
          email: usuarioActualizado.email,
          nombre: usuarioActualizado.nombre,
          rol: usuarioActualizado.rol,
        },
        credenciales: {
          email: 'invitado@ecolink.com',
          password: 'Invitado2024!',
        },
      })
      return
    }

    console.log('👤 Creando usuario invitado...')
    
    const hashedPassword = await bcrypt.hash('Invitado2024!', 10)
    
    const invitado = await prisma.usuario.create({
      data: {
        email: 'invitado@ecolink.com',
        nombre: 'Usuario Invitado',
        password: hashedPassword,
        rol: RolUsuario.ADMIN,
        activo: true,
        verificado: true,
      },
      select: {
        id: true,
        email: true,
        nombre: true,
        rol: true,
        activo: true,
        verificado: true,
      },
    })

    console.log('✅ Usuario invitado creado exitosamente')
    
    res.json({
      success: true,
      message: 'Usuario invitado creado exitosamente',
      usuario: {
        email: invitado.email,
        nombre: invitado.nombre,
        rol: invitado.rol,
      },
      credenciales: {
        email: 'invitado@ecolink.com',
        password: 'Invitado2024!',
      },
      nota: 'Este usuario tiene restricciones para modificar/eliminar/crear usuarios',
    })
  } catch (error: any) {
    console.error('❌ Error al crear usuario invitado:', error)
    res.status(500).json({
      error: 'Error al crear usuario invitado',
      message: error.message,
    })
  } finally {
    await prisma.$disconnect()
  }
}

