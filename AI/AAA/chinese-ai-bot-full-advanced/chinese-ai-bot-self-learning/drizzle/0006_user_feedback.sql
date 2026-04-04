CREATE TABLE `user_feedback` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenant_id` varchar(128) NOT NULL DEFAULT 'default',
	`app_user_id` int NOT NULL,
	`category` varchar(32) NOT NULL DEFAULT 'general',
	`message` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_feedback_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `idx_feedback_tenant_created` ON `user_feedback` (`tenant_id`,`created_at`);
