import { getTranslations } from 'next-intl/server'
import { CopyButton } from '@/components/payment/copy-button'
import { WhatsAppConfirmButton } from '@/components/payment/whatsapp-confirm-button'
import { paymentSettingsRepository } from '@/lib/db/repository/payment-settings'
import { transactionsRepository } from '@/lib/db/repository/transactions'
import { getCurrentUser } from '@/lib/auth'
import { PLAN_CONFIGS } from '@/lib/validations/payment'
import { ChevronLeft } from 'lucide-react'

interface PaymentSettings {
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  whatsappPhoneNumber: string;
  whatsappMessageTemplate: string;
}

interface PaymentPageProps {
  searchParams: Promise<{ plan?: string }>
}

export default async function PaymentPage({ searchParams }: PaymentPageProps) {
    const t = await getTranslations('payment')
    const { plan } = await searchParams

    // Use validated plan configurations
    const planDetails = {
        monthly: {
            name: PLAN_CONFIGS.monthly.name,
            price: `IDR ${PLAN_CONFIGS.monthly.amount.toLocaleString()}`,
            amount: PLAN_CONFIGS.monthly.amount,
            period: 'per month'
        },
        yearly: {
            name: PLAN_CONFIGS.yearly.name, 
            price: `IDR ${PLAN_CONFIGS.yearly.amount.toLocaleString()}`,
            amount: PLAN_CONFIGS.yearly.amount,
            period: 'per year'
        }
    }

    // Validate plan parameter
    const validPlan = plan && (plan === 'monthly' || plan === 'yearly') ? plan : 'monthly';
    const currentPlan = planDetails[validPlan];

    // Get current user and handle transaction
    let user;
    let transaction;
    let existingTransaction;
    try {
        user = await getCurrentUser();
        
        // Check if user already has a pending transaction for this plan
        existingTransaction = await transactionsRepository.getPendingTransactionByUserAndPlan(user.id, validPlan);
        
        if (existingTransaction) {
            // Use existing transaction instead of creating a new one
            transaction = existingTransaction;
        } else {
            // Create new transaction for this payment request
            transaction = await transactionsRepository.create({
                userId: user.id,
                planType: validPlan,
                amount: currentPlan.amount,
                currency: 'IDR',
                transactionReference: await transactionsRepository.generateUniqueReference(),
                paymentSettings: JSON.stringify(await paymentSettingsRepository.getActive()),
            });
        }
    } catch (error) {
        console.error('Error handling transaction:', error);
        // Continue without transaction if user not authenticated
    }

    // Fetch payment settings on the server
    let paymentSettings: PaymentSettings | null = null;
    try {
        paymentSettings = await paymentSettingsRepository.getActive();
    } catch (error) {
        console.error('Error fetching payment settings:', error);
    }

    // Fallback to default values if settings not available
    const bankDetails = paymentSettings ? {
        bankName: paymentSettings.bankName,
        accountNumber: paymentSettings.bankAccountNumber,
        accountName: paymentSettings.bankAccountName
    } : {
        bankName: 'Bank Central Asia (BCA)',
        accountNumber: '1234567890',
        accountName: 'Vidiopintar Indonesia'
    }

    let whatsappMessage = paymentSettings 
        ? paymentSettings.whatsappMessageTemplate
            .replace('{planName}', currentPlan.name)
            .replace('{planPrice}', currentPlan.price)
        : `Halo, saya sudah melakukan transfer untuk ${currentPlan.name} sebesar ${currentPlan.price}. Mohon konfirmasi pembayaran saya.`

    // Add transaction reference if available
    if (transaction?.transactionReference) {
        whatsappMessage += `\n\nReferensi Transaksi: ${transaction.transactionReference}`
    }
    
    const whatsappPhone = paymentSettings?.whatsappPhoneNumber;
    const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(whatsappMessage)}`

    return (
        <div className="min-h-screen bg-background py-12 px-4">
            <div className="mx-auto max-w-lg">
                <div className="mb-6">
                    <a href="/home" className="text-foreground hover:underline hover:text-melody transition-colors inline-flex gap-2 items-center">
                        <ChevronLeft className="size-4" />
                        Home
                    </a>
                </div>
                <div className="text-center mb-8">
                    <h1 className="text-xl font-medium mb-2">{t('title')}</h1>
                    <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
                </div>

                {existingTransaction && (
                    <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                                <svg className="size-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="text-sm">
                                <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">Existing Payment Request</p>
                                <p className="text-blue-800 dark:text-blue-200">
                                    You already have a pending payment request for this plan. We're showing your existing transaction details below.
                                </p>
                                <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                                    Created: {existingTransaction.createdAt ? new Date(existingTransaction.createdAt).toLocaleDateString() : 'Unknown'} at {existingTransaction.createdAt ? new Date(existingTransaction.createdAt).toLocaleTimeString() : 'Unknown'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-card border rounded-md p-5 mb-5">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-sm font-medium text-muted-foreground">{currentPlan.name}</h2>
                        <div className="text-base font-medium">{currentPlan.price}</div>
                    </div>
                    
                    <div className="border-t pt-5">
                        <div className="space-y-3">
                            <div className="py-2">
                                <p className="text-xs text-muted-foreground mb-1">{t('bankName')}</p>
                                <p className="text-sm">{bankDetails.bankName}</p>
                            </div>

                            <div className="py-2">
                                <p className="text-xs text-muted-foreground mb-1">{t('accountName')}</p>
                                <p className="text-sm">{bankDetails.accountName}</p>
                            </div>

                            <div className="flex items-center justify-between py-2">
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">{t('accountNumber')}</p>
                                    <p className="font-mono text-sm">{bankDetails.accountNumber}</p>
                                </div>
                                <CopyButton text={bankDetails.accountNumber} fieldId="account" />
                            </div>

                            <div className="flex items-center justify-between py-2 border-t pt-3">
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">{t('amount')}</p>
                                    <p className="text-sm font-medium">{currentPlan.price}</p>
                                </div>
                                <CopyButton text={currentPlan.price.split(' ')[1]} fieldId="amount" />
                            </div>

                            {transaction?.transactionReference && (
                                <div className="flex items-center justify-between py-2 border-t pt-3">
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">Transaction Reference</p>
                                        <p className="text-sm font-mono">{transaction.transactionReference}</p>
                                    </div>
                                    <CopyButton text={transaction.transactionReference} fieldId="reference" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-card border rounded-md p-5 mb-6">
                    <div className="space-y-2 text-sm">
                        <div className="flex gap-2">
                            <span className="text-muted-foreground">1.</span>
                            <span className="text-muted-foreground">{t('step1')}</span>
                        </div>
                        <div className="flex gap-2">
                            <span className="text-muted-foreground">2.</span>
                            <span className="text-muted-foreground">{t('step2')}</span>
                        </div>
                        <div className="flex gap-2">
                            <span className="text-muted-foreground">3.</span>
                            <span className="text-muted-foreground">{t('step3')}</span>
                        </div>
                    </div>
                </div>

                <div className="text-center">
                    <WhatsAppConfirmButton 
                        whatsappUrl={whatsappUrl}
                        transactionId={transaction?.id}
                    />
                    <p className="text-xs text-muted-foreground mt-3">{t('confirmationNote')}</p>
                </div>
            </div>
        </div>
    )
}
