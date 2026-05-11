CREATE TABLE `processed_products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`processingId` int NOT NULL,
	`productName` varchar(255) NOT NULL,
	`category` varchar(128) NOT NULL,
	`brand` varchar(128),
	`description` text,
	`imageUrl` varchar(512) NOT NULL,
	`imageKey` varchar(255) NOT NULL,
	`aiConfidence` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `processed_products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `processing_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`status` enum('processing','completed','failed') NOT NULL DEFAULT 'processing',
	`totalImages` int DEFAULT 0,
	`processedImages` int DEFAULT 0,
	`discardedImages` int DEFAULT 0,
	`githubCommitUrl` varchar(512),
	`githubRepository` varchar(255),
	`metadata` json,
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`completedAt` timestamp,
	CONSTRAINT `processing_history_id` PRIMARY KEY(`id`)
);
