/**
 * Security Manager - مدير الأمان والحماية
 * حماية البوت من الاستخدام الخطير والهجمات
 */

import { getDb } from "../db";

export interface RateLimitConfig {
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
}

export interface SecurityLog {
  userId: string;
  action: string;
  timestamp: Date;
  severity: "low" | "medium" | "high";
  details?: Record<string, any>;
}

class SecurityManager {
  private rateLimitMap: Map<string, { count: number; resetTime: number }> =
    new Map();

  private readonly DEFAULT_RATE_LIMIT: RateLimitConfig = {
    requestsPerMinute: 10,
    requestsPerHour: 60,
    requestsPerDay: 500,
  };

  /**
   * Check rate limit
   */
  checkRateLimit(
    userId: string,
    config: RateLimitConfig = this.DEFAULT_RATE_LIMIT
  ): boolean {
    const key = `${userId}_minute`;
    const now = Date.now();

    let record = this.rateLimitMap.get(key);

    if (!record || now > record.resetTime) {
      // Reset counter
      this.rateLimitMap.set(key, {
        count: 1,
        resetTime: now + 60000, // 1 minute
      });
      return true;
    }

    if (record.count >= config.requestsPerMinute) {
      return false;
    }

    record.count++;
    return true;
  }

  /**
   * Validate user input
   */
  validateInput(input: string, maxLength: number = 10000): boolean {
    // Check length
    if (input.length > maxLength) {
      return false;
    }

    // Check for malicious patterns
    const maliciousPatterns = [
      /script>/i,
      /onclick/i,
      /onerror/i,
      /javascript:/i,
      /<iframe/i,
      /eval\(/i,
      /exec\(/i,
    ];

    for (const pattern of maliciousPatterns) {
      if (pattern.test(input)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Sanitize input
   */
  sanitizeInput(input: string): string {
    // Remove potentially dangerous characters
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/javascript:/gi, "")
      .replace(/on\w+\s*=/gi, "")
      .trim();
  }

  /**
   * Log security event
   */
  async logSecurityEvent(log: SecurityLog): Promise<void> {
    try {
      console.log(
        `🔒 Security Event [${log.severity.toUpperCase()}]: ${log.action}`
      );

      // In a real implementation, save to database
      // const db = await getDb();
      // if (db) {
      //   await db.insert(securityLogs).values(log);
      // }
    } catch (error) {
      console.error("Error logging security event:", error);
    }
  }

  /**
   * Detect suspicious activity
   */
  async detectSuspiciousActivity(
    userId: string,
    action: string,
    data: Record<string, any>
  ): Promise<boolean> {
    // Check for repeated failed attempts
    const failedAttempts = data.failedAttempts || 0;
    if (failedAttempts > 5) {
      await this.logSecurityEvent({
        userId,
        action: "suspicious_activity_detected",
        timestamp: new Date(),
        severity: "high",
        details: { action, failedAttempts },
      });
      return true;
    }

    // Check for unusual patterns
    if (action === "code_execution" && data.codeLength > 50000) {
      await this.logSecurityEvent({
        userId,
        action: "large_code_execution_attempt",
        timestamp: new Date(),
        severity: "medium",
        details: { codeLength: data.codeLength },
      });
      return true;
    }

    return false;
  }

  /**
   * Encrypt sensitive data
   */
  encryptData(data: string): string {
    // In a real implementation, use proper encryption
    return Buffer.from(data).toString("base64");
  }

  /**
   * Decrypt sensitive data
   */
  decryptData(encrypted: string): string {
    // In a real implementation, use proper decryption
    return Buffer.from(encrypted, "base64").toString("utf-8");
  }

  /**
   * Validate API key
   */
  validateApiKey(apiKey: string): boolean {
    // Check key format
    if (!apiKey || apiKey.length < 20) {
      return false;
    }

    // Check if key is in whitelist (in a real app, check against database)
    return true;
  }

  /**
   * Generate secure token
   */
  generateSecureToken(length: number = 32): string {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let token = "";
    for (let i = 0; i < length; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }

  /**
   * Check IP reputation
   */
  async checkIpReputation(ip: string): Promise<boolean> {
    // In a real implementation, check against IP reputation service
    // For now, return true (allow)
    return true;
  }
}

export const securityManager = new SecurityManager();
