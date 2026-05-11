import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { processingHistory } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  processing: router({
    upload: protectedProcedure
      .input(z.object({ fileName: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database não disponível");

        await db.insert(processingHistory).values({
          userId: ctx.user.id,
          fileName: input.fileName,
          status: 'processing',
          totalImages: 0,
          processedImages: 0,
          discardedImages: 0
        });

        return {
          processingId: Date.now(),
          message: "Processamento iniciado"
        };
      }),
    
    getHistory: protectedProcedure
      .query(async ({ ctx }) => {
        const db = await getDb();
        if (!db) return [];

        const history = await db
          .select()
          .from(processingHistory)
          .where(eq(processingHistory.userId, ctx.user.id))
          .orderBy(desc(processingHistory.createdAt))
          .limit(10);

        return history || [];
      })
  })
});

export type AppRouter = typeof appRouter;
