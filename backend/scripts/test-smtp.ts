import dotenv from "dotenv"
import nodemailer from "nodemailer"
import dns from "dns"
import { promisify } from "util"

dotenv.config()

const dnsLookup = promisify(dns.lookup)

async function testSMTPConnection() {
  console.log("🔍 DIAGNÓSTICO DE CONEXIÓN SMTP")
  console.log("=" .repeat(50))

  // 1. Verificar variables de entorno
  console.log("\n1️⃣ Verificando variables de entorno...")
  const requiredVars = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"]
  const missingVars = requiredVars.filter((varName) => !process.env[varName])

  if (missingVars.length > 0) {
    console.error(`❌ Variables faltantes: ${missingVars.join(", ")}`)
    return
  }

  console.log("✅ Todas las variables de entorno están configuradas")
  console.log(`   SMTP_HOST: ${process.env.SMTP_HOST}`)
  console.log(`   SMTP_PORT: ${process.env.SMTP_PORT}`)
  console.log(`   SMTP_USER: ${process.env.SMTP_USER}`)
  console.log(`   SMTP_PASS: ${process.env.SMTP_PASS ? "***configurado***" : "❌ NO CONFIGURADO"}`)

  // 2. Verificar resolución DNS
  console.log("\n2️⃣ Verificando resolución DNS...")
  try {
    const host = process.env.SMTP_HOST!
    const addresses = await dnsLookup(host)
    console.log(`✅ DNS resuelto correctamente: ${host} -> ${addresses.address}`)
  } catch (error: any) {
    console.error(`❌ Error al resolver DNS: ${error.message}`)
    return
  }

  // 3. Crear transporter
  console.log("\n3️⃣ Creando transporter SMTP...")
  const port = Number.parseInt(process.env.SMTP_PORT || "587")
  const isSecure = port === 465

  const smtpConfig: any = {
    host: process.env.SMTP_HOST,
    port: port,
    secure: isSecure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 30000,
    socketTimeout: 30000,
    greetingTimeout: 15000,
    requireTLS: !isSecure,
    tls: {
      rejectUnauthorized: true,
      minVersion: "TLSv1.2",
    },
    pool: false,
    service: process.env.SMTP_HOST?.includes("gmail.com") ? "gmail" : undefined,
  }

  console.log("✅ Transporter configurado")
  console.log(`   Host: ${smtpConfig.host}`)
  console.log(`   Port: ${smtpConfig.port}`)
  console.log(`   Secure: ${smtpConfig.secure}`)
  console.log(`   RequireTLS: ${smtpConfig.requireTLS}`)

  // 4. Verificar conexión
  console.log("\n4️⃣ Verificando conexión SMTP...")
  const transporter = nodemailer.createTransport(smtpConfig)

  try {
    const verifyPromise = transporter.verify()
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout después de 30 segundos")), 30000)
    )

    await Promise.race([verifyPromise, timeoutPromise])
    console.log("✅ Conexión SMTP verificada exitosamente")
  } catch (error: any) {
    console.error(`❌ Error al verificar conexión SMTP:`)
    console.error(`   Mensaje: ${error.message}`)
    console.error(`   Código: ${error.code || "N/A"}`)
    console.error(`   Comando: ${error.command || "N/A"}`)
    console.error(`   Respuesta: ${error.response || "N/A"}`)

    if (error.message.includes("timeout") || error.code === "ETIMEDOUT") {
      console.error("\n⚠️  DIAGNÓSTICO DE TIMEOUT:")
      console.error("   Posibles causas:")
      console.error("   1. Render puede estar bloqueando conexiones salientes a Gmail")
      console.error("   2. Gmail puede estar bloqueando la IP de Render")
      console.error("   3. Firewall o restricciones de red")
      console.error("   4. El App Password puede estar incorrecto")
      console.error("\n💡 SOLUCIONES SUGERIDAS:")
      console.error("   1. Verificar que el App Password de Gmail sea correcto")
      console.error("   2. Considerar usar un servicio de email alternativo (SendGrid, Mailgun)")
      console.error("   3. Verificar logs de Render para restricciones de red")
      console.error("   4. Probar con puerto 465 (SSL) en lugar de 587 (TLS)")
    }

    if (error.code === "EAUTH") {
      console.error("\n⚠️  ERROR DE AUTENTICACIÓN:")
      console.error("   Posibles causas:")
      console.error("   1. El App Password de Gmail es incorrecto")
      console.error("   2. La cuenta de Gmail tiene 2FA deshabilitado")
      console.error("   3. El usuario SMTP_USER no coincide con el App Password")
    }

    transporter.close()
    return
  }

  // 5. Intentar enviar email de prueba
  console.log("\n5️⃣ Enviando email de prueba...")
  try {
    const testEmail = process.env.SMTP_USER // Enviar a sí mismo
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: testEmail,
      subject: "Test SMTP - ECOLINK",
      text: "Este es un email de prueba para verificar la configuración SMTP.",
    }

    const info = await transporter.sendMail(mailOptions)
    console.log("✅ Email de prueba enviado exitosamente")
    console.log(`   Message ID: ${info.messageId}`)
  } catch (error: any) {
    console.error(`❌ Error al enviar email de prueba:`)
    console.error(`   Mensaje: ${error.message}`)
    console.error(`   Código: ${error.code || "N/A"}`)
  } finally {
    transporter.close()
  }

  console.log("\n" + "=".repeat(50))
  console.log("✅ Diagnóstico completado")
}

// Ejecutar diagnóstico
testSMTPConnection()
  .then(() => {
    console.log("\n✅ Proceso finalizado")
    process.exit(0)
  })
  .catch((error) => {
    console.error("\n❌ Error fatal:", error)
    process.exit(1)
  })

