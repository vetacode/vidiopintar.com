import { pgTable, uuid, varchar, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { videos } from './videos';

export const notes = pgTable('notes', {
  id: uuid('id').defaultRandom().primaryKey(),
  videoId: varchar('video_id', { length: 20 }).notNull().references(() => videos.youtubeId),
  content: text('content').notNull(),
  timestamp: integer('timestamp').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
