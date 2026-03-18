CREATE TABLE `locations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`address` text NOT NULL,
	`phone` varchar(20),
	`email` varchar(320),
	`city` varchar(100) NOT NULL,
	`postalCode` varchar(20),
	`latitude` decimal(10,8),
	`longitude` decimal(11,8),
	`openingHours` text,
	`isActive` int DEFAULT 1,
	`displayOrder` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `locations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `orders` ADD `locationId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `statusId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` DROP COLUMN `orderStatusId`;