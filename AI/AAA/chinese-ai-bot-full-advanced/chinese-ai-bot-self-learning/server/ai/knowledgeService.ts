import { and, desc, eq, isNull } from "drizzle-orm";
import { getDb } from "../db";
import { knowledgeChunks, type KnowledgeChunk } from "../../drizzle/schema";
import { ENV } from "../_core/env";

export type KnowledgePrincipal =
  | { kind: "web"; appUserId: number }
  | { kind: "telegram"; telegramUserId: number };

/** حد جلب المقتطفات قبل الترتيب في الذاكرة — توازن بين التغطية والاستعلام */
const MAX_FETCH = 100;
const MAX_CHUNKS_IN_PROMPT = 5;
const MAX_TOTAL_CHARS = 6000;
/** مرشحات لـ MMR قبل الاختيار النهائي */
const MMR_CANDIDATE_POOL = 24;
/** توازن صلة / تنوع (أعلى = أهمية الصلة أكبر) */
const MMR_LAMBDA = 0.62;

/** تطبيع خفيف للعربية والبحث (تشكيل، همزات، ألف/ة/ى) — يُستخدم في الاستعلام والمقارنة */
export function normalizeForSearch(text: string): string {
  let s = text.normalize("NFKC");
  s = s.replace(/[\u064B-\u065F\u0670\u0640]/g, "");
  s = s.replace(/[\u0610-\u061A]/g, "");
  s = s.replace(/[أإآٱ]/g, "ا");
  s = s.replace(/ى/g, "ي");
  s = s.replace(/ؤ/g, "و");
  s = s.replace(/ئ/g, "ي");
  s = s.replace(/ة/g, "ه");
  return s.toLowerCase();
}

/** للاختبارات — ترتيب المقتطفات حسب تطابق كلمات الاستعلام */
export function rankChunksByQuery(
  chunks: Pick<KnowledgeChunk, "id" | "title" | "content">[],
  query: string
): Pick<KnowledgeChunk, "id" | "title" | "content">[] {
  const tokens = tokenizeForSearch(query);
  if (!tokens.length) {
    return chunks.slice(0, MAX_CHUNKS_IN_PROMPT);
  }
  const scored = chunks.map(c => {
    const body = normalizeForSearch(`${c.title ?? ""}\n${c.content}`);
    let score = 0;
    for (const t of tokens) {
      if (body.includes(t)) score += 1;
    }
    return { c, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored
    .filter(x => x.score > 0)
    .map(x => x.c)
    .slice(0, MAX_CHUNKS_IN_PROMPT);
}

function scoreChunkRelevance(
  chunk: Pick<KnowledgeChunk, "id" | "title" | "content">,
  tokens: string[]
): number {
  if (!tokens.length) return 0;
  const body = normalizeForSearch(`${chunk.title ?? ""}\n${chunk.content}`);
  let score = 0;
  for (const t of tokens) {
    if (body.includes(t)) score += 1;
  }
  return score;
}

function chunkTokenSet(
  chunk: Pick<KnowledgeChunk, "id" | "title" | "content">
): Set<string> {
  return new Set(
    normalizeForSearch(`${chunk.title ?? ""}\n${chunk.content}`)
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .split(/\s+/)
      .filter(t => t.length > 1)
  );
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 1;
  let inter = 0;
  for (const x of a) {
    if (b.has(x)) inter += 1;
  }
  const union = a.size + b.size - inter;
  return union === 0 ? 0 : inter / union;
}

/**
 * إعادة ترتيب بـ MMR فوق مرشحين ذوي صلة لتقليل التكرار في المقتطفات.
 */
export function mmrRankChunks(
  chunks: Pick<KnowledgeChunk, "id" | "title" | "content">[],
  query: string,
  k: number,
  lambda: number,
  poolSize: number
): Pick<KnowledgeChunk, "id" | "title" | "content">[] {
  const tokens = tokenizeForSearch(query);
  if (!tokens.length || !chunks.length) {
    return rankChunksByQuery(chunks, query);
  }

  const scored = chunks.map(c => ({
    c,
    rel: scoreChunkRelevance(c, tokens),
  }));
  scored.sort((a, b) => b.rel - a.rel);
  const pool = scored.filter(x => x.rel > 0).slice(0, poolSize);
  if (pool.length === 0) {
    return rankChunksByQuery(chunks, query);
  }
  if (pool.length === 1) {
    return [pool[0]!.c].slice(0, k);
  }

  const sets = new Map<number, Set<string>>();
  for (const { c } of pool) {
    sets.set(c.id, chunkTokenSet(c));
  }

  const selected: typeof pool = [];
  const selectedIds = new Set<number>();

  while (selected.length < k && selected.length < pool.length) {
    let bestI = -1;
    let bestMmr = -Infinity;
    for (let i = 0; i < pool.length; i++) {
      const item = pool[i];
      if (!item || selectedIds.has(item.c.id)) continue;
      const setC = sets.get(item.c.id);
      if (!setC) continue;
      let maxSim = 0;
      for (const s of selected) {
        const setS = sets.get(s.c.id);
        if (setS) {
          const sim = jaccardSimilarity(setC, setS);
          if (sim > maxSim) maxSim = sim;
        }
      }
      const mmr = lambda * item.rel - (1 - lambda) * maxSim;
      if (mmr > bestMmr) {
        bestMmr = mmr;
        bestI = i;
      }
    }
    if (bestI < 0) break;
    const picked = pool[bestI];
    if (!picked) break;
    selected.push(picked);
    selectedIds.add(picked.c.id);
  }

  const out = selected.map(x => x.c);
  return out.length ? out : rankChunksByQuery(chunks, query);
}

export function tokenizeForSearch(q: string): string[] {
  return normalizeForSearch(q)
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(t => t.length > 1)
    .slice(0, 24);
}

function formatChunksForPrompt(
  chunks: Pick<KnowledgeChunk, "id" | "title" | "content">[]
): { text: string; count: number; titles: string[] } {
  const parts: string[] = [];
  const titles: string[] = [];
  let total = 0;
  let used = 0;
  for (const c of chunks) {
    const header = c.title?.trim()
      ? `### ${c.title.trim()}\n`
      : `### (بدون عنوان)\n`;
    const body = c.content.trim();
    const room = MAX_TOTAL_CHARS - total - header.length - 8;
    if (room < 80) break;
    const slice = body.length > room ? `${body.slice(0, room)}…` : body;
    const block = `${header}${slice}`;
    total += block.length;
    parts.push(block);
    titles.push(c.title?.trim() || "(بدون عنوان)");
    used += 1;
    if (total >= MAX_TOTAL_CHARS) break;
  }
  return { text: parts.join("\n\n---\n\n"), count: used, titles };
}

export async function retrieveKnowledgeForPrompt(
  tenantId: string,
  principal: KnowledgePrincipal,
  userMessage: string
): Promise<{ text: string; count: number; titles: string[] } | null> {
  if (!ENV.knowledgeRagEnabled) return null;

  const db = await getDb();
  if (!db) return null;

  const base = [eq(knowledgeChunks.tenantId, tenantId)];
  if (principal.kind === "web") {
    base.push(eq(knowledgeChunks.appUserId, principal.appUserId));
    base.push(isNull(knowledgeChunks.telegramUserId));
  } else {
    base.push(eq(knowledgeChunks.telegramUserId, principal.telegramUserId));
    base.push(isNull(knowledgeChunks.appUserId));
  }

  const rows = await db
    .select({
      id: knowledgeChunks.id,
      title: knowledgeChunks.title,
      content: knowledgeChunks.content,
    })
    .from(knowledgeChunks)
    .where(and(...base))
    .orderBy(desc(knowledgeChunks.createdAt))
    .limit(MAX_FETCH);

  if (!rows.length) return null;

  let ranked = mmrRankChunks(
    rows,
    userMessage,
    MAX_CHUNKS_IN_PROMPT,
    MMR_LAMBDA,
    MMR_CANDIDATE_POOL
  );
  if (!ranked.length) {
    ranked = rows.slice(0, Math.min(3, rows.length));
  }
  if (!ranked.length) return null;

  return formatChunksForPrompt(ranked);
}
