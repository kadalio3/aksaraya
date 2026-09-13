-- AlterTable
ALTER TABLE `novel` ADD COLUMN `status` ENUM('ONGOING', 'COMPLETED', 'HIATUS', 'DROPPED') NOT NULL DEFAULT 'ONGOING',
    ADD COLUMN `totalChapters` INTEGER NULL,
    ADD COLUMN `updateSchedule` TEXT NULL;

-- CreateIndex
CREATE INDEX `Novel_status_idx` ON `Novel`(`status`);
