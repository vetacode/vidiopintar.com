import { getTranslations } from 'next-intl/server'
import { CopyButton } from '@/components/payment/copy-button'
import { paymentSettingsRepository } from '@/lib/db/repository/payment-settings'
import { transactionsRepository } from '@/lib/db/repository/transactions'
import { getCurrentUser } from '@/lib/auth'

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

    const planDetails = {
        monthly: {
            name: 'Monthly Plan',
            price: 'IDR 50,000',
            amount: 50000,
            period: 'per month'
        },
        yearly: {
            name: 'Yearly Plan', 
            price: 'IDR 500,000',
            amount: 500000,
            period: 'per year'
        }
    }

    const currentPlan = plan && (plan === 'monthly' || plan === 'yearly') ? planDetails[plan] : planDetails.monthly

    // Get current user and create transaction
    let user;
    let transaction;
    try {
        user = await getCurrentUser();
        
        // Create transaction for this payment request
        transaction = await transactionsRepository.create({
            userId: user.id,
            planType: currentPlan === planDetails.monthly ? 'monthly' : 'yearly',
            amount: currentPlan.amount,
            currency: 'IDR',
            transactionReference: await transactionsRepository.generateUniqueReference(),
            paymentSettings: JSON.stringify(await paymentSettingsRepository.getActive()),
        });
    } catch (error) {
        console.error('Error creating transaction:', error);
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
    
    const whatsappPhone = paymentSettings?.whatsappPhoneNumber || '6281234567890'
    const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(whatsappMessage)}`

    return (
        <div className="min-h-screen bg-background py-12 px-4">
            <div className="mx-auto max-w-lg">
                <div className="text-center mb-8">
                    <h1 className="text-xl font-medium mb-2">{t('title')}</h1>
                    <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
                </div>

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
                    <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm transition-colors"
                    >
                        <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                        </svg>
                        {t('confirmPayment')}
                    </a>
                    <p className="text-xs text-muted-foreground mt-3">{t('confirmationNote')}</p>
                </div>
            </div>
        </div>
    )
}