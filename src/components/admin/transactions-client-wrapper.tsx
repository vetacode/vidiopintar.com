'use client';

import { useState } from 'react';
import { TransactionsTable } from './transactions-table';
import type { TransactionWithUser } from '@/lib/db/schema/transactions';

interface TransactionsClientWrapperProps {
  initialTransactions: TransactionWithUser[];
}

export function TransactionsClientWrapper({ initialTransactions }: TransactionsClientWrapperProps) {
  const [transactions, setTransactions] = useState(initialTransactions);

  const handleUpdate = async () => {
    try {
      const response = await fetch('/api/admin/transactions');
      if (response.ok) {
        const updatedTransactions = await response.json();
        setTransactions(updatedTransactions);
      }
    } catch (error) {
      console.error('Failed to refresh transactions:', error);
    }
  };

  return (
    <TransactionsTable 
      transactions={transactions} 
      onUpdate={handleUpdate}
    />
  );
}