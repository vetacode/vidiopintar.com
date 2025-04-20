"use client"

import { useFormStatus } from 'react-dom'
import { handleVideoSubmit } from "@/app/actions"
import { Button } from '@/components/ui/button'
import { SendHorizonal, Loader } from 'lucide-react'

export function FormStartLearning() {
    const { pending } = useFormStatus();
    console.log('pending', pending);
    return (
        <form
            action={handleVideoSubmit}
            className="mx-auto max-w-md">
            <div className="bg-background has-[input:focus]:ring-muted relative grid grid-cols-[1fr_auto] items-center rounded-[calc(var(--radius)+0.5rem)] border pr-2 shadow shadow-zinc-950/5 has-[input:focus]:ring-2">
                <input
                    placeholder="Paste YouTube URL"
                    className="h-12 pl-4 w-full bg-transparent focus:outline-none"
                    type="url"
                    name='videoUrl'
                />

                <div className="md:pr-1.5 lg:pr-0">
                    <Button
                        aria-label="submit"
                        disabled={pending}
                        size="sm"
                        className="rounded-(--radius) hover:cursor-pointer">
                        {pending && <Loader className='animate-spin' />}
                        <span className="hidden md:block">
                            {pending ? 'Processing...' : 'Start learning'}
                        </span>
                        <SendHorizonal
                            className="relative mx-auto size-5 md:hidden"
                            strokeWidth={2}
                        />
                    </Button>
                </div>
            </div>
        </form>

    )
}