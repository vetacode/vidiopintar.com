"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { extractVideoId } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Loader, AlertTriangle, Crown } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from 'next-intl';
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import Link from "next/link";

function ButtonSubmitStartLearning({ isSubmitting }: { isSubmitting: boolean }) {
    const tHero = useTranslations('heroForm');

    return (
        <Button type="submit" disabled={isSubmitting} className="rounded-xl cursor-pointer">
            {isSubmitting ? <Loader className="size-4 animate-spin" /> : tHero('startLearning')}
        </Button>);
}

export function FormStartLearning() {
    const { data: session } = useSession();
    const router = useRouter();
    const tHero = useTranslations('heroForm');
    const t = useTranslations('limitDialog');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showLimitDialog, setShowLimitDialog] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        const formData = new FormData(e.currentTarget);
        const videoUrl = formData.get("videoUrl") as string;

        if (!videoUrl) {
            toast.error(tHero('videoUrlRequired'));
            return;
        }

        if (!session) {
            const videoId = extractVideoId(videoUrl);
            if (!videoId) {
                toast.error(tHero('invalidYouTubeUrl'));
                return;
            }
            // Store the video ID for redirect after login/register
            sessionStorage.setItem("pendingVideoId", videoId);
            router.push("/register");
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            const response = await fetch('/api/video/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ videoUrl }),
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                if (result.errors) {
                    const hasLimitError = result.errors.some((error: string) => 
                        error.includes('daily limit') || error.includes('upgrade')
                    );
                    
                    if (hasLimitError) {
                        setShowLimitDialog(true);
                    } else {
                        result.errors.forEach((error: string) => {
                            toast.error(error);
                        });
                    }
                } else {
                    toast.error(result.error || 'An error occurred');
                }
                return;
            }
            
            // Success - redirect to video page
            if (result.videoId) {
                window.location.href = `/video/${result.videoId}`;
            } else {
                toast.success("Video submitted successfully!");
            }
            
        } catch (error) {
            console.error('Submit error:', error);
            toast.error('Network error. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <form
                onSubmit={handleSubmit}
                className="mx-auto max-w-md">
                <div className="bg-background has-[input:focus]:ring-muted relative grid grid-cols-[1fr_auto] items-center rounded-[calc(var(--radius)+0.5rem)] border pr-2 shadow shadow-zinc-950/5 has-[input:focus]:ring-2">
                    <input
                        placeholder={tHero('placeholder')}
                        className="h-12 pl-4 w-full bg-transparent focus:outline-none"
                        type="url"
                        name='videoUrl'
                    />

                    <div className="md:pr-1.5 lg:pr-0">
                        <ButtonSubmitStartLearning isSubmitting={isSubmitting} />
                    </div>
                </div>
            </form>

            {/* Plan Limit Dialog */}
            <Dialog open={showLimitDialog} onOpenChange={setShowLimitDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-full">
                                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </div>
                            <DialogTitle>{t('title')}</DialogTitle>
                        </div>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            {t('description')}
                        </p>
                        
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg border">
                            <div className="flex items-center gap-2 mb-2">
                                <Crown className="h-4 w-4 text-blue-600" />
                                <span className="font-medium text-sm">{t('premiumBenefits')}</span>
                            </div>
                            <ul className="text-xs text-muted-foreground space-y-1">
                                <li>• {t('benefits.unlimited')}</li>
                                <li>• {t('benefits.ai')}</li>
                                <li>• {t('benefits.support')}</li>
                                <li>• {t('benefits.features')}</li>
                            </ul>
                        </div>
                    </div>
                    
                    <DialogFooter className="flex gap-2 sm:gap-2">
                        <Button 
                            variant="outline" 
                            onClick={() => setShowLimitDialog(false)}
                            className="flex-1"
                        >
                            {t('waitTomorrow')}
                        </Button>
                        <Link href="/profile/billing" className="flex-1">
                            <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                                <Crown className="w-4 h-4 mr-2" />
                                {t('upgradeNow')}
                            </Button>
                        </Link>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
