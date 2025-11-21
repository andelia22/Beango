import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const citySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  country: z.string().optional(),
  challengeCount: z.number(),
});

export const locationSchema = z.object({
  name: z.string(),
  address: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
}).optional();

export const challengeSchema = z.object({
  id: z.number(),
  caption: z.string(),
  imageUrl: z.string(),
  location: locationSchema,
});

export type City = z.infer<typeof citySchema>;
export type Challenge = z.infer<typeof challengeSchema>;
