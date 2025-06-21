import { pgTable, uuid, varchar, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { InferInsertModel } from "drizzle-orm";
import { userVideos } from './videos';

export const messages = pgTable('messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  userVideoId: integer('user_video_id').notNull().references(() => userVideos.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  role: varchar('role', { length: 10 }).notNull(), // 'user' or 'assistant'
  timestamp: integer('timestamp').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type NewMessage = InferInsertModel<typeof messages>;
