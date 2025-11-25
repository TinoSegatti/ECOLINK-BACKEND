import { Request, Response } from "express"
import nodemailer from "nodemailer"
import dns from "dns"
import { promisify } from "util"

const dnsLookup = promisify(dns.lookup)

export const testSMTPHandler = async (req: Request, res: Response): Promise<void> => {
  const resultados: any = {
    timestamp: new Date().toISOString(),
    pasos: [],
    exitoso: false,
    errores: [],
  }

  try {
    // 1. Verificar variables de entorno
    resultados.pasos.push({
      paso: 1,
      nombre: "Verificación de variables de entorno",
      estado: "iniciando",
    })

    const requiredVars = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"]
    const missingVars = requiredVars.filter((varName) => !process.env[varName])

    if (missingVars.length > 0) {
      resultados.errores.push(`Variables faltantes: ${missingVars.join(", ")}`)
      resultados.pasos[0].estado = "error"
      resultados.pasos[0].error = `Variables faltantes: ${missingVars.join(", ")}`
      res.status(400).json(resultados)
      return
    }

    resultados.pasos[0].estado = "exitoso"
    resultados.pasos[0].detalles = {
      SMTP_HOST: process.env.SMTP_HOST,
      SMTP_PORT: process.env.SMTP_PORT,
      SMTP_USER: process.env.SMTP_USER,
      SMTP_PASS: "***configurado***",
    }

    // 2. Verificar resolución DNS
    resultados.pasos.push({
      paso: 2,
      nombre: "Resolución DNS",
      estado: "iniciando",
    })

    try {
      const host = process.env.SMTP_HOST!
      const addresses = await dnsLookup(host)
      resultados.pasos[1].estado = "exitoso"
      resultados.pasos[1].detalles = {
        host: host,
        ip: addresses.address,
      }
    } catch (error: any) {
      resultados.errores.push(`Error DNS: ${error.message}`)
      resultados.pasos[1].estado = "error"
      resultados.pasos[1].error = error.message
      res.status(500).json(resultados)
      return
    }

    // 3. Crear transporter
    resultados.pasos.push({
      paso: 3,
      nombre: "Configuración del transporter SMTP",
      estado: "iniciando",
    })

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

    resultados.pasos[2].estado = "exitoso"
    resultados.pasos[2].detalles = {
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      requireTLS: smtpConfig.requireTLS,
    }

    // 4. Verificar conexión
    resultados.pasos.push({
      paso: 4,
      nombre: "Verificación de conexión SMTP",
      estado: "iniciando",
    })

    const transporter = nodemailer.createTransport(smtpConfig)

    try {
      const verifyPromise = transporter.verify()
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout después de 30 segundos")), 30000)
      )

      await Promise.race([verifyPromise, timeoutPromise])
      resultados.pasos[3].estado = "exitoso"
      resultados.pasos[3].detalles = "Conexión SMTP verificada exitosamente"
    } catch (error: any) {
      const errorMsg = error.message || String(error)
      resultados.errores.push(`Error de conexión: ${errorMsg}`)
      resultados.pasos[3].estado = "error"
      resultados.pasos[3].error = errorMsg
      resultados.pasos[3].detalles = {
        code: error.code,
        command: error.command,
        response: error.response,
        responseCode: error.responseCode,
      }

      // Diagnóstico adicional
      if (errorMsg.includes("timeout") || error.code === "ETIMEDOUT") {
        resultados.diagnostico = {
          tipo: "timeout",
          posiblesCausas: [
            "Render puede estar bloqueando conexiones salientes a Gmail",
            "Gmail puede estar bloqueando la IP de Render",
            "Firewall o restricciones de red en Render",
            "El App Password de Gmail puede estar incorrecto o expirado",
          ],
          soluciones: [
            "Verificar que el App Password de Gmail sea correcto",
            "Considerar usar un servicio de email alternativo (SendGrid, Mailgun)",
            "Verificar logs de Render para restricciones de red",
            "Probar con puerto 465 (SSL) en lugar de 587 (TLS)",
          ],
        }
      }

      if (error.code === "EAUTH") {
        resultados.diagnostico = {
          tipo: "autenticacion",
          posiblesCausas: [
            "El App Password de Gmail es incorrecto",
            "La cuenta de Gmail tiene 2FA deshabilitado",
            "El usuario SMTP_USER no coincide con el App Password",
          ],
          soluciones: [
            "Verificar que el App Password sea correcto",
            "Asegurarse de que 2FA esté habilitado en Gmail",
            "Generar un nuevo App Password desde la cuenta de Google",
          ],
        }
      }

      transporter.close()
      res.status(500).json(resultados)
      return
    }

    // 5. Intentar enviar email de prueba (opcional)
    if (req.query.sendTest === "true") {
      resultados.pasos.push({
        paso: 5,
        nombre: "Envío de email de prueba",
        estado: "iniciando",
      })

      try {
        const testEmail = process.env.SMTP_USER
        const mailOptions = {
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: testEmail,
          subject: "Test SMTP - ECOLINK",
          text: "Este es un email de prueba para verificar la configuración SMTP.",
        }

        const info = await transporter.sendMail(mailOptions)
        resultados.pasos[4].estado = "exitoso"
        resultados.pasos[4].detalles = {
          messageId: info.messageId,
          to: testEmail,
        }
      } catch (error: any) {
        resultados.errores.push(`Error al enviar email: ${error.message}`)
        resultados.pasos[4].estado = "error"
        resultados.pasos[4].error = error.message
      } finally {
        transporter.close()
      }
    } else {
      transporter.close()
    }

    resultados.exitoso = true
    res.json(resultados)
  } catch (error: any) {
    resultados.errores.push(`Error fatal: ${error.message}`)
    resultados.exitoso = false
    res.status(500).json(resultados)
  }
}

