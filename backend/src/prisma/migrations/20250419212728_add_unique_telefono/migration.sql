/*
  Warnings:

  - A unique constraint covering the columns `[telefono]` on the table `cliente` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `cliente_telefono_key` ON `cliente`(`telefono`);
