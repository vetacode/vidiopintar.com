import { pgTable, serial, varchar, jsonb, timestamp } from "drizzle-orm/pg-core";

export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  videoId: varchar("video_id", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  questions: jsonb("questions").notNull(), // store questions as JSON array
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});
