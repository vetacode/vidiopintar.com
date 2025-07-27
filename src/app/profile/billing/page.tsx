import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { transactionsRepository } from "@/lib/db/repository/transactions";
import { paymentSettingsRepository } from "@/lib/db/repository/payment-settings";
import { TransactionHistory } from "../transaction-history";
import { PendingPaymentAlert } from "../pending-payment-alert";
import { CurrentPlanCard } from "./current-plan-card";
import { UpgradePlansSection } from "./upgrade-plans-section";
import { BillingHeader } from "./billing-header";

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

  // Find pending and waiting confirmation transactions
  const pendingTransactions = transactions.filter(t => t.status === 'pending' || t.status === 'waiting_confirmation');

  // Determine current plan from latest confirmed transaction
  const confirmedTransactions = transactions.filter(t => t.status === 'confirmed');
  const latestConfirmedTransaction = confirmedTransactions.sort((a, b) => 
    new Date(b.confirmedAt || b.createdAt).getTime() - new Date(a.confirmedAt || a.createdAt).getTime()
  )[0];

  const currentPlan = latestConfirmedTransaction?.planType || 'free';

  // Get current payment settings for WhatsApp functionality
  let currentPaymentSettings = null;
  try {
    currentPaymentSettings = await paymentSettingsRepository.getActive();
  } catch (error) {
    console.log('Could not get current payment settings:', error);
  }

  return (
    <div className="space-y-6">
      <BillingHeader />

      {/* Pending Payment Alert - Show above current plan */}
      {pendingTransactions.length > 0 && currentPaymentSettings && (
        <PendingPaymentAlert 
          transactions={pendingTransactions} 
          currentPaymentSettings={currentPaymentSettings}
        />
      )}

      {/* Current Plan Display */}
      <CurrentPlanCard currentPlan={currentPlan} />

      {/* Upgrade Plans Section */}
      <UpgradePlansSection currentPlan={currentPlan} userId={user.id} />
      
      <TransactionHistory 
        transactions={transactions} 
        currentPaymentSettings={currentPaymentSettings}
      />
    </div>
  );
}