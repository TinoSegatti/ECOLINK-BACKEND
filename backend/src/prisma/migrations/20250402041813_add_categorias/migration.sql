-- CreateTable
CREATE TABLE `categoria` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `campo` VARCHAR(191) NOT NULL,
    `valor` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `categoria_campo_valor_key`(`campo`, `valor`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
