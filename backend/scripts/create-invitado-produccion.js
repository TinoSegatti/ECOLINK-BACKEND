/**
 * Script para crear el usuario invitado en producción
 * 
 * Uso:
 *   node scripts/create-invitado-produccion.js
 * 
 * O con URL personalizada:
 *   API_URL=https://tu-backend.com node scripts/create-invitado-produccion.js
 */

const https = require('https');
const http = require('http');

const API_URL = process.env.API_URL || 'https://ecolink-backend.onrender.com';
const SECRET_KEY = process.env.INVITADO_SECRET_KEY || 'Ecolink2025-Invitado-Secret-Key';

const url = new URL(`${API_URL}/api/invitado/crear-invitado`);
const isHttps = url.protocol === 'https:';
const client = isHttps ? https : http;

const options = {
  hostname: url.hostname,
  port: url.port || (isHttps ? 443 : 80),
  path: url.pathname,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-secret-key': SECRET_KEY,
  },
};

console.log(`🔗 Conectando a: ${API_URL}`);
console.log(`🔑 Usando clave secreta: ${SECRET_KEY.substring(0, 10)}...`);

const req = client.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      
      if (res.statusCode === 200) {
        console.log('✅ Usuario invitado creado/actualizado exitosamente');
        console.log('\n📋 Información del usuario:');
        console.log(`   Email: ${response.credenciales.email}`);
        console.log(`   Contraseña: ${response.credenciales.password}`);
        console.log(`   Nombre: ${response.usuario.nombre}`);
        console.log(`   Rol: ${response.usuario.rol}`);
        if (response.nota) {
          console.log(`\n⚠️  ${response.nota}`);
        }
      } else {
        console.error(`❌ Error: ${response.error || 'Error desconocido'}`);
        if (response.message) {
          console.error(`   Mensaje: ${response.message}`);
        }
        if (response.hint) {
          console.error(`   💡 ${response.hint}`);
        }
      }
    } catch (error) {
      console.error('❌ Error al parsear respuesta:', error.message);
      console.error('Respuesta recibida:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error de conexión:', error.message);
  console.error('\n💡 Verifica:');
  console.error('   1. Que la URL del backend sea correcta');
  console.error('   2. Que el servidor esté corriendo');
  console.error('   3. Que la clave secreta esté configurada en las variables de entorno del servidor');
});

req.end();

