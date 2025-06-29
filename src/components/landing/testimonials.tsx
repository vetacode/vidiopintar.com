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
      "quote": "Finally, I extract the gold from coding tutorials instead of rewatching the same parts. Connected concepts I never saw before!"
    },
    {
      "name": "Yves Kalume",
      "role": "Biology Major",
      "image": "https://randomuser.me/api/portraits/men/2.jpg",
      "quote": "Every lecture video now gives me instant insights. I build real understanding, not just notes. My knowledge actually sticks!"
    },
    {
      "name": "Yucel Faruksahan",
      "role": "HR Manager",
      "image": "https://randomuser.me/api/portraits/men/3.jpg",
      "quote": "We extract key insights from industry talks in seconds. My team gets 'aha moments' from every conference video we watch."
    },
    {
      "name": "Shekinah Tshiokufila",
      "role": "English Learner",
      "image": "https://randomuser.me/api/portraits/men/4.jpg",
      "quote": "I connect language patterns I missed before. Every video becomes an 'aha moment' for understanding real English usage."
    },
    {
      "name": "Oketa Fred",
      "role": "Online Educator",
      "image": "https://randomuser.me/api/portraits/men/5.jpg",
      "quote": "I extract the best teaching methods from educator videos. Now I help my students get their own 'aha moments' faster."
    },
    {
      "name": "Khatab Wedaa",
      "role": "Lifelong Learner",
      "image": "https://randomuser.me/api/portraits/men/6.jpg",
      "quote": "Every video I watch builds my knowledge base. I connect ideas across topics and get insights I'd never find just watching."
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

export function WallOfLoveSection() {
    return (
        <section>
            <div className="py-16 md:py-32">
                <div className="mx-auto max-w-6xl px-6">
                    <div className="text-center">
                        <h2 className="text-title text-3xl font-semibold text-balance">From watch time to "aha moments"</h2>
                        <p className="text-body mt-6">See how people are extracting real insights and building knowledge from the videos they love.</p>
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
