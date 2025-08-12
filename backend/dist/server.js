"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// C:\ECOLINK\crud-clientes - v2.1\backend\src\server.ts
const express_1 = __importDefault(require("express"));
const clienteRoutes_1 = __importDefault(require("./routes/clienteRoutes"));
const categoriaRoutes_1 = __importDefault(require("./routes/categoriaRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
// Cargar variables de entorno desde .env
dotenv_1.default.config();
// Crear una instancia de Express
const app = (0, express_1.default)();
// Middleware para parsear el cuerpo de las solicitudes a JSON
app.use(express_1.default.json());
// Middleware para permitir solicitudes CORS
app.use((0, cors_1.default)());
// Log de todas las peticiones
app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.path} - ${new Date().toISOString()}`);
    if (req.body && Object.keys(req.body).length > 0) {
        console.log(`📦 Body:`, req.body);
    }
    next();
});
// Conectar las rutas bajo el prefijo /api
console.log("🚀 Configurando rutas...");
app.use("/api", authRoutes_1.default); // Rutas de autenticación
app.use("/api", clienteRoutes_1.default);
app.use("/api", categoriaRoutes_1.default);
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
    });
});
// Ruta para listar todas las rutas disponibles
app.get("/api/routes", (req, res) => {
    const routes = [];
    app._router.stack.forEach((middleware) => {
        if (middleware.route) {
            routes.push(`${Object.keys(middleware.route.methods).join(", ").toUpperCase()} ${middleware.route.path}`);
        }
        else if (middleware.name === "router") {
            middleware.handle.stack.forEach((handler) => {
                if (handler.route) {
                    const path = middleware.regexp.source.replace("\\/?", "").replace("(?=\\/|$)", "") + handler.route.path;
                    routes.push(`${Object.keys(handler.route.methods).join(", ").toUpperCase()} ${path}`);
                }
            });
        }
    });
    res.json({ routes, timestamp: new Date().toISOString() });
});
// Manejo de errores global
app.use((err, req, res, next) => {
    console.error("❌ Error:", err.stack);
    res.status(500).json({ error: "Ocurrió un error en el servidor", timestamp: new Date().toISOString() });
});
// Manejo de rutas no encontradas
app.use((req, res) => {
    console.log(`❌ Ruta no encontrada: ${req.method} ${req.path}`);
    res.status(404).json({
        error: "Ruta no encontrada",
        method: req.method,
        path: req.path,
        timestamp: new Date().toISOString(),
    });
});
// Middleware
app.use((0, cors_1.default)({
    origin: [
        process.env.FRONTEND_URL || 'https://front-ecolink.vercel.app',
        'https://front-ecolink-djz2r5l8n-tinosegattis-projects.vercel.app',
        'http://localhost:3000',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🌟 Servidor escuchando en http://localhost:${PORT}`);
    console.log(`📋 Rutas disponibles:`);
    console.log(`   GET  http://localhost:${PORT}/`);
    console.log(`   GET  http://localhost:${PORT}/api/routes`);
    console.log(`   GET  http://localhost:${PORT}/api/auth/test`);
});
