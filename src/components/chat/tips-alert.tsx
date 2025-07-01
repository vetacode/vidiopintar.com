"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Lightbulb } from "lucide-react"
import { useEffect, useState } from "react";
import { useLocalStorage } from "usehooks-ts"

export function TipsAlert({ videoId }: { videoId: string }) {
    const [tipsCount, setTipsCount] = useLocalStorage<number>(`vidiopintar-tips-count`, 0);
    const [showTips, setShowTips] = useState<boolean>(false);

    useEffect(() => {
        if (tipsCount >= 3) return;

        const showTimeout = setTimeout(() => {
            setShowTips(true);
            setTipsCount(prev => prev + 1);

            const hideTimeout = setTimeout(() => {
                setShowTips(false);
            }, 15000);

            return () => clearTimeout(hideTimeout);
        }, 15000);

        return () => clearTimeout(showTimeout);
    }, [tipsCount, setTipsCount]);

    if (tipsCount >= 3) return null;

    return (
        <Alert className={`sticky inset-x-0 bottom-0 border-l-0 border-r-0 border-b-0 rounded-none bg-accent transition-transform duration-500 ease-in-out ${
            showTips ? 'translate-y-0' : 'translate-y-full'
        }`}>
            <Lightbulb />
            <AlertTitle>Tips!</AlertTitle>
            <AlertDescription className="inline-flex gap-1">
                Replace any <strong className="underline text-primary/75 font-semibold">youtube.com/watch/?={videoId}</strong> link with <strong className="underline text-primary/75 font-semibold">vidiopintar.com/watch?v={videoId}</strong> to start chat.
            </AlertDescription>
        </Alert>
    )
}
