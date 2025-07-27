import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const paymentSettings = pgTable('payment_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Bank Details
  bankName: text('bank_name').notNull(),
  bankAccountNumber: text('bank_account_number').notNull(),
  bankAccountName: text('bank_account_name').notNull(),
  
  // WhatsApp Configuration
  whatsappPhoneNumber: text('whatsapp_phone_number').notNull(),
  whatsappMessageTemplate: text('whatsapp_message_template').notNull(),
  
  // System fields
  isActive: text('is_active').notNull().default('true'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export type PaymentSettings = typeof paymentSettings.$inferSelect;
export type NewPaymentSettings = typeof paymentSettings.$inferInsert;