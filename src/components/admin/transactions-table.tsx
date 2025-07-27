'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Check, X, MoreHorizontal, Filter, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { TransactionWithUser } from '@/lib/db/schema/transactions';

interface TransactionsTableProps {
  transactions: TransactionWithUser[];
  onUpdate: () => void;
}

export function TransactionsTable({ transactions, onUpdate }: TransactionsTableProps) {
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState({
    status: 'all',
    planType: 'all',
    search: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  const handleConfirm = async (transactionId: string) => {
    setProcessingIds(prev => new Set(prev).add(transactionId));
    
    try {
      const response = await fetch(`/api/admin/transactions/${transactionId}/confirm`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to confirm transaction');
      }

      toast.success('Transaction confirmed');
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

      toast.success('Transaction cancelled');
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
    const variants = {
      pending: { variant: 'secondary' as const, color: 'bg-yellow-100 text-yellow-800' },
      confirmed: { variant: 'default' as const, color: 'bg-green-100 text-green-800' },
      cancelled: { variant: 'destructive' as const, color: 'bg-red-100 text-red-800' },
      expired: { variant: 'outline' as const, color: 'bg-gray-100 text-gray-800' },
    };
    
    const config = variants[status as keyof typeof variants] || variants.expired;
    
    return (
      <Badge variant={config.variant} className={`${config.color} text-xs`}>
        {status}
      </Badge>
    );
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const statusMatch = filters.status === 'all' || transaction.status === filters.status;
      const planMatch = filters.planType === 'all' || transaction.planType === filters.planType;
      const searchMatch = filters.search === '' || 
        transaction.transactionReference.toLowerCase().includes(filters.search.toLowerCase()) ||
        transaction.user?.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        transaction.user?.email?.toLowerCase().includes(filters.search.toLowerCase());
      
      return statusMatch && planMatch && searchMatch;
    });
  }, [transactions, filters]);

  const uniqueStatuses = ['all', ...new Set(transactions.map(t => t.status))];
  const uniquePlanTypes = ['all', ...new Set(transactions.map(t => t.planType))];

  const hasActiveFilters = filters.status !== 'all' || filters.planType !== 'all' || filters.search !== '';

  const resetFilters = () => {
    setFilters({
      status: 'all',
      planType: 'all',
      search: '',
    });
  };

  if (transactions.length === 0) {
    return (
      <Card className="shadow-none">
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">No transactions</h3>
            <p className="text-muted-foreground text-sm">
              Transactions will appear here when users make payments.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="shadow-none">
      {/* Compact Filter Header */}
      <div className="border-b px-4 py-3 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="h-8 px-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {showFilters ? (
                <ChevronUp className="h-4 w-4 ml-2" />
              ) : (
                <ChevronDown className="h-4 w-4 ml-2" />
              )}
            </Button>
            
            {hasActiveFilters && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-xs text-blue-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Filters active
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="h-7 px-2 text-xs text-gray-600 hover:bg-gray-100"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Reset
                </Button>
              </div>
            )}
          </div>
          
          <div className="text-sm text-gray-500">
            {filteredTransactions.length !== transactions.length ? (
              <>Showing {filteredTransactions.length} of {transactions.length} transactions</>
            ) : (
              <>{transactions.length} transactions</>
            )}
          </div>
        </div>
      </div>

      {/* Collapsible Filter Content */}
      {showFilters && (
        <div className="border-b bg-gray-50/30 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Search by reference, name, or email..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="h-9 flex-1"
            />
            
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger className="h-9 w-full sm:w-48">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                {uniqueStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status === 'all' ? 'All statuses' : status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select
              value={filters.planType}
              onValueChange={(value) => setFilters(prev => ({ ...prev, planType: value }))}
            >
              <SelectTrigger className="h-9 w-full sm:w-48">
                <SelectValue placeholder="All plans" />
              </SelectTrigger>
              <SelectContent>
                {uniquePlanTypes.map((planType) => (
                  <SelectItem key={planType} value={planType}>
                    {planType === 'all' ? 'All plans' : planType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b">
              <TableHead className="font-medium min-w-[120px]">Reference</TableHead>
              <TableHead className="font-medium min-w-[150px]">User</TableHead>
              <TableHead className="font-medium min-w-[80px]">Plan</TableHead>
              <TableHead className="font-medium min-w-[100px]">Amount</TableHead>
              <TableHead className="font-medium min-w-[80px]">Status</TableHead>
              <TableHead className="font-medium min-w-[120px]">Created</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No transactions match the current filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((transaction) => (
              <TableRow key={transaction.id} className="hover:bg-gray-50/50">
                <TableCell className="font-mono text-sm">
                  <div className="truncate max-w-[120px]">
                    {transaction.transactionReference}
                  </div>
                </TableCell>
                
                <TableCell className="text-sm">
                  {transaction.user ? (
                    <div className="min-w-[150px]">
                      <div className="font-medium">{transaction.user.name}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {transaction.user.email}
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-xs">No user data</span>
                  )}
                </TableCell>
                
                <TableCell className="text-sm">
                  <span className="capitalize">{transaction.planType}</span>
                </TableCell>
                
                <TableCell className="text-sm font-medium">
                  {formatAmount(transaction.amount, transaction.currency)}
                </TableCell>
                
                <TableCell>
                  {getStatusBadge(transaction.status)}
                </TableCell>
                
                <TableCell className="text-sm text-muted-foreground">
                  <div className="min-w-[120px]">
                    {formatDate(transaction.createdAt!)}
                    {transaction.confirmedAt && (
                      <div className="text-xs text-green-600">
                        Confirmed {formatDate(transaction.confirmedAt)}
                      </div>
                    )}
                  </div>
                </TableCell>
                
                <TableCell>
                  {transaction.status === 'pending' ? (
                    <div className="flex gap-1">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                            disabled={processingIds.has(transaction.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirm Transaction</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to confirm transaction {transaction.transactionReference}?
                              <br />
                              {transaction.user && (
                                <>
                                  <span className="font-medium">
                                    User: {transaction.user.name} ({transaction.user.email})
                                  </span>
                                  <br />
                                </>
                              )}
                              <span className="font-medium">
                                Amount: {formatAmount(transaction.amount, transaction.currency)}
                              </span>
                              <br />
                              <span className="font-medium">
                                Plan: {transaction.planType}
                              </span>
                              <br />
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleConfirm(transaction.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Confirm Transaction
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleCancel(transaction.id)}
                        disabled={processingIds.has(transaction.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem disabled>
                          View details
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}