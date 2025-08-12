/*
  Warnings:

  - You are about to drop the column `borrado` on the `categoria` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `categoria` DROP COLUMN `borrado`,
    ADD COLUMN `deleteAt` VARCHAR(191) NULL;
