'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import type { Transaction } from '@/lib/db/schema/transactions';

interface TransactionsListProps {
  transactions: Transaction[];
  onUpdate: () => void;
}

export function TransactionsList({ transactions, onUpdate }: TransactionsListProps) {
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const handleConfirm = async (transactionId: string) => {
    setProcessingIds(prev => new Set(prev).add(transactionId));
    
    try {
      const response = await fetch(`/api/admin/transactions/${transactionId}/confirm`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to confirm transaction');
      }

      toast.success('Transaction confirmed successfully!');
      onUpdate();
    } catch (error) {
      console.error('Error confirming transaction:', error);
      toast.error('Failed to confirm transaction');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(transactionId);
        return newSet;
      });
    }
  };

  const handleCancel = async (transactionId: string) => {
    setProcessingIds(prev => new Set(prev).add(transactionId));
    
    try {
      const response = await fetch(`/api/admin/transactions/${transactionId}/cancel`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to cancel transaction');
      }

      toast.success('Transaction cancelled successfully!');
      onUpdate();
    } catch (error) {
      console.error('Error cancelling transaction:', error);
      toast.error('Failed to cancel transaction');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(transactionId);
        return newSet;
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'confirmed':
        return <Badge variant="default">Confirmed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'expired':
        return <Badge variant="outline">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string | Date) => {
    return new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const pendingTransactions = transactions.filter(t => t.status === 'pending');
  const otherTransactions = transactions.filter(t => t.status !== 'pending');

  if (transactions.length === 0) {
    return (
      <Card className="shadow-none">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">No transactions found</h3>
            <p className="text-muted-foreground">
              No transactions have been created yet.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {pendingTransactions.length > 0 && (
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Pending Transactions</CardTitle>
            <CardDescription>
              Transactions waiting for confirmation ({pendingTransactions.length})
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">{transaction.transactionReference}</span>
                    {getStatusBadge(transaction.status)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatAmount(transaction.amount, transaction.currency)} • {transaction.planType} plan
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Created: {formatDate(transaction.createdAt!)}
                  </div>
                  {transaction.expiresAt && (
                    <div className="text-xs text-muted-foreground">
                      Expires: {formatDate(transaction.expiresAt)}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleConfirm(transaction.id)}
                    disabled={processingIds.has(transaction.id)}
                  >
                    {processingIds.has(transaction.id) ? 'Confirming...' : 'Confirm'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCancel(transaction.id)}
                    disabled={processingIds.has(transaction.id)}
                  >
                    {processingIds.has(transaction.id) ? 'Cancelling...' : 'Cancel'}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {otherTransactions.length > 0 && (
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>
              Completed and cancelled transactions ({otherTransactions.length})
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {otherTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border rounded-lg opacity-75"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">{transaction.transactionReference}</span>
                    {getStatusBadge(transaction.status)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatAmount(transaction.amount, transaction.currency)} • {transaction.planType} plan
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Created: {formatDate(transaction.createdAt!)}
                  </div>
                  {transaction.confirmedAt && (
                    <div className="text-xs text-muted-foreground">
                      Confirmed: {formatDate(transaction.confirmedAt)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}