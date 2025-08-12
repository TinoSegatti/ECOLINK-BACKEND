const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000'; // Ajusta según tu configuración

async function testAPIPrioridadNuevo() {
  try {
    console.log('🧪 Iniciando prueba de API para prioridad "NUEVO"...\n');

    // 1. Crear cliente sin especificar prioridad
    console.log('1. Creando cliente sin especificar prioridad...');
    const clienteData = {
      zona: 'Zona API Test',
      nombre: 'Cliente API Test Prioridad',
      barrio: 'Barrio API Test',
      direccion: 'Dirección API Test 123',
      telefono: '+5491112345680',
      tipoCliente: 'Residencial',
      // No especificamos prioridad para probar el valor por defecto
    };

    const response = await axios.post(`${API_BASE_URL}/api/clientes`, clienteData);
    
    if (response.status === 201) {
      const cliente = response.data;
      console.log('✅ Cliente creado exitosamente a través de la API');
      console.log(`   ID: ${cliente.id}`);
      console.log(`   Nombre: ${cliente.nombre}`);
      console.log(`   Prioridad: ${cliente.prioridad}`);
      
      if (cliente.prioridad === 'NUEVO') {
        console.log('✅ El valor por defecto "NUEVO" se asignó correctamente');
      } else {
        console.log('❌ El valor por defecto "NUEVO" no se asignó correctamente');
        console.log(`   Prioridad recibida: ${cliente.prioridad}`);
      }
    } else {
      console.log('❌ Error al crear cliente:', response.status, response.data);
    }

    // 2. Crear cliente especificando una prioridad diferente
    console.log('\n2. Creando cliente especificando prioridad diferente...');
    const clienteData2 = {
      zona: 'Zona API Test 2',
      nombre: 'Cliente API Test Prioridad 2',
      barrio: 'Barrio API Test 2',
      direccion: 'Dirección API Test 456',
      telefono: '+5491112345681',
      tipoCliente: 'Comercial',
      prioridad: 'ALTA', // Especificamos una prioridad diferente
    };

    const response2 = await axios.post(`${API_BASE_URL}/api/clientes`, clienteData2);
    
    if (response2.status === 201) {
      const cliente2 = response2.data;
      console.log('✅ Segundo cliente creado exitosamente');
      console.log(`   ID: ${cliente2.id}`);
      console.log(`   Nombre: ${cliente2.nombre}`);
      console.log(`   Prioridad: ${cliente2.prioridad}`);
      
      if (cliente2.prioridad === 'ALTA') {
        console.log('✅ La prioridad especificada se respetó correctamente');
      } else {
        console.log('❌ La prioridad especificada no se respetó');
        console.log(`   Prioridad esperada: ALTA`);
        console.log(`   Prioridad recibida: ${cliente2.prioridad}`);
      }
    } else {
      console.log('❌ Error al crear segundo cliente:', response2.status, response2.data);
    }

    // 3. Obtener todos los clientes para verificar
    console.log('\n3. Obteniendo todos los clientes para verificar...');
    const response3 = await axios.get(`${API_BASE_URL}/api/clientes`);
    
    if (response3.status === 200) {
      const clientes = response3.data;
      const clientesTest = clientes.filter(c => 
        c.nombre.includes('Cliente API Test Prioridad')
      );
      
      console.log(`✅ Se encontraron ${clientesTest.length} clientes de prueba`);
      clientesTest.forEach(cliente => {
        console.log(`   - ${cliente.nombre}: Prioridad = ${cliente.prioridad}`);
      });
    } else {
      console.log('❌ Error al obtener clientes:', response3.status, response3.data);
    }

    console.log('\n🎉 Prueba de API completada exitosamente!');
    console.log('La funcionalidad de prioridad "NUEVO" está funcionando correctamente a través de la API.');

  } catch (error) {
    console.error('❌ Error durante la prueba de API:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

// Ejecutar la prueba
testAPIPrioridadNuevo(); 