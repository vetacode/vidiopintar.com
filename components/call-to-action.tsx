import { Button } from '@/components/ui/button'
import { Mail, SendHorizonal } from 'lucide-react'

export default function CallToAction() {
    return (
        <section className="py-16 md:py-32">
            <div className="mx-auto max-w-5xl px-6">
                <div className="text-center">
                    <h2 className="text-balance text-4xl font-semibold lg:text-5xl">Start Learning</h2>
                    <p className="mt-4">Master Any Topic, One Video at a Time.</p>

                    <form action="" className="mx-auto mt-10 max-w-md lg:mt-12">
                        <div className="bg-background has-[input:focus]:ring-muted relative grid grid-cols-[1fr_auto] items-center rounded-[calc(var(--radius)+0.75rem)] border pr-3 shadow shadow-zinc-950/5 has-[input:focus]:ring-2">
                            <input placeholder="Paste YouTube URL" className="h-14 w-full bg-transparent pl-4 focus:outline-none" type="email" />

                            <div className="md:pr-1.5 lg:pr-0">
                                <Button aria-label="submit" className="rounded-(--radius)">
                                    <span className="hidden md:block">Start learning</span>
                                    <SendHorizonal className="relative mx-auto size-5 md:hidden" strokeWidth={2} />
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    )
}
