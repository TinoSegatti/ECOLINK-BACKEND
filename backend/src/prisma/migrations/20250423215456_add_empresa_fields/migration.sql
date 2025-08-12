-- AlterTable
ALTER TABLE `cliente` ADD COLUMN `CUIT` VARCHAR(191) NULL,
    ADD COLUMN `condicion` VARCHAR(191) NULL,
    ADD COLUMN `emailAdministracion` VARCHAR(191) NULL,
    ADD COLUMN `emailComercial` VARCHAR(191) NULL,
    ADD COLUMN `factura` VARCHAR(191) NULL,
    ADD COLUMN `nombreEmpresa` VARCHAR(191) NULL,
    ADD COLUMN `origenFacturacion` VARCHAR(191) NULL,
    ADD COLUMN `pago` VARCHAR(191) NULL;
