-- CreateTable
CREATE TABLE `usuario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `rol` ENUM('ADMIN', 'OPERADOR', 'LECTOR') NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `verificado` BOOLEAN NOT NULL DEFAULT false,
    `tokenVerificacion` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `usuario_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `solicitud_registro` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `rol` ENUM('ADMIN', 'OPERADOR', 'LECTOR') NOT NULL,
    `tokenVerificacion` VARCHAR(191) NOT NULL,
    `aprobada` BOOLEAN NOT NULL DEFAULT false,
    `rechazada` BOOLEAN NOT NULL DEFAULT false,
    `motivoRechazo` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `adminId` INTEGER NULL,

    UNIQUE INDEX `solicitud_registro_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `solicitud_registro` ADD CONSTRAINT `solicitud_registro_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
