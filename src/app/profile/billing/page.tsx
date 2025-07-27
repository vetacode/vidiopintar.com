import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { transactionsRepository } from "@/lib/db/repository/transactions";
import { TransactionHistory } from "../transaction-history";
import { PendingPaymentAlert } from "../pending-payment-alert";

export default async function BillingPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  // Get user's transaction history
  let transactions: any[] = [];
  try {
    transactions = await transactionsRepository.getByUserId(user.id, 20);
  } catch (error) {
    console.log('Could not get user transactions:', error);
  }

  // Find pending transactions
  const pendingTransactions = transactions.filter(t => t.status === 'pending');

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Billing & Transactions</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          View your payment history and manage billing information.
        </p>
      </div>

      {pendingTransactions.length > 0 && (
        <PendingPaymentAlert transactions={pendingTransactions} />
      )}
      
      <TransactionHistory transactions={transactions} />
    </div>
  );
}