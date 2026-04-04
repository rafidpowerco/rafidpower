CREATE TABLE `collective_pattern_stats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenant_id` varchar(128) NOT NULL DEFAULT 'default',
	`pattern_hash` varchar(64) NOT NULL,
	`pattern_type` varchar(50) NOT NULL,
	`pattern_preview` varchar(400) NOT NULL,
	`total_occurrences` int NOT NULL DEFAULT 0,
	`quality_sum` decimal(14,4) NOT NULL DEFAULT 0,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `collective_pattern_stats_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_collective_tenant_hash` UNIQUE(`tenant_id`,`pattern_hash`)
);
--> statement-breakpoint
CREATE INDEX `idx_collective_tenant_occ` ON `collective_pattern_stats` (`tenant_id`,`total_occurrences`);
