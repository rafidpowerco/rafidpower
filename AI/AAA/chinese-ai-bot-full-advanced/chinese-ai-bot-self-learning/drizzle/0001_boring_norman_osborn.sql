CREATE TABLE `available_models` (
	`id` int AUTO_INCREMENT NOT NULL,
	`model_id` varchar(255) NOT NULL,
	`model_name` varchar(255) NOT NULL,
	`provider` varchar(100) NOT NULL,
	`description` text,
	`context_window` int,
	`is_free` boolean DEFAULT true,
	`is_available` boolean DEFAULT true,
	`last_checked` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `available_models_id` PRIMARY KEY(`id`),
	CONSTRAINT `available_models_model_id_unique` UNIQUE(`model_id`)
);
--> statement-breakpoint
CREATE TABLE `conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`telegram_user_id` bigint NOT NULL,
	`title` varchar(255),
	`message_count` int NOT NULL DEFAULT 0,
	`model` varchar(255),
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `files` (
	`id` int AUTO_INCREMENT NOT NULL,
	`telegram_user_id` bigint NOT NULL,
	`message_id` int,
	`file_name` varchar(255) NOT NULL,
	`file_type` varchar(50),
	`file_size` bigint,
	`s3_key` varchar(500) NOT NULL,
	`s3_url` varchar(500) NOT NULL,
	`mime_type` varchar(100),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `files_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `learning_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`telegram_user_id` bigint NOT NULL,
	`log_type` varchar(50) NOT NULL,
	`description` text,
	`impact` varchar(50),
	`metadata` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `learning_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversation_id` int NOT NULL,
	`telegram_user_id` bigint NOT NULL,
	`role` enum('user','assistant','system') NOT NULL,
	`content` text NOT NULL,
	`model` varchar(255),
	`tokens_used` int DEFAULT 0,
	`rating` int,
	`metadata` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `model_performance` (
	`id` int AUTO_INCREMENT NOT NULL,
	`telegram_user_id` bigint NOT NULL,
	`model` varchar(255) NOT NULL,
	`total_requests` int DEFAULT 0,
	`average_rating` decimal(3,2),
	`average_response_time` decimal(8,2),
	`success_rate` decimal(5,2),
	`last_used` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `model_performance_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `patterns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`telegram_user_id` bigint NOT NULL,
	`pattern_type` varchar(50) NOT NULL,
	`pattern` text NOT NULL,
	`description` text,
	`confidence` decimal(3,2),
	`occurrences` int DEFAULT 1,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `patterns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `telegram_users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`telegram_id` bigint NOT NULL,
	`first_name` varchar(255),
	`last_name` varchar(255),
	`username` varchar(255),
	`message_count` int NOT NULL DEFAULT 0,
	`current_model` varchar(255) DEFAULT 'openrouter/free',
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `telegram_users_id` PRIMARY KEY(`id`),
	CONSTRAINT `telegram_users_telegram_id_unique` UNIQUE(`telegram_id`)
);
--> statement-breakpoint
CREATE TABLE `user_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`telegram_user_id` bigint NOT NULL,
	`preferred_model` varchar(255),
	`response_style` varchar(50),
	`language` varchar(10) DEFAULT 'en',
	`timezone` varchar(50),
	`notifications_enabled` boolean DEFAULT true,
	`settings` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_preferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_preferences_telegram_user_id_unique` UNIQUE(`telegram_user_id`)
);
--> statement-breakpoint
CREATE INDEX `idx_telegram_user_id` ON `conversations` (`telegram_user_id`);--> statement-breakpoint
CREATE INDEX `idx_file_user_id` ON `files` (`telegram_user_id`);--> statement-breakpoint
CREATE INDEX `idx_learning_user_id` ON `learning_logs` (`telegram_user_id`);--> statement-breakpoint
CREATE INDEX `idx_conversation_id` ON `messages` (`conversation_id`);--> statement-breakpoint
CREATE INDEX `idx_telegram_user_id` ON `messages` (`telegram_user_id`);--> statement-breakpoint
CREATE INDEX `idx_user_model` ON `model_performance` (`telegram_user_id`,`model`);--> statement-breakpoint
CREATE INDEX `idx_pattern_user_id` ON `patterns` (`telegram_user_id`);