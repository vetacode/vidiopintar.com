import { Cpu, Fingerprint, Pencil, Settings2, Sparkles, Zap } from 'lucide-react'

export function Features() {
    return (
        <section className="py-12 md:py-20">
            <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
                <div className="relative z-10 mx-auto max-w-xl space-y-6 text-center md:space-y-12">
                    <h2 className="text-balance text-4xl font-medium lg:text-5xl">Stop passive watching. Start active learning</h2>
                    <p>Master new skills, explore complex topics, and boost your knowledge retention - all from the videos you already love watching.</p>
                </div>

                <div className="relative mx-auto grid max-w-4xl divide-x divide-y border *:p-12 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Zap className="size-4" />
                            <h3 className="text-sm font-medium">Faaast</h3>
                        </div>
                        <p className="text-sm">Convert hours of content into focused learning sessions that respect your time</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Cpu className="size-4" />
                            <h3 className="text-sm font-medium">Smart</h3>
                        </div>
                        <p className="text-sm">The AI automatically identifies and organizes key concepts from any video.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Fingerprint className="size-4" />

                            <h3 className="text-sm font-medium">Personal</h3>
                        </div>
                        <p className="text-sm">Store and access your customized learning materials in one secure location.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Pencil className="size-4" />

                            <h3 className="text-sm font-medium">Interactive</h3>
                        </div>
                        <p className="text-sm">Transform passive watching into engaging activities that boost retention.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Settings2 className="size-4" />

                            <h3 className="text-sm font-medium">Progress</h3>
                        </div>
                        <p className="text-sm">Track your learning journey with detailed insights and achievement metrics.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Sparkles className="size-4" />

                            <h3 className="text-sm font-medium">Effortless</h3>
                        </div>
                        <p className="text-sm">Simple, personalized learning that works for you.</p>
                    </div>
                </div>
            </div>
        </section>
    )
}
