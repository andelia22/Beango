import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, index, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  interests: text("interests").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const beangoCompletions = pgTable("beango_completions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  cityId: varchar("city_id").notNull(),
  cityName: varchar("city_name").notNull(),
  cityImageUrl: varchar("city_image_url"),
  roomCode: varchar("room_code").notNull(),
  participantCount: integer("participant_count").notNull().default(1),
  completedAt: timestamp("completed_at").notNull().defaultNow(),
});

export const insertBeangoCompletionSchema = createInsertSchema(beangoCompletions).omit({
  id: true,
  completedAt: true,
});

export type InsertBeangoCompletion = z.infer<typeof insertBeangoCompletionSchema>;
export type BeangoCompletion = typeof beangoCompletions.$inferSelect;

export const rooms = pgTable("rooms", {
  code: varchar("code").primaryKey(),
  cityId: varchar("city_id").notNull(),
  cityName: varchar("city_name").notNull(),
  createdBy: varchar("created_by").notNull(),
  status: varchar("status").notNull().default("in_progress"),
  totalChallenges: integer("total_challenges").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertRoomSchema = createInsertSchema(rooms).omit({
  createdAt: true,
  updatedAt: true,
});

export type InsertRoom = z.infer<typeof insertRoomSchema>;
export type Room = typeof rooms.$inferSelect;

export const roomParticipants = pgTable("room_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roomCode: varchar("room_code").notNull().references(() => rooms.code),
  deviceId: varchar("device_id").notNull(),
  deviceName: varchar("device_name"),
  userId: varchar("user_id").references(() => users.id),
  completedChallengeIds: integer("completed_challenge_ids").array().notNull().default(sql`'{}'::integer[]`),
  joinedAt: timestamp("joined_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertRoomParticipantSchema = createInsertSchema(roomParticipants).omit({
  id: true,
  joinedAt: true,
  updatedAt: true,
});

export type InsertRoomParticipant = z.infer<typeof insertRoomParticipantSchema>;
export type RoomParticipant = typeof roomParticipants.$inferSelect;

export const citySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  country: z.string().optional(),
  challengeCount: z.number(),
});

export const challengeSchema = z.object({
  id: z.number(),
  caption: z.string(),
  imageUrl: z.string(),
});

export type City = z.infer<typeof citySchema>;
export type Challenge = z.infer<typeof challengeSchema>;
