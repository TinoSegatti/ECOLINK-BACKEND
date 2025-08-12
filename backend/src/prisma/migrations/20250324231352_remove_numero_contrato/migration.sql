/*
  Warnings:

  - You are about to drop the column `numeroContrato` on the `cliente` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `cliente` DROP COLUMN `numeroContrato`,
    MODIFY `fechaDeuda` VARCHAR(191) NULL,
    MODIFY `ultimaRecoleccion` VARCHAR(191) NULL,
    MODIFY `contratacion` VARCHAR(191) NULL;
