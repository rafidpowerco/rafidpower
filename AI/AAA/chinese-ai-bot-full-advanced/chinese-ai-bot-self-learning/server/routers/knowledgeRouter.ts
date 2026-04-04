/**
 * معرفة المستخدم — RAG خفيف (نصوص يدوية؛ استرجاع بسيط قبل LLM)
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { desc, eq, and, isNull, sql } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { knowledgeChunks } from "../../drizzle/schema";
import { resolveTenantId } from "../_core/tenantContext";

const MAX_CONTENT_LEN = 50_000;
/** حد مقتطفات المعرفة لكل مستخدم ويب (ويب فقط؛ تليجرام منفصل) */
const MAX_CHUNKS_PER_USER = 200;

type Db = NonNullable<Awaited<ReturnType<typeof getDb>>>;

async function countWebKnowledgeChunks(
  db: Db,
  tenantId: string,
  appUserId: number
): Promise<number> {
  const rows = await db
    .select({
      n: sql<number>`cast(count(*) as signed)`.mapWith(Number),
    })
    .from(knowledgeChunks)
    .where(
      and(
        eq(knowledgeChunks.tenantId, tenantId),
        eq(knowledgeChunks.appUserId, appUserId),
        isNull(knowledgeChunks.telegramUserId)
      )
    );
  return rows[0]?.n ?? 0;
}

export const knowledgeRouter = router({
  myList: protectedProcedure
    .input(
      z.object({
        tenantId: z.string().max(128).optional(),
        /** ترقيم صفحات (100 لكل صفحة؛ حتى 200 مقتطفاً للمستخدم) */
        offset: z.number().int().min(0).max(100).optional().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      const tenantId = resolveTenantId({
        inputTenant: input.tenantId,
        sessionUser: ctx.user,
      });
      return db
        .select({
          id: knowledgeChunks.id,
          title: knowledgeChunks.title,
          createdAt: knowledgeChunks.createdAt,
          preview: sql<string>`LEFT(${knowledgeChunks.content}, 320)`,
        })
        .from(knowledgeChunks)
        .where(
          and(
            eq(knowledgeChunks.tenantId, tenantId),
            eq(knowledgeChunks.appUserId, ctx.user.id),
            isNull(knowledgeChunks.telegramUserId)
          )
        )
        .orderBy(desc(knowledgeChunks.createdAt))
        .limit(100)
        .offset(input.offset);
    }),

  /** العدد الفعلي للمقتطفات (للواجهة والحد 200) */
  myChunkStats: protectedProcedure
    .input(z.object({ tenantId: z.string().max(128).optional() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { count: 0, limit: MAX_CHUNKS_PER_USER };
      const tenantId = resolveTenantId({
        inputTenant: input.tenantId,
        sessionUser: ctx.user,
      });
      const count = await countWebKnowledgeChunks(db, tenantId, ctx.user.id);
      return {
        count,
        limit: MAX_CHUNKS_PER_USER,
      };
    }),

  myAdd: protectedProcedure
    .input(
      z.object({
        title: z.string().max(255).optional(),
        content: z.string().min(1).max(MAX_CONTENT_LEN),
        tenantId: z.string().max(128).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "قاعدة البيانات غير متصلة",
        });
      }
      const tenantId = resolveTenantId({
        inputTenant: input.tenantId,
        sessionUser: ctx.user,
      });
      const chunkCount = await countWebKnowledgeChunks(
        db,
        tenantId,
        ctx.user.id
      );
      if (chunkCount >= MAX_CHUNKS_PER_USER) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `بلغت الحد الأقصى لمقتطفات المعرفة (${MAX_CHUNKS_PER_USER}). احذف مقتطفات قديمة أو ادمج النصوص.`,
        });
      }
      const ins = await db.insert(knowledgeChunks).values({
        tenantId,
        appUserId: ctx.user.id,
        telegramUserId: null,
        title: input.title?.trim() || null,
        content: input.content.trim(),
      });
      return { id: Number(ins[0].insertId) };
    }),

  myDelete: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        tenantId: z.string().max(128).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "قاعدة البيانات غير متصلة",
        });
      }
      const tenantId = resolveTenantId({
        inputTenant: input.tenantId,
        sessionUser: ctx.user,
      });
      await db
        .delete(knowledgeChunks)
        .where(
          and(
            eq(knowledgeChunks.id, input.id),
            eq(knowledgeChunks.tenantId, tenantId),
            eq(knowledgeChunks.appUserId, ctx.user.id),
            isNull(knowledgeChunks.telegramUserId)
          )
        );
      return { success: true };
    }),
});
