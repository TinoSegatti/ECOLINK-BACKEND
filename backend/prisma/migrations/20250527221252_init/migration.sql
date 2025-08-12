-- CreateTable
CREATE TABLE `cliente` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `zona` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `barrio` VARCHAR(191) NOT NULL,
    `direccion` VARCHAR(191) NOT NULL,
    `localidad` VARCHAR(191) NULL,
    `telefono` VARCHAR(191) NOT NULL,
    `tipoCliente` VARCHAR(191) NOT NULL,
    `detalleDireccion` VARCHAR(191) NULL,
    `semana` VARCHAR(191) NULL,
    `observaciones` VARCHAR(191) NULL,
    `debe` DOUBLE NULL,
    `fechaDeuda` VARCHAR(191) NULL,
    `precio` DOUBLE NULL,
    `ultimaRecoleccion` VARCHAR(191) NULL,
    `contratacion` VARCHAR(191) NULL,
    `nuevo` BOOLEAN NOT NULL DEFAULT true,
    `estadoTurno` VARCHAR(191) NULL,
    `prioridad` VARCHAR(191) NULL,
    `estado` VARCHAR(191) NULL,
    `gestionComercial` VARCHAR(191) NULL,
    `CUIT` VARCHAR(191) NULL,
    `condicion` VARCHAR(191) NULL,
    `factura` VARCHAR(191) NULL,
    `pago` VARCHAR(191) NULL,
    `origenFacturacion` VARCHAR(191) NULL,
    `nombreEmpresa` VARCHAR(191) NULL,
    `emailAdministracion` VARCHAR(191) NULL,
    `emailComercial` VARCHAR(191) NULL,

    UNIQUE INDEX `cliente_telefono_key`(`telefono`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categoria` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `campo` VARCHAR(191) NOT NULL,
    `valor` VARCHAR(191) NOT NULL,
    `color` VARCHAR(191) NULL,
    `deleteAt` VARCHAR(191) NULL,

    UNIQUE INDEX `categoria_campo_valor_key`(`campo`, `valor`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
