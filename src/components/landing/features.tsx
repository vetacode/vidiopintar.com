import { Cpu, Fingerprint, Pencil, Settings2, Sparkles, Zap } from 'lucide-react'

export function Features() {
    return (
        <section className="py-12 md:py-20">
            <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
                <div className="relative z-10 mx-auto max-w-xl space-y-6 text-center md:space-y-12">
                    <h2 className="text-balance text-4xl font-medium lg:text-5xl">Your YouTube learning companion</h2>
                    <p>Get instant "aha moments" from videos you already love watching</p>
                </div>

                <div className="relative mx-auto grid max-w-4xl divide-x divide-y border *:p-12 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Zap className="size-4" />
                            <h3 className="text-sm font-medium">Faaast</h3>
                        </div>
                        <p className="text-sm">Get key insights instantly. No more rewatching to find that one golden nugget.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Cpu className="size-4" />
                            <h3 className="text-sm font-medium">Smart</h3>
                        </div>
                        <p className="text-sm">AI extracts the gold from every video, connecting ideas you might have missed.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Fingerprint className="size-4" />

                            <h3 className="text-sm font-medium">Personal</h3>
                        </div>
                        <p className="text-sm">Your insights, your way. Build a personal knowledge base from videos you love.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Pencil className="size-4" />

                            <h3 className="text-sm font-medium">Interactive</h3>
                        </div>
                        <p className="text-sm">Turn passive viewing into active learning with instant comprehension tools.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Settings2 className="size-4" />

                            <h3 className="text-sm font-medium">Progress</h3>
                        </div>
                        <p className="text-sm">See your knowledge grow. Track real understanding, not just watch time.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Sparkles className="size-4" />

                            <h3 className="text-sm font-medium">Effortless</h3>
                        </div>
                        <p className="text-sm">From YouTube to "aha moments" in seconds. Learning made ridiculously simple.</p>
                    </div>
                </div>
            </div>
        </section>
    )
}
