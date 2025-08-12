-- CreateTable
CREATE TABLE `Cliente` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `numeroContrato` VARCHAR(191) NOT NULL,
    `zona` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `barrio` VARCHAR(191) NOT NULL,
    `direccion` VARCHAR(191) NOT NULL,
    `detalleDireccion` VARCHAR(191) NULL,
    `telefono` VARCHAR(191) NOT NULL,
    `semana` VARCHAR(191) NULL,
    `observaciones` VARCHAR(191) NULL,
    `tipoCliente` VARCHAR(191) NOT NULL,
    `debe` DOUBLE NULL,
    `fechaDeuda` DATETIME(3) NULL,
    `precio` DOUBLE NULL,
    `ultimaRecoleccion` DATETIME(3) NULL,
    `contratacion` DATETIME(3) NULL,
    `nuevo` BOOLEAN NOT NULL DEFAULT true,
    `estadoTurno` VARCHAR(191) NULL,
    `prioridad` VARCHAR(191) NULL,
    `estado` VARCHAR(191) NULL,
    `gestionComercial` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
