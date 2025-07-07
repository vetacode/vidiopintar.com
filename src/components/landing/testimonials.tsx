import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Markdown } from '../ui/markdown'

type Testimonial = {
    name: string
    role: string
    image: string
    quote: string
}
 
const testimonials: Testimonial[] = [
    {
      "name": "Razii Abraham",
      "role": "Heatseeker - run live market experiments with AI",
      "image": "/testimonials/razii.jpeg",
      "quote": `Keren banget, udah nyobain!

"Nonton" podcast, cukup liat table of content di description, terus langsung tanya-tanya aja based on section2 video nya di chatbox nya. Reply nya juga bagus tone of voice LLM nya.

Bonus: interface sleek and modern banget, well done!`
    },
    {
      "name": "Hilmi Aunillah Kamil",
      "role": "Human Resources Enthusiast",
      "image": "/testimonials/hilmi.jpeg",
      "quote": "makasih mas, aku udah nyoba dan beneran ngebantu banget buat proses belajar dari youtube sangat menghemat waktu"
    },
    {
      "name": "Musli",
      "role": "Content Creator",
      "image": "/testimonials/musli.jpg",
      "quote": "Dengan bantuan vidiopintar, aku gak perlu menghabiskan waktu berjam-jam nonton youtube..."
    },
    {
      "name": "Paulus Aditya Hernawan",
      "role": "L&D Practitioner",
      "image": "/testimonials/koeladit.jpg",
      "quote": `Keren bingo ini Mas, alternative lain buat ngulik dan riset video YouTube selain pakai NotebookLM 🔥`
    },
    {
      "name": "syaifudin latief",
      "role": "Programmer",
      "image": "/testimonials/sayifudin.jpeg",
      "quote": "keren banget mas tadi saya nyobain amazing... "
    },
    {
      "name": "Lucky Wiratanandi",
      "role": "Cluster HR Executive",
      "image": "/testimonials/lucky.jpeg",
      "quote": "Sebuah gebrakan yang keren bro, in needsnya jadi lebih mencakup kebutuhan pasar ✨ "
    },
    {
      "name": "Muhammad Fatih Darmawan",
      "role": "Driving Brand & Business Growth with SEO",
      "image": "/testimonials/fatih-darmawan.jpeg",
      "quote": `Thanks bro, sebelumnya saya manual, dari transcipt webpage trus lempar ke chatgpt.
Udah nyobain, bermanfaat banget.`
    },
    {
      "name": "Amik Dwiokta",
      "role": "Content Creator",
      "image": "/testimonials/ibunyaboemi.jpeg",
      "quote": `Ini keren banget sih. Bisa chit chat bahas isi videonya rupanya 🤭
Pernah coba site serupa untuk ngerangkum video ytube juga. Tapi nggak ada chitchat session gini 🤣 kadang yang di rangkum ada beberapa poin gatau dia dapatnya dari mana 🤔😅`
    },
    {
      "name": "Fizu - sadarutuh.id",
      "role": "Content Creator | Personal Growth",
      "image": "/testimonials/sadarutuh.jpeg",
      "quote": `vidiopintar.com keren sih ini. 🎉
Ngebantu banget, buat kalo mau dijadiin action plan, setelah nonton Youtube. Apalagi kalo dari materi-materi yang memang kadang bingung, action apa yang bisa dilakukan setelah nonton videonya.

Kalo bingung pun, tanya jawab seputar vidieonya di kolom kirinya. Terobosan yang baru buat summary video yang durasinya panjang, tapi cuman mau ambil poin-poinnya.

Kalo kesulitan tinggal tanyakan dengan berikan penjelasan yang lebih mudah.  `
    },
];

const shuffleArray = (array: Testimonial[]): Testimonial[] => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
}

const shuffledTestimonials = shuffleArray(testimonials)

export function WallOfLoveSection() {
    return (
        <section>
            <div className="py-16 md:py-32">
                <div className="mx-auto max-w-6xl px-6">
                    <div className="text-center">
                        <h2 className="text-title text-3xl font-semibold text-balance">From watch time to "aha moments"</h2>
                        <p className="text-body mt-6">See how people are extracting real insights and building knowledge from the videos they love.</p>
                    </div>
                    <div className="mt-8 columns-1 gap-4 space-y-4 md:mt-12 md:columns-2 lg:columns-3">
                        {shuffledTestimonials.map(({ name, role, quote, image }, index) => (
                            <Card key={index} className="break-inside-avoid mb-4">
                                <CardContent className="grid grid-cols-[auto_1fr] gap-3 pt-6">
                                    <Avatar className="size-9">
                                        <AvatarImage alt={name} src={image} loading="lazy" width="120" height="120" />
                                        <AvatarFallback>ST</AvatarFallback>
                                    </Avatar>

                                    <div>
                                        <h3 className="font-medium">{name}</h3>

                                        <span className="text-muted-foreground block text-sm tracking-wide">{role}</span>

                                        <blockquote className="mt-3 prose dark:prose-invert">
                                            <Markdown>{quote}</Markdown>
                                        </blockquote>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
