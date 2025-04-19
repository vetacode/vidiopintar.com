import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'

type Testimonial = {
    name: string
    role: string
    image: string
    quote: string
}

const testimonials: Testimonial[] = [
    {
      "name": "Jonathan Yombo",
      "role": "Aspiring Developer",
      "image": "https://randomuser.me/api/portraits/men/1.jpg",
      "quote": "Vidiopintar turned my YouTube binge-watching into productive learning sessions. I've mastered coding concepts I struggled with for months!"
    },
    {
      "name": "Yves Kalume",
      "role": "Biology Major",
      "image": "https://randomuser.me/api/portraits/men/2.jpg",
      "quote": "As a college student, Vidiopintar is my secret weapon. Complex lectures are now easier to grasp, and my grades have improved significantly."
    },
    {
      "name": "Yucel Faruksahan",
      "role": "HR Manager",
      "image": "https://randomuser.me/api/portraits/men/3.jpg",
      "quote": "I use Vidiopintar for my team's professional development. The AI summaries save us hours and keep us updated on industry trends."
    },
    {
      "name": "Shekinah Tshiokufila",
      "role": "English Learner",
      "image": "https://randomuser.me/api/portraits/men/4.jpg",
      "quote": "Learning English became fun and interactive with Vidiopintar. I'm picking up new phrases and improving my pronunciation daily."
    },
    {
      "name": "Oketa Fred",
      "role": "Online Educator",
      "image": "https://randomuser.me/api/portraits/men/5.jpg",
      "quote": "Vidiopintar helps me create engaging lessons for my online classes. My students are more attentive and retain information better."
    },
    {
      "name": "Khatab Wedaa",
      "role": "Lifelong Learner",
      "image": "https://randomuser.me/api/portraits/men/6.jpg",
      "quote": "I'm always curious about new topics, and Vidiopintar satisfies that perfectly. It's like having a personal tutor for every subject I'm interested in!"
    }
];

const chunkArray = (array: Testimonial[], chunkSize: number): Testimonial[][] => {
    const result: Testimonial[][] = []
    for (let i = 0; i < array.length; i += chunkSize) {
        result.push(array.slice(i, i + chunkSize))
    }
    return result
}

const testimonialChunks = chunkArray(testimonials, Math.ceil(testimonials.length / 3))

export default function WallOfLoveSection() {
    return (
        <section>
            <div className="py-16 md:py-32">
                <div className="mx-auto max-w-6xl px-6">
                    <div className="text-center">
                        <h2 className="text-title text-3xl font-semibold">What Our Learners Are Saying</h2>
                        <p className="text-body mt-6">Discover how Vidiopintar is transforming the way people learn from YouTube videos across various fields and interests.</p>
                    </div>
                    <div className="mt-8 grid gap-3 sm:grid-cols-2 md:mt-12 lg:grid-cols-3">
                        {testimonialChunks.map((chunk, chunkIndex) => (
                            <div key={chunkIndex} className="space-y-3">
                                {chunk.map(({ name, role, quote, image }, index) => (
                                    <Card key={index}>
                                        <CardContent className="grid grid-cols-[auto_1fr] gap-3 pt-6">
                                            <Avatar className="size-9">
                                                <AvatarImage alt={name} src={image} loading="lazy" width="120" height="120" />
                                                <AvatarFallback>ST</AvatarFallback>
                                            </Avatar>

                                            <div>
                                                <h3 className="font-medium">{name}</h3>

                                                <span className="text-muted-foreground block text-sm tracking-wide">{role}</span>

                                                <blockquote className="mt-3">
                                                    <p className="text-gray-700 dark:text-gray-300">{quote}</p>
                                                </blockquote>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
