import { pgTable, text, timestamp, uuid, integer } from 'drizzle-orm/pg-core';
import { user } from './auth';

export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // User reference
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  
  // Transaction details
  planType: text('plan_type').notNull(), // 'monthly' | 'yearly'
  amount: integer('amount').notNull(), // amount in smallest currency unit (e.g., cents)
  currency: text('currency').notNull().default('IDR'),
  
  // Payment details
  paymentMethod: text('payment_method').notNull().default('bank_transfer'),
  transactionReference: text('transaction_reference').notNull().unique(),
  
  // Status tracking
  status: text('status').notNull().default('pending'), // 'pending' | 'confirmed' | 'expired' | 'cancelled'
  
  // Additional metadata
  paymentSettings: text('payment_settings'), // JSON string of payment settings used
  userAgent: text('user_agent'),
  ipAddress: text('ip_address'),
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  confirmedAt: timestamp('confirmed_at', { withTimezone: true }),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
});

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type TransactionWithUser = Transaction & { user: { name: string; email: string } | null };

// Helper types for transaction status
export type TransactionStatus = 'pending' | 'confirmed' | 'expired' | 'cancelled';
export type PlanType = 'monthly' | 'yearly';