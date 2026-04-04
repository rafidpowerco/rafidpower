/**
 * Telegram Bot Handler - معالج بوت تليجرام
 * يتعامل مع الرسائل والأوامر من تليجرام
 */

import TelegramBot from "node-telegram-bot-api";
import { getDb } from "../db";
import { telegramUsers, conversations, messages } from "../../drizzle/schema";
import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { toolManager } from "../tools/toolManager";
import { learningEngine } from "../ai/learningEngine";
import { unifiedFreeOrchestrator } from "../ai/unifiedFreeOrchestrator";
import { ENV } from "../_core/env";

const TELEGRAM_MESSAGE_MAX = 4090;

function splitTelegramChunks(text: string): string[] {
  if (text.length <= TELEGRAM_MESSAGE_MAX) return [text];
  const out: string[] = [];
  let rest = text;
  while (rest.length > TELEGRAM_MESSAGE_MAX) {
    let end = TELEGRAM_MESSAGE_MAX;
    let chunk = rest.slice(0, end);
    const br = Math.max(
      chunk.lastIndexOf("\n\n"),
      chunk.lastIndexOf("\n"),
      chunk.lastIndexOf(" ")
    );
    if (br >= Math.floor(TELEGRAM_MESSAGE_MAX * 0.55)) {
      end = br + (chunk[br] === "\n" ? 1 : 0);
      chunk = rest.slice(0, end);
    }
    out.push(chunk.trimEnd());
    rest = rest.slice(end).trimStart();
  }
  if (rest.length) out.push(rest);
  return out;
}

export class TelegramBotHandler {
  private bot: TelegramBot;
  private token: string;

  constructor(token: string) {
    this.token = token;
    this.bot = new TelegramBot(token, { polling: true });
  }

  /**
   * Initialize the bot
   */
  async initialize(): Promise<void> {
    // Handle /start command
    this.bot.onText(/\/start/, async (msg: TelegramBot.Message) => {
      await this.handleStart(msg);
    });

    // Handle /help command
    this.bot.onText(/\/help/, async (msg: TelegramBot.Message) => {
      await this.handleHelp(msg);
    });

    // Handle /status command
    this.bot.onText(/\/status/, async (msg: TelegramBot.Message) => {
      await this.handleStatus(msg);
    });

    // Handle /models command
    this.bot.onText(/\/models/, async (msg: TelegramBot.Message) => {
      await this.handleModels(msg);
    });

    // Handle /stats command
    this.bot.onText(/\/stats/, async (msg: TelegramBot.Message) => {
      await this.handleStats(msg);
    });

    this.bot.onText(/\/newchat/, async (msg: TelegramBot.Message) => {
      await this.handleNewChat(msg);
    });

    // Handle /setmodel command
    this.bot.onText(
      /\/setmodel (.+)/,
      async (msg: TelegramBot.Message, match: RegExpExecArray | null) => {
        if (match && match[1]) {
          await this.handleSetModel(msg, match[1]);
        }
      }
    );

    // Handle regular messages
    this.bot.on("message", async (msg: TelegramBot.Message) => {
      if (msg.text && !msg.text.startsWith("/")) {
        await this.handleMessage(msg);
      }
    });

    console.log("Telegram bot initialized successfully");
  }

  /**
   * Handle /start command
   */
  private async handleStart(msg: TelegramBot.Message): Promise<void> {
    const chatId = msg.chat.id;
    const userId = msg.from?.id;

    if (!userId) return;

    // Save user to database
    const db = await getDb();
    if (db) {
      const existing = await db
        .select()
        .from(telegramUsers)
        .where(eq(telegramUsers.telegramId, userId))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(telegramUsers).values({
          telegramId: userId,
          firstName: msg.from?.first_name,
          lastName: msg.from?.last_name,
          username: msg.from?.username,
          messageCount: 0,
          currentModel: "openrouter_qwen",
          isActive: true,
        });
      }
    }

    const welcomeMessage = `
🤖 مرحباً بك في بوت الذكاء الاصطناعي المتطور!

أنا بوت ذكي يمكنه:
✅ توليد النصوص والأكواد
✅ تحليل الصور والفيديوهات
✅ تنفيذ الأكواد بشكل آمن
✅ تحليل البيانات
✅ التعلم من تفاعلاتك

الأوامر المتاحة:
/help - عرض المساعدة
/models - عرض النماذج المتاحة
/setmodel <model> - تعيين نموذج افتراضي
/stats - عرض إحصائياتك
/status - حالة البوت
/newchat - محادثة جديدة (إغلاق السياق الحالي)

فقط أرسل لي أي سؤال أو مهمة وسأساعدك! 🚀
    `;

    await this.sendChunked(chatId, welcomeMessage);
  }

  /**
   * Handle /help command
   */
  private async handleHelp(msg: TelegramBot.Message): Promise<void> {
    const chatId = msg.chat.id;

    const helpMessage = `
📚 دليل الاستخدام

أنواع المهام التي يمكنني القيام بها:

1️⃣ توليد النصوص:
   "اكتب لي مقالة عن الذكاء الاصطناعي"
   "اكتب قصة قصيرة"

2️⃣ توليد الأكواد:
   "اكتب لي برنامج Python يحسب الأعداد الأولية"
   "اكتب دالة JavaScript لفرز المصفوفة"

3️⃣ تحليل الصور:
   أرسل صورة وأطلب تحليلها

4️⃣ تحليل البيانات:
   "حلل هذه البيانات: ..."

5️⃣ الترجمة:
   "ترجم هذا النص إلى الإنجليزية"

6️⃣ التلخيص:
   "لخص هذا المقال"

استخدم /models لرؤية جميع النماذج المتاحة
/newchat لبدء سياق محادثة جديد
    `;

    await this.sendChunked(chatId, helpMessage);
  }

  /**
   * إغلاق المحادثات النشطة لتليجرام — الرسالة التالية تفتح محادثة جديدة
   */
  private async handleNewChat(msg: TelegramBot.Message): Promise<void> {
    const chatId = msg.chat.id;
    const userId = msg.from?.id;
    if (!userId) return;

    const tenantId = ENV.defaultTenantId;
    const db = await getDb();
    if (db) {
      await db
        .update(conversations)
        .set({ isActive: false })
        .where(
          and(
            eq(conversations.telegramUserId, userId),
            eq(conversations.tenantId, tenantId),
            isNull(conversations.appUserId)
          )
        );
    }
    await this.sendChunked(
      chatId,
      "✅ تم تجهيز محادثة جديدة. اكتب رسالتك التالية لبدء سياق جديد."
    );
  }

  /** إرسال آمن حد تليجرام (~4096) — يُستخدم لكل الردود النصية */
  private async sendChunked(chatId: number, text: string): Promise<void> {
    for (const part of splitTelegramChunks(text)) {
      await this.bot.sendMessage(chatId, part);
    }
  }

  /**
   * Handle /models command
   */
  private async handleModels(msg: TelegramBot.Message): Promise<void> {
    const chatId = msg.chat.id;
    const tools = toolManager.getAllTools();

    let modelsMessage = "🤖 النماذج والأدوات المتاحة:\n\n";

    tools.forEach(tool => {
      modelsMessage += `📌 ${tool.name}\n`;
      modelsMessage += `   Provider: ${tool.provider}\n`;
      modelsMessage += `   Type: ${tool.type}\n`;
      modelsMessage += `   Success Rate: ${(tool.successRate * 100).toFixed(1)}%\n\n`;
    });

    await this.sendChunked(chatId, modelsMessage);
  }

  /**
   * Handle /stats command
   */
  private async handleStats(msg: TelegramBot.Message): Promise<void> {
    const chatId = msg.chat.id;
    const userId = msg.from?.id;

    if (!userId) return;

    const metrics = await learningEngine.getLearningMetrics(
      userId,
      ENV.defaultTenantId
    );

    const statsMessage = `
📊 إحصائياتك:

📈 إجمالي المهام: ${metrics.totalTasks}
✅ المهام الناجحة: ${metrics.successfulTasks}
📉 نسبة النجاح: ${(metrics.successRate * 100).toFixed(1)}%
⭐ جودة الإجابات: ${(metrics.averageQuality * 100).toFixed(1)}%
🎯 الأنماط المكتشفة: ${metrics.discoveredPatterns}
📈 معدل التحسن: ${(metrics.improvementRate * 100).toFixed(1)}% أسبوعياً
    `;

    await this.sendChunked(chatId, statsMessage);
  }

  /**
   * Handle /setmodel command
   */
  private async handleSetModel(
    msg: TelegramBot.Message,
    modelName: string
  ): Promise<void> {
    const chatId = msg.chat.id;
    const userId = msg.from?.id;

    if (!userId) return;

    const tool = toolManager.getTool(modelName);

    if (!tool) {
      await this.sendChunked(
        chatId,
        `❌ النموذج "${modelName}" غير متاح. استخدم /models لرؤية النماذج المتاحة.`
      );
      return;
    }

    const db = await getDb();
    if (db) {
      await db
        .update(telegramUsers)
        .set({ currentModel: modelName })
        .where(eq(telegramUsers.telegramId, userId));
    }

    await this.sendChunked(
      chatId,
      `✅ تم تعيين النموذج الافتراضي إلى: ${tool.name}`
    );
  }

  /**
   * Handle /status command
   */
  private async handleStatus(msg: TelegramBot.Message): Promise<void> {
    const chatId = msg.chat.id;
    const db = await getDb();
    const dbLine = db
      ? "💾 قاعدة البيانات: متصلة ✅"
      : "💾 قاعدة البيانات: غير متصلة ⚠️";

    const statusMessage = `
🟢 حالة البوت: متصل ✅

📊 الإحصائيات العامة:
   • النماذج المتاحة: ${toolManager.getAllTools().length}
   • الأدوات النشطة: ${toolManager.getAllTools().filter(t => t.isAvailable).length}
   • متوسط وقت الاستجابة: ~2-3 ثوان

🔧 الخدمات:
   ✅ معالجة النصوص
   ✅ توليد الأكواد
   ✅ تحليل الصور
   ✅ معالجة البيانات
   ✅ التعلم الذاتي

${dbLine}
    `;

    await this.sendChunked(chatId, statusMessage);
  }

  /**
   * Handle regular messages
   */
  private async handleMessage(msg: TelegramBot.Message): Promise<void> {
    const chatId = msg.chat.id;
    const userId = msg.from?.id;
    const text = msg.text;

    if (!userId || !text) return;

    try {
      // Show typing indicator
      await this.bot.sendChatAction(chatId, "typing");

      const tenantId = ENV.defaultTenantId;
      const unified = await unifiedFreeOrchestrator.execute(userId, text, {
        tenantId,
        knowledgePrincipal: { kind: "telegram", telegramUserId: userId },
      });

      if (!unified.success) {
        await this.sendChunked(
          chatId,
          `❌ ${unified.error ?? "تعذر إكمال المهمة عبر المنسق الموحد."}`
        );
        return;
      }

      const selectedTool =
        unified.tool ??
        toolManager.selectBestFreeTool(unified.analysis.taskType, {});
      const modelId = selectedTool?.id ?? "unified_free_orchestrator";

      const db = await getDb();
      let conversationId = 0;

      if (db) {
        const open = await db
          .select({ id: conversations.id })
          .from(conversations)
          .where(
            and(
              eq(conversations.telegramUserId, userId),
              eq(conversations.tenantId, tenantId),
              isNull(conversations.appUserId),
              eq(conversations.isActive, true)
            )
          )
          .orderBy(desc(conversations.updatedAt))
          .limit(1);

        if (open.length) {
          conversationId = open[0].id;
        } else {
          const ins = await db.insert(conversations).values({
            telegramUserId: userId,
            tenantId,
            title: text.substring(0, 100),
            messageCount: 0,
            model: modelId,
            isActive: true,
          });
          conversationId = Number(ins[0].insertId);
        }

        await db.insert(messages).values({
          conversationId,
          telegramUserId: userId,
          tenantId,
          role: "user",
          content: text,
          model: modelId,
          tokensUsed: 0,
        });

        await db.insert(messages).values({
          conversationId,
          telegramUserId: userId,
          tenantId,
          role: "assistant",
          content: unified.message,
          model: modelId,
          tokensUsed: 0,
        });

        await db
          .update(conversations)
          .set({
            messageCount: sql`${conversations.messageCount} + 2`,
            model: modelId,
          })
          .where(eq(conversations.id, conversationId));
      }

      let replyText = unified.message;
      const k = unified.usedKnowledgeChunks ?? 0;
      const titles = unified.usedKnowledgeTitles;
      if (k > 0 && titles?.length) {
        const head = titles.slice(0, 3).join(" · ");
        const more = titles.length > 3 ? ` (+${titles.length - 3})` : "";
        replyText = `${replyText}\n\n📚 ${head}${more}`;
      } else if (k > 0) {
        replyText = `${replyText}\n\n📚 (${k} مقتطف مرجعي)`;
      }
      await this.sendChunked(chatId, replyText);
    } catch (error) {
      console.error("Error handling message:", error);
      await this.sendChunked(
        chatId,
        "❌ حدث خطأ أثناء معالجة رسالتك. يرجى المحاولة لاحقاً."
      );
    }
  }

  /**
   * Start polling
   */
  start(): void {
    console.log("Telegram bot started polling...");
  }

  /**
   * Stop polling
   */
  stop(): void {
    this.bot.stopPolling();
    console.log("Telegram bot stopped");
  }
}
