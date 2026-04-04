/**
 * آراء المستخدمين — إرسال للمستخدم المسجّل؛ قراءة أخيرة للمسؤول فقط.
 */

import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { adminProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { userFeedback, users } from "../../drizzle/schema";
import { resolveTenantId } from "../_core/tenantContext";

const CATEGORY = z.enum(["bug", "idea", "ux", "general"]);

export const feedbackRouter = router({
  submit: protectedProcedure
    .input(
      z.object({
        message: z.string().min(3).max(8000),
        category: CATEGORY.default("general"),
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
      await db.insert(userFeedback).values({
        tenantId,
        appUserId: ctx.user.id,
        category: input.category,
        message: input.message.trim(),
      });
      return { success: true as const };
    }),

  /** آخر الآراء — للمسؤول فقط (مراجعة التجربة على الدومين) */
  listRecent: adminProcedure
    .input(
      z.object({
        tenantId: z.string().max(128).optional(),
        limit: z.number().int().min(1).max(100).default(30),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      const tenantId = resolveTenantId({
        inputTenant: input.tenantId,
        sessionUser: ctx.user,
      });
      const rows = await db
        .select({
          id: userFeedback.id,
          category: userFeedback.category,
          message: userFeedback.message,
          createdAt: userFeedback.createdAt,
          submitterName: users.name,
          submitterEmail: users.email,
          appUserId: userFeedback.appUserId,
        })
        .from(userFeedback)
        .leftJoin(users, eq(userFeedback.appUserId, users.id))
        .where(eq(userFeedback.tenantId, tenantId))
        .orderBy(desc(userFeedback.createdAt))
        .limit(input.limit);
      return rows;
    }),
});
