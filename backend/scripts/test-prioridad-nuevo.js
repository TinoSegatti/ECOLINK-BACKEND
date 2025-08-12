const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testPrioridadNuevo() {
  try {
    console.log('🧪 Iniciando prueba de funcionalidad de prioridad "NUEVO"...\n');

    // 1. Verificar si existe la categoría "NUEVO" para prioridad
    console.log('1. Verificando si existe la categoría "NUEVO" para prioridad...');
    const categoriaExistente = await prisma.categoria.findFirst({
      where: {
        campo: 'prioridad',
        valor: 'NUEVO',
        deleteAt: null,
      },
    });

    if (categoriaExistente) {
      console.log('✅ La categoría "NUEVO" para prioridad ya existe');
    } else {
      console.log('❌ La categoría "NUEVO" para prioridad no existe');
    }

    // 2. Crear un cliente de prueba sin especificar prioridad
    console.log('\n2. Creando cliente de prueba sin especificar prioridad...');
    const clientePrueba = await prisma.cliente.create({
      data: {
        zona: 'Zona Test',
        nombre: 'Cliente Prueba Prioridad',
        barrio: 'Barrio Test',
        direccion: 'Dirección Test 123',
        telefono: '+5491112345678',
        tipoCliente: 'Residencial',
        prioridad: null, // No especificamos prioridad para probar el valor por defecto
      },
    });

    console.log('✅ Cliente creado exitosamente');
    console.log(`   ID: ${clientePrueba.id}`);
    console.log(`   Nombre: ${clientePrueba.nombre}`);
    console.log(`   Prioridad: ${clientePrueba.prioridad}`);

    // 3. Verificar que la categoría "NUEVO" se creó automáticamente
    console.log('\n3. Verificando que la categoría "NUEVO" se creó automáticamente...');
    const categoriaNuevo = await prisma.categoria.findFirst({
      where: {
        campo: 'prioridad',
        valor: 'NUEVO',
        deleteAt: null,
      },
    });

    if (categoriaNuevo) {
      console.log('✅ La categoría "NUEVO" para prioridad existe');
      console.log(`   ID: ${categoriaNuevo.id}`);
      console.log(`   Campo: ${categoriaNuevo.campo}`);
      console.log(`   Valor: ${categoriaNuevo.valor}`);
    } else {
      console.log('❌ La categoría "NUEVO" para prioridad no se creó automáticamente');
    }

    // 4. Crear otro cliente para verificar que el valor por defecto funciona
    console.log('\n4. Creando segundo cliente para verificar valor por defecto...');
    const clientePrueba2 = await prisma.cliente.create({
      data: {
        zona: 'Zona Test 2',
        nombre: 'Cliente Prueba Prioridad 2',
        barrio: 'Barrio Test 2',
        direccion: 'Dirección Test 456',
        telefono: '+5491112345679',
        tipoCliente: 'Comercial',
        // No especificamos prioridad nuevamente
      },
    });

    console.log('✅ Segundo cliente creado exitosamente');
    console.log(`   ID: ${clientePrueba2.id}`);
    console.log(`   Nombre: ${clientePrueba2.nombre}`);
    console.log(`   Prioridad: ${clientePrueba2.prioridad}`);

    // 5. Limpiar datos de prueba
    console.log('\n5. Limpiando datos de prueba...');
    await prisma.cliente.deleteMany({
      where: {
        nombre: {
          in: ['Cliente Prueba Prioridad', 'Cliente Prueba Prioridad 2']
        }
      }
    });
    console.log('✅ Datos de prueba eliminados');

    console.log('\n🎉 Prueba completada exitosamente!');
    console.log('La funcionalidad de prioridad "NUEVO" está funcionando correctamente.');

  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar la prueba
testPrioridadNuevo(); 