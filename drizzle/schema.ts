import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Processing History Table
 * Tracks all PDF processing operations with metadata and results
 */
export const processingHistory = mysqlTable("processing_history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["processing", "completed", "failed"]).default("processing").notNull(),
  totalImages: int("totalImages").default(0),
  processedImages: int("processedImages").default(0),
  discardedImages: int("discardedImages").default(0),
  githubCommitUrl: varchar("githubCommitUrl", { length: 512 }),
  githubRepository: varchar("githubRepository", { length: 255 }),
  metadata: json("metadata"),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type ProcessingHistory = typeof processingHistory.$inferSelect;
export type InsertProcessingHistory = typeof processingHistory.$inferInsert;

/**
 * Processed Products Table
 * Stores metadata for each product extracted from PDFs
 */
export const processedProducts = mysqlTable("processed_products", {
  id: int("id").autoincrement().primaryKey(),
  processingId: int("processingId").notNull(),
  productName: varchar("productName", { length: 255 }).notNull(),
  category: varchar("category", { length: 128 }).notNull(),
  brand: varchar("brand", { length: 128 }),
  description: text("description"),
  imageUrl: varchar("imageUrl", { length: 512 }).notNull(),
  imageKey: varchar("imageKey", { length: 255 }).notNull(),
  aiConfidence: int("aiConfidence"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProcessedProduct = typeof processedProducts.$inferSelect;
export type InsertProcessedProduct = typeof processedProducts.$inferInsert;
