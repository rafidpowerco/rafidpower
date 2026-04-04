CREATE TABLE `agent_collaboration` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agent_id_1` varchar(100) NOT NULL,
	`agent_id_2` varchar(100) NOT NULL,
	`task_id` varchar(100) NOT NULL,
	`collaboration_type` varchar(50),
	`result` text,
	`success_rate` decimal(5,2),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `agent_collaboration_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `agent_memory` (
	`id` varchar(100) NOT NULL,
	`agent_id` varchar(100) NOT NULL,
	`type` enum('learning','experience','insight','pattern') NOT NULL,
	`content` text NOT NULL,
	`importance` decimal(3,2) DEFAULT '0.50',
	`related_tasks` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `agent_memory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `agent_tasks` (
	`id` varchar(100) NOT NULL,
	`agent_id` varchar(100) NOT NULL,
	`task_description` text NOT NULL,
	`status` enum('pending','in_progress','completed','failed') DEFAULT 'pending',
	`result` text,
	`error` text,
	`performance_score` decimal(5,2),
	`start_time` timestamp DEFAULT (now()),
	`end_time` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `agent_tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `agents` (
	`id` varchar(100) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`role` enum('researcher','executor','processor','analyst','learner') NOT NULL,
	`personality` text,
	`capabilities` json,
	`tools` json,
	`max_memory_items` int DEFAULT 100,
	`autonomy_level` enum('low','medium','high') DEFAULT 'medium',
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `idx_collaboration_agents` ON `agent_collaboration` (`agent_id_1`,`agent_id_2`);--> statement-breakpoint
CREATE INDEX `idx_agent_memory_agent_id` ON `agent_memory` (`agent_id`);--> statement-breakpoint
CREATE INDEX `idx_agent_tasks_agent_id` ON `agent_tasks` (`agent_id`);--> statement-breakpoint
CREATE INDEX `idx_agent_tasks_status` ON `agent_tasks` (`status`);