/**
 * Bot Initialization - تهيئة البوت الرئيسي
 */

import { TelegramBotHandler } from "./telegram/botHandler";
import { toolManager } from "./tools/toolManager";
import { learningEngine } from "./ai/learningEngine";

/**
 * Initialize and start the bot
 */
export async function initializeBot(): Promise<TelegramBotHandler> {
  console.log("🤖 Initializing AI Bot...");

  // Get bot token from environment
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    throw new Error("TELEGRAM_BOT_TOKEN environment variable is not set");
  }

  // Initialize tool manager
  console.log("📦 Loading tools and models...");
  await toolManager.initialize();

  // Initialize learning engine
  console.log("🧠 Initializing learning engine...");
  await learningEngine.initialize();

  // Create and initialize bot
  console.log("🚀 Starting Telegram bot...");
  const bot = new TelegramBotHandler(botToken);
  await bot.initialize();
  bot.start();

  console.log("✅ Bot initialized successfully!");
  console.log("📊 Available tools:", toolManager.getAllTools().length);
  console.log("🎯 Bot is ready to receive messages");

  return bot;
}

/**
 * Graceful shutdown
 */
export async function shutdownBot(bot: TelegramBotHandler): Promise<void> {
  console.log("🛑 Shutting down bot...");
  bot.stop();
  console.log("✅ Bot stopped");
}
