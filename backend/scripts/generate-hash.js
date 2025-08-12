const bcrypt = require('bcryptjs');

async function generateHash() {
  const password = 'admin123';
  const saltRounds = 10;
  
  try {
    const hash = await bcrypt.hash(password, saltRounds);
    console.log('🔑 Hash generado para la contraseña "admin123":');
    console.log('');
    console.log('Contraseña original:', password);
    console.log('Hash generado:', hash);
    console.log('');
    console.log('📋 Para usar en la base de datos, copia solo el hash:');
    console.log(hash);
    console.log('');
    console.log('💡 Puedes usar este hash para crear el usuario administrador directamente en la base de datos.');
  } catch (error) {
    console.error('❌ Error al generar el hash:', error);
  }
}

generateHash();