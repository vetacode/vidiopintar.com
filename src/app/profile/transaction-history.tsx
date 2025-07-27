"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TransactionDetailDialog } from "./transaction-detail-dialog";
import { useTranslations } from 'next-intl';

interface Transaction {
  id: string;
  planType: string;
  amount: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'expired' | 'cancelled';
  transactionReference: string;
  createdAt: Date;
  confirmedAt?: Date | null;
  expiresAt?: Date | null;
  paymentSettings?: string | null;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  const t = useTranslations('profile');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleTransactionClick = (transaction: Transaction) => {
    if (transaction.status === 'pending') {
      setSelectedTransaction(transaction);
      setIsDialogOpen(true);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'expired':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return `${currency} ${amount.toLocaleString()}`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (transactions.length === 0) {
    return (
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="text-lg">Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No transactions found.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle className="text-lg">Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plan</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Confirmed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow 
                key={transaction.id}
                className={transaction.status === 'pending' ? 'cursor-pointer' : ''}
                onClick={() => handleTransactionClick(transaction)}
              >
                <TableCell className="font-medium capitalize">
                  {transaction.planType} Plan
                </TableCell>
                <TableCell className="font-medium">
                  {formatAmount(transaction.amount, transaction.currency)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={getStatusColor(transaction.status)}
                  >
                    {transaction.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(transaction.createdAt)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {transaction.confirmedAt ? formatDate(transaction.confirmedAt) : '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {transactions.some(t => t.status === 'pending') && (
          <p className="text-xs text-muted-foreground mt-4 text-center">
            Click on pending transactions to view payment details
          </p>
        )}
      </CardContent>

      <TransactionDetailDialog
        transaction={selectedTransaction}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </Card>
  );
}