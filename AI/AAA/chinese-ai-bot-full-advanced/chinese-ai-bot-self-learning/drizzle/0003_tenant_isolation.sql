ALTER TABLE `conversations` ADD `tenant_id` varchar(128) DEFAULT 'default' NOT NULL;--> statement-breakpoint
ALTER TABLE `learning_logs` ADD `tenant_id` varchar(128) DEFAULT 'default' NOT NULL;--> statement-breakpoint
ALTER TABLE `messages` ADD `tenant_id` varchar(128) DEFAULT 'default' NOT NULL;--> statement-breakpoint
ALTER TABLE `model_performance` ADD `tenant_id` varchar(128) DEFAULT 'default' NOT NULL;--> statement-breakpoint
ALTER TABLE `patterns` ADD `tenant_id` varchar(128) DEFAULT 'default' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `tenantId` varchar(128) DEFAULT 'default' NOT NULL;--> statement-breakpoint
CREATE INDEX `idx_conversations_tenant_user` ON `conversations` (`tenant_id`,`telegram_user_id`);--> statement-breakpoint
CREATE INDEX `idx_learning_logs_tenant_user` ON `learning_logs` (`tenant_id`,`telegram_user_id`);--> statement-breakpoint
CREATE INDEX `idx_messages_tenant_conv` ON `messages` (`tenant_id`,`conversation_id`);--> statement-breakpoint
CREATE INDEX `idx_model_perf_tenant_user_model` ON `model_performance` (`tenant_id`,`telegram_user_id`,`model`);--> statement-breakpoint
CREATE INDEX `idx_patterns_tenant_user` ON `patterns` (`tenant_id`,`telegram_user_id`);