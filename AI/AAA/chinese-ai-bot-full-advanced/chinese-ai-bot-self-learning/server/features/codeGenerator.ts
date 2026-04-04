/**
 * Code Generator - توليد وتنفيذ الأكواد
 */

import { invokeLLM } from "../_core/llm";
import { codeExecutor } from "../ai/codeExecutor";

export interface GeneratedCode {
  language: string;
  code: string;
  explanation: string;
  dependencies?: string[];
}

export interface ExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  executionTime: number;
}

class CodeGenerator {
  /**
   * Generate code from description
   */
  async generateCode(
    description: string,
    language: string = "python"
  ): Promise<GeneratedCode> {
    try {
      console.log("💻 Generating code:", description);

      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `You are an expert ${language} programmer. Generate clean, well-commented code.`,
          },
          {
            role: "user",
            content: `Generate ${language} code for: ${description}`,
          },
        ],
      });

      const content =
        typeof response.choices[0]?.message?.content === "string"
          ? response.choices[0].message.content
          : "";

      // Extract code and explanation
      const codeMatch = content.match(/```[\w]*\n([\s\S]*?)\n```/);
      const code = codeMatch ? codeMatch[1] : content;

      return {
        language,
        code,
        explanation: content,
        dependencies: this.extractDependencies(code, language),
      };
    } catch (error) {
      console.error("Error generating code:", error);
      throw error;
    }
  }

  /**
   * Execute generated code
   */
  async executeCode(
    code: string,
    language: string = "python"
  ): Promise<ExecutionResult> {
    try {
      console.log("▶️ Executing code");

      // Validate code before execution
      const isValid = this.validateCode(code, language);
      if (!isValid) {
        return {
          success: false,
          output: "",
          error: "Code validation failed",
          executionTime: 0,
        };
      }

      // Execute code
      const startTime = Date.now();
      const result = await codeExecutor.execute({
        code,
        language: language as "python" | "javascript" | "nodejs",
      });
      const executionTime = Date.now() - startTime;

      return {
        success: result.success,
        output: result.output,
        error: result.error,
        executionTime,
      };
    } catch (error) {
      console.error("Error executing code:", error);
      return {
        success: false,
        output: "",
        error: String(error),
        executionTime: 0,
      };
    }
  }

  /**
   * Validate code for security
   */
  private validateCode(code: string, language: string): boolean {
    // Check for dangerous operations
    const dangerousPatterns = [
      /rm\s+-rf/i, // Remove files recursively
      /exec\s*\(/i, // Execute system commands
      /eval\s*\(/i, // Eval function
      /import\s+os/i, // OS module
      /subprocess/i, // Subprocess module
      /system\s*\(/i, // System calls
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(code)) {
        console.warn("⚠️ Dangerous pattern detected:", pattern);
        return false;
      }
    }

    return true;
  }

  /**
   * Extract dependencies from code
   */
  private extractDependencies(code: string, language: string): string[] {
    const dependencies: string[] = [];

    if (language === "python") {
      const importMatch = code.match(/import\s+(\w+)|from\s+(\w+)/g);
      if (importMatch) {
        importMatch.forEach(imp => {
          const match = imp.match(/import\s+(\w+)|from\s+(\w+)/);
          if (match) {
            dependencies.push(match[1] || match[2]);
          }
        });
      }
    } else if (language === "javascript") {
      const requireMatch = code.match(/require\s*\(\s*['"]([^'"]+)['"]\s*\)/g);
      if (requireMatch) {
        requireMatch.forEach(req => {
          const match = req.match(/require\s*\(\s*['"]([^'"]+)['"]\s*\)/);
          if (match) {
            dependencies.push(match[1]);
          }
        });
      }
    }

    return dependencies;
  }

  /**
   * Optimize code
   */
  async optimizeCode(code: string, language: string): Promise<string> {
    try {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `You are a ${language} code optimization expert. Optimize the code for performance and readability.`,
          },
          {
            role: "user",
            content: `Optimize this ${language} code:\n\n${code}`,
          },
        ],
      });

      const content =
        typeof response.choices[0]?.message?.content === "string"
          ? response.choices[0].message.content
          : code;

      const codeMatch = content.match(/```[\w]*\n([\s\S]*?)\n```/);
      return codeMatch ? codeMatch[1] : content;
    } catch (error) {
      console.error("Error optimizing code:", error);
      return code;
    }
  }

  /**
   * Explain code
   */
  async explainCode(code: string, language: string): Promise<string> {
    try {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `You are a ${language} code expert. Explain the code in detail.`,
          },
          {
            role: "user",
            content: `Explain this ${language} code:\n\n${code}`,
          },
        ],
      });

      return typeof response.choices[0]?.message?.content === "string"
        ? response.choices[0].message.content
        : "Unable to explain code";
    } catch (error) {
      console.error("Error explaining code:", error);
      throw error;
    }
  }
}

export const codeGenerator = new CodeGenerator();
