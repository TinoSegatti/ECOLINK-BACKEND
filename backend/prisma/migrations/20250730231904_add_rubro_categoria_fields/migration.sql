/*
  Warnings:

  - You are about to drop the column `nuevo` on the `cliente` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `cliente` DROP COLUMN `nuevo`,
    ADD COLUMN `categoria` VARCHAR(191) NULL,
    ADD COLUMN `rubro` VARCHAR(191) NULL;
