import { FormStartLearning } from './hero-form'

export function CallToAction() {
    return (
        <section className="py-16 md:py-32">
            <div className="mx-auto max-w-5xl px-6">
                <div className="text-center">
                    <h2 className="text-balance text-4xl font-semibold lg:text-5xl">Start Learning</h2>
                    <p className="mt-4 mb-10">Learn Any Topic, One Video at a Time.</p>
                    <FormStartLearning />
                </div>
            </div>
        </section>
    )
}
