import { VideoRepository } from "@/lib/db/repository";
import VideoSubmitForm from "@/components/video-submit-form";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { VideoList } from "@/components/video-list";

const cardData = [
  {
    image: "https://images.unsplash.com/photo-1533225307893-db39ecce099a?q=80&w=1280&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    label: "Productivity"
  },
  {
    image: "https://images.unsplash.com/photo-1734638053787-4f849ed09615?q=80&w=1280&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    label: "Anthropology"
  },
  {
    image: "https://images.unsplash.com/photo-1511297968426-a869b61af3da?q=80&w=1280&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    label: "Mental Health"
  },
  {
    image: "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?q=80&w=1280&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    label: "Marketing"
  },
  {
    image: "https://images.unsplash.com/photo-1586943759341-be5595944989?q=80&w=1280&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    label: "Copywriting"
  },
  {
    image: "https://images.unsplash.com/photo-1650821414390-276561abd95a?q=80&w=1280&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    label: "Economics"
  },
  {
    image: "https://images.unsplash.com/photo-1645207563387-240c50a0d5d3?q=80&w=1280&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    label: "Geography"
  },
  {
    image: "https://images.unsplash.com/photo-1583502023538-55ce7997721a?q=80&w=1280&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    label: "History"
  },
];

function CategoryCard({ image, label }: { image: string; label: string }) {
  return (
    <Card className="rounded-2xl overflow-hidden relative cursor-pointer group hover:shadow-lg transition-shadow dark:border-white/10">
      <img src={image} className="w-full h-20 object-cover group-hover:scale-105 transition-all" />
      <div className="absolute inset-0 bg-black/35">
        <div className="p-4 flex justify-center items-center h-full">
          <p className="text-2xl font-semibold tracking-tighter text-white">{label}</p>
        </div>
      </div>
    </Card>
  );
}

import { HeroHeader } from "@/components/hero-header";

export default async function Home() {
  // const videos = await VideoRepository.getAll();
  return (
    <>
      <HeroHeader variant="home" />
      <main className="relative min-h-screen p-6 overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto">
        <div className="my-8 p-6">
          <div className="text-center mb-6 mt-8">
            <h1 className="text-4xl font-bold tracking-tighter">Vidiopintar</h1>
            <p className="tracking-tight">What do you want to learn today?</p>
          </div>
          <VideoSubmitForm />
        </div>
        <div className="max-w-4xl mx-auto w-full mb-8">
          <h2 className="text-xl font-semibold text-left mb-6 tracking-tighter">Choose topics</h2>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {cardData.map((item, idx) => (
              <CategoryCard key={idx} image={item.image} label={item.label} />
            ))}
          </div>
        </div>
        {/* <VideoList videos={videos} /> */}
      </div>
    </main>
    </>
  );
}

