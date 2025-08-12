/*
  Warnings:

  - A unique constraint covering the columns `[tokenVerificacion]` on the table `solicitud_registro` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tokenVerificacion]` on the table `usuario` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `usuario` ADD COLUMN `tokenExpiracion` DATETIME(3) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `solicitud_registro_tokenVerificacion_key` ON `solicitud_registro`(`tokenVerificacion`);

-- CreateIndex
CREATE UNIQUE INDEX `usuario_tokenVerificacion_key` ON `usuario`(`tokenVerificacion`);
