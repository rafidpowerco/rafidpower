/**
 * File Processor - معالج الملفات والمستندات
 * معالجة ورفع وتحليل الملفات
 */

import { storagePut, storageGet } from "../storage";
import { invokeLLM } from "../_core/llm";

export interface ProcessedFile {
  fileKey: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: Date;
  analysis?: string;
}

class FileProcessor {
  /**
   * Upload file to S3
   */
  async uploadFile(
    fileBuffer: Buffer,
    fileName: string,
    userId: string
  ): Promise<ProcessedFile> {
    try {
      console.log("📁 Uploading file:", fileName);

      // Generate file key
      const fileExtension = fileName.split(".").pop() || "bin";
      const fileKey = `${userId}/files/${Date.now()}-${fileName}`;

      // Upload to S3
      const { url } = await storagePut(
        fileKey,
        fileBuffer,
        this.getMimeType(fileExtension)
      );

      return {
        fileKey,
        fileUrl: url,
        fileName,
        fileType: fileExtension,
        fileSize: fileBuffer.length,
        uploadedAt: new Date(),
      };
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  }

  /**
   * Analyze file content
   */
  async analyzeFile(fileUrl: string, fileName: string): Promise<string> {
    try {
      console.log("🔍 Analyzing file:", fileName);

      const fileType = fileName.split(".").pop()?.toLowerCase() || "";

      // Handle different file types
      if (["txt", "md", "json"].includes(fileType)) {
        return await this.analyzeTextFile(fileUrl);
      } else if (["jpg", "jpeg", "png", "webp"].includes(fileType)) {
        return await this.analyzeImageFile(fileUrl);
      } else if (["pdf"].includes(fileType)) {
        return await this.analyzePdfFile(fileUrl);
      } else {
        return "File type not supported for analysis";
      }
    } catch (error) {
      console.error("Error analyzing file:", error);
      throw error;
    }
  }

  /**
   * Analyze text file
   */
  private async analyzeTextFile(fileUrl: string): Promise<string> {
    try {
      // Fetch file content
      const response = await fetch(fileUrl);
      const content = await response.text();

      // Analyze with LLM
      const analysis = await invokeLLM({
        messages: [
          {
            role: "system",
            content:
              "You are a document analysis expert. Analyze the provided text and summarize key points.",
          },
          {
            role: "user",
            content: `Analyze this document:\n\n${content.substring(0, 5000)}`,
          },
        ],
      });

      return typeof analysis.choices[0]?.message?.content === "string"
        ? analysis.choices[0].message.content
        : "Unable to analyze file";
    } catch (error) {
      console.error("Error analyzing text file:", error);
      throw error;
    }
  }

  /**
   * Analyze image file
   */
  private async analyzeImageFile(fileUrl: string): Promise<string> {
    try {
      const analysis = await invokeLLM({
        messages: [
          {
            role: "system",
            content:
              "You are an image analysis expert. Describe what you see in the image.",
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Please analyze this image.",
              },
              {
                type: "image_url",
                image_url: {
                  url: fileUrl,
                  detail: "high",
                },
              },
            ],
          },
        ],
      });

      return typeof analysis.choices[0]?.message?.content === "string"
        ? analysis.choices[0].message.content
        : "Unable to analyze image";
    } catch (error) {
      console.error("Error analyzing image file:", error);
      throw error;
    }
  }

  /**
   * Analyze PDF file
   */
  private async analyzePdfFile(fileUrl: string): Promise<string> {
    try {
      // In a real implementation, extract text from PDF first
      return "PDF analysis requires text extraction. Please implement PDF processing.";
    } catch (error) {
      console.error("Error analyzing PDF file:", error);
      throw error;
    }
  }

  /**
   * Get MIME type from file extension
   */
  private getMimeType(extension: string): string {
    const mimeTypes: Record<string, string> = {
      txt: "text/plain",
      md: "text/markdown",
      json: "application/json",
      pdf: "application/pdf",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
      mp3: "audio/mpeg",
      wav: "audio/wav",
      mp4: "video/mp4",
      webm: "video/webm",
    };

    return mimeTypes[extension.toLowerCase()] || "application/octet-stream";
  }

  /**
   * Delete file from S3
   */
  async deleteFile(fileKey: string): Promise<void> {
    try {
      console.log("🗑️ Deleting file:", fileKey);
      // Implement S3 delete operation
      // await s3.deleteObject({ Bucket, Key: fileKey }).promise();
    } catch (error) {
      console.error("Error deleting file:", error);
      throw error;
    }
  }

  /**
   * Get file download URL
   */
  async getFileUrl(fileKey: string, expiresIn: number = 3600): Promise<string> {
    try {
      const { url } = await storageGet(fileKey);
      return url;
    } catch (error) {
      console.error("Error getting file URL:", error);
      throw error;
    }
  }
}

export const fileProcessor = new FileProcessor();
