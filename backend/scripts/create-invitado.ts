import { PrismaClient, RolUsuario } from '@prisma/client'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import path from 'path'

// Cargar variables de entorno desde .env
// Intentar cargar desde la raíz del proyecto backend
dotenv.config({ path: path.resolve(__dirname, '../.env') })

// Verificar que DATABASE_URL esté configurado
if (!process.env.DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL no está configurado en el archivo .env')
  console.error('📝 Por favor, verifica que el archivo .env existe y contiene DATABASE_URL')
  process.exit(1)
}

console.log('🔗 Intentando conectar a la base de datos...')
const prisma = new PrismaClient()

async function createInvitado() {
  try {
    // Verificar conexión primero
    await prisma.$connect()
    console.log('✅ Conexión a la base de datos establecida')
    
    console.log('🔍 Verificando si el usuario invitado ya existe...')
    
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email: 'invitado@ecolink.com' },
    })

    if (usuarioExistente) {
      console.log('✅ El usuario invitado ya existe. Actualizando contraseña...')
      
      const hashedPassword = await bcrypt.hash('Invitado2024!', 10)
      
      await prisma.usuario.update({
        where: { email: 'invitado@ecolink.com' },
        data: {
          password: hashedPassword,
          activo: true,
          verificado: true,
          rol: RolUsuario.ADMIN, // Tiene rol ADMIN pero con restricciones en el controlador
        },
      })
      
      console.log('✅ Usuario invitado actualizado exitosamente')
      console.log('📧 Email: invitado@ecolink.com')
      console.log('🔑 Contraseña: Invitado2024!')
      return
    }

    console.log('👤 Creando usuario invitado...')
    
    const hashedPassword = await bcrypt.hash('Invitado2024!', 10)
    
    const invitado = await prisma.usuario.create({
      data: {
        email: 'invitado@ecolink.com',
        nombre: 'Usuario Invitado',
        password: hashedPassword,
        rol: RolUsuario.ADMIN, // Tiene rol ADMIN pero con restricciones en el controlador
        activo: true,
        verificado: true,
      },
    })

    console.log('✅ Usuario invitado creado exitosamente')
    console.log('📧 Email: invitado@ecolink.com')
    console.log('🔑 Contraseña: Invitado2024!')
    console.log('⚠️  Nota: Este usuario tiene restricciones para modificar/eliminar/crear usuarios')
  } catch (error: any) {
    console.error('❌ Error al crear usuario invitado:', error.message)
    
    if (error.message?.includes("Can't reach database server")) {
      console.error('\n💡 Posibles soluciones:')
      console.error('   1. Verifica que la base de datos esté disponible y corriendo')
      console.error('   2. Verifica que DATABASE_URL en .env sea correcto')
      console.error('   3. Verifica tu conexión a internet')
      console.error('   4. Si usas Aiven Cloud, verifica que el servicio esté activo')
      console.error('   5. Verifica que no haya restricciones de firewall')
    }
    
    throw error
  } finally {
    await prisma.$disconnect()
    console.log('🔌 Desconectado de la base de datos')
  }
}

createInvitado()
  .then(() => {
    console.log('✅ Script completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error en el script:', error)
    process.exit(1)
  })

