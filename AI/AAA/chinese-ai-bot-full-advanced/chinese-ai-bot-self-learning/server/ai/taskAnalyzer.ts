/**
 * Task Analyzer - تحليل المهام الذكي
 * يحلل الرسائل ويحدد نوع المهمة والمتطلبات
 */

import { invokeLLM } from "../_core/llm";
import { TaskType } from "../tools/toolManager";

export interface AnalyzedTask {
  taskType: TaskType;
  description: string;
  requirements: string[];
  complexity: "simple" | "medium" | "complex";
  estimatedTime: number; // in milliseconds
  requiresCode: boolean;
  requiresInternet: boolean;
  requiresFiles: boolean;
  keywords: string[];
  confidence: number; // 0-1
  suggestedTools: string[];
}

export interface TaskContext {
  userId: string;
  conversationId: number;
  userPreferences?: Record<string, any>;
  previousTasks?: AnalyzedTask[];
}

/**
 * Task Analyzer Class
 */
export class TaskAnalyzer {
  /**
   * Analyze a message and determine the task type
   */
  async analyzeTask(
    message: string,
    context?: TaskContext
  ): Promise<AnalyzedTask> {
    // Use LLM to analyze the task
    const systemPrompt = `أنت محلل مهام متقدم. التزم بمبدأ عدم الضرر: لا تُبرّر ولا تصفّ طلبات إيذاء النفس أو الغير أو جرائم؛ إن وُجد ذلك صراحةً اجعل الوصف يعكس أن المهمة غير آمنة للتنفيذ (مع بقاء taskType ضمن القائمة المعطاة، مثل general_qa).

قم بتحليل الرسالة التالية وحدد:
1. نوع المهمة (من القائمة المعطاة)
2. وصف المهمة
3. المتطلبات
4. مستوى التعقيد
5. الوقت المتوقع
6. هل تحتاج كود؟
7. هل تحتاج انترنت؟
8. هل تحتاج ملفات؟
9. الكلمات الرئيسية
10. درجة الثقة

أنواع المهام المتاحة:
- text_generation: توليد نصوص
- code_generation: توليد أكواد
- image_generation: توليد صور
- image_analysis: تحليل صور
- video_generation: توليد فيديوهات
- speech_to_text: تحويل كلام إلى نص
- text_to_speech: تحويل نص إلى كلام
- data_analysis: تحليل بيانات
- web_scraping: جلب بيانات من الويب
- code_execution: تنفيذ أكواد
- general_qa: أسئلة عامة
- creative_writing: كتابة إبداعية
- translation: ترجمة
- summarization: تلخيص

أرجع الإجابة بصيغة JSON فقط.`;

    const userPrompt = `الرسالة: "${message}"

${context ? `السياق: المستخدم لديه التفضيلات التالية: ${JSON.stringify(context.userPreferences)}` : ""}

أرجع JSON بهذا الشكل:
{
  "taskType": "...",
  "description": "...",
  "requirements": [...],
  "complexity": "simple|medium|complex",
  "estimatedTime": 1000,
  "requiresCode": boolean,
  "requiresInternet": boolean,
  "requiresFiles": boolean,
  "keywords": [...],
  "confidence": 0.95,
  "suggestedTools": [...]
}`;

    try {
      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "task_analysis",
            strict: true,
            schema: {
              type: "object",
              properties: {
                taskType: {
                  type: "string",
                  enum: [
                    "text_generation",
                    "code_generation",
                    "image_generation",
                    "image_analysis",
                    "video_generation",
                    "speech_to_text",
                    "text_to_speech",
                    "data_analysis",
                    "web_scraping",
                    "code_execution",
                    "general_qa",
                    "creative_writing",
                    "translation",
                    "summarization",
                  ],
                },
                description: { type: "string" },
                requirements: {
                  type: "array",
                  items: { type: "string" },
                },
                complexity: {
                  type: "string",
                  enum: ["simple", "medium", "complex"],
                },
                estimatedTime: { type: "number" },
                requiresCode: { type: "boolean" },
                requiresInternet: { type: "boolean" },
                requiresFiles: { type: "boolean" },
                keywords: {
                  type: "array",
                  items: { type: "string" },
                },
                confidence: { type: "number" },
                suggestedTools: {
                  type: "array",
                  items: { type: "string" },
                },
              },
              required: [
                "taskType",
                "description",
                "requirements",
                "complexity",
                "estimatedTime",
                "requiresCode",
                "requiresInternet",
                "requiresFiles",
                "keywords",
                "confidence",
                "suggestedTools",
              ],
              additionalProperties: false,
            },
          },
        },
      });

      const content = response.choices[0].message.content;
      if (typeof content === "string") {
        const parsed = JSON.parse(content);
        return parsed as AnalyzedTask;
      }

      throw new Error("Invalid response format");
    } catch (error) {
      console.error("Error analyzing task:", error);
      // Return a default analysis
      return this.getDefaultAnalysis(message);
    }
  }

  /**
   * Get default analysis when LLM fails
   */
  private getDefaultAnalysis(message: string): AnalyzedTask {
    // Simple heuristics for task type detection
    let taskType: TaskType = "general_qa";

    if (
      message.toLowerCase().includes("code") ||
      message.toLowerCase().includes("برنامج")
    ) {
      taskType = "code_generation";
    } else if (
      message.toLowerCase().includes("image") ||
      message.toLowerCase().includes("صورة")
    ) {
      taskType = "image_generation";
    } else if (
      message.toLowerCase().includes("video") ||
      message.toLowerCase().includes("فيديو")
    ) {
      taskType = "video_generation";
    } else if (
      message.toLowerCase().includes("data") ||
      message.toLowerCase().includes("بيانات")
    ) {
      taskType = "data_analysis";
    } else if (
      message.toLowerCase().includes("translate") ||
      message.toLowerCase().includes("ترجم")
    ) {
      taskType = "translation";
    } else if (
      message.toLowerCase().includes("summary") ||
      message.toLowerCase().includes("ملخص")
    ) {
      taskType = "summarization";
    }

    return {
      taskType,
      description: message,
      requirements: [],
      complexity: "simple",
      estimatedTime: 2000,
      requiresCode: false,
      requiresInternet: false,
      requiresFiles: false,
      keywords: message.split(" ").slice(0, 5),
      confidence: 0.5,
      suggestedTools: [],
    };
  }

  /**
   * Classify task complexity
   */
  classifyComplexity(task: AnalyzedTask): "simple" | "medium" | "complex" {
    if (task.requirements.length === 0) {
      return "simple";
    } else if (task.requirements.length <= 3) {
      return "medium";
    } else {
      return "complex";
    }
  }

  /**
   * Extract keywords from message
   */
  extractKeywords(message: string): string[] {
    // Simple keyword extraction
    const words = message.toLowerCase().split(/\s+/);
    const stopWords = new Set([
      "the",
      "a",
      "an",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "to",
      "for",
      "of",
      "is",
      "are",
      "was",
      "were",
      "be",
      "been",
      "being",
      "have",
      "has",
      "had",
      "do",
      "does",
      "did",
      "will",
      "would",
      "could",
      "should",
      "may",
      "might",
      "must",
      "can",
      "الـ",
      "و",
      "أو",
      "في",
      "على",
      "من",
      "إلى",
      "هو",
      "هي",
      "هم",
      "هن",
    ]);

    return words
      .filter(word => word.length > 3 && !stopWords.has(word))
      .slice(0, 10);
  }

  /**
   * Estimate task complexity and time
   */
  estimateTaskMetrics(task: AnalyzedTask): {
    complexity: "simple" | "medium" | "complex";
    estimatedTime: number;
  } {
    let complexity: "simple" | "medium" | "complex" = "simple";
    let estimatedTime = 1000; // Base time in ms

    // Adjust based on task type
    switch (task.taskType) {
      case "text_generation":
        estimatedTime = 2000;
        complexity = "simple";
        break;
      case "code_generation":
        estimatedTime = 5000;
        complexity = "medium";
        break;
      case "image_generation":
        estimatedTime = 10000;
        complexity = "complex";
        break;
      case "video_generation":
        estimatedTime = 60000;
        complexity = "complex";
        break;
      case "data_analysis":
        estimatedTime = 8000;
        complexity = "medium";
        break;
      case "web_scraping":
        estimatedTime = 5000;
        complexity = "medium";
        break;
      case "code_execution":
        estimatedTime = 3000;
        complexity = "medium";
        break;
      default:
        estimatedTime = 2000;
        complexity = "simple";
    }

    // Adjust based on complexity
    if (task.complexity === "complex") {
      estimatedTime *= 2;
      complexity = "complex";
    } else if (task.complexity === "medium") {
      estimatedTime *= 1.5;
      complexity = "medium";
    }

    return { complexity, estimatedTime };
  }
}

// Export singleton instance
export const taskAnalyzer = new TaskAnalyzer();
