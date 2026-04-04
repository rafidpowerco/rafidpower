ALTER TABLE `conversations` ADD `app_user_id` int;--> statement-breakpoint
ALTER TABLE `messages` ADD `app_user_id` int;--> statement-breakpoint
CREATE INDEX `idx_conversations_tenant_app_user` ON `conversations` (`tenant_id`,`app_user_id`);