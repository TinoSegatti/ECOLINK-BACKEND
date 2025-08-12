// C:\ECOLINK\crud-clientes - v2.1\backend\src\server.ts
import express from "express"
import clienteRoutes from "./routes/clienteRoutes"
import categoriaRoutes from "./routes/categoriaRoutes"
import authRoutes from "./routes/authRoutes"
import cors from "cors"
import dotenv from "dotenv"

// Cargar variables de entorno desde .env
dotenv.config()

// Crear una instancia de Express
const app = express()

// Middleware para parsear el cuerpo de las solicitudes a JSON
app.use(express.json())

// Middleware para permitir solicitudes CORS
app.use(cors())

// Log de todas las peticiones
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path} - ${new Date().toISOString()}`)
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`📦 Body:`, req.body)
  }
  next()
})

// Conectar las rutas bajo el prefijo /api
console.log("🚀 Configurando rutas...")
app.use("/api", authRoutes) // Rutas de autenticación
app.use("/api", clienteRoutes)
app.use("/api", categoriaRoutes)

// Ruta de prueba para verificar que el servidor está funcionando
app.get("/", (req, res) => {
  res.json({
    message: "¡Bienvenido a la API de gestión de clientes!",
    timestamp: new Date().toISOString(),
    routes: {
      auth: "/api/auth/*",
      clientes: "/api/clientes",
      categorias: "/api/categorias",
    },
  })
})

// Ruta para listar todas las rutas disponibles
app.get("/api/routes", (req, res) => {
  const routes: string[] = []

  app._router.stack.forEach((middleware: any) => {
    if (middleware.route) {
      routes.push(`${Object.keys(middleware.route.methods).join(", ").toUpperCase()} ${middleware.route.path}`)
    } else if (middleware.name === "router") {
      middleware.handle.stack.forEach((handler: any) => {
        if (handler.route) {
          const path = middleware.regexp.source.replace("\\/?", "").replace("(?=\\/|$)", "") + handler.route.path
          routes.push(`${Object.keys(handler.route.methods).join(", ").toUpperCase()} ${path}`)
        }
      })
    }
  })

  res.json({ routes, timestamp: new Date().toISOString() })
})

// Manejo de errores global
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("❌ Error:", err.stack)
  res.status(500).json({ error: "Ocurrió un error en el servidor", timestamp: new Date().toISOString() })
})

// Manejo de rutas no encontradas
app.use((req: express.Request, res: express.Response) => {
  console.log(`❌ Ruta no encontrada: ${req.method} ${req.path}`)
  res.status(404).json({
    error: "Ruta no encontrada",
    method: req.method,
    path: req.path,
    timestamp: new Date().toISOString(),
  })
})


// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'https://front-ecolink.vercel.app',
    'https://front-ecolink-djz2r5l8n-tinosegattis-projects.vercel.app',
    'http://localhost:3000',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));


// Iniciar el servidor
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`🌟 Servidor escuchando en http://localhost:${PORT}`)
  console.log(`📋 Rutas disponibles:`)
  console.log(`   GET  http://localhost:${PORT}/`)
  console.log(`   GET  http://localhost:${PORT}/api/routes`)
  console.log(`   GET  http://localhost:${PORT}/api/auth/test`)
})