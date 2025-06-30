"use client";

import { handleVideoSubmit } from "@/app/actions"
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { extractVideoId } from "@/lib/utils";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";

export function FormStartLearning() {
    const { data: session } = useSession();
    const router = useRouter();
    const { pending } = useFormStatus();

    const handleSubmit = async (formData: FormData) => {
        const videoUrl = formData.get("videoUrl") as string;
        
        if (!session) {
            if (videoUrl) {
                const videoId = extractVideoId(videoUrl);
                if (videoId) {
                    // Store the video ID for redirect after login/register
                    sessionStorage.setItem("pendingVideoId", videoId);
                }
            }
            router.push("/register");
            return;
        }
        await handleVideoSubmit(formData);
    };

    return (
        <form
            action={handleSubmit}
            className="mx-auto max-w-md">
            <div className="bg-background has-[input:focus]:ring-muted relative grid grid-cols-[1fr_auto] items-center rounded-[calc(var(--radius)+0.5rem)] border pr-2 shadow shadow-zinc-950/5 has-[input:focus]:ring-2">
                <input
                    placeholder="Paste YouTube URL"
                    className="h-12 pl-4 w-full bg-transparent focus:outline-none"
                    type="url"
                    name='videoUrl'
                />

                <div className="md:pr-1.5 lg:pr-0">
                    <Button type="submit" disabled={pending} className="rounded-xl cursor-pointer">
                        {pending ? <Loader className="size-4 animate-spin" /> : "Start learning"}
                    </Button>
                </div>
            </div>
        </form>

    )
}