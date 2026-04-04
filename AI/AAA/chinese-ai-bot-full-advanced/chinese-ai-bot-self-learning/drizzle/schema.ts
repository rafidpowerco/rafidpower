import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  bigint,
  decimal,
  json,
  boolean,
  index,
  uniqueIndex,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  /** عزل بيانات متعدد المستأجرين (مرحلة 2) */
  tenantId: varchar("tenantId", { length: 128 }).default("default").notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Telegram Users table
export const telegramUsers = mysqlTable("telegram_users", {
  id: int("id").autoincrement().primaryKey(),
  telegramId: bigint("telegram_id", { mode: "number" }).notNull().unique(),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  username: varchar("username", { length: 255 }),
  messageCount: int("message_count").default(0).notNull(),
  currentModel: varchar("current_model", { length: 255 }).default(
    "openrouter/free"
  ),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type TelegramUser = typeof telegramUsers.$inferSelect;
export type InsertTelegramUser = typeof telegramUsers.$inferInsert;

// Conversations table
export const conversations = mysqlTable(
  "conversations",
  {
    id: int("id").autoincrement().primaryKey(),
    telegramUserId: bigint("telegram_user_id", { mode: "number" }).notNull(),
    /** مستخدم الويب (جدول users) — null لمحادثات تليجرام فقط */
    appUserId: int("app_user_id"),
    tenantId: varchar("tenant_id", { length: 128 })
      .default("default")
      .notNull(),
    title: varchar("title", { length: 255 }),
    messageCount: int("message_count").default(0).notNull(),
    model: varchar("model", { length: 255 }),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  table => ({
    userIdx: index("idx_telegram_user_id").on(table.telegramUserId),
    tenantUserIdx: index("idx_conversations_tenant_user").on(
      table.tenantId,
      table.telegramUserId
    ),
    tenantAppUserIdx: index("idx_conversations_tenant_app_user").on(
      table.tenantId,
      table.appUserId
    ),
  })
);

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

// Messages table
export const messages = mysqlTable(
  "messages",
  {
    id: int("id").autoincrement().primaryKey(),
    conversationId: int("conversation_id").notNull(),
    telegramUserId: bigint("telegram_user_id", { mode: "number" }).notNull(),
    appUserId: int("app_user_id"),
    tenantId: varchar("tenant_id", { length: 128 })
      .default("default")
      .notNull(),
    role: mysqlEnum("role", ["user", "assistant", "system"]).notNull(),
    content: text("content").notNull(),
    model: varchar("model", { length: 255 }),
    tokensUsed: int("tokens_used").default(0),
    rating: int("rating"), // 1-5 stars or null if not rated
    metadata: json("metadata"), // Additional data like file references
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  table => ({
    conversationIdx: index("idx_conversation_id").on(table.conversationId),
    userIdx: index("idx_telegram_user_id").on(table.telegramUserId),
    tenantConvIdx: index("idx_messages_tenant_conv").on(
      table.tenantId,
      table.conversationId
    ),
  })
);

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

// Patterns table (for discovered patterns and rules)
export const patterns = mysqlTable(
  "patterns",
  {
    id: int("id").autoincrement().primaryKey(),
    telegramUserId: bigint("telegram_user_id", { mode: "number" }).notNull(),
    tenantId: varchar("tenant_id", { length: 128 })
      .default("default")
      .notNull(),
    patternType: varchar("pattern_type", { length: 50 }).notNull(), // 'question', 'preference', 'rule', etc.
    pattern: text("pattern").notNull(),
    description: text("description"),
    confidence: decimal("confidence", { precision: 3, scale: 2 }), // 0.00 to 1.00
    occurrences: int("occurrences").default(1),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  table => ({
    userIdx: index("idx_pattern_user_id").on(table.telegramUserId),
    tenantUserIdx: index("idx_patterns_tenant_user").on(
      table.tenantId,
      table.telegramUserId
    ),
  })
);

export type Pattern = typeof patterns.$inferSelect;
export type InsertPattern = typeof patterns.$inferInsert;

// User Preferences table
export const userPreferences = mysqlTable("user_preferences", {
  id: int("id").autoincrement().primaryKey(),
  telegramUserId: bigint("telegram_user_id", { mode: "number" })
    .notNull()
    .unique(),
  preferredModel: varchar("preferred_model", { length: 255 }),
  responseStyle: varchar("response_style", { length: 50 }), // 'concise', 'detailed', 'creative', etc.
  language: varchar("language", { length: 10 }).default("en"),
  timezone: varchar("timezone", { length: 50 }),
  notificationsEnabled: boolean("notifications_enabled").default(true),
  settings: json("settings"), // Custom settings as JSON
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type UserPreference = typeof userPreferences.$inferSelect;
export type InsertUserPreference = typeof userPreferences.$inferInsert;

// Model Performance table
export const modelPerformance = mysqlTable(
  "model_performance",
  {
    id: int("id").autoincrement().primaryKey(),
    telegramUserId: bigint("telegram_user_id", { mode: "number" }).notNull(),
    tenantId: varchar("tenant_id", { length: 128 })
      .default("default")
      .notNull(),
    model: varchar("model", { length: 255 }).notNull(),
    totalRequests: int("total_requests").default(0),
    averageRating: decimal("average_rating", { precision: 3, scale: 2 }),
    averageResponseTime: decimal("average_response_time", {
      precision: 8,
      scale: 2,
    }), // in milliseconds
    successRate: decimal("success_rate", { precision: 5, scale: 2 }), // percentage
    lastUsed: timestamp("last_used"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  table => ({
    userModelIdx: index("idx_user_model").on(table.telegramUserId, table.model),
    tenantUserModelIdx: index("idx_model_perf_tenant_user_model").on(
      table.tenantId,
      table.telegramUserId,
      table.model
    ),
  })
);

export type ModelPerformance = typeof modelPerformance.$inferSelect;
export type InsertModelPerformance = typeof modelPerformance.$inferInsert;

// Files table (for S3 file references)
export const files = mysqlTable(
  "files",
  {
    id: int("id").autoincrement().primaryKey(),
    telegramUserId: bigint("telegram_user_id", { mode: "number" }).notNull(),
    messageId: int("message_id"),
    fileName: varchar("file_name", { length: 255 }).notNull(),
    fileType: varchar("file_type", { length: 50 }),
    fileSize: bigint("file_size", { mode: "number" }),
    s3Key: varchar("s3_key", { length: 500 }).notNull(),
    s3Url: varchar("s3_url", { length: 500 }).notNull(),
    mimeType: varchar("mime_type", { length: 100 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  table => ({
    userIdx: index("idx_file_user_id").on(table.telegramUserId),
  })
);

export type File = typeof files.$inferSelect;
export type InsertFile = typeof files.$inferInsert;

// Learning Logs table (for tracking learning progress)
export const learningLogs = mysqlTable(
  "learning_logs",
  {
    id: int("id").autoincrement().primaryKey(),
    telegramUserId: bigint("telegram_user_id", { mode: "number" }).notNull(),
    tenantId: varchar("tenant_id", { length: 128 })
      .default("default")
      .notNull(),
    logType: varchar("log_type", { length: 50 }).notNull(), // 'pattern_discovered', 'preference_updated', 'model_optimized', etc.
    description: text("description"),
    impact: varchar("impact", { length: 50 }), // 'high', 'medium', 'low'
    metadata: json("metadata"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  table => ({
    userIdx: index("idx_learning_user_id").on(table.telegramUserId),
    tenantUserIdx: index("idx_learning_logs_tenant_user").on(
      table.tenantId,
      table.telegramUserId
    ),
  })
);

export type LearningLog = typeof learningLogs.$inferSelect;
export type InsertLearningLog = typeof learningLogs.$inferInsert;

// Available Models table (for tracking free models from OpenRouter)
export const availableModels = mysqlTable("available_models", {
  id: int("id").autoincrement().primaryKey(),
  modelId: varchar("model_id", { length: 255 }).notNull().unique(),
  modelName: varchar("model_name", { length: 255 }).notNull(),
  provider: varchar("provider", { length: 100 }).notNull(),
  description: text("description"),
  contextWindow: int("context_window"),
  isFree: boolean("is_free").default(true),
  isAvailable: boolean("is_available").default(true),
  lastChecked: timestamp("last_checked"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type AvailableModel = typeof availableModels.$inferSelect;
export type InsertAvailableModel = typeof availableModels.$inferInsert;

// Agents table
export const agents = mysqlTable("agents", {
  id: varchar("id", { length: 100 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  role: mysqlEnum("role", [
    "researcher",
    "executor",
    "processor",
    "analyst",
    "learner",
  ]).notNull(),
  personality: text("personality"),
  capabilities: json("capabilities"), // Array of capabilities
  tools: json("tools"), // Array of tools
  maxMemoryItems: int("max_memory_items").default(100),
  autonomyLevel: mysqlEnum("autonomy_level", ["low", "medium", "high"]).default(
    "medium"
  ),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Agent = typeof agents.$inferSelect;
export type InsertAgent = typeof agents.$inferInsert;

// Agent Memory table
export const agentMemory = mysqlTable(
  "agent_memory",
  {
    id: varchar("id", { length: 100 }).primaryKey(),
    agentId: varchar("agent_id", { length: 100 }).notNull(),
    type: mysqlEnum("type", [
      "learning",
      "experience",
      "insight",
      "pattern",
    ]).notNull(),
    content: text("content").notNull(),
    importance: decimal("importance", { precision: 3, scale: 2 }).default(
      "0.50"
    ),
    relatedTasks: json("related_tasks"), // Array of task IDs
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  table => ({
    agentIdx: index("idx_agent_memory_agent_id").on(table.agentId),
  })
);

export type AgentMemoryItem = typeof agentMemory.$inferSelect;
export type InsertAgentMemoryItem = typeof agentMemory.$inferInsert;

// Agent Tasks table
export const agentTasks = mysqlTable(
  "agent_tasks",
  {
    id: varchar("id", { length: 100 }).primaryKey(),
    agentId: varchar("agent_id", { length: 100 }).notNull(),
    taskDescription: text("task_description").notNull(),
    status: mysqlEnum("status", [
      "pending",
      "in_progress",
      "completed",
      "failed",
    ]).default("pending"),
    result: text("result"),
    error: text("error"),
    performanceScore: decimal("performance_score", { precision: 5, scale: 2 }),
    startTime: timestamp("start_time").defaultNow(),
    endTime: timestamp("end_time"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  table => ({
    agentIdx: index("idx_agent_tasks_agent_id").on(table.agentId),
    statusIdx: index("idx_agent_tasks_status").on(table.status),
  })
);

export type AgentTask = typeof agentTasks.$inferSelect;
export type InsertAgentTask = typeof agentTasks.$inferInsert;

// Agent Collaboration table (for tracking collaboration between agents)
export const agentCollaboration = mysqlTable(
  "agent_collaboration",
  {
    id: int("id").autoincrement().primaryKey(),
    agentId1: varchar("agent_id_1", { length: 100 }).notNull(),
    agentId2: varchar("agent_id_2", { length: 100 }).notNull(),
    taskId: varchar("task_id", { length: 100 }).notNull(),
    collaborationType: varchar("collaboration_type", { length: 50 }), // 'sequential', 'parallel', 'feedback'
    result: text("result"),
    successRate: decimal("success_rate", { precision: 5, scale: 2 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  table => ({
    agentIdx: index("idx_collaboration_agents").on(
      table.agentId1,
      table.agentId2
    ),
  })
);

export type AgentCollaboration = typeof agentCollaboration.$inferSelect;
export type InsertAgentCollaboration = typeof agentCollaboration.$inferInsert;

/** مقتطفات معرفة للمستخدم (RAG خفيف — مرحلة 3) */
export const knowledgeChunks = mysqlTable(
  "knowledge_chunks",
  {
    id: int("id").autoincrement().primaryKey(),
    tenantId: varchar("tenant_id", { length: 128 })
      .default("default")
      .notNull(),
    /** مستخدم الويب؛ null إن كان السجل لتليجرام */
    appUserId: int("app_user_id"),
    /** معرّف تليجرام؛ null إن كان السجل للويب */
    telegramUserId: bigint("telegram_user_id", { mode: "number" }),
    title: varchar("title", { length: 255 }),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  t => ({
    tenantAppIdx: index("idx_knowledge_tenant_app").on(t.tenantId, t.appUserId),
    tenantTgIdx: index("idx_knowledge_tenant_tg").on(
      t.tenantId,
      t.telegramUserId
    ),
  })
);

export type KnowledgeChunk = typeof knowledgeChunks.$inferSelect;
export type InsertKnowledgeChunk = typeof knowledgeChunks.$inferInsert;

/** آراء وتعليقات مستخدمي الويب (تجربة / إطلاق تجريبي) */
export const userFeedback = mysqlTable(
  "user_feedback",
  {
    id: int("id").autoincrement().primaryKey(),
    tenantId: varchar("tenant_id", { length: 128 })
      .default("default")
      .notNull(),
    appUserId: int("app_user_id").notNull(),
    category: varchar("category", { length: 32 }).default("general").notNull(),
    message: text("message").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  t => ({
    tenantCreatedIdx: index("idx_feedback_tenant_created").on(
      t.tenantId,
      t.createdAt
    ),
  })
);

export type UserFeedback = typeof userFeedback.$inferSelect;
export type InsertUserFeedback = typeof userFeedback.$inferInsert;

/** إحصاءات أنماط مجمّعة لكل مستأجر (عبر كل العملاء/الجلسات — بدون PII) */
export const collectivePatternStats = mysqlTable(
  "collective_pattern_stats",
  {
    id: int("id").autoincrement().primaryKey(),
    tenantId: varchar("tenant_id", { length: 128 })
      .default("default")
      .notNull(),
    patternHash: varchar("pattern_hash", { length: 64 }).notNull(),
    patternType: varchar("pattern_type", { length: 50 }).notNull(),
    patternPreview: varchar("pattern_preview", { length: 400 }).notNull(),
    totalOccurrences: int("total_occurrences").default(0).notNull(),
    qualitySum: decimal("quality_sum", { precision: 14, scale: 4 })
      .default("0")
      .notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  t => ({
    uniqTenantHash: uniqueIndex("uq_collective_tenant_hash").on(
      t.tenantId,
      t.patternHash
    ),
    tenantOccIdx: index("idx_collective_tenant_occ").on(
      t.tenantId,
      t.totalOccurrences
    ),
  })
);

export type CollectivePatternStat = typeof collectivePatternStats.$inferSelect;
export type InsertCollectivePatternStat =
  typeof collectivePatternStats.$inferInsert;
