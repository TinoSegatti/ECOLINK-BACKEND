"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const diagnosticoController_1 = require("../controllers/diagnosticoController");
const router = (0, express_1.Router)();
// Ruta para diagnosticar conexión SMTP
// GET /api/diagnostico/smtp - Diagnóstico básico
// GET /api/diagnostico/smtp?sendTest=true - Diagnóstico completo con envío de email
router.get("/smtp", diagnosticoController_1.testSMTPHandler);
exports.default = router;
