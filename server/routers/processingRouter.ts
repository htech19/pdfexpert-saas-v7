import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { processingHistory, processedProducts } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";

const ProductMetadataSchema = z.object({
  id: z.number(),
  nome: z.string().min(1, "Nome é obrigatório"),
  categoria: z.string().min(1, "Categoria é obrigatória"),
  marca: z.string().min(1, "Marca é obrigatória"),
  descricao: z.string().min(1, "Descrição é obrigatória"),
  imagem: z.string(),
  imagePreview: z.string().optional()
});

export const processingRouter = router({
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
    }),

  confirmMetadata: protectedProcedure
    .input(z.object({
      processingId: z.number(),
      products: z.array(ProductMetadataSchema)
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database não disponível");

      try {
        // Atualizar histórico de processamento
        await db.update(processingHistory)
          .set({
            status: 'completed',
            processedImages: input.products.length,
            completedAt: new Date()
          })
          .where(eq(processingHistory.id, input.processingId));

        // Salvar produtos processados
        for (const product of input.products) {
          await db.insert(processedProducts).values({
            processingId: input.processingId,
            productName: product.nome,
            category: product.categoria,
            brand: product.marca,
            description: product.descricao,
            imageUrl: product.imagem,
            imageKey: `products/${ctx.user.id}/${product.imagem}`,
            aiConfidence: 95 // Placeholder
          });
        }

        return {
          success: true,
          message: `${input.products.length} produtos salvos com sucesso`,
          processingId: input.processingId
        };
      } catch (error) {
        console.error("Erro ao confirmar metadados:", error);
        throw new Error("Erro ao salvar produtos");
      }
    }),

  updateProductMetadata: protectedProcedure
    .input(z.object({
      productId: z.number(),
      metadata: ProductMetadataSchema
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database não disponível");

      try {
        await db.update(processedProducts)
          .set({
            productName: input.metadata.nome,
            category: input.metadata.categoria,
            brand: input.metadata.marca,
            description: input.metadata.descricao
          })
          .where(eq(processedProducts.id, input.productId));

        return { success: true, message: "Produto atualizado" };
      } catch (error) {
        throw new Error("Erro ao atualizar produto");
      }
    }),

  getProcessedProducts: protectedProcedure
    .input(z.object({ processingId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];

      const products = await db
        .select()
        .from(processedProducts)
        .where(eq(processedProducts.processingId, input.processingId));

      return products || [];
    })
});
