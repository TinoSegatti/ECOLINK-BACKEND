"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const invitadoController_1 = require("../controllers/invitadoController");
const router = express_1.default.Router();
// Ruta para crear/actualizar usuario invitado
// Requiere clave secreta en header o body para seguridad
router.post('/crear-invitado', invitadoController_1.crearUsuarioInvitado);
exports.default = router;
