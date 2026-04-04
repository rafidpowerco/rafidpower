/**
 * Code Executor - محرك تنفيذ الأكواد الآمن
 * ينفذ الأكواد في بيئة آمنة معزولة
 */

export interface ExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  executionTime: number;
  resourcesUsed: {
    memory: number;
    cpu: number;
  };
}

export interface CodeExecutionRequest {
  code: string;
  language: "python" | "javascript" | "nodejs";
  timeout?: number;
  maxMemory?: number;
}

/**
 * Code Executor Class
 */
export class CodeExecutor {
  private readonly DEFAULT_TIMEOUT = 30000; // 30 seconds
  private readonly DEFAULT_MAX_MEMORY = 512 * 1024 * 1024; // 512 MB
  private readonly DANGEROUS_PATTERNS = [
    /import\s+os/,
    /import\s+sys/,
    /subprocess/,
    /exec\(/,
    /eval\(/,
    /open\(/,
    /socket/,
    /requests\./,
    /urllib/,
    /__import__/,
  ];

  /**
   * Validate code for security
   */
  validateCode(
    code: string,
    language: string
  ): { valid: boolean; reason?: string } {
    // Check for dangerous patterns
    for (const pattern of this.DANGEROUS_PATTERNS) {
      if (pattern.test(code)) {
        return {
          valid: false,
          reason: `Dangerous pattern detected: ${pattern.source}`,
        };
      }
    }

    // Check code length
    if (code.length > 10000) {
      return {
        valid: false,
        reason: "Code is too long (max 10000 characters)",
      };
    }

    // Check for infinite loops (simple heuristic)
    if (code.match(/while\s*\(\s*true\s*\)/)) {
      return {
        valid: false,
        reason: "Infinite loops are not allowed",
      };
    }

    return { valid: true };
  }

  /**
   * Execute Python code
   */
  async executePython(
    code: string,
    timeout: number = this.DEFAULT_TIMEOUT
  ): Promise<ExecutionResult> {
    const validation = this.validateCode(code, "python");
    if (!validation.valid) {
      return {
        success: false,
        output: "",
        error: validation.reason,
        executionTime: 0,
        resourcesUsed: { memory: 0, cpu: 0 },
      };
    }

    const startTime = Date.now();

    try {
      // In a real implementation, this would use a sandbox like E2B or Docker
      // For now, we'll return a mock response
      const output = await this.mockPythonExecution(code, timeout);

      return {
        success: true,
        output,
        executionTime: Date.now() - startTime,
        resourcesUsed: { memory: 100, cpu: 50 },
      };
    } catch (error) {
      return {
        success: false,
        output: "",
        error: error instanceof Error ? error.message : "Unknown error",
        executionTime: Date.now() - startTime,
        resourcesUsed: { memory: 0, cpu: 0 },
      };
    }
  }

  /**
   * Execute JavaScript code
   */
  async executeJavaScript(
    code: string,
    timeout: number = this.DEFAULT_TIMEOUT
  ): Promise<ExecutionResult> {
    const validation = this.validateCode(code, "javascript");
    if (!validation.valid) {
      return {
        success: false,
        output: "",
        error: validation.reason,
        executionTime: 0,
        resourcesUsed: { memory: 0, cpu: 0 },
      };
    }

    const startTime = Date.now();

    try {
      // In a real implementation, this would use a sandbox like E2B or VM2
      const output = await this.mockJavaScriptExecution(code, timeout);

      return {
        success: true,
        output,
        executionTime: Date.now() - startTime,
        resourcesUsed: { memory: 80, cpu: 40 },
      };
    } catch (error) {
      return {
        success: false,
        output: "",
        error: error instanceof Error ? error.message : "Unknown error",
        executionTime: Date.now() - startTime,
        resourcesUsed: { memory: 0, cpu: 0 },
      };
    }
  }

  /**
   * Execute code (auto-detect language)
   */
  async execute(request: CodeExecutionRequest): Promise<ExecutionResult> {
    const timeout = request.timeout || this.DEFAULT_TIMEOUT;

    switch (request.language) {
      case "python":
        return this.executePython(request.code, timeout);
      case "javascript":
      case "nodejs":
        return this.executeJavaScript(request.code, timeout);
      default:
        return {
          success: false,
          output: "",
          error: `Unsupported language: ${request.language}`,
          executionTime: 0,
          resourcesUsed: { memory: 0, cpu: 0 },
        };
    }
  }

  /**
   * Mock Python execution (for testing)
   */
  private async mockPythonExecution(
    code: string,
    timeout: number
  ): Promise<string> {
    // Simulate execution
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error("Execution timeout"));
      }, timeout);

      try {
        // Simple mock - in production, use actual sandbox
        if (code.includes("print")) {
          const match = code.match(/print\((.*?)\)/);
          if (match) {
            clearTimeout(timer);
            resolve(match[1].replace(/['"]/g, ""));
          }
        } else {
          clearTimeout(timer);
          resolve("Code executed successfully");
        }
      } catch (error) {
        clearTimeout(timer);
        reject(error);
      }
    });
  }

  /**
   * Mock JavaScript execution (for testing)
   */
  private async mockJavaScriptExecution(
    code: string,
    timeout: number
  ): Promise<string> {
    // Simulate execution
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error("Execution timeout"));
      }, timeout);

      try {
        // Simple mock - in production, use actual sandbox
        if (code.includes("console.log")) {
          const match = code.match(/console\.log\((.*?)\)/);
          if (match) {
            clearTimeout(timer);
            resolve(match[1].replace(/['"]/g, ""));
          }
        } else {
          clearTimeout(timer);
          resolve("Code executed successfully");
        }
      } catch (error) {
        clearTimeout(timer);
        reject(error);
      }
    });
  }

  /**
   * Generate code from natural language
   */
  async generateCode(
    description: string,
    language: "python" | "javascript"
  ): Promise<string> {
    // This would call an LLM to generate code
    // For now, return a template
    if (language === "python") {
      return `# ${description}\n# قالب مبدئي — استبدل بالتنفيذ الفعلي\nprint("Hello, World!")`;
    } else {
      return `// ${description}\n// قالب مبدئي — استبدل بالتنفيذ الفعلي\nconsole.log("Hello, World!");`;
    }
  }

  /**
   * Analyze code for potential issues
   */
  analyzeCode(code: string): { issues: string[]; warnings: string[] } {
    const issues: string[] = [];
    const warnings: string[] = [];

    // Check for dangerous patterns
    if (/eval\(/.test(code)) {
      issues.push("eval() is dangerous and should be avoided");
    }

    if (/exec\(/.test(code)) {
      issues.push("exec() is dangerous and should be avoided");
    }

    // Check for common mistakes
    if (/==\s*true/.test(code)) {
      warnings.push("Use === instead of == for comparison");
    }

    if (/var\s+/.test(code)) {
      warnings.push("Use let or const instead of var");
    }

    // Check for missing error handling
    if (/try\s*{/.test(code) && !/catch\s*\(/.test(code)) {
      warnings.push("Try block without catch - consider adding error handling");
    }

    return { issues, warnings };
  }

  /**
   * Optimize code for performance
   */
  optimizeCode(code: string, language: string): string {
    // Simple optimization suggestions
    let optimized = code;

    if (language === "python") {
      // Replace for loops with list comprehensions where possible
      optimized = optimized.replace(
        /for\s+\w+\s+in\s+range\(/g,
        "# Consider using range() with step parameter"
      );
    }

    return optimized;
  }
}

// Export singleton instance
export const codeExecutor = new CodeExecutor();
