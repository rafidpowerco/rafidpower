CREATE TABLE `knowledge_chunks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenant_id` varchar(128) NOT NULL DEFAULT 'default',
	`app_user_id` int,
	`telegram_user_id` bigint,
	`title` varchar(255),
	`content` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `knowledge_chunks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `idx_knowledge_tenant_app` ON `knowledge_chunks` (`tenant_id`,`app_user_id`);--> statement-breakpoint
CREATE INDEX `idx_knowledge_tenant_tg` ON `knowledge_chunks` (`tenant_id`,`telegram_user_id`);