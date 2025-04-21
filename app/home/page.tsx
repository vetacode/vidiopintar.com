import { VideoRepository } from "@/lib/db/repository";
import VideoSubmitForm from "@/components/video-submit-form";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { VideoList } from "@/components/video-list";

const cardData = [
  {
    image: "http://res.cloudinary.com/dr15yjl8w/image/upload/v1745156417/public/dfnhwobdonz53w04owoj.jpg",
    label: "Productivity"
  },
  {
    image: "http://res.cloudinary.com/dr15yjl8w/image/upload/v1745157020/public/vdyztettdwchz5xcgavy.jpg",
    label: "Math"
  },
  {
    image: "http://res.cloudinary.com/dr15yjl8w/image/upload/v1745157216/public/ri3ksakrrglvgof0aybx.jpg",
    label: "Software Engineering"
  }
];

function CategoryCard({ image, label }: { image: string; label: string }) {
  return (
    <Card className="rounded-2xl overflow-hidden relative cursor-pointer group hover:shadow-lg transition-shadow dark:border-white/10">
      <img src={image} className="w-full h-18 object-cover group-hover:scale-105 transition-all" />
      <div className="absolute inset-0 bg-black/25">
        <div className="p-4 flex justify-center items-center h-full">
          <p className="text-2xl font-semibold tracking-tighter text-white">{label}</p>
        </div>
      </div>
    </Card>
  );
}

export default async function Home() {
  const videos = await VideoRepository.getAll();
  return (
    <main className="relative min-h-screen p-6 overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="mb-8 p-6">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold tracking-tighter">Vidiopintar</h1>
            <p className="tracking-tight">What do you want to learn today?</p>
          </div>
          <VideoSubmitForm />
        </div>
        <div className="max-w-4xl mx-auto w-full mb-8">
          <h2 className="text-xl font-semibold text-left mb-6 tracking-tighter">Choose topics</h2>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 lg:grid-cols-3">
            {cardData.map((item, idx) => (
              <CategoryCard key={idx} image={item.image} label={item.label} />
            ))}
          </div>
        </div>
        <VideoList videos={videos} />
      </div>
    </main>
  );
}

