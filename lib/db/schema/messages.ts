import { pgTable, uuid, varchar, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { videos } from './videos';
import { InferInsertModel } from "drizzle-orm";

export const messages = pgTable('messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  videoId: varchar('video_id', { length: 20 }).notNull().references(() => videos.youtubeId),
  content: text('content').notNull(),
  role: varchar('role', { length: 10 }).notNull(), // 'user' or 'assistant'
  timestamp: integer('timestamp').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type NewMessage = InferInsertModel<typeof messages>;
