/**
 * Analytics Engine - محرك الإحصائيات والتحليلات
 * تحليل البيانات وتوليد التقارير والرؤى
 */

import { eq, and } from "drizzle-orm";
import { getDb } from "../db";
import { conversations, modelPerformance } from "../../drizzle/schema";
import { ENV } from "../_core/env";

export interface UserStats {
  totalMessages: number;
  totalConversations: number;
  averageResponseTime: number;
  mostUsedModel: string;
  successRate: number;
  lastActive: Date;
}

export interface ModelStats {
  modelId: string;
  totalUses: number;
  successCount: number;
  failureCount: number;
  averageResponseTime: number;
  successRate: number;
  averageQuality: number;
}

export interface InsightData {
  type: "trend" | "anomaly" | "recommendation" | "warning";
  title: string;
  description: string;
  severity: "low" | "medium" | "high";
  data: Record<string, any>;
}

class AnalyticsEngine {
  /**
   * Get user statistics
   */
  async getUserStats(
    userId: bigint,
    tenantId: string = ENV.defaultTenantId
  ): Promise<UserStats> {
    const db = await getDb();
    if (!db) {
      return {
        totalMessages: 0,
        totalConversations: 0,
        averageResponseTime: 0,
        mostUsedModel: "unknown",
        successRate: 0,
        lastActive: new Date(),
      };
    }

    try {
      const convCount = await db
        .select()
        .from(conversations)
        .where(
          and(
            eq(conversations.telegramUserId, Number(userId)),
            eq(conversations.tenantId, tenantId)
          )
        );

      // Calculate stats
      const totalMessages = convCount.reduce(
        (sum, c) => sum + (c.messageCount || 0),
        0
      );
      const totalConversations = convCount.length;
      const averageResponseTime =
        convCount.reduce((sum, c) => sum + (Number(c.model) || 0), 0) /
          totalConversations || 0;

      return {
        totalMessages,
        totalConversations,
        averageResponseTime,
        mostUsedModel: "gpt-4",
        successRate: 0.92,
        lastActive: new Date(),
      };
    } catch (error) {
      console.error("Error getting user stats:", error);
      return {
        totalMessages: 0,
        totalConversations: 0,
        averageResponseTime: 0,
        mostUsedModel: "unknown",
        successRate: 0,
        lastActive: new Date(),
      };
    }
  }

  /**
   * Get model statistics
   */
  async getModelStats(
    modelId: string,
    tenantId: string = ENV.defaultTenantId
  ): Promise<ModelStats> {
    const db = await getDb();
    if (!db) {
      return {
        modelId,
        totalUses: 0,
        successCount: 0,
        failureCount: 0,
        averageResponseTime: 0,
        successRate: 0,
        averageQuality: 0,
      };
    }

    try {
      const perfData = await db
        .select()
        .from(modelPerformance)
        .where(
          and(
            eq(modelPerformance.model, String(modelId)),
            eq(modelPerformance.tenantId, tenantId)
          )
        );

      const totalUses = perfData.length;
      const successCount = perfData.filter(
        p => Number(p.successRate) > 0.8
      ).length;
      const failureCount = totalUses - successCount;
      const averageResponseTime =
        perfData.reduce(
          (sum, p) => sum + (Number(p.averageResponseTime) || 0),
          0
        ) / totalUses || 0;
      const averageQuality =
        perfData.reduce((sum, p) => sum + (Number(p.averageRating) || 0), 0) /
          totalUses || 0;

      return {
        modelId,
        totalUses,
        successCount,
        failureCount,
        averageResponseTime,
        successRate: successCount / totalUses,
        averageQuality,
      };
    } catch (error) {
      console.error("Error getting model stats:", error);
      return {
        modelId,
        totalUses: 0,
        successCount: 0,
        failureCount: 0,
        averageResponseTime: 0,
        successRate: 0,
        averageQuality: 0,
      };
    }
  }

  /**
   * Generate insights
   */
  async generateInsights(
    userId: bigint,
    tenantId: string = ENV.defaultTenantId
  ): Promise<InsightData[]> {
    const insights: InsightData[] = [];

    try {
      const userStats = await this.getUserStats(userId, tenantId);

      // Insight 1: Usage trend
      if (userStats.totalMessages > 100) {
        insights.push({
          type: "trend",
          title: "High Usage Activity",
          description: `You have sent ${userStats.totalMessages} messages across ${userStats.totalConversations} conversations`,
          severity: "low",
          data: { totalMessages: userStats.totalMessages },
        });
      }

      // Insight 2: Performance recommendation
      if (userStats.successRate < 0.8) {
        insights.push({
          type: "recommendation",
          title: "Improve Success Rate",
          description:
            "Consider using different models or providing more context",
          severity: "medium",
          data: { currentSuccessRate: userStats.successRate },
        });
      }

      // Insight 3: Response time warning
      if (userStats.averageResponseTime > 5000) {
        insights.push({
          type: "warning",
          title: "Slow Response Times",
          description: "Average response time is higher than usual",
          severity: "medium",
          data: { averageResponseTime: userStats.averageResponseTime },
        });
      }

      return insights;
    } catch (error) {
      console.error("Error generating insights:", error);
      return [];
    }
  }

  /**
   * Get trending topics
   */
  async getTrendingTopics(
    userId: bigint,
    limit: number = 5,
    tenantId: string = ENV.defaultTenantId
  ): Promise<string[]> {
    const db = await getDb();
    if (!db) return [];

    try {
      const convs = await db
        .select()
        .from(conversations)
        .where(
          and(
            eq(conversations.telegramUserId, Number(userId)),
            eq(conversations.tenantId, tenantId)
          )
        );

      // Extract topics from messages (simplified)
      const topics: Record<string, number> = {};

      for (const conv of convs) {
        const message = conv.title || "";
        const words = message.split(" ").filter((w: string) => w.length > 3);

        for (const word of words) {
          topics[word] = (topics[word] || 0) + 1;
        }
      }

      // Sort and return top topics
      return Object.entries(topics)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([topic]) => topic);
    } catch (error) {
      console.error("Error getting trending topics:", error);
      return [];
    }
  }

  /**
   * Generate report
   */
  async generateReport(
    userId: bigint,
    tenantId: string = ENV.defaultTenantId
  ): Promise<Record<string, any>> {
    try {
      const userStats = await this.getUserStats(userId, tenantId);
      const insights = await this.generateInsights(userId, tenantId);
      const trendingTopics = await this.getTrendingTopics(userId, 5, tenantId);

      return {
        generatedAt: new Date(),
        userStats,
        insights,
        trendingTopics,
        recommendations: this.generateRecommendations(userStats, insights),
      };
    } catch (error) {
      console.error("Error generating report:", error);
      return {};
    }
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    stats: UserStats,
    insights: InsightData[]
  ): string[] {
    const recommendations: string[] = [];

    if (stats.successRate < 0.85) {
      recommendations.push(
        "Try providing more detailed context in your messages"
      );
    }

    if (stats.averageResponseTime > 3000) {
      recommendations.push("Consider using faster models for quick responses");
    }

    if (insights.length > 0) {
      recommendations.push("Review the insights above for personalized tips");
    }

    return recommendations;
  }
}

export const analyticsEngine = new AnalyticsEngine();
