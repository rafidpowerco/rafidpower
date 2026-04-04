/**
 * Notification Manager - مدير التنبيهات والإشعارات
 * إرسال التنبيهات والإشعارات للمستخدمين
 */

import { notifyOwner } from "../_core/notification";

export interface NotificationConfig {
  type: "error" | "warning" | "info" | "success";
  title: string;
  content: string;
  userId?: string;
  priority?: "low" | "medium" | "high";
  actionUrl?: string;
}

class NotificationManager {
  /**
   * Send notification to owner
   */
  async notifyOwner(config: NotificationConfig): Promise<boolean> {
    try {
      console.log(`📢 Sending notification: ${config.title}`);

      const result = await notifyOwner({
        title: config.title,
        content: config.content,
      });

      return result;
    } catch (error) {
      console.error("Error sending notification:", error);
      return false;
    }
  }

  /**
   * Send error notification
   */
  async notifyError(title: string, error: Error | string): Promise<boolean> {
    const content = error instanceof Error ? error.message : String(error);

    return this.notifyOwner({
      type: "error",
      title,
      content,
      priority: "high",
    });
  }

  /**
   * Send warning notification
   */
  async notifyWarning(title: string, message: string): Promise<boolean> {
    return this.notifyOwner({
      type: "warning",
      title,
      content: message,
      priority: "medium",
    });
  }

  /**
   * Send success notification
   */
  async notifySuccess(title: string, message: string): Promise<boolean> {
    return this.notifyOwner({
      type: "success",
      title,
      content: message,
      priority: "low",
    });
  }

  /**
   * Send info notification
   */
  async notifyInfo(title: string, message: string): Promise<boolean> {
    return this.notifyOwner({
      type: "info",
      title,
      content: message,
      priority: "low",
    });
  }

  /**
   * Notify about new model discovery
   */
  async notifyNewModelDiscovered(
    modelName: string,
    modelId: string
  ): Promise<boolean> {
    return this.notifyOwner({
      type: "info",
      title: "🆕 New Model Discovered",
      content: `A new model has been discovered: ${modelName} (${modelId}). It's now available for use.`,
      priority: "medium",
    });
  }

  /**
   * Notify about high error rate
   */
  async notifyHighErrorRate(
    modelId: string,
    errorRate: number
  ): Promise<boolean> {
    return this.notifyOwner({
      type: "warning",
      title: "⚠️ High Error Rate Detected",
      content: `Model ${modelId} has a high error rate: ${(errorRate * 100).toFixed(2)}%. Consider switching to a different model.`,
      priority: "high",
    });
  }

  /**
   * Notify about learning milestone
   */
  async notifyLearningMilestone(
    milestone: string,
    details: string
  ): Promise<boolean> {
    return this.notifyOwner({
      type: "success",
      title: "🎯 Learning Milestone Reached",
      content: `${milestone}: ${details}`,
      priority: "medium",
    });
  }

  /**
   * Notify about resource usage
   */
  async notifyResourceUsage(
    resourceType: string,
    usage: number,
    limit: number
  ): Promise<boolean> {
    const percentage = (usage / limit) * 100;

    if (percentage > 90) {
      return this.notifyOwner({
        type: "warning",
        title: "⚠️ High Resource Usage",
        content: `${resourceType} usage is at ${percentage.toFixed(2)}% of limit.`,
        priority: "high",
      });
    }

    return true;
  }

  /**
   * Notify about scheduled maintenance
   */
  async notifyMaintenance(
    startTime: Date,
    endTime: Date,
    reason: string
  ): Promise<boolean> {
    return this.notifyOwner({
      type: "info",
      title: "🔧 Scheduled Maintenance",
      content: `Maintenance scheduled from ${startTime.toISOString()} to ${endTime.toISOString()}. Reason: ${reason}`,
      priority: "medium",
    });
  }

  /**
   * Notify about security event
   */
  async notifySecurityEvent(
    eventType: string,
    details: string
  ): Promise<boolean> {
    return this.notifyOwner({
      type: "warning",
      title: "🔒 Security Event",
      content: `${eventType}: ${details}`,
      priority: "high",
    });
  }

  /**
   * Notify about performance issue
   */
  async notifyPerformanceIssue(
    metric: string,
    currentValue: number,
    threshold: number
  ): Promise<boolean> {
    return this.notifyOwner({
      type: "warning",
      title: "⚡ Performance Issue",
      content: `${metric} is ${currentValue}, which exceeds the threshold of ${threshold}.`,
      priority: "medium",
    });
  }
}

export const notificationManager = new NotificationManager();
