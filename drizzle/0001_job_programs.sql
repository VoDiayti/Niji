CREATE TABLE `JobProgram` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`order` integer DEFAULT 0 NOT NULL,
	`isActive` integer DEFAULT true NOT NULL,
	`createdAt` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` datetime NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `JobProgram_slug_key` ON `JobProgram` (`slug`);--> statement-breakpoint
ALTER TABLE `JobOrder` ADD `programId` text;--> statement-breakpoint
CREATE INDEX `JobOrder_programId_idx` ON `JobOrder` (`programId`);--> statement-breakpoint
ALTER TABLE `Setting` ADD `jobTableTitle` text;--> statement-breakpoint
ALTER TABLE `Setting` ADD `jobTableEnabled` integer DEFAULT true NOT NULL;